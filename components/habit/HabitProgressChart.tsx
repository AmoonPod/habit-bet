"use client";

import React, { useMemo } from "react";
import { Tables } from "@/supabase/models/database.types";
import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
} from "@/components/ui/chart";
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface HabitProgressChartProps {
  habit: Tables<"habits">;
  checkins: Tables<"habit_checkins">[];
}

export default function HabitProgressChart({
  habit,
  checkins,
}: HabitProgressChartProps) {
  // Prepare data for the chart
  const chartData = useMemo(() => {
    // If no check-ins, return empty array
    if (checkins.length === 0) return [];

    // Sort check-ins by date (oldest to newest)
    const sortedCheckins = [...checkins].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Get start and end dates
    const startDate = new Date(sortedCheckins[0].created_at);
    const endDate = new Date();

    // Create an array of weeks
    const weeks = [];
    let currentWeekStart = startOfWeek(startDate, { weekStartsOn: 1 });
    const lastWeekEnd = endOfWeek(endDate, { weekStartsOn: 1 });

    while (currentWeekStart <= lastWeekEnd) {
      const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

      // Get all days in the week
      const daysInWeek = eachDayOfInterval({
        start: currentWeekStart,
        end: weekEnd,
      });

      // Count successful check-ins for this week
      const weeklySuccessfulCheckins = sortedCheckins.filter((checkin) => {
        const checkinDate = new Date(checkin.created_at);
        return (
          checkinDate >= currentWeekStart &&
          checkinDate <= weekEnd &&
          checkin.status === "true"
        );
      }).length;

      // Count failed check-ins for this week
      const weeklyFailedCheckins = sortedCheckins.filter((checkin) => {
        const checkinDate = new Date(checkin.created_at);
        return (
          checkinDate >= currentWeekStart &&
          checkinDate <= weekEnd &&
          checkin.status === "false"
        );
      }).length;

      // Calculate weekly completion rate
      const weeklyCompletionRate =
        weeklySuccessfulCheckins + weeklyFailedCheckins > 0
          ? Math.round(
              (weeklySuccessfulCheckins /
                (weeklySuccessfulCheckins + weeklyFailedCheckins)) *
                100
            )
          : 0;

      weeks.push({
        name: `${format(currentWeekStart, "MM/dd")} - ${format(
          weekEnd,
          "MM/dd"
        )}`,
        completionRate: weeklyCompletionRate,
        successful: weeklySuccessfulCheckins,
        failed: weeklyFailedCheckins,
      });

      // Move to next week
      currentWeekStart = new Date(weekEnd);
      currentWeekStart.setDate(currentWeekStart.getDate() + 1);
    }

    return weeks;
  }, [checkins]);

  // If no data, show a message
  if (chartData.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        Not enough data to display the chart.
      </p>
    );
  }

  // Chart color configuration
  const chartConfig = {
    completionRate: {
      label: "Completion Rate",
      color: "#4F46E5",
    },
    successful: {
      label: "Successful Check-ins",
      color: "#10B981",
    },
    failed: {
      label: "Failed Check-ins",
      color: "#EF4444",
    },
  };

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis
            yAxisId="left"
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, "dataMax + 2"]}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload || !payload.length) return null;

              return (
                <div className="rounded-lg border bg-background p-2 shadow-md">
                  <div className="font-medium">{label}</div>
                  <div className="flex flex-col gap-1 mt-2">
                    {payload.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <div>
                          {entry.name === "completionRate"
                            ? `Completion Rate: ${entry.value}%`
                            : entry.name === "successful"
                            ? `Successful Check-ins: ${entry.value}`
                            : `Failed Check-ins: ${entry.value}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="completionRate"
            name="Completion Rate"
            stroke="#4F46E5"
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="successful"
            name="Successful Check-ins"
            stroke="#10B981"
            strokeWidth={2}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="failed"
            name="Failed Check-ins"
            stroke="#EF4444"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
