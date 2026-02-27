import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError, unauthorized, notFound } from "@/lib/api-helpers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return unauthorized();
    }

    const { id: courseId } = await params;
    const userId = (session.user as { id: string }).id;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return notFound("Course");
    }
    if (course.creatorId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: { lessonProgress: { where: { completed: true } } },
    });

    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { quiz: { lesson: { chapter: { courseId } } } },
    });

    const totalStudents = enrollments.length;
    const totalRevenue = Math.round(course.price * totalStudents * 100) / 100;
    const completedStudents = enrollments.filter((e) => e.completedAt !== null).length;
    const inProgressStudents = enrollments.filter((e) => e.completedAt === null && e.lessonProgress.length > 0).length;
    const notStartedStudents = enrollments.filter((e) => e.completedAt === null && e.lessonProgress.length === 0).length;
    const completionRate = totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0;
    const avgQuizScore = quizAttempts.length > 0
      ? Math.round(quizAttempts.reduce((sum, a) => sum + a.score, 0) / quizAttempts.length)
      : 0;

    const now = new Date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const enrollmentTrend: { month: string; enrollments: number }[] = [];
    const revenueTrend: { month: string; revenue: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const monthEnrollments = enrollments.filter((e) => {
        const created = new Date(e.createdAt);
        return created >= monthStart && created < monthEnd;
      });
      const label = monthNames[d.getMonth()];
      enrollmentTrend.push({ month: label, enrollments: monthEnrollments.length });
      revenueTrend.push({ month: label, revenue: Math.round(monthEnrollments.length * course.price * 100) / 100 });
    }

    return NextResponse.json({
      stats: { totalStudents, totalRevenue, completionRate, avgQuizScore },
      enrollmentTrend,
      revenueTrend,
      completionData: [
        { name: "Completed", value: completedStudents },
        { name: "In Progress", value: inProgressStudents },
        { name: "Not Started", value: notStartedStudents },
      ],
    });
  } catch (error) {
    return handleApiError(error);
  }
}
