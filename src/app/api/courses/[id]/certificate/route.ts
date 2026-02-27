import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { handleApiError, unauthorized, notFound } from "@/lib/api-helpers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return unauthorized();
    }

    const { id: courseId } = await params;
    const userId = (session.user as { id: string }).id;

    // Verify enrollment and completion
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
    }

    if (!enrollment.completedAt) {
      return NextResponse.json(
        { error: "Course not completed yet. Complete all lessons to earn your certificate." },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        creator: { select: { name: true } },
      },
    });

    if (!course) {
      return notFound("Course");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    if (!user) {
      return notFound("User");
    }

    // Upsert certificate
    let certificate = await prisma.certificate.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (!certificate) {
      certificate = await prisma.certificate.create({
        data: {
          userId,
          courseId,
          completedAt: enrollment.completedAt,
        },
      });

      // Notify user about certificate
      await createNotification({
        userId,
        type: "certificate_earned",
        title: "Certificate Earned!",
        message: `Congratulations! You earned a certificate for completing "${course.title}".`,
        metadata: JSON.stringify({ courseId, certificateId: certificate.id }),
      });
    }

    const completionDate = new Date(enrollment.completedAt).toLocaleDateString(
      "en-US",
      { year: "numeric", month: "long", day: "numeric" }
    );

    const certificateHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate of Completion - ${course.title}</title>
  <style>
    @media print {
      body { margin: 0; padding: 0; }
      .no-print { display: none !important; }
      .certificate-wrapper { box-shadow: none !important; }
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      background: #f3f4f6;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }

    .no-print {
      margin-bottom: 24px;
      display: flex;
      gap: 12px;
    }

    .no-print button {
      padding: 10px 24px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-print {
      background: #7c3aed;
      color: white;
    }

    .btn-print:hover { background: #6d28d9; }

    .btn-back {
      background: #e5e7eb;
      color: #374151;
    }

    .btn-back:hover { background: #d1d5db; }

    .certificate-wrapper {
      width: 900px;
      max-width: 100%;
      background: white;
      border-radius: 4px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .certificate {
      padding: 60px;
      position: relative;
      border: 3px solid #7c3aed;
      margin: 16px;
      border-radius: 2px;
    }

    .certificate::before {
      content: '';
      position: absolute;
      top: 8px;
      left: 8px;
      right: 8px;
      bottom: 8px;
      border: 1px solid #c4b5fd;
      border-radius: 2px;
      pointer-events: none;
    }

    .header {
      text-align: center;
      margin-bottom: 32px;
    }

    .logo {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }

    .logo-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #7c3aed, #4f46e5);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 16px;
    }

    .logo-text {
      font-size: 18px;
      font-weight: 700;
      color: #7c3aed;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .title {
      font-size: 36px;
      font-weight: 400;
      color: #1f2937;
      letter-spacing: 4px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .subtitle {
      font-size: 16px;
      color: #6b7280;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .body {
      text-align: center;
      margin-bottom: 32px;
    }

    .presented {
      font-size: 14px;
      color: #9ca3af;
      margin-bottom: 16px;
      letter-spacing: 1px;
    }

    .student-name {
      font-size: 32px;
      font-weight: 700;
      color: #7c3aed;
      padding-bottom: 8px;
      border-bottom: 2px solid #7c3aed;
      display: inline-block;
      margin-bottom: 20px;
    }

    .completion-text {
      font-size: 15px;
      color: #4b5563;
      line-height: 1.8;
      max-width: 600px;
      margin: 0 auto;
    }

    .course-title {
      font-size: 20px;
      font-weight: 700;
      color: #1f2937;
      margin-top: 12px;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 48px;
      padding-top: 24px;
    }

    .signature-block {
      text-align: center;
    }

    .signature-line {
      width: 180px;
      border-top: 1px solid #9ca3af;
      padding-top: 8px;
    }

    .signature-name {
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
    }

    .signature-role {
      font-size: 12px;
      color: #9ca3af;
    }

    .cert-details {
      text-align: center;
    }

    .cert-date {
      font-size: 13px;
      color: #6b7280;
    }

    .cert-id {
      font-size: 11px;
      color: #9ca3af;
      margin-top: 4px;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="btn-print" onclick="window.print()">Print Certificate</button>
    <button class="btn-back" onclick="window.history.back()">Go Back</button>
  </div>

  <div class="certificate-wrapper">
    <div class="certificate">
      <div class="header">
        <div class="logo">
          <div class="logo-icon">L</div>
          <span class="logo-text">LearnForge</span>
        </div>
        <h1 class="title">Certificate</h1>
        <p class="subtitle">of Completion</p>
      </div>

      <div class="body">
        <p class="presented">This is to certify that</p>
        <h2 class="student-name">${user.name}</h2>
        <p class="completion-text">
          has successfully completed all lessons and requirements for the course
        </p>
        <p class="course-title">${course.title}</p>
      </div>

      <div class="footer">
        <div class="signature-block">
          <div class="signature-line">
            <p class="signature-name">${course.creator.name}</p>
            <p class="signature-role">Course Instructor</p>
          </div>
        </div>

        <div class="cert-details">
          <p class="cert-date">${completionDate}</p>
          <p class="cert-id">Certificate ID: ${certificate.certificateNo}</p>
        </div>

        <div class="signature-block">
          <div class="signature-line">
            <p class="signature-name">LearnForge</p>
            <p class="signature-role">Platform</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

    return new NextResponse(certificateHtml, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
