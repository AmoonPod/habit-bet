"use client";

import { Tables } from "@/supabase/models/database.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Award, XCircle, PieChart, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardSummaryProps {
  habits: Tables<"habits">[];
  checkins: Tables<"habit_checkins">[];
}

export default function DashboardSummary({
  habits,
  checkins,
}: DashboardSummaryProps) {
  // Calculate summary statistics
  const totalHabits = habits.length;
  const activeHabits = habits.filter(habit => habit.status !== "failed").length;
  const failedHabits = habits.filter(habit => habit.status === "failed").length;

  // Calculate success vs failure rate
  const successfulCheckins = checkins.filter(c => c.status === "true").length;
  const failedCheckins = checkins.filter(c => c.status === "false").length;
  const totalCheckins = successfulCheckins + failedCheckins;

  const successRate = totalCheckins > 0
    ? Math.round((successfulCheckins / totalCheckins) * 100)
    : 100;

  const failureRate = totalCheckins > 0
    ? Math.round((failedCheckins / totalCheckins) * 100)
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

  // Calculate the circle circumference and offset for the circular progress
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const successOffset = circumference - (circumference * successRate) / 100;

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
            {totalHabits === 1 ? "Total habit" : "Total habits"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Habits</CardTitle>
          <Target className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeHabits}</div>
          <p className="text-xs text-muted-foreground">
            {activeHabits === 1 ? "Active habit" : "Active habits"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Failed Habits</CardTitle>
          <XCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{failedHabits}</div>
          <p className="text-xs text-muted-foreground">
            {failedHabits === 1 ? "Failed habit" : "Failed habits"}
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
