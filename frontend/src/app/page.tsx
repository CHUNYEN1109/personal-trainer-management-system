import Link from "next/link";
import AuthStatus from "@/components/AuthStatus";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

const features = [
  {
    title: "Bookings",
    description:
      "Clients can book available trainer slots while trainers manage confirmations, cancellations, and completions.",
    metric: "Schedule",
  },
  {
    title: "Packages",
    description:
      "Track purchased sessions, remaining sessions, and package history for each assigned client.",
    metric: "Sessions",
  },
  {
    title: "Progress",
    description:
      "Record weight, body fat, and training notes to help clients follow their fitness journey.",
    metric: "Tracking",
  },
  {
    title: "Trophies",
    description:
      "Reward clients with achievements when they complete sessions and record progress milestones.",
    metric: "Rewards",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0B192C] px-6 py-6 text-[#E0E0E0] lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl flex-col">
        <header className="mx-auto mb-10 flex w-full max-w-6xl items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-5 py-4 shadow-2xl shadow-black/20 backdrop-blur">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/40 bg-cyan-300/10 text-sm font-bold text-cyan-300">
              PT
            </span>
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-white">
              Trainer Hub
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#E0E0E0] md:flex">
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

        <section className="grid flex-1 items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Badge variant="trainer" className="mb-6 bg-cyan-300/10">
              Fitness SaaS Dashboard
            </Badge>

            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Manage personal training in one clean dashboard.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-[#A8B3C7] sm:text-lg">
              Trainer Hub helps personal trainers and clients manage bookings,
              packages, progress tracking, and training achievements through a
              modern role-based web app.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/login"
                className="rounded-2xl bg-cyan-300 px-7 py-3 text-center text-sm font-bold uppercase tracking-[0.18em] text-[#0B192C] transition hover:bg-cyan-200"
              >
                Sign in
              </Link>

              <Link
                href="/register"
                className="rounded-2xl border border-cyan-300/40 px-7 py-3 text-center text-sm font-bold uppercase tracking-[0.18em] text-cyan-300 transition hover:bg-cyan-300/10"
              >
                Create account
              </Link>
            </div>

            <div className="mt-8 max-w-md rounded-2xl border border-white/10 bg-white/5 p-4">
              <AuthStatus />
            </div>
          </div>

          <aside className="relative overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-cyan-300 p-6 shadow-2xl shadow-cyan-950/30 sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_26%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.25),transparent_24%),linear-gradient(135deg,#67E8F9_0%,#22D3EE_45%,#14B8A6_100%)]" />
            <div className="absolute -right-24 top-10 h-72 w-72 rounded-full border border-white/40" />
            <div className="absolute -bottom-28 -left-20 h-96 w-96 rounded-full border border-white/30" />
            <div className="absolute left-1/2 top-0 h-full w-24 -translate-x-1/2 rotate-12 bg-white/20 blur-xl" />

            <div className="relative z-10">
              <div className="mb-10 flex items-center justify-between">
                <span className="rounded-full bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#0B192C]">
                  MVP Ready
                </span>
                <span className="rounded-full bg-[#0B192C] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white">
                  Role Based
                </span>
              </div>

              <Card className="bg-[#0B192C]/85 p-5">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-300">
                  Dashboard Preview
                </p>

                <h2 className="mt-3 text-2xl font-semibold text-white">
                  Bookings, packages, progress, and trophies.
                </h2>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {features.map((feature) => (
                    <div
                      key={feature.title}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                        {feature.metric}
                      </p>
                      <h3 className="mt-2 font-semibold text-white">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[#A8B3C7]">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="mt-5 grid grid-cols-3 gap-3 text-center text-[#0B192C]">
                <div className="rounded-2xl bg-white/80 p-4 backdrop-blur">
                  <p className="text-2xl font-bold">2</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider">
                    Roles
                  </p>
                </div>

                <div className="rounded-2xl bg-white/80 p-4 backdrop-blur">
                  <p className="text-2xl font-bold">4</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider">
                    Modules
                  </p>
                </div>

                <div className="rounded-2xl bg-white/80 p-4 backdrop-blur">
                  <p className="text-2xl font-bold">JWT</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider">
                    Auth
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
