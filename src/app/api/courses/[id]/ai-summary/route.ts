import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCourseSummary } from "@/lib/mock-ai";
import { handleApiError, notFound } from "@/lib/api-helpers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        chapters: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              select: { id: true, duration: true },
            },
          },
        },
      },
    });

    if (!course) {
      return notFound("Course");
    }

    const chapters = course.chapters.map((ch) => ({
      title: ch.title,
      lessonCount: ch.lessons.length,
    }));

    const totalLessons = course.chapters.reduce(
      (sum, ch) => sum + ch.lessons.length,
      0
    );

    const totalDuration = course.chapters.reduce(
      (sum, ch) =>
        sum + ch.lessons.reduce((s, l) => s + (l.duration || 0), 0),
      0
    );

    const summary = await generateCourseSummary({
      title: course.title,
      description: course.description,
      chapters,
      totalLessons,
      totalDuration,
      level: course.level,
      category: course.category,
    });

    return NextResponse.json({
      courseId: course.id,
      courseTitle: course.title,
      summary,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
