import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { handleApiError, unauthorized } from "@/lib/api-helpers";

const updateChapterSchema = z.object({
  title: z.string().min(1).optional(),
  order: z.number().int().positive().optional(),
});

export async function PUT(
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
    const validation = updateChapterSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const chapter = await prisma.chapter.update({
      where: { id: chapterId },
      data: validation.data,
      include: { lessons: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json(chapter);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
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

    await prisma.chapter.delete({ where: { id: chapterId } });

    return NextResponse.json({ message: "Chapter deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
