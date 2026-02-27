import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { handleApiError, unauthorized } from "@/lib/api-helpers";

const createChapterSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return unauthorized();
    }

    const { id } = await params;

    const chapters = await prisma.chapter.findMany({
      where: { courseId: id },
      orderBy: { order: "asc" },
      include: {
        lessons: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(chapters);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return unauthorized();
    }

    const { id } = await params;
    const userId = (session.user as { id: string }).id;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course || course.creatorId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = createChapterSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const maxOrder = await prisma.chapter.findFirst({
      where: { courseId: id },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const chapter = await prisma.chapter.create({
      data: {
        title: validation.data.title,
        order: (maxOrder?.order ?? 0) + 1,
        courseId: id,
      },
      include: {
        lessons: true,
      },
    });

    return NextResponse.json(chapter, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
