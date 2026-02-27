interface GeneratedLesson {
  title: string;
  type: "text" | "video" | "quiz";
}

interface GeneratedChapter {
  title: string;
  lessons: GeneratedLesson[];
}

interface GeneratedQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const prebuiltOutlines: Record<string, GeneratedChapter[]> = {
  web: [
    {
      title: "Getting Started with Web Development",
      lessons: [
        { title: "What is Web Development?", type: "text" },
        { title: "Setting Up Your Development Environment", type: "text" },
        { title: "Understanding How the Web Works", type: "text" },
        { title: "Chapter Quiz: Web Basics", type: "quiz" },
      ],
    },
    {
      title: "HTML Fundamentals",
      lessons: [
        { title: "Introduction to HTML", type: "text" },
        { title: "HTML Elements and Attributes", type: "text" },
        { title: "Forms and Input Elements", type: "text" },
        { title: "Semantic HTML", type: "video" },
      ],
    },
    {
      title: "CSS Styling",
      lessons: [
        { title: "CSS Basics and Selectors", type: "text" },
        { title: "Box Model and Layout", type: "text" },
        { title: "Flexbox and Grid", type: "video" },
        { title: "Responsive Design", type: "text" },
      ],
    },
    {
      title: "JavaScript Essentials",
      lessons: [
        { title: "Variables and Data Types", type: "text" },
        { title: "Functions and Scope", type: "text" },
        { title: "DOM Manipulation", type: "video" },
        { title: "JavaScript Quiz", type: "quiz" },
      ],
    },
    {
      title: "React Framework",
      lessons: [
        { title: "Introduction to React", type: "text" },
        { title: "Components and Props", type: "text" },
        { title: "State Management", type: "video" },
        { title: "React Hooks", type: "text" },
      ],
    },
  ],
  data: [
    {
      title: "Introduction to Data Science",
      lessons: [
        { title: "What is Data Science?", type: "text" },
        { title: "The Data Science Workflow", type: "text" },
        { title: "Setting Up Python Environment", type: "text" },
      ],
    },
    {
      title: "Python for Data Science",
      lessons: [
        { title: "Python Basics Review", type: "text" },
        { title: "NumPy Fundamentals", type: "text" },
        { title: "Pandas DataFrames", type: "video" },
        { title: "Python Quiz", type: "quiz" },
      ],
    },
    {
      title: "Data Visualization",
      lessons: [
        { title: "Matplotlib Basics", type: "text" },
        { title: "Seaborn for Statistical Plots", type: "text" },
        { title: "Interactive Visualizations with Plotly", type: "video" },
      ],
    },
    {
      title: "Machine Learning Basics",
      lessons: [
        { title: "Supervised vs Unsupervised Learning", type: "text" },
        { title: "Linear Regression", type: "text" },
        { title: "Decision Trees and Random Forests", type: "text" },
        { title: "ML Quiz", type: "quiz" },
      ],
    },
  ],
  design: [
    {
      title: "Design Thinking",
      lessons: [
        { title: "What is Design Thinking?", type: "text" },
        { title: "Empathize and Define", type: "text" },
        { title: "Ideate and Prototype", type: "video" },
      ],
    },
    {
      title: "Visual Design Principles",
      lessons: [
        { title: "Color Theory", type: "text" },
        { title: "Typography Fundamentals", type: "text" },
        { title: "Layout and Composition", type: "text" },
        { title: "Design Principles Quiz", type: "quiz" },
      ],
    },
    {
      title: "UI Design",
      lessons: [
        { title: "UI Components and Patterns", type: "text" },
        { title: "Design Systems", type: "text" },
        { title: "Figma Walkthrough", type: "video" },
      ],
    },
    {
      title: "UX Research",
      lessons: [
        { title: "User Research Methods", type: "text" },
        { title: "Usability Testing", type: "text" },
        { title: "Creating Personas", type: "text" },
      ],
    },
  ],
  default: [
    {
      title: "Introduction",
      lessons: [
        { title: "Course Overview", type: "text" },
        { title: "Getting Started", type: "text" },
        { title: "Prerequisites and Setup", type: "text" },
      ],
    },
    {
      title: "Core Concepts",
      lessons: [
        { title: "Fundamental Principles", type: "text" },
        { title: "Key Terminology", type: "text" },
        { title: "Practical Examples", type: "video" },
        { title: "Core Concepts Quiz", type: "quiz" },
      ],
    },
    {
      title: "Advanced Topics",
      lessons: [
        { title: "Deep Dive", type: "text" },
        { title: "Best Practices", type: "text" },
        { title: "Case Studies", type: "video" },
      ],
    },
    {
      title: "Hands-On Projects",
      lessons: [
        { title: "Project Setup", type: "text" },
        { title: "Building the Project", type: "text" },
        { title: "Testing and Deployment", type: "text" },
        { title: "Final Assessment", type: "quiz" },
      ],
    },
  ],
};

