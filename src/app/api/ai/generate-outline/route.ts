import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateCourseOutline } from "@/lib/mock-ai";
import { handleApiError, unauthorized } from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return unauthorized();
    }

    const body = await request.json();
    const { topic, targetAudience, level, numChapters } = body;

    if (!topic) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    const description = `${topic} for ${targetAudience || "learners"} at ${level || "beginner"} level`;
    const outline = await generateCourseOutline(topic, description, numChapters);

    return NextResponse.json({ outline });
  } catch (error) {
    return handleApiError(error);
  }
}
