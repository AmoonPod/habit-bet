"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tables } from "@/supabase/models/database.types";
import { Target, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  addDays,
  addWeeks,
  addMonths,
  parseISO,
  format,
} from "date-fns";
import { calculateHabitProgress } from "@/lib/progress-calculation";

interface HabitCardProps {
  habit: Tables<"habits">;
  stake: Tables<"habit_stakes">;
  checkins?: Tables<"habit_checkins">[];
}

export default function HabitCard({
  habit,
  stake,
  checkins = [],
}: HabitCardProps) {
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ value: 0, unit: "days" });

  useEffect(() => {
    // Calculate completion percentage based on habit frequency and check-ins
    calculateCompletionPercentage();

    // Calculate time left
    calculateTimeLeft();
  }, [habit, checkins]);

  const calculateCompletionPercentage = () => {
    if (!habit.frequency_value || !habit.duration_value) {
      setCompletionPercentage(0);
      return;
    }

    // Use the centralized calculation function
    const { progressPercentage } = calculateHabitProgress(habit, checkins);
    setCompletionPercentage(progressPercentage);
  };

  const calculateTimeLeft = () => {
    if (!habit.duration_unit || !habit.duration_value) {
      setTimeLeft({ value: 0, unit: "days" });
      return;
    }

    const startDate = new Date(habit.created_at);
    let endDate;

    // Calculate end date based on duration unit and value
    switch (habit.duration_unit) {
      case "day":
        endDate = addDays(startDate, habit.duration_value);
        break;
      case "week":
        endDate = addWeeks(startDate, habit.duration_value);
        break;
      case "month":
        endDate = addMonths(startDate, habit.duration_value);
        break;
      default:
        endDate = addDays(startDate, 30); // Default to 30 days
    }

    const now = new Date();

    // Show time left in the same unit as the habit frequency
    // for better user understanding
    if (habit.frequency_unit === "day") {
      // If the frequency is daily, show days left
      const daysLeft = Math.max(0, differenceInDays(endDate, now));
      setTimeLeft({
        value: daysLeft,
        unit: daysLeft === 1 ? "day" : "days",
      });
    } else if (habit.frequency_unit === "week") {
      // If the frequency is weekly, show weeks left
      const weeksLeft = Math.max(0, differenceInWeeks(endDate, now));
      setTimeLeft({
        value: weeksLeft,
        unit: weeksLeft === 1 ? "week" : "weeks",
      });
    } else if (habit.frequency_unit === "month") {
      // If the frequency is monthly, show months left
      const monthsLeft = Math.max(0, differenceInMonths(endDate, now));
      setTimeLeft({
        value: monthsLeft,
        unit: monthsLeft === 1 ? "month" : "months",
      });
    } else {
      // Fallback to days if the frequency is not specified
      const daysLeft = Math.max(0, differenceInDays(endDate, now));
      setTimeLeft({
        value: daysLeft,
        unit: daysLeft === 1 ? "day" : "days",
      });
    }
  };

  // Helper function to calculate elapsed time in the appropriate unit
  const calculateElapsedTime = (
    startDate: Date,
    currentDate: Date,
    unit: string
  ): number => {
    switch (unit) {
      case "day":
        return Math.max(0, differenceInDays(currentDate, startDate)) + 1; // +1 to include today
      case "week":
        return Math.max(0, differenceInWeeks(currentDate, startDate)) + 1; // +1 to include current week
      case "month":
        return Math.max(0, differenceInMonths(currentDate, startDate)) + 1; // +1 to include current month
      default:
        return 1;
    }
  };

  return (
    <Link href={`/dashboard/${habit.slug}`}>
      <Card className="w-full hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{habit.name}</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {habit.frequency_value}/{habit.frequency_unit} • ${stake.amount}{" "}
                at stake
              </p>
              <Progress value={completionPercentage} className="h-2" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <TrendingUp
                  className={`h-4 w-4 ${
                    completionPercentage > 50
                      ? "text-indigo-500"
                      : "text-zinc-500"
                  }`}
                />
                <span
                  className={`text-xs ${
                    completionPercentage > 50
                      ? "text-indigo-500"
                      : "text-zinc-500"
                  }`}
                >
                  {completionPercentage}% Complete
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {timeLeft.value} {timeLeft.unit} left
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