function detectTopic(title: string, description: string): string {
  const combined = `${title} ${description}`.toLowerCase();

  if (
    combined.includes("web") ||
    combined.includes("html") ||
    combined.includes("css") ||
    combined.includes("javascript") ||
    combined.includes("react") ||
    combined.includes("frontend") ||
    combined.includes("fullstack")
  ) {
    return "web";
  }

  if (
    combined.includes("data") ||
    combined.includes("python") ||
    combined.includes("machine learning") ||
    combined.includes("ml") ||
    combined.includes("analytics") ||
    combined.includes("statistics")
  ) {
    return "data";
  }

  if (
    combined.includes("design") ||
    combined.includes("ui") ||
    combined.includes("ux") ||
    combined.includes("figma") ||
    combined.includes("visual") ||
    combined.includes("user experience")
  ) {
    return "design";
  }

  return "default";
}

export async function generateCourseOutline(
  title: string,
  description: string,
  numChapters?: number
): Promise<GeneratedChapter[]> {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const topic = detectTopic(title, description);
  let outline = prebuiltOutlines[topic] || prebuiltOutlines.default;

  if (numChapters && numChapters > 0) {
    outline = outline.slice(0, numChapters);
  }

  const customized = outline.map((chapter, index) => ({
    ...chapter,
    title:
      index === 0
        ? `Introduction to ${title.split(" ").slice(0, 4).join(" ")}`
        : chapter.title,
    lessons: chapter.lessons.map((lesson) => ({ ...lesson })),
  }));

  return customized;
}

export async function generateLessonContent(
  lessonTitle: string,
  courseTitle: string
): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return `<h2>${lessonTitle}</h2>
<p>Welcome to this lesson on <strong>${lessonTitle}</strong> as part of the course "${courseTitle}". This lesson will cover the key concepts and practical applications you need to know.</p>

<h3>Overview</h3>
<p>In this lesson, you will learn the fundamental principles and best practices related to ${lessonTitle.toLowerCase()}. We will cover both theory and hands-on examples to ensure you have a solid understanding.</p>

<h3>Key Concepts</h3>
<ul>
<li><strong>Concept 1</strong> - Understanding the basics and foundations of ${lessonTitle.toLowerCase()}</li>
<li><strong>Concept 2</strong> - Exploring intermediate patterns and techniques</li>
<li><strong>Concept 3</strong> - Advanced strategies for real-world application</li>
<li><strong>Concept 4</strong> - Common pitfalls and how to avoid them</li>
</ul>

<h3>Detailed Explanation</h3>
<p>Let's dive deeper into each concept. The first thing to understand is that ${lessonTitle.toLowerCase()} is a critical skill in today's landscape. Whether you're a beginner or an experienced practitioner, mastering these fundamentals will set you apart.</p>

<h4>Getting Started</h4>
<p>To begin working with ${lessonTitle.toLowerCase()}, you'll need to understand the basic workflow:</p>
<ol>
<li>Set up your environment and tools</li>
<li>Understand the core terminology</li>
<li>Practice with simple examples</li>
<li>Build progressively more complex projects</li>
<li>Review and refine your approach</li>
</ol>

<h3>Practical Example</h3>
<pre><code>// Example code for ${lessonTitle}
// This demonstrates the core concepts in action

function example() {
  // Step 1: Initialize
  const config = {
    setting: "value",
    enabled: true
  };

  // Step 2: Process
  const result = processData(config);

  // Step 3: Output
  console.log("Result:", result);
  return result;
}</code></pre>

<h3>Best Practices</h3>
<ul>
<li>Always start with a clear plan before implementation</li>
<li>Write clean, readable code with proper documentation</li>
<li>Test your work thoroughly at each stage</li>
<li>Seek feedback from peers and mentors</li>
<li>Stay up to date with the latest developments in the field</li>
</ul>

<h3>Summary</h3>
<p>In this lesson, we covered the essential aspects of ${lessonTitle.toLowerCase()}. Remember to practice these concepts regularly and apply them in your own projects. In the next lesson, we'll build on these foundations with more advanced topics.</p>

<blockquote>
<strong>Pro Tip:</strong> The best way to learn is by doing. Try to implement what you've learned in a small project before moving on to the next lesson.
</blockquote>`;
}

