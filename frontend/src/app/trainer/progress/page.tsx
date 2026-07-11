"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ProgressRecord,
  createTrainerProgressRecord,
  getTrainerProgressRecords,
} from "@/lib/api/api";

type ProgressClientOption = {
  clientId: number;
  clientEmail: string;
};

type ProgressChartData = {
  recordedAt: string;
  weight: number | null;
  bodyFat: number | null;
};

export default function TrainerProgressPage() {
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [clientId, setClientId] = useState("");
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [dietSuggestion, setDietSuggestion] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const clients: ProgressClientOption[] = Array.from(
    new Map(
      progressRecords.map((record) => [
        record.clientId,
        {
          clientId: record.clientId,
          clientEmail: record.clientEmail,
        },
      ]),
    ).values(),
  ).sort((firstClient, secondClient) =>
    firstClient.clientEmail.localeCompare(secondClient.clientEmail),
  );

  const filteredProgressRecords = selectedClientId
    ? progressRecords.filter(
        (record) => record.clientId === Number(selectedClientId),
      )
    : [];

  const chartData: ProgressChartData[] = filteredProgressRecords
    .slice()
    .sort(
      (firstRecord, secondRecord) =>
        new Date(firstRecord.recordedAt).getTime() -
        new Date(secondRecord.recordedAt).getTime(),
    )
    .map((record) => ({
      recordedAt: new Date(record.recordedAt).toLocaleDateString(),
      weight: record.weight,
      bodyFat: record.bodyFat,
    }));

  function getToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem("authToken");
  }

  async function loadProgressRecords() {
    try {
      const token = getToken();

      if (!token) {
        setError(
          "You must be logged in as a trainer to view progress records.",
        );
        return;
      }

      const data = await getTrainerProgressRecords(token);
      setProgressRecords(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load progress records.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialProgressRecords() {
      try {
        const token = getToken();

        if (!token) {
          if (isMounted) {
            setError(
              "You must be logged in as a trainer to view progress records.",
            );
          }
          return;
        }

        const data = await getTrainerProgressRecords(token);

        if (isMounted) {
          setProgressRecords(data);
        }
      } catch (error) {
        if (isMounted) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load progress records.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialProgressRecords();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleCreateProgressRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const token = getToken();

      if (!token) {
        setError(
          "You must be logged in as a trainer to create progress records.",
        );
        return;
      }

      const parsedClientId = Number(clientId);
      const parsedWeight = weight ? Number(weight) : undefined;
      const parsedBodyFat = bodyFat ? Number(bodyFat) : undefined;

      if (!parsedClientId || parsedClientId <= 0) {
        setError("Please enter a valid client ID.");
        return;
      }

      if (parsedWeight !== undefined && parsedWeight <= 0) {
        setError("Please enter a valid weight.");
        return;
      }

      if (parsedBodyFat !== undefined && parsedBodyFat <= 0) {
        setError("Please enter a valid body fat value.");
        return;
      }

      await createTrainerProgressRecord(token, {
        clientId: parsedClientId,
        weight: parsedWeight,
        bodyFat: parsedBodyFat,
        dietSuggestion: dietSuggestion || undefined,
      });

      setClientId("");
      setWeight("");
      setBodyFat("");
      setDietSuggestion("");
      setSelectedClientId(String(parsedClientId));
      setSuccessMessage("Progress record created successfully.");

      await loadProgressRecords();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create progress record.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Progress Management</h1>
        <p className="mt-4 text-gray-600">Loading progress records...</p>
      </main>
    );
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Progress Management</h1>
      <p className="mt-2 text-gray-600">
        Create and manage progress records for your clients.
      </p>

      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-medium">Create Progress Record</h2>

        <form onSubmit={handleCreateProgressRecord} className="mt-4 grid gap-4">
          <div>
            <label
              htmlFor="clientId"
              className="block text-sm font-medium text-gray-700"
            >
              Client ID
            </label>
            <input
              id="clientId"
              type="number"
              min="1"
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Enter client ID"
            />
          </div>

          <div>
            <label
              htmlFor="weight"
              className="block text-sm font-medium text-gray-700"
            >
              Weight
            </label>
            <input
              id="weight"
              type="number"
              min="0"
              step="0.01"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Enter weight"
            />
          </div>

          <div>
            <label
              htmlFor="bodyFat"
              className="block text-sm font-medium text-gray-700"
            >
              Body Fat
            </label>
            <input
              id="bodyFat"
              type="number"
              min="0"
              step="0.01"
              value={bodyFat}
              onChange={(event) => setBodyFat(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Enter body fat"
            />
          </div>

          <div>
            <label
              htmlFor="dietSuggestion"
              className="block text-sm font-medium text-gray-700"
            >
              Diet Suggestion
            </label>
            <textarea
              id="dietSuggestion"
              value={dietSuggestion}
              onChange={(event) => setDietSuggestion(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Enter diet suggestion"
              rows={4}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-fit rounded-md bg-gray-900 px-4 py-2 text-white disabled:opacity-60"
          >
            {isSubmitting ? "Creating..." : "Create Progress Record"}
          </button>
        </form>

        {successMessage && (
          <p className="mt-4 text-sm text-green-600">{successMessage}</p>
        )}

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </section>

      <section className="mt-8 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-medium">Progress Trend</h2>
        <p className="mt-1 text-sm text-gray-600">
          Select a client to view their weight and body fat changes over time.
        </p>

        {progressRecords.length === 0 ? (
          <p className="mt-4 text-gray-600">
            Create a progress record before viewing a chart.
          </p>
        ) : (
          <>
            <div className="mt-4">
              <label
                htmlFor="selectedClientId"
                className="block text-sm font-medium text-gray-700"
              >
                Client
              </label>
              <select
                id="selectedClientId"
                value={selectedClientId}
                onChange={(event) => setSelectedClientId(event.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.clientId} value={client.clientId}>
                    {client.clientEmail} (ID: {client.clientId})
                  </option>
                ))}
              </select>
            </div>

            {!selectedClientId ? (
              <p className="mt-4 text-gray-600">
                Select a client to display the progress chart.
              </p>
            ) : chartData.length === 0 ? (
              <p className="mt-4 text-gray-600">
                This client does not have any progress records yet.
              </p>
            ) : (
              <div className="mt-4 h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="recordedAt" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      name="Weight"
                      stroke="#2563eb"
                      strokeWidth={2}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="bodyFat"
                      name="Body Fat"
                      stroke="#dc2626"
                      strokeWidth={2}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-medium">Progress Records</h2>

        {progressRecords.length === 0 ? (
          <p className="mt-4 text-gray-600">
            You have not created any progress records yet.
          </p>
        ) : (
          <div className="mt-4 grid gap-4">
            {progressRecords.map((record) => (
              <div
                key={record.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    Progress Record #{record.id}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {new Date(record.recordedAt).toLocaleString()}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-700">
                  <p>
                    <span className="font-medium">Client:</span>{" "}
                    {record.clientEmail}
                  </p>
                  <p>
                    <span className="font-medium">Client ID:</span>{" "}
                    {record.clientId}
                  </p>
                  <p>
                    <span className="font-medium">Weight:</span>{" "}
                    {record.weight ?? "Not recorded"}
                  </p>
                  <p>
                    <span className="font-medium">Body fat:</span>{" "}
                    {record.bodyFat ?? "Not recorded"}
                  </p>
                  <p>
                    <span className="font-medium">Diet suggestion:</span>{" "}
                    {record.dietSuggestion || "No suggestion provided."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
