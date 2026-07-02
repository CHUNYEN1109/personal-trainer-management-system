import Link from "next/link";
import AuthStatus from "@/components/AuthStatus";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B192C] px-6 py-12 text-center text-[#E0E0E0]">
      <section className="w-full max-w-4xl rounded-2xl border border-white/10 bg-[#1A1A1A]/80 p-8 shadow-2xl shadow-black/40 backdrop-blur sm:p-12">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
          MVP Authentication
        </p>

        <h1 className="mb-5 text-3xl font-semibold text-white sm:text-5xl">
          Personal Trainer Management System
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-base leading-7 text-[#E0E0E0] sm:text-lg">
          A modern MVP for clients and trainers to register, login, and access
          role-based features.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#0B192C] transition hover:bg-[#E0E0E0]"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-300 hover:bg-white/10"
          >
            Register
          </Link>
        </div>
        <div className="mt-8">
          <AuthStatus />
        </div>
      </section>
    </main>
  );
}
