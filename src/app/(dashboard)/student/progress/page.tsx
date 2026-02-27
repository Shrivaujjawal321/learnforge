"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Trophy,
  Flame,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  Star,
  Compass,
} from "lucide-react";

interface ProgressData {
  overallProgress: number;
  totalCoursesEnrolled: number;
  totalCoursesCompleted: number;
  totalLessonsCompleted: number;
  totalLessons: number;
  learningStreak: number;
  longestStreak: number;
  totalTimeSpent: number;
  quizHistory: {
    quizTitle: string;
    courseName: string;
    score: number;
    attemptedAt: string;
  }[];
  courseProgress: {
    courseId: string;
    courseTitle: string;
    progress: number;
    completedLessons: number;
    totalLessons: number;
    lastActivity: string;
  }[];
  recommendedCourses: {
    id: string;
    title: string;
    slug: string;
    category: string;
    level: string;
    reason: string;
  }[];
  weeklyActivity: {
    day: string;
    minutes: number;
  }[];
}

export default function StudentProgressPage() {
  const { data, isLoading } = useQuery<ProgressData>({
    queryKey: ["student-progress"],
    queryFn: async () => {
      const res = await fetch("/api/student/progress");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Learning Progress</h1>
          <p className="text-muted-foreground">
            Track your learning journey
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No progress data</h3>
        <p className="mt-2 text-muted-foreground">
          Enroll in a course to start tracking your progress
        </p>
        <Button asChild className="mt-4">
          <Link href="/courses">
            <Compass className="mr-2 h-4 w-4" />
            Browse Courses
          </Link>
        </Button>
      </div>
    );
  }

  const maxMinutes = Math.max(...data.weeklyActivity.map((d) => d.minutes), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Learning Progress</h1>
        <p className="text-muted-foreground">
          Track your learning journey across all courses
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{data.overallProgress}%</p>
                <p className="text-sm text-muted-foreground">
                  Overall Progress
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <Progress value={data.overallProgress} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{data.learningStreak}</p>
                <p className="text-sm text-muted-foreground">
                  Day Streak
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Flame className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Longest: {data.longestStreak} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {data.totalCoursesCompleted}/{data.totalCoursesEnrolled}
                </p>
                <p className="text-sm text-muted-foreground">
                  Courses Completed
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {Math.floor(data.totalTimeSpent / 60)}h{" "}
                  {data.totalTimeSpent % 60}m
                </p>
                <p className="text-sm text-muted-foreground">Time Spent</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Course Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4" />
              Course Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.courseProgress.length > 0 ? (
              data.courseProgress.map((course) => (
                <Link
                  key={course.courseId}
                  href={`/learn/${course.courseId}`}
                  className="block"
                >
                  <div className="rounded-lg border p-3 transition-colors hover:bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium line-clamp-1">
                        {course.courseTitle}
                      </h4>
                      {course.progress >= 100 ? (
                        <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                      ) : (
                        <span className="text-xs font-medium text-muted-foreground">
                          {course.progress}%
                        </span>
                      )}
                    </div>
                    <Progress value={course.progress} className="h-1.5" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {course.completedLessons}/{course.totalLessons} lessons
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No courses enrolled yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Weekly Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-40">
              {data.weeklyActivity.map((day) => (
                <div
                  key={day.day}
                  className="flex flex-col items-center gap-1 flex-1"
                >
                  <span className="text-xs text-muted-foreground">
                    {day.minutes}m
                  </span>
                  <div
                    className="w-full rounded-t-sm bg-purple-500 transition-all min-h-[4px]"
                    style={{
                      height: `${Math.max(4, (day.minutes / maxMinutes) * 120)}px`,
                    }}
                  />
                  <span className="text-xs font-medium text-muted-foreground">
                    {day.day}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quiz Performance History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Star className="h-4 w-4" />
              Quiz Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.quizHistory.length > 0 ? (
              <div className="space-y-3">
                {data.quizHistory.map((quiz, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{quiz.quizTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {quiz.courseName}
                      </p>
                    </div>
                    <Badge
                      variant={
                        quiz.score >= 80
                          ? "default"
                          : quiz.score >= 60
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {quiz.score}%
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No quizzes attempted yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recommended Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Compass className="h-4 w-4" />
              Recommended For You
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recommendedCourses.length > 0 ? (
              <div className="space-y-3">
                {data.recommendedCourses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.slug}`}
                    className="block"
                  >
                    <div className="rounded-lg border p-3 transition-colors hover:bg-muted/50">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium line-clamp-1">
                          {course.title}
                        </h4>
                        <Badge variant="outline" className="text-xs capitalize">
                          {course.level}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {course.reason}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Complete more courses to get recommendations
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
