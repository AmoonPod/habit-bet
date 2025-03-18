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
  const calculateCompletionPercentage = (habit: Tables<"habits">) => {
    if (!habit.frequency_value || !habit.duration_value) {
      return 0;
    }

    // Count successful check-ins
    const successfulCheckins = checkins.filter(
      (checkin) =>
        checkin.habit_uuid === habit.uuid && checkin.status === "true"
    ).length;

    // Calculate total required check-ins for the entire habit duration
    const totalRequiredCheckins = habit.frequency_value * habit.duration_value;

    // Calculate percentage based on total required check-ins for the entire duration
    const percentage = Math.round(
      (successfulCheckins / totalRequiredCheckins) * 100
    );

    // Limit percentage to 100%
    return Math.min(percentage, 100);
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
      <div className="space-y-4">
        {habits.map((habit) => {
          const completionPercentage = calculateCompletionPercentage(habit);
          const timeLeft = calculateTimeLeft(habit);
          const stakeAmount = getStakeAmount(habit);

          return (
            <Link href={`/dashboard/${habit.slug}`} key={habit.uuid}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: habit.color || "#4F46E5" }}
                      />
                      <h3 className="font-medium">{habit.name}</h3>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Frequency</p>
                      <p>
                        {habit.frequency_value}/{habit.frequency_unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Stake</p>
                      <p>${stakeAmount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Time Left</p>
                      <p>
                        {timeLeft.value} {timeLeft.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Verification</p>
                      <Badge variant="outline" className="font-normal">
                        {habit.verification_type === "honor" && "Honor"}
                        {habit.verification_type === "photo" && "Photo"}
                        {habit.verification_type === "text" && "Text"}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center space-x-2">
                      <Progress
                        value={completionPercentage}
                        className="h-2 flex-1"
                      />
                      <span
                        className={`text-xs ${
                          completionPercentage > 50
                            ? "text-indigo-500"
                            : "text-zinc-500"
                        }`}
                      >
                        {completionPercentage}%
                      </span>
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Habit</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Stake</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Time Left</TableHead>
            <TableHead>Verification</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {habits.map((habit) => {
            const completionPercentage = calculateCompletionPercentage(habit);
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
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: habit.color || "#4F46E5" }}
                    />
                    <span>{habit.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {habit.frequency_value}/{habit.frequency_unit}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  ${stakeAmount}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Progress
                      value={completionPercentage}
                      className="h-2 w-16"
                    />
                    <span
                      className={`text-xs ${
                        completionPercentage > 50
                          ? "text-indigo-500"
                          : "text-zinc-500"
                      }`}
                    >
                      {completionPercentage}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {timeLeft.value} {timeLeft.unit}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-normal">
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