export async function generateQuizQuestions(
  lessonTitle: string,
  courseTitle: string
): Promise<GeneratedQuizQuestion[]> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return [
    {
      question: `What is the primary purpose of ${lessonTitle.toLowerCase()}?`,
      options: [
        "To add visual styling only",
        `To provide core functionality for ${courseTitle.toLowerCase()}`,
        "To handle database connections",
        "To manage user authentication",
      ],
      correctIndex: 1,
      explanation: `${lessonTitle} is primarily focused on providing core functionality and understanding within the context of ${courseTitle}.`,
    },
    {
      question: `Which of the following is a best practice when working with ${lessonTitle.toLowerCase()}?`,
      options: [
        "Skip testing to save time",
        "Write code without comments",
        "Start with a clear plan before implementation",
        "Avoid seeking feedback from others",
      ],
      correctIndex: 2,
      explanation:
        "Starting with a clear plan helps ensure you build the right solution and avoid costly mistakes later in the process.",
    },
    {
      question: `What should you do after learning the basics of ${lessonTitle.toLowerCase()}?`,
      options: [
        "Move on to an entirely different subject",
        "Practice with simple examples before advancing",
        "Skip to advanced topics immediately",
        "Stop learning and start working",
      ],
      correctIndex: 1,
      explanation:
        "Building a strong foundation through practice with simple examples is essential before moving to more complex topics.",
    },
    {
      question: `Which step comes first in the ${lessonTitle.toLowerCase()} workflow?`,
      options: [
        "Build complex projects",
        "Review and refine",
        "Set up your environment and tools",
        "Practice advanced techniques",
      ],
      correctIndex: 2,
      explanation:
        "Setting up your environment and tools is always the first step in any development workflow.",
    },
    {
      question: `What is the recommended approach for mastering ${lessonTitle.toLowerCase()}?`,
      options: [
        "Only read theory without practice",
        "Learn by doing and implementing in projects",
        "Memorize all the concepts",
        "Only watch video tutorials",
      ],
      correctIndex: 1,
      explanation:
        "Learning by doing is the most effective approach. Applying concepts in real projects solidifies understanding.",
    },
  ];
}

// --- Phase C: Advanced AI Features ---

