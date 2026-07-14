"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormMessage } from "@/components/ui/FormMessage";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { getCurrentUser, registerUser } from "@/lib/api/auth";
import type { CurrentUserResponse, UserRole } from "@/types/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { refreshCurrentUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<UserRole>("CLIENT");
  const [currentUser, setCurrentUser] = useState<CurrentUserResponse | null>(
    null,
  );
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
      const authResponse = await registerUser({
        email,
        password,
        username,
        role,
      });

      localStorage.setItem("authToken", authResponse.token);

      await refreshCurrentUser();

      const user = await getCurrentUser(authResponse.token);

      setCurrentUser(user);
      setMessage("Register successful.");

      if (user.role === "CLIENT") {
        router.push("/client/dashboard");
      } else {
        router.push("/trainer/dashboard");
      }
    } catch (exception) {
      const errorMessage =
        exception instanceof Error ? exception.message : "Register failed.";

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#0B192C] text-[#E0E0E0]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 lg:px-8">
        <header className="mx-auto mb-8 flex w-full max-w-5xl items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-5 py-4 shadow-2xl shadow-black/20 backdrop-blur">
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
            <Link href="/login" className="transition hover:text-cyan-300">
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-white px-5 py-2 text-[#0B192C] transition hover:bg-cyan-300"
            >
              Sign up
            </Link>
          </nav>
        </header>

        <section className="relative flex flex-1 flex-col items-center">
          <div className="relative w-full overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-cyan-300 px-6 py-14 shadow-2xl shadow-cyan-950/30 sm:px-10 lg:py-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_26%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.25),transparent_24%),linear-gradient(135deg,#67E8F9_0%,#22D3EE_45%,#14B8A6_100%)]" />
            <div className="absolute -left-24 top-10 h-72 w-72 rounded-full border border-white/40" />
            <div className="absolute -right-28 bottom-0 h-96 w-96 rounded-full border border-white/30" />
            <div className="absolute left-1/2 top-0 h-full w-24 -translate-x-1/2 rotate-12 bg-white/20 blur-xl" />

            <div className="relative z-10 mx-auto max-w-2xl text-center">
              <Badge variant="trainer" className="mb-6 bg-[#0B192C]/80">
                Fitness SaaS
              </Badge>

              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Start your training journey
              </h1>

              <p className="mx-auto mt-5 max-w-xl text-sm font-medium leading-7 text-white/90 sm:text-base">
                Create a client or trainer account to manage bookings, packages,
                progress records, and personal training milestones.
              </p>
            </div>
          </div>

          <Card className="relative z-10 -mt-12 w-full max-w-md rounded-3xl bg-[#111C2F]/95 p-6 sm:-mt-16 sm:p-8">
            <div className="mb-6 text-center">
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
                Create Account
              </p>

              <h2 className="text-2xl font-semibold text-white">
                Register your profile
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#A8B3C7]">
                Choose your role and create an account for your personal trainer
                dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                id="username"
                name="username"
                type="text"
                label="Username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                placeholder="test_client"
              />

              <Input
                id="email"
                name="email"
                type="email"
                label="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="client@example.com"
              />

              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                placeholder="password123"
              />

              <div>
                <label
                  htmlFor="role"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  Role
                </label>

                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(event) => setRole(event.target.value as UserRole)}
                  className="w-full rounded-lg border border-white/10 bg-[#0B192C] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                >
                  <option value="CLIENT">Client</option>
                  <option value="TRAINER">Trainer</option>
                </select>
              </div>

              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm text-[#A8B3C7]">
                Accounts are protected by secure token authentication.
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-2xl py-3 text-sm font-bold uppercase tracking-[0.18em]"
              >
                {isLoading ? "Creating account..." : "Sign up"}
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
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-cyan-300 transition hover:text-cyan-200"
              >
                Sign in
              </Link>
            </p>
          </Card>
        </section>
      </div>
    </main>
  );
}
