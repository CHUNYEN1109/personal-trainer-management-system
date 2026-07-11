"use client";

import { useEffect, useState } from "react";
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
import { getClientProgressRecords, ProgressRecord } from "@/lib/api/api";

type ProgressChartData = {
  recordedAt: string;
  weight: number | null;
  bodyFat: number | null;
};

export default function ClientProgressPage() {
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const chartData: ProgressChartData[] = progressRecords
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

  const latestProgressRecord = chartData.at(-1);

  useEffect(() => {
    async function loadProgressRecords() {
      try {
        const token = localStorage.getItem("authToken");

        if (!token) {
          setError("You must be logged in to view your progress records.");
          return;
        }

        const data = await getClientProgressRecords(token);
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

    loadProgressRecords();
  }, []);

  if (isLoading) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">My Progress</h1>
        <p className="mt-4 text-gray-600">Loading progress records...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">My Progress</h1>
        <p className="mt-4 text-red-600">{error}</p>
      </main>
    );
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">My Progress</h1>
      <p className="mt-2 text-gray-600">
        View your progress records from your trainer.
      </p>

      {progressRecords.length === 0 ? (
        <p className="mt-6 text-gray-600">
          You do not have any progress records yet.
        </p>
      ) : (
        <>
          <section className="mt-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-medium">Progress Trend</h2>
            <p className="mt-1 text-sm text-gray-600">
              Track your weight and body fat changes over time.
            </p>

            {chartData.length === 1 && latestProgressRecord ? (
              <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                <p className="font-medium text-gray-900">
                  One progress record available.
                </p>
                <p className="mt-2">
                  Add at least one more record to display a progress trend
                  chart.
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <p>
                    <span className="font-medium">Recorded date:</span>{" "}
                    {latestProgressRecord.recordedAt}
                  </p>
                  <p>
                    <span className="font-medium">Current weight:</span>{" "}
                    {latestProgressRecord.weight ?? "Not recorded"}
                  </p>
                  <p>
                    <span className="font-medium">Current body fat:</span>{" "}
                    {latestProgressRecord.bodyFat ?? "Not recorded"}
                  </p>
                </div>
              </div>
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
          </section>

          <div className="mt-6 grid gap-4">
            {progressRecords.map((record) => (
              <div
                key={record.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium">
                    Progress Record #{record.id}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {new Date(record.recordedAt).toLocaleString()}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-700">
                  <p>
                    <span className="font-medium">Trainer:</span>{" "}
                    {record.trainerEmail}
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
        </>
      )}
    </main>
  );
}