interface QuizFromContent {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

interface WrittenAnswerAssessment {
  score: number;
  maxScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

interface LessonRecommendation {
  lessonId: string;
  lessonTitle: string;
  reason: string;
  priority: number;
}

export async function generateQuizFromContent(
  lessonContent: string,
  difficulty: "easy" | "medium" | "hard" = "medium"
): Promise<QuizFromContent[]> {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // Extract key terms from content for question generation
  const contentLower = lessonContent.toLowerCase();
  const topics: string[] = [];

  // Extract headings as topics
  const headingMatches = lessonContent.match(/<h[2-4][^>]*>(.*?)<\/h[2-4]>/gi);
  if (headingMatches) {
    headingMatches.forEach((m) => {
      const text = m.replace(/<[^>]+>/g, "").trim();
      if (text.length > 3 && text.length < 80) topics.push(text);
    });
  }

  // Extract bold terms
  const boldMatches = lessonContent.match(/<strong>(.*?)<\/strong>/gi);
  if (boldMatches) {
    boldMatches.forEach((m) => {
      const text = m.replace(/<[^>]+>/g, "").trim();
      if (text.length > 2 && text.length < 50) topics.push(text);
    });
  }

  const uniqueTopics = [...new Set(topics)].slice(0, 8);
  const mainTopic = uniqueTopics[0] || "the lesson content";

  const difficultyMultiplier = difficulty === "easy" ? 3 : difficulty === "hard" ? 5 : 4;
  const questionCount = Math.min(difficultyMultiplier, Math.max(3, uniqueTopics.length));

  const questions: QuizFromContent[] = [];

  const templates = [
    {
      q: (t: string) => `What is a key concept covered in "${t}"?`,
      opts: (t: string) => [
        `Understanding the fundamentals of ${t.toLowerCase()}`,
        "Unrelated database operations",
        "System administration tasks",
        "Network configuration",
      ],
      correct: 0,
      exp: (t: string) => `The lesson focuses on understanding ${t.toLowerCase()} and its core principles.`,
    },
    {
      q: (t: string) => `Which best describes the purpose of ${t.toLowerCase()}?`,
      opts: (t: string) => [
        "It is only used for testing",
        "It is a deprecated practice",
        `It provides essential functionality and understanding for ${t.toLowerCase()}`,
        "It is optional and rarely used",
      ],
      correct: 2,
      exp: (t: string) => `${t} is an essential concept that provides core functionality in this subject area.`,
    },
    {
      q: (t: string) => `When working with ${t.toLowerCase()}, what should you do first?`,
      opts: (t: string) => [
        "Skip to the advanced topics",
        `Understand the basics of ${t.toLowerCase()}`,
        "Ignore the prerequisites",
        "Only memorize the theory",
      ],
      correct: 1,
      exp: () => "Building a solid foundation of basic understanding is always the first step.",
    },
    {
      q: (t: string) => `What is the recommended approach for learning ${t.toLowerCase()}?`,
      opts: () => [
        "Only read documentation without practice",
        "Skip fundamentals and go to advanced topics",
        "Combine theory with hands-on practice",
        "Only watch others demonstrate",
      ],
      correct: 2,
      exp: () => "The most effective learning combines theoretical understanding with hands-on practice.",
    },
    {
      q: (t: string) => `Why is ${t.toLowerCase()} important in this context?`,
      opts: (t: string) => [
        "It is not important at all",
        `It forms a foundational part of understanding ${contentLower.includes("web") ? "web development" : contentLower.includes("data") ? "data science" : "the subject"}`,
        "It is only relevant in very specific cases",
        "It was important historically but not anymore",
      ],
      correct: 1,
      exp: (t: string) => `${t} is an important building block that supports further learning and application.`,
    },
  ];

  for (let i = 0; i < questionCount && i < templates.length; i++) {
    const topic = uniqueTopics[i] || mainTopic;
    const template = templates[i];
    questions.push({
      question: template.q(topic),
      options: template.opts(topic),
      correctIndex: template.correct,
      explanation: template.exp(topic),
      difficulty,
    });
  }

  return questions;
}

export async function assessWrittenAnswer(
  question: string,
  answer: string,
  rubric?: string
): Promise<WrittenAnswerAssessment> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const answerLength = answer.trim().length;
  const wordCount = answer.trim().split(/\s+/).length;
  const hasKeyTerms = question
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 4)
    .some((term) => answer.toLowerCase().includes(term));

  let baseScore = 50;
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (wordCount >= 50) {
    baseScore += 15;
    strengths.push("Provided a detailed and thorough response");
  } else if (wordCount >= 20) {
    baseScore += 8;
    strengths.push("Adequate response length");
  } else {
    improvements.push("Consider providing a more detailed response with additional examples");
  }

  if (hasKeyTerms) {
    baseScore += 15;
    strengths.push("Used relevant terminology from the question");
  } else {
    improvements.push("Try to incorporate key terms and concepts from the question");
  }

  if (answer.includes("because") || answer.includes("therefore") || answer.includes("since")) {
    baseScore += 10;
    strengths.push("Good use of reasoning and logical connections");
  } else {
    improvements.push("Include explanations of why and how, not just what");
  }

  if (answer.includes("example") || answer.includes("for instance") || answer.includes("such as")) {
    baseScore += 10;
    strengths.push("Included concrete examples to support points");
  } else {
    improvements.push("Support your arguments with specific examples");
  }

  const score = Math.min(100, Math.max(10, baseScore));

