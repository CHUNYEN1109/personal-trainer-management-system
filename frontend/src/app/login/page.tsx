"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormMessage } from "@/components/ui/FormMessage";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { getCurrentUser, loginUser } from "@/lib/api/auth";
import type { CurrentUserResponse } from "@/types/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentUser, setCurrentUser] = useState<CurrentUserResponse | null>(
    null,
  );
  const { refreshCurrentUser } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");
    setCurrentUser(null);
    setIsLoading(true);

    try {
      const authResponse = await loginUser({
        email,
        password,
      });

      localStorage.setItem("authToken", authResponse.token);

      await refreshCurrentUser();

      const user = await getCurrentUser(authResponse.token);

      setCurrentUser(user);
      setMessage("Login successful.");

      if (user.role === "CLIENT") {
        router.push("/client/dashboard");
      } else {
        router.push("/trainer/dashboard");
      }
    } catch (exception) {
      const errorMessage =
        exception instanceof Error ? exception.message : "Login failed.";

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#0B192C] text-[#E0E0E0]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 lg:px-8">
        <header className="mx-auto mb-10 flex w-full max-w-5xl items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-5 py-4 shadow-2xl shadow-black/20 backdrop-blur lg:mb-16">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/40 bg-cyan-300/10 text-sm font-bold text-cyan-300">
              PT
            </span>
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-white">
              Trainer Hub
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#E0E0E0] md:flex">
            <Link href="/" className="transition hover:text-cyan-300">
              Home
            </Link>
            <Link href="/register" className="transition hover:text-cyan-300">
              Sign up
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-white px-5 py-2 text-[#0B192C] transition hover:bg-cyan-300"
            >
              Sign in
            </Link>
          </nav>
        </header>

        <section className="grid flex-1 items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="mx-auto w-full max-w-md">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
              Welcome Back
            </p>

            <h1 className="mb-3 text-4xl font-semibold tracking-tight text-white">
              Sign in to your dashboard
            </h1>

            <p className="mb-8 text-sm leading-6 text-[#A8B3C7]">
              Enter your email and password to manage bookings, packages,
              clients, progress, and training achievements.
            </p>

            <Card className="rounded-3xl bg-[#111C2F]/90 p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  label="Email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  placeholder="trainer@example.com"
                />

                <Input
                  id="password"
                  name="password"
                  type="password"
                  label="Password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  placeholder="password123"
                />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#A8B3C7]">
                    Protected by secure token authentication.
                  </span>

                  <span className="text-xs font-medium text-cyan-300">
                    Secure login
                  </span>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-2xl py-3 text-sm font-bold uppercase tracking-[0.18em]"
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>

              {message && (
                <div className="mt-5">
                  <FormMessage message={message} variant="success" />
                </div>
              )}

              {error && (
                <div className="mt-5">
                  <FormMessage message={error} variant="error" />
                </div>
              )}

              {currentUser && (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[#E0E0E0]">
                  <p>
                    <span className="font-medium text-white">Email:</span>{" "}
                    {currentUser.email}
                  </p>
                  <p>
                    <span className="font-medium text-white">Username:</span>{" "}
                    {currentUser.username}
                  </p>
                  <p>
                    <span className="font-medium text-white">Role:</span>{" "}
                    {currentUser.role}
                  </p>
                </div>
              )}

              <p className="mt-6 text-center text-sm text-[#A8B3C7]">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-cyan-300 transition hover:text-cyan-200"
                >
                  Sign up
                </Link>
              </p>
            </Card>
          </div>

          <aside className="relative hidden min-h-[620px] overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-cyan-300 shadow-2xl shadow-cyan-950/30 lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_26%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.25),transparent_24%),linear-gradient(135deg,#67E8F9_0%,#22D3EE_45%,#14B8A6_100%)]" />

            <div className="absolute -right-24 top-10 h-72 w-72 rounded-full border border-white/40" />
            <div className="absolute -bottom-28 -left-20 h-96 w-96 rounded-full border border-white/30" />
            <div className="absolute left-1/2 top-0 h-full w-24 -translate-x-1/2 rotate-12 bg-white/20 blur-xl" />

            <div className="relative z-10 flex h-full flex-col justify-between p-10 text-[#0B192C]">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em]">
                  Fitness SaaS
                </span>
                <span className="rounded-full bg-[#0B192C] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white">
                  Dashboard
                </span>
              </div>

              <div className="mx-auto flex max-w-md flex-col items-center text-center">
                <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-white text-5xl font-black text-cyan-500 shadow-xl">
                  ⚡
                </div>

                <h2 className="text-5xl font-bold tracking-tight text-white drop-shadow-sm">
                  Train smarter.
                </h2>

                <p className="mt-5 text-lg font-medium leading-8 text-white/90">
                  Manage clients, sessions, packages, progress tracking, and
                  achievements in one clean personal trainer dashboard.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white/80 p-4 text-center backdrop-blur">
                  <p className="text-2xl font-bold">1:1</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider">
                    Coaching
                  </p>
                </div>

                <div className="rounded-2xl bg-white/80 p-4 text-center backdrop-blur">
                  <p className="text-2xl font-bold">24/7</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider">
                    Tracking
                  </p>
                </div>

                <div className="rounded-2xl bg-white/80 p-4 text-center backdrop-blur">
                  <p className="text-2xl font-bold">MVP</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider">
                    Ready
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
