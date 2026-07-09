"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  cancelTrainingSlot,
  createTrainingSlot,
  getTrainerSlots,
} from "@/lib/api/bookings";
import type { TrainingSlotResponse } from "@/types/bookings";

function toLocalDateTimeValue(date: Date) {
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function getDefaultStartTime() {
  const now = new Date();
  const defaultStartTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  defaultStartTime.setMinutes(0, 0, 0);

  return toLocalDateTimeValue(defaultStartTime);
}

function getDefaultEndTime() {
  const now = new Date();
  const defaultStartTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  defaultStartTime.setMinutes(0, 0, 0);

  const defaultEndTime = new Date(defaultStartTime.getTime() + 60 * 60 * 1000);

  return toLocalDateTimeValue(defaultEndTime);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-IE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "AVAILABLE":
      return "border-green-300/30 bg-green-400/10 text-green-300";
    case "BOOKED":
      return "border-yellow-300/30 bg-yellow-400/10 text-yellow-300";
    case "CANCELLED":
      return "border-red-300/30 bg-red-400/10 text-red-300";
    default:
      return "border-white/20 bg-white/10 text-gray-200";
  }
}

export default function TrainerSlotsPage() {
  const router = useRouter();
  const { currentUser, token, isLoading } = useAuth();

  const [startTime, setStartTime] = useState(getDefaultStartTime);
  const [endTime, setEndTime] = useState(getDefaultEndTime);
  const [trainerSlots, setTrainerSlots] = useState<TrainingSlotResponse[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadTrainerSlots = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      setIsLoadingSlots(true);
      const slots = await getTrainerSlots(token);
      setTrainerSlots(slots);
    } catch (exception) {
      const errorMessage =
        exception instanceof Error
          ? exception.message
          : "Failed to load training slots.";

      setError(errorMessage);
    } finally {
      setIsLoadingSlots(false);
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
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadTrainerSlots();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [currentUser, isLoading, loadTrainerSlots, router, token]);

  async function handleCreateSlot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      router.push("/login");
      return;
    }

    if (!startTime || !endTime) {
      setError("Please choose both start time and end time.");
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      setError("End time must be after start time.");
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage("");
      setError("");

      await createTrainingSlot(token, {
        startTime,
        endTime,
      });

      setMessage("Training slot created successfully.");

      await loadTrainerSlots();

      const nextStartTime = new Date(
        new Date(startTime).getTime() + 60 * 60 * 1000,
      );
      const nextEndTime = new Date(nextStartTime.getTime() + 60 * 60 * 1000);

      setStartTime(toLocalDateTimeValue(nextStartTime));
      setEndTime(toLocalDateTimeValue(nextEndTime));
    } catch (exception) {
      const errorMessage =
        exception instanceof Error
          ? exception.message
          : "Failed to create training slot.";

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancelSlot(slotId: number) {
    if (!token) {
      router.push("/login");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this training slot?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setError("");

      await cancelTrainingSlot(token, slotId);

      setMessage("Training slot cancelled successfully.");
      await loadTrainerSlots();
    } catch (exception) {
      const errorMessage =
        exception instanceof Error
          ? exception.message
          : "Failed to cancel training slot.";

      setError(errorMessage);
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0B192C] px-6 text-center text-[#E0E0E0]">
        <p>Checking authentication status...</p>
      </main>
    );
  }

  if (!currentUser || currentUser.role !== "TRAINER") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0B192C] px-6 text-center text-[#E0E0E0]">
        <p>Redirecting...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B192C] px-6 py-10 text-[#E0E0E0]">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 rounded-2xl border border-white/10 bg-[#1A1A1A]/80 p-8 shadow-2xl shadow-black/40 backdrop-blur">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
            Trainer Slots
          </p>
          <h1 className="text-3xl font-semibold text-white">Slot Management</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#E0E0E0]">
            Create available training slots so clients can book sessions with
            you.
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
          <div className="mb-6">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300">
              Create slot
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Add a new available time
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#E0E0E0]/80">
              Choose a future start and end time. Clients will see this slot as
              available after it is created.
            </p>
          </div>

          <form onSubmit={handleCreateSlot} className="space-y-5">
            <div>
              <label
                htmlFor="startTime"
                className="mb-2 block text-sm font-medium text-white"
              >
                Start time
              </label>
              <input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300"
              />
            </div>

            <div>
              <label
                htmlFor="endTime"
                className="mb-2 block text-sm font-medium text-white"
              >
                End time
              </label>
              <input
                id="endTime"
                type="datetime-local"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-[#0B192C] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creating..." : "Create available slot"}
            </button>
          </form>
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-[#1A1A1A]/80 p-6 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="mb-6">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300">
              Your slots
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Created training slots
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#E0E0E0]/80">
              Review the training times you have created for clients to book.
            </p>
          </div>

          {isLoadingSlots ? (
            <p className="rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-[#E0E0E0]/80">
              Loading your slots...
            </p>
          ) : trainerSlots.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 bg-white/5 p-6 text-sm text-[#E0E0E0]/80">
              <p className="font-medium text-white">
                You have not created any slots yet.
              </p>
              <p className="mt-2">
                Use the form above to create your first available training time.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {trainerSlots.map((slot) => (
                <article
                  key={slot.id}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-300/40"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {formatDateTime(slot.startTime)}
                      </p>
                      <p className="mt-1 text-sm text-[#E0E0E0]/75">
                        Ends {formatDateTime(slot.endTime)}
                      </p>
                      <p className="mt-2 text-xs text-[#E0E0E0]/60">
                        Slot ID: {slot.id}
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-2 sm:items-end">
                      <span
                        className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                          slot.status,
                        )}`}
                      >
                        {slot.status}
                      </span>

                      {slot.status === "AVAILABLE" && (
                        <button
                          type="button"
                          onClick={() => handleCancelSlot(slot.id)}
                          className="rounded-lg border border-red-300/30 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-400/10"
                        >
                          Cancel slot
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
