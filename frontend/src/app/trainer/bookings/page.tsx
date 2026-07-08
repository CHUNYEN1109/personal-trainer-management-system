"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  completeBooking,
  confirmBooking,
  getTrainerBookings,
  rejectBooking,
} from "@/lib/api/bookings";
import type { BookingResponse } from "@/types/bookings";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-IE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "PENDING":
      return "border-yellow-300/30 bg-yellow-400/10 text-yellow-300";
    case "CONFIRMED":
      return "border-cyan-300/30 bg-cyan-400/10 text-cyan-300";
    case "COMPLETED":
      return "border-green-300/30 bg-green-400/10 text-green-300";
    case "REJECTED":
      return "border-red-300/30 bg-red-400/10 text-red-300";
    case "CANCELLED":
      return "border-gray-300/30 bg-gray-400/10 text-gray-300";
    default:
      return "border-white/20 bg-white/10 text-gray-200";
  }
}

export default function TrainerBookingsPage() {
  const router = useRouter();
  const { currentUser, token, isLoading } = useAuth();

  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoadingBookingId, setActionLoadingBookingId] = useState<
    number | null
  >(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadTrainerBookings = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      setPageLoading(true);
      setError("");

      const bookingsData = await getTrainerBookings(token);

      setBookings(bookingsData);
    } catch (exception) {
      const errorMessage =
        exception instanceof Error
          ? exception.message
          : "Failed to load trainer bookings.";

      setError(errorMessage);
    } finally {
      setPageLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!currentUser || !token) {
      router.push("/login");
      return;
    }

    if (currentUser.role !== "TRAINER") {
      router.push("/unauthorized");
    }
  }, [currentUser, isLoading, router, token]);

  useEffect(() => {
    if (isLoading || !currentUser || !token || currentUser.role !== "TRAINER") {
      return;
    }

    const timer = window.setTimeout(() => {
      void loadTrainerBookings();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [currentUser, isLoading, loadTrainerBookings, token]);

  async function handleConfirmBooking(bookingId: number) {
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setActionLoadingBookingId(bookingId);
      setMessage("");
      setError("");

      await confirmBooking(token, bookingId);

      setMessage("Booking confirmed successfully.");
      await loadTrainerBookings();
    } catch (exception) {
      const errorMessage =
        exception instanceof Error
          ? exception.message
          : "Failed to confirm booking.";

      setError(errorMessage);
    } finally {
      setActionLoadingBookingId(null);
    }
  }

  async function handleRejectBooking(bookingId: number) {
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setActionLoadingBookingId(bookingId);
      setMessage("");
      setError("");

      await rejectBooking(token, bookingId);

      setMessage("Booking rejected successfully.");
      await loadTrainerBookings();
    } catch (exception) {
      const errorMessage =
        exception instanceof Error
          ? exception.message
          : "Failed to reject booking.";

      setError(errorMessage);
    } finally {
      setActionLoadingBookingId(null);
    }
  }

  async function handleCompleteBooking(bookingId: number) {
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setActionLoadingBookingId(bookingId);
      setMessage("");
      setError("");

      await completeBooking(token, bookingId);

      setMessage("Booking completed successfully.");
      await loadTrainerBookings();
    } catch (exception) {
      const errorMessage =
        exception instanceof Error
          ? exception.message
          : "Failed to complete booking.";

      setError(errorMessage);
    } finally {
      setActionLoadingBookingId(null);
    }
  }

  if (isLoading || pageLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0B192C] px-6 text-center text-[#E0E0E0]">
        <p>Loading trainer bookings...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B192C] px-6 py-10 text-[#E0E0E0]">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 rounded-2xl border border-white/10 bg-[#1A1A1A]/80 p-8 shadow-2xl shadow-black/40 backdrop-blur">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
            Trainer Bookings
          </p>
          <h1 className="text-3xl font-semibold text-white">
            Booking Management
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#E0E0E0]">
            Review client booking requests, confirm or reject pending sessions,
            and complete confirmed training sessions.
          </p>
        </header>

        {message && (
          <p className="mb-4 rounded-lg border border-green-300/30 bg-green-400/10 px-4 py-3 text-sm text-green-300">
            {message}
          </p>
        )}

        {error && (
          <p className="mb-4 rounded-lg border border-red-300/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <section className="rounded-2xl border border-white/10 bg-[#1A1A1A]/80 p-6 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300">
                My trainer bookings
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                Client sessions
              </h2>
            </div>
            <p className="text-sm text-[#E0E0E0]/70">
              {bookings.length} booking{bookings.length === 1 ? "" : "s"}
            </p>
          </div>

          {bookings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 bg-white/5 p-6">
              <p className="font-medium text-white">
                You do not have any client bookings yet.
              </p>
              <p className="mt-2 text-sm leading-6 text-[#E0E0E0]/80">
                Once clients book your available slots, their requests will
                appear here for review.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <article
                  key={booking.id}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-300/40"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-medium text-white">
                        {formatDateTime(booking.startTime)} -{" "}
                        {formatDateTime(booking.endTime)}
                      </p>

                      <p className="mt-1 text-sm text-[#E0E0E0]/80">
                        Client: {booking.clientEmail}
                      </p>

                      <p className="mt-1 text-xs text-[#E0E0E0]/60">
                        Booking ID: {booking.id} · Slot ID: {booking.slotId}
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-3 md:items-end">
                      <span
                        className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                          booking.status,
                        )}`}
                      >
                        {booking.status}
                      </span>

                      {booking.status === "PENDING" && (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleConfirmBooking(booking.id)}
                            disabled={actionLoadingBookingId === booking.id}
                            className="rounded-lg bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-[#0B192C] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {actionLoadingBookingId === booking.id
                              ? "Processing..."
                              : "Confirm"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRejectBooking(booking.id)}
                            disabled={actionLoadingBookingId === booking.id}
                            className="rounded-lg border border-red-300/40 px-5 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {actionLoadingBookingId === booking.id
                              ? "Processing..."
                              : "Reject"}
                          </button>
                        </div>
                      )}

                      {booking.status === "CONFIRMED" && (
                        <button
                          type="button"
                          onClick={() => handleCompleteBooking(booking.id)}
                          disabled={actionLoadingBookingId === booking.id}
                          className="rounded-lg bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-[#0B192C] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {actionLoadingBookingId === booking.id
                            ? "Processing..."
                            : "Complete"}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
