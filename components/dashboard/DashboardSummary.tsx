"use client";

import { Tables } from "@/supabase/models/database.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, Calendar, Award } from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardSummaryProps {
  habits: Tables<"habits">[];
  checkins: Tables<"habit_checkins">[];
}

export default function DashboardSummary({
  habits,
  checkins,
}: DashboardSummaryProps) {
  const [todayCheckins, setTodayCheckins] = useState(0);

  // Calculate summary statistics
  const totalHabits = habits.length;

  useEffect(() => {
    // Calculate today's check-ins
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Debug: Log the date we're comparing against
    console.log("Today's date for comparison:", today);

    const todayCount = checkins.filter((checkin) => {
      const checkinDate = new Date(checkin.created_at);
      checkinDate.setHours(0, 0, 0, 0);

      // Debug: Log each checkin date for comparison
      console.log("Checkin date:", checkinDate, "Status:", checkin.status);

      // Confronto più affidabile: confronta anno, mese e giorno invece del timestamp
      const isSameDay =
        checkinDate.getFullYear() === today.getFullYear() &&
        checkinDate.getMonth() === today.getMonth() &&
        checkinDate.getDate() === today.getDate();

      const isCompleted = checkin.status === "true";

      return isSameDay && isCompleted;
    }).length;

    console.log("Today's checkins count:", todayCount);
    setTodayCheckins(todayCount);
  }, [checkins]);

  // Calculate total completion rate
  const totalCompletionRate =
    habits.length > 0
      ? Math.round(
          (checkins.filter((c) => c.status === "true").length / habits.length) *
            100
        )
      : 0;

  // Calculate longest habit (in days)
  const longestHabit = habits.reduce((longest, habit) => {
    const createdDate = new Date(habit.created_at);
    const now = new Date();
    const durationInDays = Math.floor(
      (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return durationInDays > longest ? durationInDays : longest;
  }, 0);

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Habits</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalHabits}</div>
          <p className="text-xs text-muted-foreground">
            {totalHabits === 1 ? "Active habit" : "Active habits"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Today's Check-ins
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todayCheckins}</div>
          <p className="text-xs text-muted-foreground">
            {todayCheckins === 1
              ? "Habit completed today"
              : "Habits completed today"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCompletionRate}%</div>
          <p className="text-xs text-muted-foreground">
            Total completion percentage
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Longest Habit</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{longestHabit}</div>
          <p className="text-xs text-muted-foreground">
            {longestHabit === 1 ? "Day" : "Days"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
