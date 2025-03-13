"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/supabase/models/database.types";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, CheckCircle, TrendingUp } from "lucide-react";

interface HabitInsightsProps {
  habits: Tables<"habits">[];
  checkins: Tables<"habit_checkins">[];
}

export default function HabitInsights({
  habits,
  checkins,
}: HabitInsightsProps) {
  const [insights, setInsights] = useState<{
    mostConsistentHabit: { name: string; rate: number } | null;
    bestDayOfWeek: string | null;
    topHabits: Array<{ name: string; rate: number; color: string }>;
  }>({
    mostConsistentHabit: null,
    bestDayOfWeek: null,
    topHabits: [],
  });

  useEffect(() => {
    calculateInsights();
  }, [habits, checkins]);

  const calculateInsights = () => {
    // Skip if no data
    if (habits.length === 0 || checkins.length === 0) {
      return;
    }

    // 1. Find most consistent habit (highest completion rate)
    const habitCompletionRates = habits.map((habit) => {
      const habitCheckins = checkins.filter(
        (checkin) => checkin.habit_uuid === habit.uuid
      );

      const successfulCheckins = habitCheckins.filter(
        (checkin) => checkin.status === "true"
      ).length;

      const totalExpectedCheckins =
        (habit.frequency_value || 1) * (habit.duration_value || 1);

      const completionRate =
        totalExpectedCheckins > 0
          ? (successfulCheckins / totalExpectedCheckins) * 100
          : 0;

      return {
        name: habit.name || "Unnamed habit",
        rate: Math.round(completionRate),
        color: habit.color || "#10b981", // Default to green if no color
      };
    });

    // Sort by completion rate
    habitCompletionRates.sort((a, b) => b.rate - a.rate);

    // 2. Find best day of week
    const dayOfWeekCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun, Mon, Tue, Wed, Thu, Fri, Sat

    checkins.forEach((checkin) => {
      if (checkin.status === "true") {
        const date = new Date(checkin.created_at);
        dayOfWeekCounts[date.getDay()]++;
      }
    });

    const bestDayIndex = dayOfWeekCounts.indexOf(Math.max(...dayOfWeekCounts));
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    setInsights({
      mostConsistentHabit:
        habitCompletionRates.length > 0
          ? {
              name: habitCompletionRates[0].name,
              rate: habitCompletionRates[0].rate,
            }
          : null,
      bestDayOfWeek: dayNames[bestDayIndex],
      topHabits: habitCompletionRates.slice(0, 5), // Take top 5 habits
    });
  };

  // If there's no data, show a message
  if (habits.length === 0 || checkins.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Habit Insights</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">
            Complete your habits to see insights here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Habit Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {insights.mostConsistentHabit && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-indigo-500" />
                <h3 className="text-sm font-medium">Most Consistent Habit</h3>
              </div>
              <div className="bg-muted/50 p-3 rounded-md">
                <p className="text-lg font-semibold mb-1">
                  {insights.mostConsistentHabit.name}
                </p>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">
                    Completion rate
                  </span>
                  <Badge variant="outline">
                    {insights.mostConsistentHabit.rate}%
                  </Badge>
                </div>
                <Progress
                  value={insights.mostConsistentHabit.rate}
                  className="h-2"
                />
              </div>
            </div>
          )}

          {insights.bestDayOfWeek && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-purple-500" />
                <h3 className="text-sm font-medium">Best Day for Habits</h3>
              </div>
              <div className="bg-muted/50 p-3 rounded-md">
                <p className="text-lg font-semibold">
                  {insights.bestDayOfWeek}
                </p>
                <p className="text-sm text-muted-foreground">
                  You complete more habits on this day
                </p>
              </div>
            </div>
          )}

          {insights.topHabits.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <h3 className="text-sm font-medium">
                  Top Habits by Completion
                </h3>
              </div>
              <div className="space-y-3">
                {insights.topHabits.map((habit, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate max-w-[200px]">
                        {habit.name}
                      </p>
                      <Badge
                        variant="outline"
                        className={
                          habit.rate > 50 ? "text-indigo-500" : "text-zinc-500"
                        }
                      >
                        {habit.rate}%
                      </Badge>
                    </div>
                    <Progress
                      value={habit.rate}
                      className="h-2"
                      style={
                        {
                          "--progress-background": habit.color,
                        } as React.CSSProperties
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
