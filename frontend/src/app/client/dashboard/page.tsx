"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DashboardPageHeader,
  DashboardShell,
  DashboardSidebar,
  DashboardTopbar,
  type DashboardNavItem,
} from "@/components/dashboard";
import { useAuth } from "@/context/AuthContext";
import {
  ClientPackage,
  getClientPackages,
  getClientProgressRecords,
  getClientTrophies,
  ProgressRecord,
  Trophy,
} from "@/lib/api/api";
import { getClientBookings } from "@/lib/api/bookings";
import type { BookingResponse, BookingStatus } from "@/types/bookings";

const clientNavItems: DashboardNavItem[] = [
  { href: "/client/dashboard", label: "Dashboard" },
  { href: "/client/bookings", label: "Bookings" },
  { href: "/client/packages", label: "Packages" },
  { href: "/client/progress", label: "Progress" },
  { href: "/client/trophies", label: "Trophies" },
];

const bookingStatuses: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
];

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem("authToken");
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-IE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusLabel(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function getBookingStatusClass(status: BookingStatus) {
  switch (status) {
    case "CONFIRMED":
      return "border-emerald-300/30 bg-emerald-300/10 text-emerald-200";
    case "COMPLETED":
      return "border-cyan-300/30 bg-cyan-300/10 text-cyan-200";
    case "CANCELLED":
      return "border-slate-300/30 bg-slate-300/10 text-slate-200";
    case "REJECTED":
      return "border-rose-300/30 bg-rose-300/10 text-rose-200";
    case "PENDING":
    default:
      return "border-amber-300/30 bg-amber-300/10 text-amber-200";
  }
}

type SummaryCardProps = {
  label: string;
  value: number | string;
  description: string;
};

function SummaryCard({ label, value, description }: SummaryCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-2xl shadow-black/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A8B3C7]">
        {label}
      </p>
      <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-[#A8B3C7]">{description}</p>
    </div>
  );
}

