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
  Award,
  Download,
  ExternalLink,
  BookOpen,
  Compass,
} from "lucide-react";
import { format } from "date-fns";

interface Certificate {
  id: string;
  certificateNo: string;
  courseId: string;
  courseTitle: string;
  instructorName: string;
  completedAt: string;
  issuedAt: string;
}

export default function CertificatesPage() {
  const { data: certificates, isLoading } = useQuery<Certificate[]>({
    queryKey: ["certificates"],
    queryFn: async () => {
      const res = await fetch("/api/certificates");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Certificates</h1>
        <p className="text-muted-foreground">
          Certificates earned for completed courses
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-20 w-full rounded-lg" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : certificates && certificates.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <Card
              key={cert.id}
              className="overflow-hidden transition-shadow hover:shadow-lg"
            >
              <CardHeader className="p-0">
                <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 text-center text-white">
                  <Award className="mx-auto h-10 w-10 mb-2" />
                  <p className="text-sm font-medium text-purple-200">
                    Certificate of Completion
                  </p>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                <h3 className="font-semibold line-clamp-2">
                  {cert.courseTitle}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Instructor: {cert.instructorName}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Completed{" "}
                    {format(new Date(cert.completedAt), "MMM d, yyyy")}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  ID: {cert.certificateNo}
                </p>
              </CardContent>
              <CardFooter className="flex gap-2 border-t pt-4">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <a
                    href={`/api/courses/${cert.courseId}/certificate`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-1 h-3 w-3" />
                    View
                  </a>
                </Button>
                <Button variant="default" size="sm" asChild className="flex-1">
                  <a
                    href={`/api/courses/${cert.courseId}/certificate`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="mr-1 h-3 w-3" />
                    Print
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-12">
          <CardContent className="text-center">
            <Award className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">
              No certificates yet
            </h3>
            <p className="mt-2 text-muted-foreground">
              Complete a course to earn your first certificate
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
