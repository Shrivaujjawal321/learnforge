"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  GripVertical,
  X,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import type { GeneratedChapter } from "@/lib/mock-ai";

const steps = [
  { title: "Topic", description: "Define your course topic" },
  { title: "AI Outline", description: "Review generated outline" },
  { title: "Details", description: "Add course details" },
  { title: "Review", description: "Review and create" },
];

export default function NewCoursePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Step 1: Topic
  const [topic, setTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [level, setLevel] = useState("beginner");
  const [numChapters, setNumChapters] = useState("4");

  // Step 2: Outline
  const [outline, setOutline] = useState<GeneratedChapter[]>([]);

  // Step 3: Details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("development");
  const [price, setPrice] = useState("0");

  const generateOutline = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a course topic");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          targetAudience,
          level,
          numChapters: parseInt(numChapters),
        }),
      });

      if (!res.ok) throw new Error("Failed to generate");
      const data = await res.json();
      setOutline(data.outline);

      // Auto-fill title and description
      if (!title) {
        setTitle(
          topic.charAt(0).toUpperCase() + topic.slice(1) + " Complete Course"
        );
      }
      if (!description) {
        setDescription(
          `Master ${topic} from the ground up. This comprehensive course is designed for ${targetAudience || "learners"} at the ${level} level. You will learn through practical lessons, video content, and quizzes.`
        );
      }

      setCurrentStep(1);
      toast.success("Course outline generated!");
    } catch {
      toast.error("Failed to generate outline");
    } finally {
      setLoading(false);
    }
  };

  const removeChapter = (index: number) => {
    setOutline(outline.filter((_, i) => i !== index));
  };

  const removeLesson = (chapterIndex: number, lessonIndex: number) => {
    const updated = [...outline];
    updated[chapterIndex] = {
      ...updated[chapterIndex],
      lessons: updated[chapterIndex].lessons.filter(
        (_, i) => i !== lessonIndex
      ),
    };
    setOutline(updated);
  };

  const addLesson = (chapterIndex: number) => {
    const updated = [...outline];
    updated[chapterIndex] = {
      ...updated[chapterIndex],
      lessons: [
        ...updated[chapterIndex].lessons,
        { title: "New Lesson", type: "text" as const },
      ],
    };
    setOutline(updated);
  };

  const updateChapterTitle = (index: number, newTitle: string) => {
    const updated = [...outline];
    updated[index] = { ...updated[index], title: newTitle };
    setOutline(updated);
  };

  const updateLessonTitle = (
    chapterIndex: number,
    lessonIndex: number,
    newTitle: string
  ) => {
    const updated = [...outline];
    updated[chapterIndex] = {
      ...updated[chapterIndex],
      lessons: updated[chapterIndex].lessons.map((l, i) =>
        i === lessonIndex ? { ...l, title: newTitle } : l
      ),
    };
    setOutline(updated);
  };

  const createCourse = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    setCreating(true);
    try {
      // Create the course
      const courseRes = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          level,
        }),
      });

      if (!courseRes.ok) throw new Error("Failed to create course");
      const course = await courseRes.json();

      // Update price
      if (parseFloat(price) > 0) {
        await fetch(`/api/courses/${course.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ price: parseFloat(price) }),
        });
      }

      // Create chapters and lessons
      for (let i = 0; i < outline.length; i++) {
        const chapterRes = await fetch(
          `/api/courses/${course.id}/chapters`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: outline[i].title }),
          }
        );

        if (!chapterRes.ok) continue;
        const chapter = await chapterRes.json();

        for (const lesson of outline[i].lessons) {
          await fetch(
            `/api/courses/${course.id}/chapters/${chapter.id}/lessons`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: lesson.title,
                type: lesson.type,
                content: "",
              }),
            }
          );
        }
      }

      toast.success("Course created successfully!");
      router.push(`/creator/courses/${course.id}`);
    } catch {
      toast.error("Failed to create course");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create New Course</h1>
        <p className="text-muted-foreground">
          Use AI to generate your course structure
        </p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                i < currentStep
                  ? "bg-primary text-primary-foreground"
                  : i === currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {i < currentStep ? (
                <Check className="h-4 w-4" />
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`hidden text-sm sm:inline ${
                i === currentStep
                  ? "font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {step.title}
            </span>
            {i < steps.length - 1 && (
              <div className="mx-1 h-px w-8 bg-border" />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Topic */}
      {currentStep === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Define Your Course Topic</CardTitle>
            <CardDescription>
              Tell us about your course and let AI generate the outline
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Course Topic *</Label>
              <Input
                id="topic"
                placeholder="e.g., Web Development, Data Science, UI/UX Design"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="audience">Target Audience</Label>
              <Input
                id="audience"
                placeholder="e.g., Beginners, Junior Developers, Designers"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Level</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Number of Chapters</Label>
                <Select value={numChapters} onValueChange={setNumChapters}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Chapters</SelectItem>
                    <SelectItem value="4">4 Chapters</SelectItem>
                    <SelectItem value="5">5 Chapters</SelectItem>
                    <SelectItem value="6">6 Chapters</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={generateOutline}
              disabled={loading || !topic.trim()}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {loading ? "Generating with AI..." : "Generate Course Outline"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Outline */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Review Course Outline</CardTitle>
            <CardDescription>
              Edit the AI-generated outline. You can modify chapters and lessons.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {outline.map((chapter, ci) => (
              <div key={ci} className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <Input
                    value={chapter.title}
                    onChange={(e) => updateChapterTitle(ci, e.target.value)}
                    className="font-semibold"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeChapter(ci)}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="ml-6 space-y-2">
                  {chapter.lessons.map((lesson, li) => (
                    <div key={li} className="flex items-center gap-2">
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {lesson.type}
                      </Badge>
                      <Input
                        value={lesson.title}
                        onChange={(e) =>
                          updateLessonTitle(ci, li, e.target.value)
                        }
                        className="text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLesson(ci, li)}
                        className="shrink-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addLesson(ci)}
                    className="text-xs"
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Add Lesson
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(0)}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={() => setCurrentStep(2)}>
                Next: Course Details
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Details */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
            <CardDescription>
              Add the finishing touches to your course
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter course title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your course"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="data-science">Data Science</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0 for free"
                />
              </div>
            </div>
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              <p className="text-sm">Thumbnail upload placeholder</p>
              <p className="text-xs mt-1">
                You can add a thumbnail later in course settings
              </p>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={() => setCurrentStep(3)}>
                Next: Review
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Review */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Create</CardTitle>
            <CardDescription>
              Review your course details before creating
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border p-4 space-y-3">
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
              <div className="flex gap-2">
                <Badge variant="secondary" className="capitalize">
                  {level}
                </Badge>
                <Badge variant="secondary" className="capitalize">
                  {category}
                </Badge>
                <Badge variant="outline">
                  {parseFloat(price) === 0
                    ? "Free"
                    : `$${parseFloat(price).toFixed(2)}`}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">
                Course Structure ({outline.length} chapters,{" "}
                {outline.reduce((s, c) => s + c.lessons.length, 0)} lessons)
              </h4>
              {outline.map((chapter, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <p className="font-medium text-sm">
                    Chapter {i + 1}: {chapter.title}
                  </p>
                  <div className="ml-4 mt-2 space-y-1">
                    {chapter.lessons.map((lesson, j) => (
                      <div
                        key={j}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5"
                        >
                          {lesson.type}
                        </Badge>
                        {lesson.title}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(2)}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={createCourse} disabled={creating}>
                {creating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                {creating ? "Creating Course..." : "Create Course"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
