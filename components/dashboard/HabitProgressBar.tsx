"use client";

import { Tables } from "@/supabase/models/database.types";
import { Progress } from "@/components/ui/progress";
import { CheckCircle } from "lucide-react";
import { calculateHabitProgress } from "@/lib/progress-calculation";

interface HabitProgressBarProps {
  habit: Tables<"habits">;
  checkins: Tables<"habit_checkins">[];
  showPercentage?: boolean;
}

export default function HabitProgressBar({
  habit,
  checkins,
  showPercentage = true,
}: HabitProgressBarProps) {
  // Use the centralized calculation function
  const { progressPercentage, isCompleted } = calculateHabitProgress(
    habit,
    checkins
  );

  return (
    <div className="flex flex-col space-y-1 w-full max-w-[180px]">
      <div className="flex items-center gap-2 w-full">
        <div className="flex-grow min-w-0 max-w-[100px]">
          <Progress
            value={progressPercentage}
            className={`h-2 ${isCompleted ? "bg-muted/50" : ""}`}
          />
        </div>
        {showPercentage && (
          <span className="text-xs font-medium whitespace-nowrap flex-shrink-0 w-10 text-right">
            {progressPercentage}%
          </span>
        )}
      </div>
      {isCompleted && (
        <div className="flex items-center gap-1 text-xs text-green-600">
          <CheckCircle className="h-3 w-3 flex-shrink-0" />
          <span className="whitespace-nowrap">Completed</span>
        </div>
      )}
    </div>
  );
}
