"use client";

import React, { useMemo } from "react";
import { Tables } from "@/supabase/models/database.types";
import {
  format,
  parseISO,
  differenceInDays,
  startOfDay,
  endOfDay,
  isMonday,
  isTuesday,
  isWednesday,
  isThursday,
  isFriday,
  isSaturday,
  isSunday,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  isSameDay,
} from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";

interface HabitInsightsProps {
  habit: Tables<"habits">;
  checkins: Tables<"habit_checkins">[];
}

interface DayData {
  name: string;
  fullName: string;
  value: number;
}

interface Suggestion {
  title: string;
  description: string;
  icon: React.FC<{ className?: string }>;
}

export default function HabitInsights({ habit, checkins }: HabitInsightsProps) {
  // Calculate statistics and insights
  const insights = useMemo(() => {
    if (checkins.length === 0) return null;

    // Sort check-ins by date
    const sortedCheckins = [...checkins].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Count successful and failed check-ins
    const successfulCheckins = checkins.filter((c) => c.status === "true");
    const failedCheckins = checkins.filter((c) => c.status === "false");

    // Calculate distribution by day of week
    const dayDistribution: DayData[] = [
      { name: "Mon", value: 0, fullName: "Monday" },
      { name: "Tue", value: 0, fullName: "Tuesday" },
      { name: "Wed", value: 0, fullName: "Wednesday" },
      { name: "Thu", value: 0, fullName: "Thursday" },
      { name: "Fri", value: 0, fullName: "Friday" },
      { name: "Sat", value: 0, fullName: "Saturday" },
      { name: "Sun", value: 0, fullName: "Sunday" },
    ];

    // Also track failed check-ins by day
    const failedByDay: DayData[] = [
      { name: "Mon", value: 0, fullName: "Monday" },
      { name: "Tue", value: 0, fullName: "Tuesday" },
      { name: "Wed", value: 0, fullName: "Wednesday" },
      { name: "Thu", value: 0, fullName: "Thursday" },
      { name: "Fri", value: 0, fullName: "Friday" },
      { name: "Sat", value: 0, fullName: "Saturday" },
      { name: "Sun", value: 0, fullName: "Sunday" },
    ];

    successfulCheckins.forEach((checkin) => {
      const date = new Date(checkin.created_at);
      if (isMonday(date)) dayDistribution[0].value++;
      if (isTuesday(date)) dayDistribution[1].value++;
      if (isWednesday(date)) dayDistribution[2].value++;
      if (isThursday(date)) dayDistribution[3].value++;
      if (isFriday(date)) dayDistribution[4].value++;
      if (isSaturday(date)) dayDistribution[5].value++;
      if (isSunday(date)) dayDistribution[6].value++;
    });

    failedCheckins.forEach((checkin) => {
      const date = new Date(checkin.created_at);
      if (isMonday(date)) failedByDay[0].value++;
      if (isTuesday(date)) failedByDay[1].value++;
      if (isWednesday(date)) failedByDay[2].value++;
      if (isThursday(date)) failedByDay[3].value++;
      if (isFriday(date)) failedByDay[4].value++;
      if (isSaturday(date)) failedByDay[5].value++;
      if (isSunday(date)) failedByDay[6].value++;
    });

    // Find best and worst days
    const bestDay = [...dayDistribution].sort((a, b) => b.value - a.value)[0];

    // Find the day with the worst success rate
    const worstDay = [...dayDistribution]
      .map((day, index) => {
        const successCount = day.value;
        const failCount = failedByDay[index].value;
        const total = successCount + failCount;
        const successRate = total === 0 ? 1 : successCount / total; // Default to 100% if no data

        return {
          ...day,
          successRate,
        };
      })
      .sort((a, b) => a.successRate - b.successRate)[0] || {
      name: "",
      fullName: "",
      value: 0,
      successRate: 1,
    };

    // Calculate recent trend (last 7 days)
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      return {
        date,
        day: format(date, "EEE"),
        successful: 0,
        failed: 0,
      };
    });

    // Fill in the check-ins for the last 7 days
    checkins.forEach((checkin) => {
      const checkinDate = new Date(checkin.created_at);
      const dayIndex = last7Days.findIndex((d) =>
        isSameDay(d.date, checkinDate)
      );

      if (dayIndex >= 0) {
        if (checkin.status === "true") {
          last7Days[dayIndex].successful++;
        } else {
          last7Days[dayIndex].failed++;
        }
      }
    });

    // Calculate longest streak
    let longestStreak = 0;
    let currentStreak = 0;
    let previousDate: Date | null = null;

    // Sort successful check-ins by date
    const sortedSuccessful = [...successfulCheckins].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Group check-ins by day to handle multiple check-ins on the same day
    const checkInsByDay = new Map<string, boolean>();

    sortedSuccessful.forEach((checkin) => {
      const dateStr = format(new Date(checkin.created_at), "yyyy-MM-dd");
      checkInsByDay.set(dateStr, true);
    });

    // Convert to array of dates and sort
    const uniqueDates = Array.from(checkInsByDay.keys())
      .map((dateStr) => new Date(dateStr))
      .sort((a, b) => a.getTime() - b.getTime());

    // Calculate streaks with a 1-day grace period
    if (uniqueDates.length > 0) {
      currentStreak = 1;

      for (let i = 1; i < uniqueDates.length; i++) {
        const currentDate = uniqueDates[i];
        const prevDate = uniqueDates[i - 1];
        const dayDiff = differenceInDays(currentDate, prevDate);

        if (dayDiff <= 2) {
          // Allow a 1-day gap (grace period)
          currentStreak++;
        } else {
          if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
          }
          currentStreak = 1;
        }
      }

      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
    }

    // Calculate improvement suggestions based on data
    const suggestions: Suggestion[] = [];

    // Suggestion based on worst day
    if (worstDay) {
      const hasFailedCheckins = worstDay.value > 0;

      if (worstDay.successRate < 0.5 && hasFailedCheckins) {
        suggestions.push({
          title: `Struggle on ${worstDay.fullName || "certain days"}s`,
          description: `You tend to miss your habit most often on ${worstDay.fullName || "certain days"
            }s. Consider setting a special reminder or preparing in advance for this day.`,
          icon: AlertTriangle,
        });
      }
    }

    // Suggestion for consistency
    if (longestStreak < 7 && checkins.length > 10) {
      suggestions.push({
        title: "Build More Consistency",
        description: `Your longest streak is ${longestStreak} days. Try to focus on not breaking the chain to build momentum.`,
        icon: Calendar,
      });
    }

    // Suggestion for improvement
    const recentSuccessRate =
      last7Days.reduce((sum, day) => sum + day.successful, 0) /
      Math.max(
        1,
        last7Days.reduce((sum, day) => sum + day.successful + day.failed, 0)
      );

    if (recentSuccessRate < 0.7 && checkins.length > 5) {
      suggestions.push({
        title: "Recent Performance Dropping",
        description:
          "Your success rate has been lower recently. Consider adjusting your approach or making the habit easier to complete.",
        icon: TrendingDown,
      });
    }

    return {
      totalCheckins: checkins.length,
      successfulCheckins: successfulCheckins.length,
      failedCheckins: failedCheckins.length,
      successRate: Math.round(
        (successfulCheckins.length / checkins.length) * 100
      ),
      dayDistribution,
      failedByDay,
      bestDay,
      worstDay,
      last7Days,
      longestStreak,
      suggestions,
    };
  }, [checkins]);

  if (!insights) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Not enough data to display insights.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {/* General statistics */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-lg border p-4 space-y-1">
                <p className="text-sm text-muted-foreground">Total check-ins</p>
                <p className="text-2xl font-bold">{insights.totalCheckins}</p>
              </div>
              <div className="bg-card rounded-lg border p-4 space-y-1">
                <p className="text-sm text-muted-foreground">Success rate</p>
                <p className="text-2xl font-bold">{insights.successRate}%</p>
              </div>
              <div className="bg-card rounded-lg border p-4 space-y-1">
                <p className="text-sm text-muted-foreground">
                  Successful check-ins
                </p>
                <p className="text-2xl font-bold text-indigo-500">
                  {insights.successfulCheckins}
                </p>
              </div>
              <div className="bg-card rounded-lg border p-4 space-y-1">
                <p className="text-sm text-muted-foreground">
                  Failed check-ins
                </p>
                <p className="text-2xl font-bold text-zinc-500">
                  {insights.failedCheckins}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">
                Best and Worst Days
              </h3>
              <div className="bg-card rounded-lg border p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">Best day: </span>
                  </div>
                  <Badge variant="outline" className="bg-green-50">
                    {insights.bestDay.fullName} ({insights.bestDay.value}{" "}
                    successes)
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <XCircle className="h-4 w-4 text-red-500 mr-2" />
                    <span className="text-sm">Most challenging: </span>
                  </div>
                  <Badge variant="outline" className="bg-red-50">
                    {insights.worstDay.fullName}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Last 7 Days</h3>
            <div className="bg-card rounded-lg border p-4">
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={insights.last7Days}
                    margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" />
                    <YAxis allowDecimals={false} />
                    <RechartsTooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-2 border rounded shadow-sm">
                              <p className="font-medium">
                                {format(data.date, "MMM d, yyyy")}
                              </p>
                              <p className="text-indigo-500">
                                Successful: {data.successful}
                              </p>
                              <p className="text-zinc-500">
                                Failed: {data.failed}
                              </p>
                              {habit?.frequency_unit !== "day" && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {habit?.frequency_unit === "week"
                                    ? "Part of current week's check-ins"
                                    : "Part of current month's check-ins"}
                                </p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="successful"
                      fill="#6366F1"
                      name="Successful"
                    />
                    <Bar
                      dataKey="failed"
                      fill="#A1A1AA"
                      name="Failed"
                      stackId="a"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Daily activity</span>
                <span>
                  {habit?.frequency_unit === "day" || !habit?.frequency_unit
                    ? "Daily check-ins"
                    : habit?.frequency_unit === "week"
                      ? `Weekly goal: ${habit?.frequency_value || 1} check-ins`
                      : `Monthly goal: ${habit?.frequency_value || 1} check-ins`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Improvement suggestions */}
        {insights.suggestions.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Info className="h-5 w-5 mr-2 text-blue-500" />
              Improvement Suggestions
            </h3>
            <div className="bg-card rounded-lg border p-4">
              <div className="space-y-4">
                {insights.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex">
                    <suggestion.icon className="h-5 w-5 mr-3 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">{suggestion.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {suggestion.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Day of week performance */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Day of Week Performance
          </h3>
          <div className="bg-card rounded-lg border p-4">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={insights.dayDistribution}
                  margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const dayName = payload[0].payload.fullName;
                        const successCount = payload[0].value as number;
                        const failCount =
                          insights.failedByDay.find((d) => d.name === label)
                            ?.value || 0;
                        const total = successCount + failCount;
                        const successRate =
                          total === 0
                            ? 0
                            : Math.round((successCount / total) * 100);

                        return (
                          <div className="bg-white p-2 border rounded shadow-sm">
                            <p className="font-medium">{dayName}</p>
                            <p className="text-indigo-500">
                              Successful: {successCount}
                            </p>
                            <p className="text-zinc-500">Failed: {failCount}</p>
                            <p className="font-medium mt-1">
                              Success rate: {successRate}%
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="value" name="Successful Check-ins">
                    {insights.dayDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.name === insights.bestDay.name
                            ? "#6366F1"
                            : entry.name === insights.worstDay.name
                              ? "#A1A1AA"
                              : "#A855F7"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
