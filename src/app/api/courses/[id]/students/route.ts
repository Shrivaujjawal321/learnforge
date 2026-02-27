import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError, unauthorized } from "@/lib/api-helpers";

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

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course || course.creatorId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        lessonProgress: {
          where: { completed: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalLessons = await prisma.lesson.count({
      where: { chapter: { courseId } },
    });

    const result = enrollments.map((e) => ({
      id: e.id,
      student: e.user,
      progress: e.progress,
      completedLessons: e.lessonProgress.length,
      totalLessons,
      enrolledAt: e.createdAt,
      completedAt: e.completedAt,
    }));

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
