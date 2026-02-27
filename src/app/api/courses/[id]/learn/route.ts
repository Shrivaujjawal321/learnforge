import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError, unauthorized, notFound } from "@/lib/api-helpers";

export async function GET(
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

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      include: {
        lessonProgress: true,
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        creator: {
          select: { id: true, name: true },
        },
        chapters: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              include: {
                quiz: {
                  include: {
                    questions: {
                      orderBy: { order: "asc" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!course) {
      return notFound("Course");
    }

    const completedLessonIds = new Set(
      enrollment.lessonProgress
        .filter((lp) => lp.completed)
        .map((lp) => lp.lessonId)
    );

    const totalLessons = course.chapters.reduce(
      (sum, ch) => sum + ch.lessons.length,
      0
    );
    const completedCount = completedLessonIds.size;
    const progressPercent =
      totalLessons > 0
        ? Math.round((completedCount / totalLessons) * 100)
        : 0;

    return NextResponse.json({
      course,
      enrollmentId: enrollment.id,
      completedLessonIds: Array.from(completedLessonIds),
      progressPercent,
      totalLessons,
      completedCount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
