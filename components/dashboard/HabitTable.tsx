"use client";

import { Tables } from "@/supabase/models/database.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  addDays,
  addWeeks,
  addMonths,
  parseISO,
} from "date-fns";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Card, CardContent } from "@/components/ui/card";

interface HabitTableProps {
  habits: Tables<"habits">[];
  stakes: Tables<"habit_stakes">[];
  checkins: Tables<"habit_checkins">[];
}

export default function HabitTable({
  habits,
  stakes,
  checkins = [],
}: HabitTableProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Function to calculate completion percentage of a habit
  const calculateCompletionPercentage = (
    habit: Tables<"habits">,
    checkins: Tables<"habit_checkins">[]
  ) => {
    if (!habit.frequency_value || !habit.duration_value) {
      return 0;
    }

    // Get required values from habit
    const frequencyUnit = habit.frequency_unit || "day";
    const frequencyValue = habit.frequency_value || 1;
    const durationValue = habit.duration_value || 1;
    const startDate = habit.start_date
      ? parseISO(habit.start_date)
      : new Date(habit.created_at);

    // Count successful check-ins
    const successfulCheckins = checkins.filter(
      (checkin) =>
        checkin.habit_uuid === habit.uuid && checkin.status === "true"
    ).length;

    // Calculate total required check-ins based on frequency and duration
    let totalRequiredCheckins = 0;
    if (frequencyUnit === "day") {
      // For daily habits, calculate based on total days in duration
      const totalDays =
        durationValue *
        (habit.duration_unit === "day"
          ? 1
          : habit.duration_unit === "week"
          ? 7
          : 30);
      totalRequiredCheckins = frequencyValue * totalDays;
    } else if (frequencyUnit === "week") {
      // For weekly habits, calculate based on total weeks in duration
      const totalWeeks =
        durationValue *
        (habit.duration_unit === "day"
          ? 1 / 7
          : habit.duration_unit === "week"
          ? 1
          : 4.33);
      totalRequiredCheckins = frequencyValue * Math.ceil(totalWeeks);
    } else if (frequencyUnit === "month") {
      // For monthly habits, calculate based on total months in duration
      const totalMonths =
        durationValue *
        (habit.duration_unit === "day"
          ? 1 / 30
          : habit.duration_unit === "week"
          ? 1 / 4.33
          : 1);
      totalRequiredCheckins = frequencyValue * Math.ceil(totalMonths);
    }

    // Calculate the progress percentage based on completed vs total required
    const percentage = Math.min(
      Math.round(
        (successfulCheckins / Math.max(totalRequiredCheckins, 1)) * 100
      ),
      100
    );

    return percentage;
  };

  // Function to calculate time left for a habit
  const calculateTimeLeft = (habit: Tables<"habits">) => {
    if (!habit.duration_unit || !habit.duration_value) {
      return { value: 0, unit: "days" };
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
    if (habit.frequency_unit === "day") {
      // If frequency is daily, show days left
      const daysLeft = Math.max(0, differenceInDays(endDate, now));
      return {
        value: daysLeft,
        unit: daysLeft === 1 ? "day" : "days",
      };
    } else if (habit.frequency_unit === "week") {
      // If frequency is weekly, show weeks left
      const weeksLeft = Math.max(0, differenceInWeeks(endDate, now));
      return {
        value: weeksLeft,
        unit: weeksLeft === 1 ? "week" : "weeks",
      };
    } else if (habit.frequency_unit === "month") {
      // If frequency is monthly, show months left
      const monthsLeft = Math.max(0, differenceInMonths(endDate, now));
      return {
        value: monthsLeft,
        unit: monthsLeft === 1 ? "month" : "months",
      };
    } else {
      // Fallback to days if frequency is not specified
      const daysLeft = Math.max(0, differenceInDays(endDate, now));
      return {
        value: daysLeft,
        unit: daysLeft === 1 ? "day" : "days",
      };
    }
  };

  // Function to get stake amount for a habit
  const getStakeAmount = (habit: Tables<"habits">) => {
    const stake = stakes.find((s) => s.uuid === habit.stake_uuid);
    return stake?.amount || 0;
  };

  // Mobile view - cards instead of table
  if (isMobile) {
    return (
      <div className="space-y-3">
        {habits.map((habit) => {
          const completionPercentage = calculateCompletionPercentage(
            habit,
            checkins
          );
          const timeLeft = calculateTimeLeft(habit);
          const stakeAmount = getStakeAmount(habit);

          return (
            <Link href={`/dashboard/${habit.slug}`} key={habit.uuid} prefetch>
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
                style={{ borderLeftColor: habit.color || "#4F46E5" }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1 mr-2">
                      <h3 className="font-medium text-base line-clamp-1">
                        {habit.name}
                      </h3>
                    </div>
                    <div className="flex items-center flex-shrink-0">
                      <Badge
                        variant="outline"
                        className="text-xs font-normal mr-2 whitespace-nowrap"
                      >
                        {habit.verification_type === "honor" && "Honor"}
                        {habit.verification_type === "photo" && "Photo"}
                        {habit.verification_type === "text" && "Text"}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-grow">
                        <Progress
                          value={completionPercentage}
                          className="h-2"
                        />
                      </div>
                      <span
                        className={`text-xs font-medium whitespace-nowrap flex-shrink-0 ${
                          completionPercentage > 50
                            ? "text-indigo-500"
                            : "text-muted-foreground"
                        }`}
                      >
                        {completionPercentage}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-5 h-5 mr-2 flex items-center justify-center text-muted-foreground flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-repeat"
                        >
                          <path d="m17 2 4 4-4 4" />
                          <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                          <path d="m7 22-4-4 4-4" />
                          <path d="M21 13v1a4 4 0 0 1-4 4H3" />
                        </svg>
                      </div>
                      <div className="truncate">
                        <span className="font-medium">
                          {habit.frequency_value}/{habit.frequency_unit}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-5 h-5 mr-2 flex items-center justify-center text-muted-foreground flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-dollar-sign"
                        >
                          <line x1="12" x2="12" y1="2" y2="22" />
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                      </div>
                      <div className="truncate">
                        <span className="font-medium">${stakeAmount}</span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-5 h-5 mr-2 flex items-center justify-center text-muted-foreground flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-clock"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      </div>
                      <div className="truncate">
                        <span className="font-medium">
                          {timeLeft.value} {timeLeft.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    );
  }

  // Desktop view - table
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[150px]">Habit</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Stake</TableHead>
            <TableHead className="min-w-[140px]">Progress</TableHead>
            <TableHead>Time Left</TableHead>
            <TableHead className="min-w-[100px]">Verification</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {habits.map((habit) => {
            const completionPercentage = calculateCompletionPercentage(
              habit,
              checkins
            );
            const timeLeft = calculateTimeLeft(habit);
            const stakeAmount = getStakeAmount(habit);

            return (
              <TableRow
                key={habit.uuid}
                className="cursor-pointer hover:bg-muted/50 group"
                onClick={() =>
                  (window.location.href = `/dashboard/${habit.slug}`)
                }
              >
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: habit.color || "#4F46E5" }}
                    />
                    <span className="truncate">{habit.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {habit.frequency_value}/{habit.frequency_unit}
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  ${stakeAmount}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 w-full pr-4">
                    <div className="w-20 max-w-20 flex-shrink-0">
                      <Progress value={completionPercentage} className="h-2" />
                    </div>
                    <span
                      className={`text-xs whitespace-nowrap flex-shrink-0 ${
                        completionPercentage > 50
                          ? "text-indigo-500"
                          : "text-zinc-500"
                      }`}
                    >
                      {completionPercentage}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {timeLeft.value} {timeLeft.unit}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <Badge
                    variant="outline"
                    className="font-normal whitespace-nowrap"
                  >
                    {habit.verification_type === "honor" && "Honor"}
                    {habit.verification_type === "photo" && "Photo"}
                    {habit.verification_type === "text" && "Text"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
