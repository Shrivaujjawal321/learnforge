import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyEnrollment } from "@/lib/notifications";
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
    const userId = (session.user as { id: string }).id;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return notFound("Course");
    }

    if (course.status !== "published") {
      return NextResponse.json(
        { error: "Course is not available for enrollment" },
        { status: 400 }
      );
    }

    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Already enrolled", enrollment: existing },
        { status: 400 }
      );
    }

    // Mock payment flow for paid courses
    let paymentStatus = "free";
    let paymentId: string | null = null;

    if (course.price > 0) {
      // Parse optional payment token from request body
      let paymentToken: string | undefined;
      try {
        const body = await request.json();
        paymentToken = body.paymentToken;
      } catch {
        // No body or invalid JSON is fine for free courses
      }

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock payment validation - accept any token or generate a mock one
      paymentId = paymentToken || `pay_mock_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      paymentStatus = "paid";
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
      },
    });

    // Send enrollment notification
    await notifyEnrollment(userId, course.title, courseId);

    return NextResponse.json(
      {
        ...enrollment,
        paymentStatus,
        paymentId,
        message:
          paymentStatus === "paid"
            ? `Payment of $${course.price} processed successfully. You are now enrolled!`
            : "You are now enrolled in this free course!",
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
