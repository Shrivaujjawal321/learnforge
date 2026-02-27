import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { handleApiError, unauthorized } from "@/lib/api-helpers";

const createCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  level: z.enum(["beginner", "intermediate", "advanced"]),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return unauthorized();
    }

    const userId = (session.user as { id: string }).id;
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

    const where: Record<string, unknown> = { creatorId: userId };
    if (status && status !== "all") {
      where.status = status;
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        enrollments: true,
        chapters: {
          include: {
            lessons: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const result = courses.map((c) => ({
      ...c,
      studentCount: c.enrollments.length,
      lessonCount: c.chapters.reduce(
        (sum, ch) => sum + ch.lessons.length,
        0
      ),
      chapterCount: c.chapters.length,
    }));

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return unauthorized();
    }

    const userId = (session.user as { id: string }).id;
    const body = await request.json();
    const validation = createCourseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { title, description, category, level } = validation.data;
    let slug = slugify(title);

    // Ensure unique slug
    const existing = await prisma.course.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        category,
        level,
        creatorId: userId,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
