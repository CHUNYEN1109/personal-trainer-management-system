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
      <main className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-sm text-gray-600">Loading trainer bookings...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <p className="text-sm font-medium text-gray-500">Trainer</p>
        <h1 className="text-3xl font-semibold">Booking Management</h1>
        <p className="mt-2 text-sm text-gray-600">
          Review client bookings, confirm or reject requests, and complete
          finished sessions.
        </p>
      </header>

      {message && (
        <p className="mb-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </p>
      )}

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <section className="rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">My trainer bookings</h2>

        {bookings.length === 0 ? (
          <p className="text-sm text-gray-600">
            You do not have any bookings yet.
          </p>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <article
                key={booking.id}
                className="rounded-md border border-gray-200 p-4"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-medium">
                      {formatDateTime(booking.startTime)} -{" "}
                      {formatDateTime(booking.endTime)}
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      Client: {booking.clientEmail}
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      Booking ID: {booking.id}
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      Slot ID: {booking.slotId}
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-3 md:items-end">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                      {booking.status}
                    </span>

                    {booking.status === "PENDING" && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleConfirmBooking(booking.id)}
                          disabled={actionLoadingBookingId === booking.id}
                          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {actionLoadingBookingId === booking.id
                            ? "Processing..."
                            : "Confirm"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRejectBooking(booking.id)}
                          disabled={actionLoadingBookingId === booking.id}
                          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
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
                        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
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
    </main>
  );
}
