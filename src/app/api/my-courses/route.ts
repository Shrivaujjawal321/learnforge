import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError, unauthorized } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return unauthorized();
    }

    const userId = (session.user as { id: string }).id;

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            creator: {
              select: { id: true, name: true, avatarUrl: true },
            },
            chapters: {
              orderBy: { order: "asc" },
              include: {
                lessons: {
                  orderBy: { order: "asc" },
                  select: { id: true, title: true, duration: true },
                },
              },
            },
          },
        },
        lessonProgress: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const result = enrollments.map((e) => {
      const totalLessons = e.course.chapters.reduce(
        (sum, ch) => sum + ch.lessons.length,
        0
      );
      const completedLessons = e.lessonProgress.filter(
        (lp) => lp.completed
      ).length;
      const progressPercent =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

      return {
        enrollmentId: e.id,
        courseId: e.course.id,
        title: e.course.title,
        slug: e.course.slug,
        thumbnail: e.course.thumbnail,
        creator: e.course.creator,
        totalLessons,
        completedLessons,
        progressPercent,
        enrolledAt: e.createdAt,
        completedAt: e.completedAt,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
