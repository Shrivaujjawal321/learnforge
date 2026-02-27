"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Users } from "lucide-react";
import { format } from "date-fns";

interface StudentEnrollment {
  id: string;
  student: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
  progress: number;
  completedLessons: number;
  totalLessons: number;
  enrolledAt: string;
  completedAt: string | null;
}

export default function StudentsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);

  const { data: students, isLoading } = useQuery<StudentEnrollment[]>({
    queryKey: ["students", courseId],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}/students`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/creator/courses/${courseId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Enrolled Students</h1>
          <p className="text-muted-foreground">
            View and manage student enrollments
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Students ({students?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : students && students.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Lessons Completed</TableHead>
                  <TableHead>Enrolled Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {enrollment.student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {enrollment.student.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {enrollment.student.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <Progress
                          value={enrollment.progress}
                          className="h-2 flex-1"
                        />
                        <span className="text-xs font-medium w-10 text-right">
                          {enrollment.progress}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {enrollment.completedLessons} / {enrollment.totalLessons}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(
                        new Date(enrollment.enrolledAt),
                        "MMM d, yyyy"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          enrollment.completedAt ? "default" : "secondary"
                        }
                      >
                        {enrollment.completedAt ? "Completed" : "In Progress"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <Users className="mx-auto h-12 w-12 opacity-30" />
              <p className="mt-4">No students enrolled yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
