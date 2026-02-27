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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Users,
  BookOpen,
  DollarSign,
  Image as ImageIcon,
} from "lucide-react";

interface CourseItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  price: number;
  status: string;
  level: string;
  category: string;
  studentCount: number;
  lessonCount: number;
  chapterCount: number;
  updatedAt: string;
}

export default function CreatorCoursesPage() {
  const { data: courses, isLoading } = useQuery<CourseItem[]>({
    queryKey: ["creator-courses"],
    queryFn: async () => {
      const res = await fetch("/api/courses");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const statusColor = (status: string) => {
    switch (status) {
      case "published":
        return "default" as const;
      case "draft":
        return "secondary" as const;
      case "archived":
        return "outline" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Courses</h1>
          <p className="text-muted-foreground">
            Manage and create your courses
          </p>
        </div>
        <Button asChild>
          <Link href="/creator/courses/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-40 w-full rounded-md" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : courses && courses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/creator/courses/${course.id}`}
            >
              <Card className="h-full transition-shadow hover:shadow-lg cursor-pointer">
                <CardHeader className="p-0">
                  <div className="relative h-40 rounded-t-lg bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="h-full w-full rounded-t-lg object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-12 w-12 text-purple-300" />
                    )}
                    <Badge
                      variant={statusColor(course.status)}
                      className="absolute top-3 right-3 capitalize"
                    >
                      {course.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <h3 className="font-semibold line-clamp-1">{course.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {course.description}
                  </p>
                </CardContent>
                <CardFooter className="flex items-center justify-between border-t pt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    <span>{course.studentCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>{course.lessonCount} lessons</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>
                      {course.price === 0 ? "Free" : `$${course.price}`}
                    </span>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="py-12">
          <CardContent className="text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No courses yet</h3>
            <p className="mt-2 text-muted-foreground">
              Create your first course to get started
            </p>
            <Button asChild className="mt-4">
              <Link href="/creator/courses/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Course
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
