import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { handleApiError, unauthorized, notFound } from "@/lib/api-helpers";

const questionSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(1),
  options: z.string(),
  correctAnswer: z.number().int().min(0).max(3),
  explanation: z.string().nullable().optional(),
  order: z.number().int(),
});

const updateLessonSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  type: z.enum(["text", "video", "quiz"]).optional(),
  videoUrl: z.string().nullable().optional(),
  duration: z.number().nullable().optional(),
  order: z.number().int().positive().optional(),
  quiz: z
    .object({
      questions: z.array(questionSchema),
    })
    .optional(),
});

export async function GET(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ id: string; chapterId: string; lessonId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return unauthorized();
    }

    const { lessonId } = await params;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        quiz: {
          include: {
            questions: { orderBy: { order: "asc" } },
          },
        },
      },
    });

    if (!lesson) {
      return notFound("Lesson");
    }

    return NextResponse.json(lesson);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ id: string; chapterId: string; lessonId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return unauthorized();
    }

    const { id, lessonId } = await params;
    const userId = (session.user as { id: string }).id;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course || course.creatorId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = updateLessonSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { quiz: quizData, ...lessonData } = validation.data;

    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: lessonData,
    });

    // Handle quiz data
    if (quizData && lesson.type === "quiz") {
      const existingQuiz = await prisma.quiz.findUnique({
        where: { lessonId },
      });

      if (existingQuiz) {
        // Delete existing questions and recreate
        await prisma.quizQuestion.deleteMany({
          where: { quizId: existingQuiz.id },
        });

        await prisma.quizQuestion.createMany({
          data: quizData.questions.map((q) => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            order: q.order,
            quizId: existingQuiz.id,
          })),
        });
      } else {
        await prisma.quiz.create({
          data: {
            lessonId,
            questions: {
              create: quizData.questions.map((q) => ({
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                order: q.order,
              })),
            },
          },
        });
      }
    }

    const updatedLesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        quiz: {
          include: {
            questions: { orderBy: { order: "asc" } },
          },
        },
      },
    });

    return NextResponse.json(updatedLesson);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ id: string; chapterId: string; lessonId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return unauthorized();
    }

    const { id, lessonId } = await params;
    const userId = (session.user as { id: string }).id;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course || course.creatorId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.lesson.delete({ where: { id: lessonId } });

    return NextResponse.json({ message: "Lesson deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
