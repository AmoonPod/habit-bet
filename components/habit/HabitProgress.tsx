"use client";

import { Tables } from "@/supabase/models/database.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Calendar, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import {
  format,
  parseISO,
  startOfWeek,
  addDays,
  subWeeks,
  isBefore,
  subDays,
} from "date-fns";

interface HabitProgressProps {
  checkins: Tables<"habit_checkins">[];
  habit: Tables<"habits">;
}

export default function HabitProgress({ checkins, habit }: HabitProgressProps) {
  const [weeklyHeatmap, setWeeklyHeatmap] = useState<{
    [key: string]: { status: string; date: Date };
  }>({});
  const [weekOffset, setWeekOffset] = useState(0);
  const [completionTrend, setCompletionTrend] = useState<string[]>([]);
  const [canGoEarlier, setCanGoEarlier] = useState(true);

  // Get habit start date for navigation boundary - move to useMemo to prevent recreation on each render
  const habitStartDate = useMemo(() => {
    return habit.start_date
      ? parseISO(habit.start_date)
      : new Date(habit.created_at);
  }, [habit.start_date, habit.created_at]);

  // Process checkins to generate heatmap data
  useEffect(() => {
    if (checkins.length === 0) return;

    // Generate trend data (last 10 check-ins)
    const lastTenCheckins = [...checkins]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 10)
      .reverse();

    setCompletionTrend(
      lastTenCheckins.map((c) => (c.status === "true" ? "success" : "missed"))
    );

    // Generate weekly heatmap data
    const now = new Date();
    const startDate = subWeeks(
      startOfWeek(now, { weekStartsOn: 1 }),
      weekOffset
    );

    // Check if we can go earlier based on habit start date
    const earliestDateInView = startDate;
    const shouldAllowEarlier = !isBefore(earliestDateInView, habitStartDate);
    setCanGoEarlier(shouldAllowEarlier);

    const heatmapData: { [key: string]: { status: string; date: Date } } = {};

    // Initialize the week with empty days
    for (let i = 0; i < 7; i++) {
      const day = addDays(startDate, i);
      const dateKey = format(day, "yyyy-MM-dd");
      heatmapData[dateKey] = { status: "empty", date: day };
    }

    // Fill in the check-ins data
    checkins.forEach((checkin) => {
      const checkinDate = parseISO(checkin.created_at);
      const dateKey = format(checkinDate, "yyyy-MM-dd");

      // Only include if the date is within our week range
      if (heatmapData[dateKey]) {
        heatmapData[dateKey] = {
          status: checkin.status === "true" ? "success" : "missed",
          date: checkinDate,
        };
      }
    });

    setWeeklyHeatmap(heatmapData);
  }, [checkins, weekOffset, habitStartDate]);

  // Handle week navigation
  const navigateWeek = (direction: number) => {
    if (direction > 0) {
      // Going backwards (to earlier dates)
      const now = new Date();
      const currentStartDate = subWeeks(
        startOfWeek(now, { weekStartsOn: 1 }),
        weekOffset
      );
      const newStartDate = subWeeks(currentStartDate, 1);

      // Don't allow navigating before the habit start date
      if (isBefore(newStartDate, habitStartDate)) {
        return;
      }
    }

    setWeekOffset((prev) => prev + direction);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-500";
      case "missed":
        return "bg-red-200";
      default:
        return "bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-3 w-3 text-white" />;
      case "missed":
        return <XCircle className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  // Get week range for display
  const weekStart =
    Object.keys(weeklyHeatmap).length > 0
      ? weeklyHeatmap[Object.keys(weeklyHeatmap)[0]].date
      : new Date();

  const weekEnd =
    Object.keys(weeklyHeatmap).length > 0
      ? weeklyHeatmap[Object.keys(weeklyHeatmap)[6]].date
      : new Date();

  // Generate insights based on completion patterns
  const generateInsights = () => {
    if (checkins.length === 0) return "Start checking in to see your patterns";

    const successRate =
      checkins.filter((c) => c.status === "true").length / checkins.length;

    if (successRate === 1) return "Perfect record! Keep up the great work!";
    if (successRate > 0.8) return "You're doing great with this habit!";
    if (successRate > 0.5) return "You're on the right track. Keep going!";
    return "This habit needs more consistency. Don't give up!";
  };

  return (
    <Card className="mb-8">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Habit Progress
          </CardTitle>
          <Activity className="h-5 w-5 text-blue-500" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Weekly heatmap */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Weekly View</h4>
              <div className="text-xs text-muted-foreground">
                {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d")}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => navigateWeek(1)}
                className={`text-xs ${
                  !canGoEarlier
                    ? "text-muted-foreground/50 cursor-not-allowed"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                disabled={!canGoEarlier}
              >
                ← Earlier
              </button>

              <div className="flex gap-1 justify-center my-2">
                {Object.entries(weeklyHeatmap).map(([date, data]) => (
                  <div key={date} className="flex flex-col items-center">
                    <div className="text-xs text-muted-foreground mb-1">
                      {format(data.date, "E")[0]}
                    </div>
                    <div
                      className={`w-8 h-8 rounded-md flex items-center justify-center ${getStatusColor(
                        data.status
                      )}`}
                      title={`${format(data.date, "MMM d")}: ${
                        data.status === "success"
                          ? "Completed"
                          : data.status === "missed"
                          ? "Missed"
                          : "No check-in"
                      }`}
                    >
                      {getStatusIcon(data.status)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(data.date, "d")}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigateWeek(-1)}
                disabled={weekOffset === 0}
                className={`text-xs ${
                  weekOffset === 0
                    ? "text-muted-foreground/50"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Later →
              </button>
            </div>
          </div>

          {/* Progress trend */}
          {checkins.length > 1 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Recent Trend</h4>
              <div className="flex gap-1 items-center h-6">
                {completionTrend.map((status, i) => (
                  <div
                    key={i}
                    className={`h-full rounded-sm transition-all duration-200 ${
                      status === "success"
                        ? "bg-green-500 w-6"
                        : "bg-red-200 w-2"
                    }`}
                    title={status === "success" ? "Completed" : "Missed"}
                  />
                ))}
                {completionTrend.length === 0 && (
                  <div className="text-xs text-muted-foreground">
                    Not enough data yet
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Insight */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <h4 className="text-sm font-medium mb-1 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Insight
            </h4>
            <p className="text-sm text-muted-foreground">
              {generateInsights()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
