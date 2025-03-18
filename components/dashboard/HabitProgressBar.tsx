"use client";

import { Tables } from "@/supabase/models/database.types";
import { Progress } from "@/components/ui/progress";
import { CheckCircle } from "lucide-react";

interface HabitProgressBarProps {
  habit: Tables<"habits">;
  checkins: Tables<"habit_checkins">[];
}

export default function HabitProgressBar({
  habit,
  checkins,
}: HabitProgressBarProps) {
  // Calculate total required check-ins for the entire habit
  // Frequency value represents how many times per frequency unit (day/week/month)
  // Duration value represents how many frequency units the habit lasts for
  const totalRequiredCheckins =
    (habit.frequency_value || 1) * (habit.duration_value || 1);

  // Count successful check-ins
  const successfulCheckins = checkins.filter((c) => c.status === "true").length;

  // Calculate simple overall completion percentage
  const progressPercentage = Math.min(
    Math.round((successfulCheckins / Math.max(totalRequiredCheckins, 1)) * 100),
    100
  );

  // Determine if habit is completed
  const isCompleted = successfulCheckins >= totalRequiredCheckins;

  return (
    <div className="flex flex-col space-y-1">
      <div className="flex items-center gap-2">
        <Progress
          value={progressPercentage}
          className={`h-2 ${isCompleted ? "bg-muted/50" : ""}`}
        />
        <span className="text-xs font-medium">{progressPercentage}%</span>
      </div>
      {isCompleted && (
        <div className="flex items-center gap-1 text-xs text-green-600">
          <CheckCircle className="h-3 w-3" />
          Completed
        </div>
      )}
    </div>
  );
}
