import Link from "next/link";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#0B192C] text-[#E0E0E0]">
      <header className="border-b border-white/10 bg-[#1A1A1A]/80 px-6 py-4">
        <nav className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/client/dashboard"
            className="text-lg font-semibold text-white"
          >
            Client Portal
          </Link>

          <div className="flex flex-wrap gap-3 text-sm">
            <Link
              href="/client/dashboard"
              className="rounded-md border border-white/10 px-3 py-2 text-white transition hover:border-cyan-300 hover:bg-white/10"
            >
              Dashboard
            </Link>

            <Link
              href="/client/bookings"
              className="rounded-md border border-white/10 px-3 py-2 text-white transition hover:border-cyan-300 hover:bg-white/10"
            >
              Bookings
            </Link>

            <Link
              href="/client/packages"
              className="rounded-md border border-white/10 px-3 py-2 text-white transition hover:border-cyan-300 hover:bg-white/10"
            >
              Packages
            </Link>

            <Link
              href="/client/progress"
              className="rounded-md border border-white/10 px-3 py-2 text-white transition hover:border-cyan-300 hover:bg-white/10"
            >
              Progress
            </Link>
          </div>
        </nav>
      </header>

      {children}
    </div>
  );
}
