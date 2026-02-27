import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQuizFromContent } from "@/lib/mock-ai";
import { handleApiError, unauthorized, notFound } from "@/lib/api-helpers";

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
    const body = await request.json();
    const { lessonId, difficulty = "medium" } = body;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        chapters: {
          include: {
            lessons: {
              select: { id: true, content: true, title: true },
            },
          },
        },
      },
    });

    if (!course) {
      return notFound("Course");
    }

    let content = "";
    let lessonTitle = "";

    if (lessonId) {
      // Generate quiz for a specific lesson
      for (const chapter of course.chapters) {
        const lesson = chapter.lessons.find((l) => l.id === lessonId);
        if (lesson) {
          content = lesson.content;
          lessonTitle = lesson.title;
          break;
        }
      }

      if (!content) {
        return NextResponse.json(
          { error: "Lesson not found in this course" },
          { status: 404 }
        );
      }
    } else {
      // Generate quiz from all course content combined
      const allLessons = course.chapters.flatMap((ch) => ch.lessons);
      content = allLessons.map((l) => l.content).join("\n\n");
      lessonTitle = course.title;
    }

    const questions = await generateQuizFromContent(content, difficulty);

    return NextResponse.json({
      courseId,
      lessonId: lessonId || null,
      lessonTitle,
      difficulty,
      questions,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
