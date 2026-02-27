"use client";

import { useState, use, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle,
  Circle,
  FileText,
  PlayCircle,
  HelpCircle,
  ChevronRight,
  ArrowLeft,
  Video,
} from "lucide-react";
import { toast } from "sonner";

interface QuizQuestion {
  id: string;
  question: string;
  options: string;
  correctAnswer: number;
  explanation: string | null;
  order: number;
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  type: string;
  videoUrl: string | null;
  duration: number | null;
  order: number;
  quiz: {
    id: string;
    questions: QuizQuestion[];
  } | null;
}

interface Chapter {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface LearnData {
  course: {
    id: string;
    title: string;
    creator: { id: string; name: string };
    chapters: Chapter[];
  };
  enrollmentId: string;
  completedLessonIds: string[];
  progressPercent: number;
  totalLessons: number;
  completedCount: number;
}

export default function CoursePlayerPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const queryClient = useQueryClient();
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const { data, isLoading } = useQuery<LearnData>({
    queryKey: ["learn", courseId],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}/learn`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  // Set initial selected lesson
  const allLessons =
    data?.course.chapters.flatMap((ch) =>
      ch.lessons.map((l) => ({ ...l, chapterId: ch.id }))
    ) || [];

  if (data && !selectedLessonId && allLessons.length > 0) {
    // Find first incomplete lesson or default to first
    const firstIncomplete = allLessons.find(
      (l) => !data.completedLessonIds.includes(l.id)
    );
    // Use setTimeout to avoid setting state during render
    setTimeout(() => {
      setSelectedLessonId(firstIncomplete?.id || allLessons[0]?.id || null);
    }, 0);
  }

  const selectedLesson = allLessons.find((l) => l.id === selectedLessonId);
  const selectedLessonIndex = allLessons.findIndex(
    (l) => l.id === selectedLessonId
  );
  const nextLesson =
    selectedLessonIndex >= 0 && selectedLessonIndex < allLessons.length - 1
      ? allLessons[selectedLessonIndex + 1]
      : null;

  const markComplete = useMutation({
    mutationFn: async (lessonId: string) => {
      const res = await fetch(`/api/courses/${courseId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, completed: true }),
      });
      if (!res.ok) throw new Error("Failed to update progress");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learn", courseId] });
    },
  });

  const handleSelectLesson = useCallback(
    (lessonId: string) => {
      setSelectedLessonId(lessonId);
      setQuizAnswers({});
      setQuizSubmitted(false);
    },
    []
  );

  const handleCompleteAndNext = () => {
    if (selectedLessonId) {
      markComplete.mutate(selectedLessonId);
      toast.success("Lesson completed!");
    }
    if (nextLesson) {
      handleSelectLesson(nextLesson.id);
    }
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
    if (selectedLesson?.quiz) {
      const totalQuestions = selectedLesson.quiz.questions.length;
      const correctCount = selectedLesson.quiz.questions.filter(
        (q) => quizAnswers[q.id] === q.correctAnswer
      ).length;
      const score = Math.round((correctCount / totalQuestions) * 100);

      if (score >= 70) {
        toast.success(
          `Quiz passed! Score: ${score}% (${correctCount}/${totalQuestions})`
        );
        if (selectedLessonId) {
          markComplete.mutate(selectedLessonId);
        }
      } else {
        toast.error(
          `Score: ${score}% (${correctCount}/${totalQuestions}). Need 70% to pass.`
        );
      }
    }
  };

  const lessonIcon = (type: string, completed: boolean) => {
    if (completed) return <CheckCircle className="h-4 w-4 text-green-500" />;
    switch (type) {
      case "video":
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case "quiz":
        return <HelpCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-300" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-6">
        <Skeleton className="h-[600px] w-72" />
        <Skeleton className="h-[600px] flex-1" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p>Could not load course. Are you enrolled?</p>
        <Button asChild className="mt-4">
          <Link href="/courses">Browse Courses</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/my-courses">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-bold line-clamp-1">
              {data.course.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              by {data.course.creator.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">
            {data.progressPercent}% complete
          </span>
          <Progress value={data.progressPercent} className="w-32 h-2" />
        </div>
      </div>

      <div className="flex gap-6 min-h-[calc(100vh-220px)]">
        {/* Sidebar - Chapter accordion with lessons */}
        <div className="w-72 shrink-0 rounded-lg border bg-card overflow-y-auto max-h-[calc(100vh-200px)]">
          <div className="p-3 border-b">
            <p className="text-xs text-muted-foreground">
              {data.completedCount} / {data.totalLessons} lessons completed
            </p>
          </div>
          <Accordion
            type="multiple"
            defaultValue={data.course.chapters.map((_, i) => `ch-${i}`)}
          >
            {data.course.chapters.map((chapter, ci) => (
              <AccordionItem key={chapter.id} value={`ch-${ci}`}>
                <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
                  <span className="text-left font-medium line-clamp-1">
                    {chapter.title}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-1">
                  <div className="space-y-0.5 px-1">
                    {chapter.lessons.map((lesson) => {
                      const isCompleted =
                        data.completedLessonIds.includes(lesson.id);
                      const isSelected = selectedLessonId === lesson.id;

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => handleSelectLesson(lesson.id)}
                          className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                            isSelected
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-accent"
                          }`}
                        >
                          {lessonIcon(lesson.type, isCompleted)}
                          <span className="text-left truncate flex-1">
                            {lesson.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Main content area */}
        <div className="flex-1 min-w-0 rounded-lg border bg-card overflow-y-auto max-h-[calc(100vh-200px)]">
          {selectedLesson ? (
            <div className="p-6 space-y-6">
              {/* Lesson header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="capitalize text-xs">
                      {selectedLesson.type}
                    </Badge>
                    {selectedLesson.duration && (
                      <span className="text-xs text-muted-foreground">
                        {selectedLesson.duration} min
                      </span>
                    )}
                    {data.completedLessonIds.includes(selectedLesson.id) && (
                      <Badge
                        variant="default"
                        className="text-xs bg-green-500 hover:bg-green-600"
                      >
                        Completed
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-xl font-bold">{selectedLesson.title}</h2>
                </div>
              </div>

              <Separator />

              {/* Video placeholder */}
              {selectedLesson.type === "video" && (
                <div className="rounded-lg bg-gray-900 aspect-video flex items-center justify-center">
                  <div className="text-center text-white">
                    <Video className="mx-auto h-12 w-12 mb-2 opacity-50" />
                    <p className="text-sm opacity-70">Video Player Placeholder</p>
                    <p className="text-xs opacity-50 mt-1">
                      Mux video integration would go here
                    </p>
                  </div>
                </div>
              )}

              {/* Lesson content */}
              {selectedLesson.content && (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: selectedLesson.content,
                  }}
                />
              )}

              {/* Quiz section */}
              {selectedLesson.quiz &&
                selectedLesson.quiz.questions.length > 0 && (
                  <div className="space-y-4">
                    <Separator />
                    <h3 className="text-lg font-bold">Quiz</h3>
                    <p className="text-sm text-muted-foreground">
                      Answer the questions below. You need 70% to pass.
                    </p>

                    {selectedLesson.quiz.questions.map((q, qi) => {
                      const options: string[] = JSON.parse(q.options);
                      const userAnswer = quizAnswers[q.id];
                      const isCorrect =
                        quizSubmitted && userAnswer === q.correctAnswer;
                      const isWrong =
                        quizSubmitted &&
                        userAnswer !== undefined &&
                        userAnswer !== q.correctAnswer;

                      return (
                        <div key={q.id} className="rounded-lg border p-4">
                          <p className="font-medium mb-3">
                            {qi + 1}. {q.question}
                          </p>
                          <div className="space-y-2">
                            {options.map((opt, oi) => {
                              let optionClass =
                                "border rounded-md p-3 text-sm cursor-pointer transition-colors ";

                              if (quizSubmitted) {
                                if (oi === q.correctAnswer) {
                                  optionClass +=
                                    "bg-green-50 border-green-300 text-green-800";
                                } else if (oi === userAnswer && isWrong) {
                                  optionClass +=
                                    "bg-red-50 border-red-300 text-red-800";
                                } else {
                                  optionClass += "opacity-50";
                                }
                              } else if (userAnswer === oi) {
                                optionClass +=
                                  "bg-primary/10 border-primary text-primary";
                              } else {
                                optionClass += "hover:bg-muted/50";
                              }

                              return (
                                <button
                                  key={oi}
                                  className={`w-full text-left ${optionClass}`}
                                  onClick={() => {
                                    if (!quizSubmitted) {
                                      setQuizAnswers({
                                        ...quizAnswers,
                                        [q.id]: oi,
                                      });
                                    }
                                  }}
                                  disabled={quizSubmitted}
                                >
                                  <span className="font-medium mr-2">
                                    {String.fromCharCode(65 + oi)}.
                                  </span>
                                  {opt}
                                  {quizSubmitted &&
                                    oi === q.correctAnswer && (
                                      <CheckCircle className="inline ml-2 h-4 w-4 text-green-600" />
                                    )}
                                </button>
                              );
                            })}
                          </div>

                          {quizSubmitted && q.explanation && (
                            <div
                              className={`mt-3 rounded-md p-3 text-sm ${
                                isCorrect
                                  ? "bg-green-50 text-green-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              <strong>Explanation:</strong> {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {!quizSubmitted ? (
                      <Button
                        onClick={handleQuizSubmit}
                        disabled={
                          Object.keys(quizAnswers).length <
                          (selectedLesson.quiz?.questions.length || 0)
                        }
                      >
                        Submit Quiz
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setQuizAnswers({});
                          setQuizSubmitted(false);
                        }}
                      >
                        Retry Quiz
                      </Button>
                    )}
                  </div>
                )}

              <Separator />

              {/* Navigation buttons */}
              <div className="flex justify-between">
                <div>
                  {!data.completedLessonIds.includes(selectedLesson.id) && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        markComplete.mutate(selectedLesson.id);
                        toast.success("Lesson marked as complete");
                      }}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as Complete
                    </Button>
                  )}
                </div>
                {nextLesson ? (
                  <Button onClick={handleCompleteAndNext}>
                    Next Lesson
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      if (selectedLessonId) {
                        markComplete.mutate(selectedLessonId);
                      }
                      toast.success("Congratulations! You completed the course!");
                    }}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Finish Course
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full p-6">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 font-semibold">Select a Lesson</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Choose a lesson from the sidebar to start learning
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
