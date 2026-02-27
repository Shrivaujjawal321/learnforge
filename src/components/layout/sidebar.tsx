"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  DollarSign,
  GraduationCap,
  Compass,
  Flame,
  Award,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const creatorLinks = [
  {
    title: "Dashboard",
    href: "/creator",
    icon: LayoutDashboard,
  },
  {
    title: "My Courses",
    href: "/creator/courses",
    icon: BookOpen,
  },
  {
    title: "Earnings",
    href: "/creator/earnings",
    icon: DollarSign,
  },
];

const studentLinks = [
  {
    title: "Browse Courses",
    href: "/courses",
    icon: Compass,
  },
  {
    title: "My Learning",
    href: "/my-courses",
    icon: GraduationCap,
  },
  {
    title: "Progress",
    href: "/student/progress",
    icon: TrendingUp,
  },
  {
    title: "Certificates",
    href: "/certificates",
    icon: Award,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const role = (session?.user as { role?: string })?.role || "student";
  const links = role === "creator" ? creatorLinks : studentLinks;

  return (
    <aside className="hidden md:flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600">
          <Flame className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold">LearnForge</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {role === "creator" && (
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Creator Studio
          </p>
        )}
        {links.map((link) => {
          const isActive =
            link.href === "/creator"
              ? pathname === "/creator"
              : pathname === link.href ||
                pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href + link.title}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.title}
            </Link>
          );
        })}

        {role === "creator" && (
          <>
            <div className="my-4 border-t" />
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Student View
            </p>
            <Link
              href="/courses"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/courses"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Compass className="h-4 w-4" />
              Browse Courses
            </Link>
            <Link
              href="/my-courses"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/my-courses"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <GraduationCap className="h-4 w-4" />
              My Learning
            </Link>
            <Link
              href="/student/progress"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/student/progress"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <TrendingUp className="h-4 w-4" />
              Progress
            </Link>
            <Link
              href="/certificates"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/certificates"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Award className="h-4 w-4" />
              Certificates
            </Link>
          </>
        )}
      </nav>

      <div className="border-t p-4">
        <div className="rounded-lg bg-gradient-to-r from-purple-500/10 to-indigo-500/10 p-3">
          <p className="text-xs font-medium text-primary">AI Powered</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Generate course outlines with AI assistance
          </p>
        </div>
      </div>
    </aside>
  );
}
