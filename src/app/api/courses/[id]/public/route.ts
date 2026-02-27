import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError, notFound } from "@/lib/api-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Try to find by slug first, then by id
    let course = await prisma.course.findUnique({
      where: { slug: id },
      include: {
        creator: {
          select: { id: true, name: true, bio: true, avatarUrl: true },
        },
        chapters: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              select: {
                id: true,
                title: true,
                type: true,
                duration: true,
                order: true,
              },
            },
          },
        },
        enrollments: {
          select: { id: true },
        },
      },
    });

    if (!course) {
      course = await prisma.course.findUnique({
        where: { id },
        include: {
          creator: {
            select: { id: true, name: true, bio: true, avatarUrl: true },
          },
          chapters: {
            orderBy: { order: "asc" },
            include: {
              lessons: {
                orderBy: { order: "asc" },
                select: {
                  id: true,
                  title: true,
                  type: true,
                  duration: true,
                  order: true,
                },
              },
            },
          },
          enrollments: {
            select: { id: true },
          },
        },
      });
    }

    if (!course || course.status !== "published") {
      return notFound("Course");
    }

    // Check if current user is enrolled
    let isEnrolled = false;
    const session = await getServerSession(authOptions);
    if (session?.user) {
      const userId = (session.user as { id: string }).id;
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId: course.id } },
      });
      isEnrolled = !!enrollment;
    }

    const totalDuration = course.chapters.reduce(
      (sum, ch) =>
        sum + ch.lessons.reduce((s, l) => s + (l.duration || 0), 0),
      0
    );

    const totalLessons = course.chapters.reduce(
      (sum, ch) => sum + ch.lessons.length,
      0
    );

    return NextResponse.json({
      ...course,
      enrolledCount: course.enrollments.length,
      totalDuration,
      totalLessons,
      isEnrolled,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
