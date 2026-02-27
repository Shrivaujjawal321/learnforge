"use client";

import { use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Clock,
  Users,
  PlayCircle,
  FileText,
  HelpCircle,
  CheckCircle,
  ArrowLeft,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface CourseDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  price: number;
  level: string;
  category: string;
  status: string;
  creator: {
    id: string;
    name: string;
    bio: string | null;
    avatarUrl: string | null;
  };
  chapters: {
    id: string;
    title: string;
    order: number;
    lessons: {
      id: string;
      title: string;
      type: string;
      duration: number | null;
      order: number;
    }[];
  }[];
  enrolledCount: number;
  totalDuration: number;
  totalLessons: number;
  isEnrolled: boolean;
}

export default function CourseLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const { data: course, isLoading } = useQuery<CourseDetail>({
    queryKey: ["public-course", slug],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${slug}/public`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const enroll = useMutation({
    mutationFn: async () => {
      if (!session) {
        router.push("/login");
        return;
      }
      const res = await fetch(`/api/courses/${course?.id}/enroll`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to enroll");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["public-course", slug] });
      toast.success("Successfully enrolled!");
      router.push(`/learn/${course?.id}`);
    },
    onError: (error: Error) => {
      if (error.message === "Already enrolled") {
        router.push(`/learn/${course?.id}`);
      } else {
        toast.error(error.message);
      }
    },
  });

  const lessonIcon = (type: string) => {
    switch (type) {
      case "video":
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case "quiz":
        return <HelpCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-8 w-96" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Course not found</h2>
        <Button asChild className="mt-4">
          <Link href="/courses">Browse Courses</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/courses">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Link>
      </Button>

      {/* Hero Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Course Header */}
          <div className="rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 p-6 text-white">
            <div className="flex gap-2 mb-3">
              <Badge variant="secondary" className="capitalize bg-white/20 text-white border-none">
                {course.level}
              </Badge>
              <Badge variant="secondary" className="capitalize bg-white/20 text-white border-none">
                {course.category}
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">{course.title}</h1>
            <p className="mt-3 text-purple-100 leading-relaxed">
              {course.description}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-purple-200">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {course.enrolledCount} students
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {course.totalLessons} lessons
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDuration(course.totalDuration)}
              </span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                {course.creator.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium">{course.creator.name}</p>
                {course.creator.bio && (
                  <p className="text-xs text-purple-200 line-clamp-1">
                    {course.creator.bio}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Curriculum */}
          <Card>
            <CardHeader>
              <CardTitle>Course Curriculum</CardTitle>
              <p className="text-sm text-muted-foreground">
                {course.chapters.length} chapters, {course.totalLessons} lessons
              </p>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" defaultValue={["chapter-0"]}>
                {course.chapters.map((chapter, i) => (
                  <AccordionItem key={chapter.id} value={`chapter-${i}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {i + 1}
                        </span>
                        <span className="font-medium text-left">
                          {chapter.title}
                        </span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {chapter.lessons.length} lessons
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="ml-9 space-y-2">
                        {chapter.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-2">
                              {lessonIcon(lesson.type)}
                              <span>{lesson.title}</span>
                            </div>
                            {lesson.duration && (
                              <span className="text-xs text-muted-foreground">
                                {lesson.duration} min
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Card - Sticky Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Card className="overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-16 w-16 text-purple-300" />
                )}
              </div>
              <CardContent className="pt-6 space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold">
                    {course.price === 0 ? "Free" : `$${course.price}`}
                  </p>
                </div>

                {course.isEnrolled ? (
                  <div className="space-y-2">
                    <Button asChild className="w-full" size="lg">
                      <Link href={`/learn/${course.id}`}>
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Continue Learning
                      </Link>
                    </Button>
                    <div className="flex items-center justify-center gap-1 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Already enrolled</span>
                    </div>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => enroll.mutate()}
                    disabled={enroll.isPending}
                  >
                    {enroll.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {course.price === 0
                      ? "Enroll for Free"
                      : `Enroll for $${course.price}`}
                  </Button>
                )}

                <Separator />

                <div className="space-y-3 text-sm">
                  <h4 className="font-semibold">This course includes:</h4>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span>{course.totalLessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {formatDuration(course.totalDuration)} of content
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    <span>Interactive quizzes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <span>Certificate of completion</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
