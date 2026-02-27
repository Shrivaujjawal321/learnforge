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

    // Get all enrollments with progress details
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            chapters: {
              include: {
                lessons: { select: { id: true, duration: true } },
              },
            },
          },
        },
        lessonProgress: {
          where: { completed: true },
          orderBy: { completedAt: "desc" },
        },
      },
    });

    const totalCoursesEnrolled = enrollments.length;
    const totalCoursesCompleted = enrollments.filter(
      (e) => e.completedAt !== null
    ).length;

    const totalLessons = enrollments.reduce(
      (sum, e) =>
        sum +
        e.course.chapters.reduce((s, ch) => s + ch.lessons.length, 0),
      0
    );

    const totalLessonsCompleted = enrollments.reduce(
      (sum, e) => sum + e.lessonProgress.length,
      0
    );

    const overallProgress =
      totalLessons > 0
        ? Math.round((totalLessonsCompleted / totalLessons) * 100)
        : 0;

    // Calculate total time spent (estimate based on completed lesson durations)
    const allCompletedLessonIds = enrollments.flatMap((e) =>
      e.lessonProgress.map((lp) => lp.lessonId)
    );

    let totalTimeSpent = 0;
    for (const enrollment of enrollments) {
      for (const chapter of enrollment.course.chapters) {
        for (const lesson of chapter.lessons) {
          if (allCompletedLessonIds.includes(lesson.id)) {
            totalTimeSpent += lesson.duration || 10;
          }
        }
      }
    }

    // Calculate learning streak
    const allCompletionDates = enrollments
      .flatMap((e) =>
        e.lessonProgress
          .filter((lp) => lp.completedAt)
          .map((lp) => lp.completedAt!)
      )
      .sort((a, b) => b.getTime() - a.getTime());

    let learningStreak = 0;
    let longestStreak = 0;
    if (allCompletionDates.length > 0) {
      // Check consecutive days from today going backward
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const uniqueDays = new Set(
        allCompletionDates.map((d) => {
          const date = new Date(d);
          date.setHours(0, 0, 0, 0);
          return date.getTime();
        })
      );

      const sortedDays = [...uniqueDays].sort((a, b) => b - a);

      // Current streak
      let currentStreak = 0;
      let checkDate = today.getTime();

      for (const day of sortedDays) {
        if (day === checkDate || day === checkDate - 86400000) {
          currentStreak++;
          checkDate = day - 86400000;
        } else if (day < checkDate - 86400000) {
          break;
        }
      }
      learningStreak = currentStreak;

      // Longest streak
      let tempStreak = 1;
      for (let i = 1; i < sortedDays.length; i++) {
        if (sortedDays[i - 1] - sortedDays[i] === 86400000) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    // Course progress details
    const courseProgress = enrollments.map((e) => {
      const courseTotalLessons = e.course.chapters.reduce(
        (s, ch) => s + ch.lessons.length,
        0
      );
      const lastProgress = e.lessonProgress[0];

      return {
        courseId: e.courseId,
        courseTitle: e.course.title,
        progress: Math.round(e.progress),
        completedLessons: e.lessonProgress.length,
        totalLessons: courseTotalLessons,
        lastActivity: lastProgress?.completedAt?.toISOString() || e.createdAt.toISOString(),
      };
    });

    // Quiz performance history
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { userId },
      include: {
        quiz: {
          include: {
            lesson: {
              include: {
                chapter: {
                  include: {
                    course: { select: { title: true } },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const quizHistory = quizAttempts.map((attempt) => ({
      quizTitle: attempt.quiz.lesson.title,
      courseName: attempt.quiz.lesson.chapter.course.title,
      score: Math.round(attempt.score),
      attemptedAt: attempt.createdAt.toISOString(),
    }));

    // Recommended courses based on enrolled categories
    const enrolledCourseIds = enrollments.map((e) => e.courseId);
    const enrolledCategories = [
      ...new Set(enrollments.map((e) => e.course.category)),
    ];

    const recommended = await prisma.course.findMany({
      where: {
        status: "published",
        id: { notIn: enrolledCourseIds },
        ...(enrolledCategories.length > 0
          ? { category: { in: enrolledCategories } }
          : {}),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        level: true,
      },
      take: 4,
    });

    const recommendedCourses = recommended.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      category: c.category,
      level: c.level,
      reason: `Based on your interest in ${c.category.replace("-", " ")}`,
    }));

    // Weekly activity (simulated from lesson completion dates)
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyActivity = dayNames.map((day, index) => {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diff = dayOfWeek - index;
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() - diff);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const completionsOnDay = allCompletionDates.filter((d) => {
        const date = new Date(d);
        return date >= targetDate && date < nextDay;
      });

      // Estimate minutes based on completions
      const minutes = completionsOnDay.length * 15;

      return { day, minutes };
    });

    return NextResponse.json({
      overallProgress,
      totalCoursesEnrolled,
      totalCoursesCompleted,
      totalLessonsCompleted,
      totalLessons,
      learningStreak,
      longestStreak,
      totalTimeSpent,
      quizHistory,
      courseProgress,
      recommendedCourses,
      weeklyActivity,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
