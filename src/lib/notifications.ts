import { prisma } from "@/lib/prisma";

interface CreateNotificationParams {
  userId: string;
  type: string;
  title: string;
  message: string;
  metadata?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        metadata: params.metadata || null,
      },
    });
    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}

export async function notifyEnrollment(userId: string, courseTitle: string, courseId: string) {
  return createNotification({
    userId,
    type: "enrollment_confirmed",
    title: "Enrollment Confirmed",
    message: `You have been successfully enrolled in "${courseTitle}". Start learning now!`,
    metadata: JSON.stringify({ courseId }),
  });
}

export async function notifyQuizGraded(
  userId: string,
  quizTitle: string,
  score: number,
  courseId: string
) {
  return createNotification({
    userId,
    type: "quiz_graded",
    title: "Quiz Graded",
    message: `Your quiz "${quizTitle}" has been graded. You scored ${score}%.`,
    metadata: JSON.stringify({ courseId, score }),
  });
}

export async function notifyCertificateEarned(
  userId: string,
  courseTitle: string,
  courseId: string,
  certificateId: string
) {
  return createNotification({
    userId,
    type: "certificate_earned",
    title: "Certificate Earned!",
    message: `Congratulations! You earned a certificate for completing "${courseTitle}".`,
    metadata: JSON.stringify({ courseId, certificateId }),
  });
}

export async function notifyNewLessonPublished(
  userId: string,
  lessonTitle: string,
  courseTitle: string,
  courseId: string
) {
  return createNotification({
    userId,
    type: "new_lesson",
    title: "New Lesson Available",
    message: `A new lesson "${lessonTitle}" has been published in "${courseTitle}".`,
    metadata: JSON.stringify({ courseId }),
  });
}

export async function notifyCourseCompletion(
  userId: string,
  courseTitle: string,
  courseId: string
) {
  return createNotification({
    userId,
    type: "course_completed",
    title: "Course Completed!",
    message: `Amazing! You have completed all lessons in "${courseTitle}". Check your certificates!`,
    metadata: JSON.stringify({ courseId }),
  });
}
