"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  createBooking,
  getAvailableSlots,
  getClientBookings,
} from "@/lib/api/bookings";
import type { BookingResponse, TrainingSlotResponse } from "@/types/bookings";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-IE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function ClientBookingsPage() {
  const router = useRouter();
  const { currentUser, token, isLoading } = useAuth();

  const [availableSlots, setAvailableSlots] = useState<TrainingSlotResponse[]>(
    [],
  );
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoadingSlotId, setActionLoadingSlotId] = useState<number | null>(
    null,
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadBookingData = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      setPageLoading(true);
      setError("");

      const [slotsData, bookingsData] = await Promise.all([
        getAvailableSlots(token),
        getClientBookings(token),
      ]);

      setAvailableSlots(slotsData);
      setBookings(bookingsData);
    } catch (exception) {
      const errorMessage =
        exception instanceof Error
          ? exception.message
          : "Failed to load booking data.";

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

    if (currentUser.role !== "CLIENT") {
      router.push("/unauthorized");
    }
  }, [currentUser, isLoading, router, token]);

  useEffect(() => {
    if (isLoading || !currentUser || !token || currentUser.role !== "CLIENT") {
      return;
    }

    const timer = window.setTimeout(() => {
      void loadBookingData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [currentUser, isLoading, loadBookingData, token]);

  async function handleBookSlot(slotId: number) {
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setActionLoadingSlotId(slotId);
      setMessage("");
      setError("");

      await createBooking(token, { slotId });

      setMessage("Booking created successfully. Waiting for trainer approval.");
      await loadBookingData();
    } catch (exception) {
      const errorMessage =
        exception instanceof Error ? exception.message : "Failed to book slot.";

      setError(errorMessage);
    } finally {
      setActionLoadingSlotId(null);
    }
  }

  if (isLoading || pageLoading) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-sm text-gray-600">Loading bookings...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <p className="text-sm font-medium text-gray-500">Client</p>
        <h1 className="text-3xl font-semibold">Bookings</h1>
        <p className="mt-2 text-sm text-gray-600">
          View available training slots and manage your booked sessions.
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

      <section className="mb-10 rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Available slots</h2>

        {availableSlots.length === 0 ? (
          <p className="text-sm text-gray-600">
            There are no available slots at the moment.
          </p>
        ) : (
          <div className="space-y-4">
            {availableSlots.map((slot) => (
              <article
                key={slot.id}
                className="flex flex-col gap-4 rounded-md border border-gray-200 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium">
                    {formatDateTime(slot.startTime)} -{" "}
                    {formatDateTime(slot.endTime)}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Trainer: {slot.trainerEmail}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Status: {slot.status}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleBookSlot(slot.id)}
                  disabled={actionLoadingSlotId === slot.id}
                  className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoadingSlotId === slot.id ? "Booking..." : "Book"}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">My bookings</h2>

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
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-medium">
                      {formatDateTime(booking.startTime)} -{" "}
                      {formatDateTime(booking.endTime)}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Trainer: {booking.trainerEmail}
                    </p>
                  </div>

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                    {booking.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