export default function ClientDashboardPage() {
  const router = useRouter();
  const { currentUser, isAuthenticated, isLoading, logout } = useAuth();

  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [packages, setPackages] = useState<ClientPackage[]>([]);
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
  const [trophies, setTrophies] = useState<Trophy[]>([]);

  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [isLoadingTrophies, setIsLoadingTrophies] = useState(true);

  const [bookingSummaryError, setBookingSummaryError] = useState("");
  const [packageSummaryError, setPackageSummaryError] = useState("");
  const [progressSummaryError, setProgressSummaryError] = useState("");
  const [trophySummaryError, setTrophySummaryError] = useState("");

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

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      if (isLoading || !isAuthenticated || currentUser?.role !== "CLIENT") {
        if (!isLoading && isMounted) {
          setIsLoadingBookings(false);
          setIsLoadingPackages(false);
          setIsLoadingProgress(false);
          setIsLoadingTrophies(false);
        }
        return;
      }

      const token = getToken();

      if (!token) {
        if (isMounted) {
          setBookingSummaryError("Unable to load booking summary.");
          setPackageSummaryError("Unable to load package summary.");
          setProgressSummaryError("Unable to load progress summary.");
          setTrophySummaryError("Unable to load trophy summary.");
          setIsLoadingBookings(false);
          setIsLoadingPackages(false);
          setIsLoadingProgress(false);
          setIsLoadingTrophies(false);
        }
        return;
      }

      try {
        const bookingData = await getClientBookings(token);

        if (isMounted) {
          setBookings(bookingData);
        }
      } catch {
        if (isMounted) {
          setBookingSummaryError("Unable to load booking summary.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingBookings(false);
        }
      }

      try {
        const packageData = await getClientPackages(token);

        if (isMounted) {
          setPackages(packageData);
        }
      } catch {
        if (isMounted) {
          setPackageSummaryError("Unable to load package summary.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingPackages(false);
        }
      }

      try {
        const progressData = await getClientProgressRecords(token);

        if (isMounted) {
          setProgressRecords(progressData);
        }
      } catch {
        if (isMounted) {
          setProgressSummaryError("Unable to load progress summary.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingProgress(false);
        }
      }

      try {
        const trophyData = await getClientTrophies(token);

        if (isMounted) {
          setTrophies(trophyData);
        }
      } catch {
        if (isMounted) {
          setTrophySummaryError("Unable to load trophy summary.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingTrophies(false);
        }
      }
    }

    void loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [currentUser, isAuthenticated, isLoading]);

  function handleLogout() {
    logout();
    router.push("/");
  }

  const upcomingBookings = useMemo(() => {
    return bookings
      .filter(
        (booking) =>
          booking.status === "PENDING" || booking.status === "CONFIRMED",
      )
      .sort(
        (first, second) =>
          new Date(first.startTime).getTime() -
          new Date(second.startTime).getTime(),
      );
  }, [bookings]);

  const nextBooking = upcomingBookings[0];

  const bookingStatusCounts = bookingStatuses.reduce(
    (counts, status) => ({
      ...counts,
      [status]: bookings.filter((booking) => booking.status === status).length,
    }),
    {} as Record<BookingStatus, number>,
  );

  const activePackages = packages.filter(
    (clientPackage) => clientPackage.remainingSessions > 0,
  ).length;

  const totalSessionsPurchased = packages.reduce(
    (total, clientPackage) => total + clientPackage.totalSessions,
    0,
  );

  const totalRemainingSessions = packages.reduce(
    (total, clientPackage) => total + clientPackage.remainingSessions,
    0,
  );

  const totalUsedSessions = totalSessionsPurchased - totalRemainingSessions;

  const packageUsagePercent =
    totalSessionsPurchased === 0
      ? 0
      : Math.round((totalUsedSessions / totalSessionsPurchased) * 100);

  const recentProgressRecords = [...progressRecords]
    .sort(
      (first, second) =>
        new Date(second.recordedAt).getTime() -
        new Date(first.recordedAt).getTime(),
    )
    .slice(0, 4);

  const latestTrophies = [...trophies]
    .sort(
      (first, second) =>
        new Date(second.awardedAt).getTime() -
        new Date(first.awardedAt).getTime(),
    )
    .slice(0, 4);

  const isDashboardLoading =
    isLoadingBookings ||
    isLoadingPackages ||
    isLoadingProgress ||
    isLoadingTrophies;

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
    <DashboardShell
      sidebar={
        <DashboardSidebar
          title="Client Dashboard"
          brandLabel="Client Hub"
          navItems={clientNavItems}
        />
      }
      topbar={
        <DashboardTopbar
          title={`Welcome, ${currentUser.username}`}
          subtitle="Track your bookings, packages, training progress, and achievements from one dashboard."
          action={
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[#0B192C] transition hover:bg-[#E0E0E0]"
            >
              Logout
            </button>
          }
        />
      }
    >
      <div className="space-y-8">
        <DashboardPageHeader
          eyebrow="Client Analytics"
          title="Training overview"
          description="A real-time snapshot of your training activity, package usage, progress updates, and trophies."
        />

        {isDashboardLoading && (
          <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5 text-sm text-cyan-100">
            Loading client dashboard analytics...
          </div>
        )}

        {(bookingSummaryError ||
          packageSummaryError ||
          progressSummaryError ||
          trophySummaryError) && (
          <div className="rounded-3xl border border-rose-300/20 bg-rose-300/10 p-5 text-sm text-rose-100">
            Some dashboard data could not be loaded. Please refresh the page or
            try again later.
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Upcoming Bookings"
            value={upcomingBookings.length}
            description="Pending or confirmed sessions in your schedule."
          />
          <SummaryCard
            label="Active Packages"
            value={activePackages}
            description="Packages with remaining sessions available."
          />
          <SummaryCard
            label="Remaining Sessions"
            value={totalRemainingSessions}
            description="Training sessions still available to use."
          />
          <SummaryCard
            label="Trophies Earned"
            value={trophies.length}
            description="Achievements unlocked from your training journey."
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Client Training Hub
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-white">
                  Your personal training workspace
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#A8B3C7]">
                  Review bookings, monitor package usage, check progress
                  records, and celebrate trophies earned through completed
                  training milestones.
                </p>
              </div>

              <Link
                href="/client/bookings"
                className="rounded-2xl bg-cyan-300 px-5 py-3 text-center text-sm font-bold text-[#0B192C] transition hover:bg-cyan-200"
              >
                Book session
              </Link>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { href: "/client/bookings", label: "View Bookings" },
                { href: "/client/packages", label: "View Packages" },
                { href: "/client/progress", label: "View Progress" },
                { href: "/client/trophies", label: "View Trophies" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-4 text-center text-sm font-semibold text-cyan-100 transition hover:border-cyan-300 hover:bg-cyan-300/20"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Next Booking
            </p>

            {nextBooking ? (
              <div className="mt-5">
                <p className="text-2xl font-semibold text-white">
                  {formatDateTime(nextBooking.startTime)}
                </p>
                <p className="mt-3 text-sm text-[#A8B3C7]">
                  Trainer:{" "}
                  <span className="font-semibold text-white">
                    {nextBooking.trainerEmail}
                  </span>
                </p>
                <span
                  className={`mt-5 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getBookingStatusClass(
                    nextBooking.status,
                  )}`}
                >
                  {getStatusLabel(nextBooking.status)}
                </span>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-white/15 bg-[#0B192C]/50 p-5 text-sm leading-6 text-[#A8B3C7]">
                No upcoming booking yet. Book an available training slot to plan
                your next session.
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Booking Status
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  Booking activity overview
                </h2>
              </div>
              <Link
                href="/client/bookings"
                className="text-sm font-semibold text-cyan-300 hover:text-cyan-200"
              >
                View all
              </Link>
            </div>

            <div className="space-y-4">
              {bookingStatuses.map((status) => {
                const count = bookingStatusCounts[status];
                const percent =
                  bookings.length === 0
                    ? 0
                    : Math.round((count / bookings.length) * 100);

                return (
                  <div key={status}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-[#E0E0E0]">
                        {getStatusLabel(status)}
                      </span>
                      <span className="text-[#A8B3C7]">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#0B192C]">
                      <div
                        className="h-2 rounded-full bg-cyan-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Package Usage
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  Session usage overview
                </h2>
              </div>
              <Link
                href="/client/packages"
                className="text-sm font-semibold text-cyan-300 hover:text-cyan-200"
              >
                View packages
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-[#0B192C]/60 p-4">
                <p className="text-xs text-[#A8B3C7]">Purchased</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {totalSessionsPurchased}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0B192C]/60 p-4">
                <p className="text-xs text-[#A8B3C7]">Used</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {totalUsedSessions}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0B192C]/60 p-4">
                <p className="text-xs text-[#A8B3C7]">Remaining</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {totalRemainingSessions}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-[#E0E0E0]">
                  Usage progress
                </span>
                <span className="text-[#A8B3C7]">{packageUsagePercent}%</span>
              </div>
              <div className="h-3 rounded-full bg-[#0B192C]">
                <div
                  className="h-3 rounded-full bg-cyan-300"
                  style={{ width: `${packageUsagePercent}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Recent Progress
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  Latest trainer updates
                </h2>
              </div>
              <Link
                href="/client/progress"
                className="text-sm font-semibold text-cyan-300 hover:text-cyan-200"
              >
                View all
              </Link>
            </div>

            {recentProgressRecords.length > 0 ? (
              <div className="space-y-3">
                {recentProgressRecords.map((record) => (
                  <div
                    key={record.id}
                    className="rounded-2xl border border-white/10 bg-[#0B192C]/60 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-white">
                          {formatDateTime(record.recordedAt)}
                        </p>
                        <p className="mt-1 text-sm text-[#A8B3C7]">
                          Trainer: {record.trainerEmail}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[#E0E0E0]">
                          Weight:{" "}
                          {record.weight !== null
                            ? `${record.weight} kg`
                            : "N/A"}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[#E0E0E0]">
                          Body fat:{" "}
                          {record.bodyFat !== null
                            ? `${record.bodyFat}%`
                            : "N/A"}
                        </span>
                      </div>
                    </div>

                    {record.dietSuggestion && (
                      <p className="mt-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm leading-6 text-cyan-100">
                        {record.dietSuggestion}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/15 bg-[#0B192C]/50 p-5 text-sm leading-6 text-[#A8B3C7]">
                No progress records yet. Your trainer can add progress updates
                after sessions.
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Trophy Summary
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  Latest achievements
                </h2>
              </div>
              <Link
                href="/client/trophies"
                className="text-sm font-semibold text-cyan-300 hover:text-cyan-200"
              >
                View all
              </Link>
            </div>

            {latestTrophies.length > 0 ? (
              <div className="space-y-3">
                {latestTrophies.map((trophy) => (
                  <div
                    key={trophy.id}
                    className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4"
                  >
                    <p className="font-semibold text-white">{trophy.title}</p>
                    <p className="mt-1 text-sm leading-6 text-cyan-100">
                      {trophy.description}
                    </p>
                    <p className="mt-3 text-xs text-[#A8B3C7]">
                      Earned {formatDateTime(trophy.awardedAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/15 bg-[#0B192C]/50 p-5 text-sm leading-6 text-[#A8B3C7]">
                No trophies earned yet. Complete training milestones to unlock
                achievements.
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
