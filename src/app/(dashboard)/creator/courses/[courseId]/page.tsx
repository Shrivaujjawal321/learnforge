"use client";

import { useState, use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Trash2,
  ChevronRight,
  FileText,
  Video,
  HelpCircle,
  Sparkles,
  Loader2,
  Save,
  Users,
  BarChart3,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

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
    questions: {
      id: string;
      question: string;
      options: string;
      correctAnswer: number;
      explanation: string | null;
      order: number;
    }[];
  } | null;
}

interface Chapter {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: string;
  price: number;
  level: string;
  category: string;
  chapters: Chapter[];
  studentCount: number;
  lessonCount: number;
}

export default function CourseEditorPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const queryClient = useQueryClient();
  const [selectedLesson, setSelectedLesson] = useState<{
    chapterId: string;
    lesson: Lesson;
  } | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  const { data: course, isLoading } = useQuery<Course>({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const addChapter = useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch(`/api/courses/${courseId}/chapters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to create chapter");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      toast.success("Chapter added");
    },
  });

  const deleteChapter = useMutation({
    mutationFn: async (chapterId: string) => {
      const res = await fetch(
        `/api/courses/${courseId}/chapters/${chapterId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete chapter");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      setSelectedLesson(null);
      toast.success("Chapter deleted");
    },
  });

  const addLesson = useMutation({
    mutationFn: async ({
      chapterId,
      title,
    }: {
      chapterId: string;
      title: string;
    }) => {
      const res = await fetch(
        `/api/courses/${courseId}/chapters/${chapterId}/lessons`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content: "" }),
        }
      );
      if (!res.ok) throw new Error("Failed to create lesson");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      toast.success("Lesson added");
    },
  });

  const deleteLesson = useMutation({
    mutationFn: async ({
      chapterId,
      lessonId,
    }: {
      chapterId: string;
      lessonId: string;
    }) => {
      const res = await fetch(
        `/api/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete lesson");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      setSelectedLesson(null);
      toast.success("Lesson deleted");
    },
  });

  const selectLesson = (chapterId: string, lesson: Lesson) => {
    setSelectedLesson({ chapterId, lesson });
    setEditContent(lesson.content || "");
    setEditTitle(lesson.title);
  };

  const saveLesson = async () => {
    if (!selectedLesson) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/courses/${courseId}/chapters/${selectedLesson.chapterId}/lessons/${selectedLesson.lesson.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: editTitle,
            content: editContent,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to save");
      await queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      toast.success("Lesson saved");
    } catch {
      toast.error("Failed to save lesson");
    } finally {
      setSaving(false);
    }
  };

  const generateContent = async () => {
    if (!selectedLesson) return;
    setGeneratingContent(true);
    try {
      const res = await fetch("/api/ai/generate-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonTitle: editTitle,
          courseTitle: course?.title,
        }),
      });
      if (!res.ok) throw new Error("Failed to generate");
      const data = await res.json();
      setEditContent(data.content);
      toast.success("Content generated! Click Save to keep it.");
    } catch {
      toast.error("Failed to generate content");
    } finally {
      setGeneratingContent(false);
    }
  };

  const generateQuiz = async () => {
    if (!selectedLesson) return;
    setGeneratingQuiz(true);
    try {
      const res = await fetch("/api/ai/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonTitle: editTitle,
          courseTitle: course?.title,
        }),
      });
      if (!res.ok) throw new Error("Failed to generate");
      const data = await res.json();

      // Save quiz to the lesson
      const quizQuestions = data.questions.map(
        (
          q: {
            question: string;
            options: string[];
            correctIndex: number;
            explanation: string;
          },
          i: number
        ) => ({
          question: q.question,
          options: JSON.stringify(q.options),
          correctAnswer: q.correctIndex,
          explanation: q.explanation,
          order: i + 1,
        })
      );

      await fetch(
        `/api/courses/${courseId}/chapters/${selectedLesson.chapterId}/lessons/${selectedLesson.lesson.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quiz: { questions: quizQuestions },
          }),
        }
      );

      await queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      toast.success("Quiz generated and saved!");
    } catch {
      toast.error("Failed to generate quiz");
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const lessonIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-3.5 w-3.5 text-blue-500" />;
      case "quiz":
        return <HelpCircle className="h-3.5 w-3.5 text-amber-500" />;
      default:
        return <FileText className="h-3.5 w-3.5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-6">
          <Skeleton className="h-[600px] w-72" />
          <Skeleton className="h-[600px] flex-1" />
        </div>
      </div>
    );
  }

  if (!course) {
    return <div className="text-center py-12">Course not found</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/creator/courses">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">{course.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={
                  course.status === "published" ? "default" : "secondary"
                }
                className="capitalize"
              >
                {course.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {course.lessonCount} lessons
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/creator/courses/${courseId}/students`}>
              <Users className="mr-2 h-4 w-4" />
              Students
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/creator/courses/${courseId}/analytics`}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/creator/courses/${courseId}/settings`}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex gap-6 min-h-[600px]">
        {/* Left sidebar - Chapter/Lesson tree */}
        <div className="w-72 shrink-0 rounded-lg border bg-card overflow-y-auto max-h-[calc(100vh-200px)]">
          <div className="p-3 border-b">
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() =>
                addChapter.mutate(
                  `Chapter ${(course.chapters?.length || 0) + 1}`
                )
              }
            >
              <Plus className="mr-2 h-3 w-3" />
              Add Chapter
            </Button>
          </div>

          <div className="p-2 space-y-1">
            {course.chapters?.map((chapter) => (
              <div key={chapter.id}>
                <div className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-accent group">
                  <span className="text-sm font-medium truncate flex-1">
                    {chapter.title}
                  </span>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() =>
                        addLesson.mutate({
                          chapterId: chapter.id,
                          title: "New Lesson",
                        })
                      }
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={() => {
                        if (
                          confirm(
                            "Delete this chapter and all its lessons?"
                          )
                        ) {
                          deleteChapter.mutate(chapter.id);
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="ml-2 space-y-0.5">
                  {chapter.lessons?.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => selectLesson(chapter.id, lesson)}
                      className={`flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
                        selectedLesson?.lesson.id === lesson.id
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      {lessonIcon(lesson.type)}
                      <span className="truncate flex-1 text-left">
                        {lesson.title}
                      </span>
                      <ChevronRight className="h-3 w-3 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 min-w-0">
          {selectedLesson ? (
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {lessonIcon(selectedLesson.lesson.type)}
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="font-semibold text-lg border-none shadow-none px-0 focus-visible:ring-0"
                    />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm("Delete this lesson?")) {
                          deleteLesson.mutate({
                            chapterId: selectedLesson.chapterId,
                            lessonId: selectedLesson.lesson.id,
                          });
                        }
                      }}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Delete
                    </Button>
                    <Button onClick={saveLesson} disabled={saving} size="sm">
                      {saving ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <Save className="mr-1 h-3 w-3" />
                      )}
                      Save
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <Separator />

              <CardContent className="pt-4 space-y-4">
                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateContent}
                    disabled={generatingContent}
                  >
                    {generatingContent ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="mr-1 h-3 w-3" />
                    )}
                    Generate Content with AI
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateQuiz}
                    disabled={generatingQuiz}
                  >
                    {generatingQuiz ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <HelpCircle className="mr-1 h-3 w-3" />
                    )}
                    Generate Quiz
                  </Button>
                </div>

                {/* Video upload placeholder */}
                {selectedLesson.lesson.type === "video" && (
                  <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
                    <Video className="mx-auto h-8 w-8 mb-2" />
                    <p className="text-sm">Video upload placeholder</p>
                    <p className="text-xs mt-1">
                      Mux video integration would go here
                    </p>
                  </div>
                )}

                {/* Content editor */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Lesson Content (HTML/Markdown)
                  </label>
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                    placeholder="Enter lesson content here... HTML is supported."
                  />
                </div>

                {/* Preview */}
                {editContent && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Preview</label>
                    <div
                      className="prose prose-sm max-w-none rounded-lg border p-4 bg-muted/30"
                      dangerouslySetInnerHTML={{ __html: editContent }}
                    />
                  </div>
                )}

                {/* Quiz display */}
                {selectedLesson.lesson.quiz &&
                  selectedLesson.lesson.quiz.questions.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Quiz ({selectedLesson.lesson.quiz.questions.length}{" "}
                        questions)
                      </label>
                      <div className="space-y-3">
                        {selectedLesson.lesson.quiz.questions.map((q, i) => (
                          <div key={q.id} className="rounded-lg border p-3">
                            <p className="text-sm font-medium">
                              {i + 1}. {q.question}
                            </p>
                            <div className="mt-2 space-y-1">
                              {JSON.parse(q.options).map(
                                (opt: string, j: number) => (
                                  <div
                                    key={j}
                                    className={`text-xs px-2 py-1 rounded ${
                                      j === q.correctAnswer
                                        ? "bg-green-50 text-green-700 font-medium"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    {String.fromCharCode(65 + j)}. {opt}
                                    {j === q.correctAnswer && " (correct)"}
                                  </div>
                                )
                              )}
                            </div>
                            {q.explanation && (
                              <p className="mt-2 text-xs text-muted-foreground italic">
                                {q.explanation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 font-semibold">Select a Lesson</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Choose a lesson from the sidebar to start editing
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
