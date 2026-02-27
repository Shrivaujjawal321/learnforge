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

    const courses = await prisma.course.findMany({
      where: { creatorId: userId },
      include: {
        enrollments: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        chapters: {
          include: {
            lessons: true,
          },
        },
      },
    });

    const totalCourses = courses.length;
    const publishedCourses = courses.filter((c) => c.status === "published").length;

    const totalStudents = new Set(
      courses.flatMap((c) => c.enrollments.map((e) => e.userId))
    ).size;

    const allEnrollments = courses.flatMap((c) => c.enrollments);
    const avgCompletion =
      allEnrollments.length > 0
        ? Math.round(
            allEnrollments.reduce((sum, e) => sum + e.progress, 0) /
              allEnrollments.length
          )
        : 0;

    const totalRevenue = courses.reduce(
      (sum, c) => sum + c.price * c.enrollments.length,
      0
    );

    const coursePerformance = courses
      .filter((c) => c.status === "published")
      .map((c) => ({
        name: c.title.length > 25 ? c.title.substring(0, 25) + "..." : c.title,
        enrollments: c.enrollments.length,
        lessons: c.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0),
      }));

    const recentEnrollments = allEnrollments
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5)
      .map((e) => ({
        id: e.id,
        studentName: e.user.name,
        studentEmail: e.user.email,
        courseTitle:
          courses.find((c) => c.id === e.courseId)?.title || "Unknown",
        progress: e.progress,
        enrolledAt: e.createdAt,
      }));

    return NextResponse.json({
      stats: {
        totalCourses,
        publishedCourses,
        totalStudents,
        avgCompletion,
        totalRevenue,
      },
      coursePerformance,
      recentEnrollments,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
