import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    const where: Record<string, unknown> = {
      status: "published",
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (category && category !== "all") {
      where.category = category;
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        creator: {
          select: { id: true, name: true, avatarUrl: true },
        },
        chapters: {
          include: {
            lessons: {
              select: { id: true, duration: true },
            },
          },
        },
        enrollments: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = courses.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      description: c.description,
      thumbnail: c.thumbnail,
      price: c.price,
      level: c.level,
      category: c.category,
      creator: c.creator,
      chapterCount: c.chapters.length,
      lessonCount: c.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0),
      totalDuration: c.chapters.reduce(
        (sum, ch) =>
          sum + ch.lessons.reduce((s, l) => s + (l.duration || 0), 0),
        0
      ),
      enrolledCount: c.enrollments.length,
      createdAt: c.createdAt,
    }));

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
