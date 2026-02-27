"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  CheckCircle,
  PlayCircle,
  Image as ImageIcon,
  Compass,
} from "lucide-react";
import { format } from "date-fns";

interface EnrolledCourse {
  enrollmentId: string;
  courseId: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  creator: { id: string; name: string; avatarUrl: string | null };
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  enrolledAt: string;
  completedAt: string | null;
}

export default function MyCoursesPage() {
  const { data: courses, isLoading } = useQuery<EnrolledCourse[]>({
    queryKey: ["my-courses"],
    queryFn: async () => {
      const res = await fetch("/api/my-courses");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Learning</h1>
        <p className="text-muted-foreground">
          Continue where you left off
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="p-0">
                <Skeleton className="h-40 w-full rounded-t-lg" />
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : courses && courses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link key={course.enrollmentId} href={`/learn/${course.courseId}`}>
              <Card className="h-full transition-shadow hover:shadow-lg cursor-pointer overflow-hidden">
                <CardHeader className="p-0">
                  <div className="relative h-40 bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-12 w-12 text-purple-300" />
                    )}
                    {course.completedAt && (
                      <Badge className="absolute top-3 right-3 bg-green-500 text-white hover:bg-green-600">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <h3 className="font-semibold line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    by {course.creator.name}
                  </p>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {course.completedLessons} / {course.totalLessons}{" "}
                        lessons
                      </span>
                      <span className="font-medium">
                        {course.progressPercent}%
                      </span>
                    </div>
                    <Progress
                      value={course.progressPercent}
                      className="h-2"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between border-t pt-4">
                  <span className="text-xs text-muted-foreground">
                    Enrolled {format(new Date(course.enrolledAt), "MMM d, yyyy")}
                  </span>
                  <Button size="sm" variant="ghost" className="text-primary">
                    {course.completedAt ? (
                      <>
                        <BookOpen className="mr-1 h-3 w-3" />
                        Review
                      </>
                    ) : (
                      <>
                        <PlayCircle className="mr-1 h-3 w-3" />
                        Continue
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="py-12">
          <CardContent className="text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">
              No courses yet
            </h3>
            <p className="mt-2 text-muted-foreground">
              Browse our catalog and start learning today
            </p>
            <Button asChild className="mt-4">
              <Link href="/courses">
                <Compass className="mr-2 h-4 w-4" />
                Browse Courses
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
