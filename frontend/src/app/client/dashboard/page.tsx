"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ClientDashboardPage() {
  const router = useRouter();
  const { currentUser, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (currentUser?.role !== "CLIENT") {
      router.push("/unauthorized");
    }
  }, [currentUser, isAuthenticated, isLoading, router]);

  function handleLogout() {
    logout();
    router.push("/");
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0B192C] px-6 text-center text-[#E0E0E0]">
        <p>Checking authentication status...</p>
      </main>
    );
  }

  if (!isAuthenticated || !currentUser || currentUser.role !== "CLIENT") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0B192C] px-6 text-center text-[#E0E0E0]">
        <p>Redirecting...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B192C] px-6 py-12 text-[#E0E0E0]">
      <section className="w-full max-w-3xl rounded-2xl border border-white/10 bg-[#1A1A1A]/80 p-8 shadow-2xl shadow-black/40 backdrop-blur sm:p-10">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
          Client Dashboard
        </p>

        <h1 className="mb-4 text-3xl font-semibold text-white">
          Welcome, {currentUser.username}
        </h1>

        <p className="mb-8 text-sm leading-6 text-[#E0E0E0]">
          This is the client dashboard. In the next phase, clients will be able
          to view available trainer slots and manage their bookings here.
        </p>

        <Link
          href="/client/bookings"
          className="inline-flex rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
        >
          View and book training slots
        </Link>

        <div className="mb-8 rounded-lg border border-white/10 bg-white/5 p-5">
          <p className="mb-2 text-sm">
            <span className="font-semibold text-white">Email:</span>{" "}
            {currentUser.email}
          </p>

          <p className="mb-2 text-sm">
            <span className="font-semibold text-white">Username:</span>{" "}
            {currentUser.username}
          </p>

          <p className="text-sm">
            <span className="font-semibold text-white">Role:</span>{" "}
            {currentUser.role}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-lg border border-white/20 px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:border-cyan-300 hover:bg-white/10"
          >
            Back to home
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[#0B192C] transition hover:bg-[#E0E0E0]"
          >
            Logout
          </button>
        </div>
      </section>
    </main>
  );
}
