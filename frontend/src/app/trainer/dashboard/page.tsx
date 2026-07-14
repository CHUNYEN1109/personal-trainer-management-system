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
  getTrainerClients,
  getTrainerPackages,
  TrainerClient,
} from "@/lib/api/api";
import { getTrainerBookings } from "@/lib/api/bookings";
import type { BookingResponse, BookingStatus } from "@/types/bookings";

const trainerNavItems: DashboardNavItem[] = [
  { href: "/trainer/dashboard", label: "Dashboard" },
  { href: "/trainer/clients", label: "Clients" },
  { href: "/trainer/slots", label: "Slots" },
  { href: "/trainer/bookings", label: "Bookings" },
  { href: "/trainer/packages", label: "Packages" },
  { href: "/trainer/progress", label: "Progress" },
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

export default function TrainerDashboardPage() {
  const router = useRouter();
  const { currentUser, isAuthenticated, isLoading, logout } = useAuth();

  const [packages, setPackages] = useState<ClientPackage[]>([]);
  const [clients, setClients] = useState<TrainerClient[]>([]);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);

  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

  const [packageSummaryError, setPackageSummaryError] = useState("");
  const [clientSummaryError, setClientSummaryError] = useState("");
  const [bookingSummaryError, setBookingSummaryError] = useState("");

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (currentUser?.role !== "TRAINER") {
      router.push("/unauthorized");
    }
  }, [currentUser, isAuthenticated, isLoading, router]);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      if (isLoading || !isAuthenticated || currentUser?.role !== "TRAINER") {
        if (!isLoading && isMounted) {
          setIsLoadingPackages(false);
          setIsLoadingClients(false);
          setIsLoadingBookings(false);
        }
        return;
      }

      const token = getToken();

      if (!token) {
        if (isMounted) {
          setPackageSummaryError("Unable to load package summary.");
          setClientSummaryError("Unable to load client summary.");
          setBookingSummaryError("Unable to load booking summary.");
          setIsLoadingPackages(false);
          setIsLoadingClients(false);
          setIsLoadingBookings(false);
        }
        return;
      }

      try {
        const packageData = await getTrainerPackages(token);

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
        const clientData = await getTrainerClients(token);

        if (isMounted) {
          setClients(clientData);
        }
      } catch {
        if (isMounted) {
          setClientSummaryError("Unable to load client summary.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingClients(false);
        }
      }

      try {
        const bookingData = await getTrainerBookings(token);

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

  const totalSessionsSold = packages.reduce(
    (total, clientPackage) => total + clientPackage.totalSessions,
    0,
  );

  const totalRemainingSessions = packages.reduce(
    (total, clientPackage) => total + clientPackage.remainingSessions,
    0,
  );

  const totalUsedSessions = totalSessionsSold - totalRemainingSessions;
  const packageUsagePercent =
    totalSessionsSold === 0
      ? 0
      : Math.round((totalUsedSessions / totalSessionsSold) * 100);

  const totalClients = clients.length;
  const activeClients = clients.filter(
    (client) => client.status === "ACTIVE",
  ).length;

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

  const recentClients = [...clients]
    .sort(
      (first, second) =>
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime(),
    )
    .slice(0, 4);

  const recentBookings = [...bookings]
    .sort(
      (first, second) =>
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime(),
    )
    .slice(0, 5);

  const isDashboardLoading =
    isLoadingPackages || isLoadingClients || isLoadingBookings;

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0B192C] px-6 text-center text-[#E0E0E0]">
        <p>Checking authentication status...</p>
      </main>
    );
  }

  if (!isAuthenticated || !currentUser || currentUser.role !== "TRAINER") {
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
          title="Trainer Dashboard"
          navItems={trainerNavItems}
        />
      }
      topbar={
        <DashboardTopbar
          title={`Welcome, ${currentUser.username}`}
          subtitle="Manage clients, bookings, packages, and progress from one trainer workspace."
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
          eyebrow="Trainer Analytics"
          title="Performance overview"
          description="A real-time snapshot of your assigned clients, booking activity, and package usage."
        />

        {isDashboardLoading && (
          <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5 text-sm text-cyan-100">
            Loading dashboard analytics...
          </div>
        )}

        {(packageSummaryError || clientSummaryError || bookingSummaryError) && (
          <div className="rounded-3xl border border-rose-300/20 bg-rose-300/10 p-5 text-sm text-rose-100">
            Some dashboard data could not be loaded. Please refresh the page or
            try again later.
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Assigned Clients"
            value={totalClients}
            description="Total client relationships assigned to you."
          />
          <SummaryCard
            label="Active Clients"
            value={activeClients}
            description="Clients currently active in your trainer list."
          />
          <SummaryCard
            label="Upcoming Bookings"
            value={upcomingBookings.length}
            description="Pending or confirmed sessions coming next."
          />
          <SummaryCard
            label="Remaining Sessions"
            value={totalRemainingSessions}
            description="Available sessions across active client packages."
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Trainer Workspace
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-white">
                  Your daily control center
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#A8B3C7]">
                  Quickly move between client management, session scheduling,
                  package tracking, and client progress updates.
                </p>
              </div>

              <Link
                href="/trainer/slots"
                className="rounded-2xl bg-cyan-300 px-5 py-3 text-center text-sm font-bold text-[#0B192C] transition hover:bg-cyan-200"
              >
                Create slots
              </Link>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { href: "/trainer/clients", label: "Manage Clients" },
                { href: "/trainer/packages", label: "Manage Packages" },
                { href: "/trainer/bookings", label: "Manage Bookings" },
                { href: "/trainer/progress", label: "Manage Progress" },
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
                  Client:{" "}
                  <span className="font-semibold text-white">
                    {nextBooking.clientEmail}
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
                No upcoming booking yet. Create trainer slots so clients can
                book their next session.
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
                href="/trainer/bookings"
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
                href="/trainer/packages"
                className="text-sm font-semibold text-cyan-300 hover:text-cyan-200"
              >
                View packages
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-[#0B192C]/60 p-4">
                <p className="text-xs text-[#A8B3C7]">Sold</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {totalSessionsSold}
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
                  Recent Clients
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  Latest assigned clients
                </h2>
              </div>
              <Link
                href="/trainer/clients"
                className="text-sm font-semibold text-cyan-300 hover:text-cyan-200"
              >
                View all
              </Link>
            </div>

            {recentClients.length > 0 ? (
              <div className="space-y-3">
                {recentClients.map((client) => (
                  <div
                    key={client.id}
                    className="rounded-2xl border border-white/10 bg-[#0B192C]/60 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-white">
                          {client.clientUsername}
                        </p>
                        <p className="mt-1 text-sm text-[#A8B3C7]">
                          {client.clientEmail}
                        </p>
                      </div>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                          client.status === "ACTIVE"
                            ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-200"
                            : "border-slate-300/30 bg-slate-300/10 text-slate-200"
                        }`}
                      >
                        {getStatusLabel(client.status)}
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-[#A8B3C7]">
                      Added {formatDateTime(client.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/15 bg-[#0B192C]/50 p-5 text-sm leading-6 text-[#A8B3C7]">
                No clients assigned yet. Add your first client to start
                managing packages and progress.
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Recent Bookings
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  Latest booking activity
                </h2>
              </div>
              <Link
                href="/trainer/bookings"
                className="text-sm font-semibold text-cyan-300 hover:text-cyan-200"
              >
                View all
              </Link>
            </div>

            {recentBookings.length > 0 ? (
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="rounded-2xl border border-white/10 bg-[#0B192C]/60 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-white">
                          {booking.clientEmail}
                        </p>
                        <p className="mt-1 text-sm text-[#A8B3C7]">
                          {formatDateTime(booking.startTime)}
                        </p>
                      </div>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${getBookingStatusClass(
                          booking.status,
                        )}`}
                      >
                        {getStatusLabel(booking.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/15 bg-[#0B192C]/50 p-5 text-sm leading-6 text-[#A8B3C7]">
                No booking activity yet. Once clients book sessions, recent
                activity will appear here.
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
