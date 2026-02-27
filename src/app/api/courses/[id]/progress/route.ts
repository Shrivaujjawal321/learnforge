import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyCourseCompletion, notifyCertificateEarned } from "@/lib/notifications";
import { handleApiError, unauthorized } from "@/lib/api-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return unauthorized();
    }

    const { id: courseId } = await params;
    const userId = (session.user as { id: string }).id;
    const body = await request.json();
    const { lessonId, completed } = body;

    if (!lessonId) {
      return NextResponse.json(
        { error: "lessonId is required" },
        { status: 400 }
      );
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
    }

    const wasAlreadyComplete = enrollment.completedAt !== null;

    // Upsert lesson progress
    await prisma.lessonProgress.upsert({
      where: {
        lessonId_enrollmentId: {
          lessonId,
          enrollmentId: enrollment.id,
        },
      },
      update: {
        completed: completed !== false,
        completedAt: completed !== false ? new Date() : null,
      },
      create: {
        lessonId,
        enrollmentId: enrollment.id,
        completed: completed !== false,
        completedAt: completed !== false ? new Date() : null,
      },
    });

    // Recalculate overall progress
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        chapters: {
          include: { lessons: { select: { id: true } } },
        },
      },
    });

    const totalLessons =
      course?.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0) || 0;

    const completedLessons = await prisma.lessonProgress.count({
      where: {
        enrollmentId: enrollment.id,
        completed: true,
      },
    });

    const progressPercent =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    const isNowComplete = progressPercent >= 100;

    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        progress: progressPercent,
        completedAt: isNowComplete ? new Date() : null,
      },
    });

    // Auto-notify and create certificate on first completion
    if (isNowComplete && !wasAlreadyComplete && course) {
      // Notify course completion
      await notifyCourseCompletion(userId, course.title, courseId);

      // Auto-create certificate
      const existingCert = await prisma.certificate.findUnique({
        where: { userId_courseId: { userId, courseId } },
      });

      if (!existingCert) {
        const certificate = await prisma.certificate.create({
          data: {
            userId,
            courseId,
            completedAt: new Date(),
          },
        });

        await notifyCertificateEarned(
          userId,
          course.title,
          courseId,
          certificate.id
        );
      }
    }

    return NextResponse.json({
      progressPercent,
      completedLessons,
      totalLessons,
      justCompleted: isNowComplete && !wasAlreadyComplete,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
