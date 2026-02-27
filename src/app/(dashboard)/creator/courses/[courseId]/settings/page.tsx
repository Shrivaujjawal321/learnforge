"use client";

import { useState, useEffect, use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Save,
  Loader2,
  Globe,
  EyeOff,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface CourseSettings {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: string;
  price: number;
  level: string;
  category: string;
  thumbnail: string | null;
}

export default function CourseSettingsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [level, setLevel] = useState("beginner");
  const [category, setCategory] = useState("development");

  const { data: course, isLoading } = useQuery<CourseSettings>({
    queryKey: ["course-settings", courseId],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setDescription(course.description);
      setPrice(course.price.toString());
      setLevel(course.level);
      setCategory(course.category);
    }
  }, [course]);

  const updateCourse = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-settings", courseId] });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      toast.success("Course updated");
    },
    onError: () => {
      toast.error("Failed to update course");
    },
  });

  const deleteCourse = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      toast.success("Course deleted");
      router.push("/creator/courses");
    },
    onError: () => {
      toast.error("Failed to delete course");
    },
  });

  const saveSettings = () => {
    updateCourse.mutate({
      title,
      description,
      price: parseFloat(price),
      level,
      category,
    });
  };

  const togglePublish = () => {
    const newStatus = course?.status === "published" ? "draft" : "published";
    updateCourse.mutate({ status: newStatus });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/creator/courses/${courseId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Course Settings</h1>
          <p className="text-muted-foreground">
            Manage pricing, visibility, and details
          </p>
        </div>
      </div>

      {/* Publish/Unpublish */}
      <Card>
        <CardHeader>
          <CardTitle>Visibility</CardTitle>
          <CardDescription>
            Control whether students can see and enroll in your course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {course?.status === "published" ? (
                <div className="rounded-full bg-green-50 p-2">
                  <Globe className="h-5 w-5 text-green-600" />
                </div>
              ) : (
                <div className="rounded-full bg-gray-100 p-2">
                  <EyeOff className="h-5 w-5 text-gray-500" />
                </div>
              )}
              <div>
                <p className="font-medium">
                  {course?.status === "published"
                    ? "Course is Published"
                    : "Course is a Draft"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {course?.status === "published"
                    ? "Students can find and enroll in your course"
                    : "Only you can see this course"}
                </p>
              </div>
            </div>
            <Button
              onClick={togglePublish}
              variant={
                course?.status === "published" ? "outline" : "default"
              }
              disabled={updateCourse.isPending}
            >
              {updateCourse.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {course?.status === "published" ? "Unpublish" : "Publish"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>Update your course information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
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
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
          <CardDescription>Set the price for your course</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="price">Price (USD)</Label>
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">$</span>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="max-w-[200px]"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Set to 0 for a free course
            </p>
          </div>
          {course?.slug && (
            <div className="mt-4">
              <Label>Course URL</Label>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">
                  /courses/{course.slug}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-between">
        <Button
          onClick={saveSettings}
          disabled={updateCourse.isPending}
        >
          {updateCourse.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      <Separator />

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions. Please be certain.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => {
              if (
                confirm(
                  "Are you sure you want to delete this course? This cannot be undone."
                )
              ) {
                deleteCourse.mutate();
              }
            }}
            disabled={deleteCourse.isPending}
          >
            {deleteCourse.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Delete Course
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
