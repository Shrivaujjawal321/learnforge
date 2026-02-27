import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { handleApiError, unauthorized } from "@/lib/api-helpers";

const createLessonSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional().default(""),
  type: z.enum(["text", "video", "quiz"]).optional().default("text"),
  videoUrl: z.string().nullable().optional(),
  duration: z.number().nullable().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return unauthorized();
    }

    const { chapterId } = await params;

    const lessons = await prisma.lesson.findMany({
      where: { chapterId },
      orderBy: { order: "asc" },
      include: {
        quiz: {
          include: {
            questions: { orderBy: { order: "asc" } },
          },
        },
      },
    });

    return NextResponse.json(lessons);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return unauthorized();
    }

    const { id, chapterId } = await params;
    const userId = (session.user as { id: string }).id;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course || course.creatorId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = createLessonSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const maxOrder = await prisma.lesson.findFirst({
      where: { chapterId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const lesson = await prisma.lesson.create({
      data: {
        title: validation.data.title,
        content: validation.data.content || "",
        type: validation.data.type || "text",
        videoUrl: validation.data.videoUrl,
        duration: validation.data.duration,
        order: (maxOrder?.order ?? 0) + 1,
        chapterId,
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
