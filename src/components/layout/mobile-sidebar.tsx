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
import { SheetClose } from "@/components/ui/sheet";

const creatorLinks = [
  { title: "Dashboard", href: "/creator", icon: LayoutDashboard },
  { title: "My Courses", href: "/creator/courses", icon: BookOpen },
  { title: "Earnings", href: "/creator/earnings", icon: DollarSign },
  { title: "Browse Courses", href: "/courses", icon: Compass },
  { title: "My Learning", href: "/my-courses", icon: GraduationCap },
  { title: "Progress", href: "/student/progress", icon: TrendingUp },
  { title: "Certificates", href: "/certificates", icon: Award },
];

const studentLinks = [
  { title: "Browse Courses", href: "/courses", icon: Compass },
  { title: "My Learning", href: "/my-courses", icon: GraduationCap },
  { title: "Progress", href: "/student/progress", icon: TrendingUp },
  { title: "Certificates", href: "/certificates", icon: Award },
];

export function MobileSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const role = (session?.user as { role?: string })?.role || "student";
  const links = role === "creator" ? creatorLinks : studentLinks;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600">
          <Flame className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold">LearnForge</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <SheetClose asChild key={link.href + link.title}>
              <Link
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
            </SheetClose>
          );
        })}
      </nav>
    </div>
  );
}
