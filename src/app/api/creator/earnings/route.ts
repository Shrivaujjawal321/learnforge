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
          include: { user: { select: { name: true, email: true } } },
        },
      },
    });

    const now = new Date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Per-course earnings
    const courseEarnings = courses.map((c) => ({
      id: c.id,
      title: c.title,
      price: c.price,
      students: c.enrollments.length,
      revenue: Math.round(c.price * c.enrollments.length * 100) / 100,
    }));

    const totalEarnings = courseEarnings.reduce((sum, c) => sum + c.revenue, 0);

    // Monthly trend (last 8 months)
    const monthlyTrend: { month: string; revenue: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1);

      let monthRevenue = 0;
      for (const course of courses) {
        const monthEnrollments = course.enrollments.filter((e) => {
          const created = new Date(e.createdAt);
          return created >= monthStart && created < monthEnd;
        });
        monthRevenue += monthEnrollments.length * course.price;
      }

      monthlyTrend.push({ month: monthNames[d.getMonth()], revenue: Math.round(monthRevenue * 100) / 100 });
    }

    // This month earnings
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    let thisMonthEarnings = 0;
    for (const course of courses) {
      const monthEnrollments = course.enrollments.filter(
        (e) => new Date(e.createdAt) >= thisMonthStart
      );
      thisMonthEarnings += monthEnrollments.length * course.price;
    }

    // Recent transactions
    const allEnrollments = courses.flatMap((c) =>
      c.enrollments.map((e) => ({ ...e, courseTitle: c.title, coursePrice: c.price }))
    );
    const recentTransactions = allEnrollments
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map((e) => ({
        id: e.id,
        studentName: e.user.name,
        studentEmail: e.user.email,
        courseTitle: e.courseTitle,
        amount: e.coursePrice,
        date: e.createdAt,
      }));

    return NextResponse.json({
      stats: {
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        thisMonth: Math.round(thisMonthEarnings * 100) / 100,
        totalCourses: courses.length,
        totalStudents: new Set(allEnrollments.map((e) => e.userId)).size,
      },
      courseEarnings,
      monthlyTrend,
      recentTransactions,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
