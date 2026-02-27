import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError, unauthorized } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return unauthorized();
    }

    const userId = (session.user as { id: string }).id;

    const certificates = await prisma.certificate.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            creator: { select: { name: true } },
          },
        },
      },
      orderBy: { issuedAt: "desc" },
    });

    const result = certificates.map((cert) => ({
      id: cert.id,
      certificateNo: cert.certificateNo,
      courseId: cert.courseId,
      courseTitle: cert.course.title,
      instructorName: cert.course.creator.name,
      completedAt: cert.completedAt,
      issuedAt: cert.issuedAt,
    }));

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