  let feedback: string;
  if (score >= 85) {
    feedback = "Excellent response! You demonstrate a strong understanding of the material and provide well-reasoned arguments with supporting examples.";
  } else if (score >= 70) {
    feedback = "Good response that covers the main points. Consider adding more depth and specific examples to strengthen your answer.";
  } else if (score >= 50) {
    feedback = "Satisfactory response that addresses some key points. You could improve by being more thorough and including relevant terminology.";
  } else {
    feedback = "This response needs more development. Review the material and try to address the question more completely with specific details.";
  }

  if (strengths.length === 0) {
    strengths.push("Attempted to answer the question");
  }

  return {
    score,
    maxScore: 100,
    feedback,
    strengths,
    improvements,
  };
}

export async function recommendNextLesson(
  studentProgress: { lessonId: string; completed: boolean; lessonTitle: string }[],
  courseStructure: { id: string; title: string; order: number; chapterTitle: string }[]
): Promise<LessonRecommendation[]> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const completedIds = new Set(
    studentProgress.filter((p) => p.completed).map((p) => p.lessonId)
  );

  const recommendations: LessonRecommendation[] = [];

  // Find the first incomplete lesson in order (natural next step)
  const incompleteLessons = courseStructure.filter((l) => !completedIds.has(l.id));

  incompleteLessons.forEach((lesson, index) => {
    let reason: string;
    let priority: number;

    if (index === 0) {
      reason = "This is your next lesson in the course sequence. Continue where you left off!";
      priority = 1;
    } else if (index < 3) {
      reason = `Part of your upcoming lessons in "${lesson.chapterTitle}". Complete in order for the best learning experience.`;
      priority = index + 1;
    } else {
      reason = `Future lesson in "${lesson.chapterTitle}". You'll get here after completing earlier materials.`;
      priority = index + 1;
    }

    if (index < 5) {
      recommendations.push({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        reason,
        priority,
      });
    }
  });

  return recommendations;
}

export async function generateCourseSummary(
  courseContent: {
    title: string;
    description: string;
    chapters: { title: string; lessonCount: number }[];
    totalLessons: number;
    totalDuration: number;
    level: string;
    category: string;
  }
): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const chapterList = courseContent.chapters
    .map((ch, i) => `${i + 1}. **${ch.title}** (${ch.lessonCount} lessons)`)
    .join("\n");

  const hours = Math.floor(courseContent.totalDuration / 60);
  const mins = courseContent.totalDuration % 60;
  const durationStr = hours > 0 ? `${hours} hours and ${mins} minutes` : `${mins} minutes`;

  return `# ${courseContent.title} - Course Summary

## Overview
${courseContent.description}

## Course Details
- **Level:** ${courseContent.level.charAt(0).toUpperCase() + courseContent.level.slice(1)}
- **Category:** ${courseContent.category.charAt(0).toUpperCase() + courseContent.category.slice(1)}
- **Total Lessons:** ${courseContent.totalLessons}
- **Estimated Duration:** ${durationStr}

## What You'll Learn
This ${courseContent.level}-level course in ${courseContent.category} covers ${courseContent.chapters.length} comprehensive chapters designed to take you from foundational concepts to practical application.

## Course Outline
${chapterList}

## Key Takeaways
- Gain a solid understanding of ${courseContent.title.toLowerCase()} fundamentals
- Learn through a combination of text lessons, video content, and interactive quizzes
- Build practical skills through hands-on exercises in each chapter
- Progress from basic concepts to advanced topics at a comfortable pace

## Who This Course Is For
This course is ideal for ${courseContent.level === "beginner" ? "newcomers looking to get started" : courseContent.level === "intermediate" ? "learners with some foundational knowledge looking to deepen their understanding" : "experienced practitioners looking to master advanced techniques"} in ${courseContent.category.replace("-", " ")}.

## Prerequisites
${courseContent.level === "beginner" ? "No prior experience required. Just bring your curiosity and willingness to learn!" : courseContent.level === "intermediate" ? "Basic familiarity with the core concepts is recommended. Review introductory materials if needed." : "Strong foundation in the fundamentals is required. This course builds on intermediate-level knowledge."}`;
}

export type {
  GeneratedChapter,
  GeneratedLesson,
  GeneratedQuizQuestion,
  QuizFromContent,
  WrittenAnswerAssessment,
  LessonRecommendation,
};
