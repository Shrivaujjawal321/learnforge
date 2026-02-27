import path from "path";

// Set DATABASE_URL before any Prisma imports
const dbPath = path.resolve(process.cwd(), "dev.db");
process.env.DATABASE_URL = `file:${dbPath}`;

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean existing data
  await prisma.lessonProgress.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.review.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create users
  const creator = await prisma.user.create({
    data: {
      email: "creator@learnforge.io",
      name: "Alex Johnson",
      password: hashedPassword,
      role: "creator",
      bio: "Senior developer and educator with 10+ years of experience building web applications and teaching programming.",
    },
  });

  const student = await prisma.user.create({
    data: {
      email: "student@learnforge.io",
      name: "Jamie Smith",
      password: hashedPassword,
      role: "student",
      bio: "Aspiring developer learning new skills.",
    },
  });

  // Course 1: Web Development Bootcamp
  const webCourse = await prisma.course.create({
    data: {
      title: "Complete Web Development Bootcamp",
      slug: "complete-web-development-bootcamp",
      description: "Master web development from scratch. Learn HTML, CSS, JavaScript, React, Node.js, and more.",
      category: "development",
      level: "beginner",
      status: "published",
      price: 49.99,
      creatorId: creator.id,
    },
  });

  const webChapter = await prisma.chapter.create({
    data: {
      title: "Getting Started with Web Development",
      order: 1,
      courseId: webCourse.id,
    },
  });

  await prisma.lesson.create({
    data: {
      title: "What is Web Development?",
      order: 1,
      type: "text",
      duration: 10,
      content: "<h2>What is Web Development?</h2><p>Web development is the process of building websites and web applications.</p>",
      chapterId: webChapter.id,
    },
  });

  await prisma.lesson.create({
    data: {
      title: "Setting Up Your Development Environment",
      order: 2,
      type: "text",
      duration: 15,
      content: "<h2>Setting Up Your Development Environment</h2><p>Before we start coding, we need to set up the right tools.</p>",
      chapterId: webChapter.id,
    },
  });

  // Course 2: Data Science with Python
  const dataCourse = await prisma.course.create({
    data: {
      title: "Data Science with Python",
      slug: "data-science-with-python",
      description: "Learn data science from the ground up using Python. Master pandas, NumPy, matplotlib, and scikit-learn.",
      category: "data-science",
      level: "intermediate",
      status: "published",
      price: 39.99,
      creatorId: creator.id,
    },
  });

  const dataChapter = await prisma.chapter.create({
    data: {
      title: "Python for Data Science",
      order: 1,
      courseId: dataCourse.id,
    },
  });

  await prisma.lesson.create({
    data: {
      title: "Python Environment Setup",
      order: 1,
      type: "text",
      duration: 10,
      content: "<h2>Python Environment Setup</h2><p>Setting up a proper Python environment is the first step.</p>",
      chapterId: dataChapter.id,
    },
  });

  // Course 3: UI/UX Design Fundamentals (free)
  const designCourse = await prisma.course.create({
    data: {
      title: "UI/UX Design Fundamentals",
      slug: "ui-ux-design-fundamentals",
      description: "Master the principles of user interface and user experience design.",
      category: "design",
      level: "beginner",
      status: "published",
      price: 0,
      creatorId: creator.id,
    },
  });

  const designChapter = await prisma.chapter.create({
    data: {
      title: "Introduction to Design",
      order: 1,
      courseId: designCourse.id,
    },
  });

  await prisma.lesson.create({
    data: {
      title: "What is UI/UX Design?",
      order: 1,
      type: "text",
      duration: 10,
      content: "<h2>What is UI/UX Design?</h2><p>UI and UX design are crucial disciplines in creating digital products.</p>",
      chapterId: designChapter.id,
    },
  });

  // Course 4: Draft course
  await prisma.course.create({
    data: {
      title: "Advanced TypeScript Patterns",
      slug: "advanced-typescript-patterns",
      description: "Deep dive into advanced TypeScript concepts including generics, conditional types, and design patterns.",
      category: "development",
      level: "advanced",
      status: "draft",
      price: 59.99,
      creatorId: creator.id,
    },
  });

  // Create enrollment for student
  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: webCourse.id,
      progress: 35,
    },
  });

  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: designCourse.id,
      progress: 15,
    },
  });

  console.log("Seed completed successfully!");
  console.log("Users created: creator@learnforge.io, student@learnforge.io");
  console.log("Password for both: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
