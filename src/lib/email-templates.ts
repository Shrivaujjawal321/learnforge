// Email Templates for LearnForge
// These generate HTML email content for various platform events.
// In production, integrate with an email provider (SendGrid, Resend, etc.)

interface EnrollmentEmailParams {
  studentName: string;
  courseTitle: string;
  instructorName: string;
  courseUrl: string;
}

interface CertificateEmailParams {
  studentName: string;
  courseTitle: string;
  completionDate: string;
  certificateId: string;
  certificateUrl: string;
}

interface CourseCompletionEmailParams {
  studentName: string;
  courseTitle: string;
  instructorName: string;
  completionDate: string;
  progressPercent: number;
  certificateUrl: string;
}

const baseStyles = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; margin-top: 32px; margin-bottom: 32px; }
  .header { background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 32px; text-align: center; }
  .header h1 { color: white; font-size: 24px; margin: 0; }
  .header p { color: #c4b5fd; margin-top: 8px; font-size: 14px; }
  .content { padding: 32px; }
  .content h2 { color: #1f2937; font-size: 20px; margin-bottom: 16px; }
  .content p { color: #4b5563; line-height: 1.6; margin-bottom: 16px; }
  .btn { display: inline-block; background: #7c3aed; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0; }
  .footer { padding: 24px 32px; background: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb; }
  .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
  .highlight { background: #f5f3ff; padding: 16px; border-radius: 8px; border-left: 4px solid #7c3aed; margin: 16px 0; }
  .highlight p { margin: 0; color: #5b21b6; font-weight: 500; }
`;

export function enrollmentConfirmationEmail(params: EnrollmentEmailParams): string {
  return `<!DOCTYPE html>
<html>
<head><style>${baseStyles}</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>LearnForge</h1>
      <p>Enrollment Confirmed</p>
    </div>
    <div class="content">
      <h2>Welcome to the course!</h2>
      <p>Hi ${params.studentName},</p>
      <p>You have been successfully enrolled in <strong>${params.courseTitle}</strong> by ${params.instructorName}.</p>
      <div class="highlight">
        <p>Your learning journey starts now! Dive into the first lesson and begin building your skills.</p>
      </div>
      <p>Here's what you can expect:</p>
      <ul style="color: #4b5563; line-height: 2;">
        <li>Structured lessons organized into clear chapters</li>
        <li>Interactive quizzes to test your knowledge</li>
        <li>A certificate of completion when you finish</li>
      </ul>
      <a href="${params.courseUrl}" class="btn">Start Learning</a>
      <p>Happy learning!</p>
      <p>- The LearnForge Team</p>
    </div>
    <div class="footer">
      <p>LearnForge - AI-Powered Learning Platform</p>
    </div>
  </div>
</body>
</html>`;
}

export function certificateEmail(params: CertificateEmailParams): string {
  return `<!DOCTYPE html>
<html>
<head><style>${baseStyles}</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>LearnForge</h1>
      <p>Certificate Earned</p>
    </div>
    <div class="content">
      <h2>Congratulations, ${params.studentName}!</h2>
      <p>You have earned a certificate for completing <strong>${params.courseTitle}</strong>.</p>
      <div class="highlight">
        <p>Certificate ID: ${params.certificateId}</p>
        <p style="margin-top: 4px;">Completed: ${params.completionDate}</p>
      </div>
      <p>This certificate recognizes your dedication and hard work in completing all the course material. You can view, download, and print your certificate at any time.</p>
      <a href="${params.certificateUrl}" class="btn">View Certificate</a>
      <p>Keep up the great work and continue your learning journey!</p>
      <p>- The LearnForge Team</p>
    </div>
    <div class="footer">
      <p>LearnForge - AI-Powered Learning Platform</p>
    </div>
  </div>
</body>
</html>`;
}

export function courseCompletionEmail(params: CourseCompletionEmailParams): string {
  return `<!DOCTYPE html>
<html>
<head><style>${baseStyles}</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>LearnForge</h1>
      <p>Course Completed</p>
    </div>
    <div class="content">
      <h2>Amazing Achievement, ${params.studentName}!</h2>
      <p>You have completed <strong>${params.courseTitle}</strong> by ${params.instructorName}!</p>
      <div class="highlight">
        <p>Completion Date: ${params.completionDate}</p>
        <p style="margin-top: 4px;">Final Progress: ${params.progressPercent}%</p>
      </div>
      <p>Your dedication to learning is truly inspiring. You have worked through all the lessons, completed the quizzes, and demonstrated your understanding of the material.</p>
      <p>Your certificate of completion is ready:</p>
      <a href="${params.certificateUrl}" class="btn">View Certificate</a>
      <p>What's next? Browse our catalog for more courses to continue growing your skills.</p>
      <p>- The LearnForge Team</p>
    </div>
    <div class="footer">
      <p>LearnForge - AI-Powered Learning Platform</p>
    </div>
  </div>
</body>
</html>`;
}

export type {
  EnrollmentEmailParams,
  CertificateEmailParams,
  CourseCompletionEmailParams,
};
