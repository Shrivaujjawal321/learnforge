import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateLessonContent } from "@/lib/mock-ai";
import { handleApiError, unauthorized } from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return unauthorized();
    }

    const body = await request.json();
    const { lessonTitle, courseTitle } = body;

    if (!lessonTitle) {
      return NextResponse.json(
        { error: "Lesson title is required" },
        { status: 400 }
      );
    }

    const content = await generateLessonContent(
      lessonTitle,
      courseTitle || "Course"
    );

    return NextResponse.json({ content });
  } catch (error) {
    return handleApiError(error);
  }
}
