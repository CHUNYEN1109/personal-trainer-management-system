import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B192C] px-6 py-12 text-center text-[#E0E0E0]">
      <section className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#1A1A1A]/80 p-8 shadow-2xl shadow-black/40 backdrop-blur">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
          Unauthorized
        </p>

        <h1 className="mb-4 text-3xl font-semibold text-white">
          Access denied
        </h1>

        <p className="mb-8 text-sm leading-6 text-[#E0E0E0]">
          You do not have permission to access this page.
        </p>

        <Link
          href="/"
          className="inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[#0B192C] transition hover:bg-[#E0E0E0]"
        >
          Back to home
        </Link>
      </section>
    </main>
  );
}
