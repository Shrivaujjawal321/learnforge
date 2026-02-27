"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Flame, LogIn, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid credentials. Please try again.");
      } else {
        toast.success("Welcome back!");
        router.push("/");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loginAs = async (role: "creator" | "student") => {
    setLoading(true);
    const loginEmail =
      role === "creator" ? "creator@learnforge.io" : "student@learnforge.io";

    try {
      const result = await signIn("credentials", {
        email: loginEmail,
        password: "password123",
        redirect: false,
      });

      if (result?.error) {
        toast.error("Login failed. Make sure the database is seeded.");
      } else {
        toast.success(`Welcome back!`);
        router.push("/");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-4">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg">
          <Flame className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">LearnForge</h1>
        <p className="mt-2 text-muted-foreground">
          AI-Powered Course Builder Platform
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              Sign in
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Demo Accounts
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => loginAs("creator")}
              disabled={loading}
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              <span className="text-xs font-semibold text-primary">
                Creator
              </span>
              <span className="text-[10px] text-muted-foreground">
                creator@learnforge.io
              </span>
            </Button>
            <Button
              variant="outline"
              onClick={() => loginAs("student")}
              disabled={loading}
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              <span className="text-xs font-semibold text-primary">
                Student
              </span>
              <span className="text-[10px] text-muted-foreground">
                student@learnforge.io
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Password for both accounts: <code className="text-primary">password123</code>
      </p>
    </div>
  );
}
