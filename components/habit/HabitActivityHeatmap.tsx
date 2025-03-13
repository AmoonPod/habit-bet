"use client";

import React, { useMemo } from "react";
import { Tables } from "@/supabase/models/database.types";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  isToday,
  isWeekend,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface HabitActivityHeatmapProps {
  checkins: Tables<"habit_checkins">[];
}

export default function HabitActivityHeatmap({
  checkins,
}: HabitActivityHeatmapProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Prepare data for the heatmap
  const { days, monthStart, monthEnd } = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    // Get all days in the month
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Map days with check-ins
    const days = daysInMonth.map((day) => {
      // Find check-ins for this day
      const dayCheckins = checkins.filter((checkin) => {
        const checkinDate = new Date(checkin.created_at);
        return isSameDay(checkinDate, day);
      });

      // Count successful and failed check-ins
      const successful = dayCheckins.filter((c) => c.status === "true").length;
      const failed = dayCheckins.filter((c) => c.status === "false").length;

      // Calculate color intensity based on number of check-ins
      let intensity = 0;
      if (successful > 0 && failed === 0) {
        // Only successful check-ins: green
        intensity = Math.min(1, successful * 0.25);
      } else if (failed > 0 && successful === 0) {
        // Only failed check-ins: red
        intensity = Math.min(1, failed * 0.25);
      } else if (successful > 0 && failed > 0) {
        // Mix of check-ins: orange
        intensity = Math.min(1, (successful + failed) * 0.2);
      }

      return {
        date: day,
        successful,
        failed,
        intensity,
        total: successful + failed,
      };
    });

    return { days, monthStart, monthEnd };
  }, [checkins, currentMonth]);

  // Functions to navigate between months
  const goToPreviousMonth = () => {
    setCurrentMonth((prevMonth) => subMonths(prevMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth((prevMonth) => addMonths(prevMonth, 1));
  };

  // Function to get cell color
  const getCellColor = (day: {
    successful: number;
    failed: number;
    intensity: number;
    date: Date;
  }) => {
    if (day.successful > 0 && day.failed === 0) {
      // Successful check-ins: primary color with opacity
      return `rgba(99, 102, 241, ${day.intensity})`;
    } else if (day.failed > 0 && day.successful === 0) {
      // Failed check-ins: muted color with opacity
      return `rgba(161, 161, 170, ${day.intensity})`;
    } else if (day.successful > 0 && day.failed > 0) {
      // Mix of check-ins: secondary color with opacity
      return `rgba(168, 85, 247, ${day.intensity})`;
    }

    // Light gray for weekends, darker gray for weekdays
    return isWeekend(day.date)
      ? "rgba(243, 244, 246, 0.5)"
      : "rgba(229, 231, 235, 0.2)";
  };

  // Get weekday names (shorter version)
  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];

  // Calculate offset to start from the correct weekday
  const firstDayOfMonth = getDay(monthStart);
  const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Adjust to start from Monday

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Activity</h3>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={goToPreviousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {format(currentMonth, "MMM yyyy")}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={goToNextMonth}
            disabled={
              isSameDay(endOfMonth(currentMonth), endOfMonth(new Date())) ||
              endOfMonth(currentMonth) > new Date()
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {/* Weekday headers */}
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}

        {/* Empty cells for offset */}
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Day cells */}
        {days.map((day, i) => (
          <TooltipProvider key={i}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="aspect-square relative">
                  <div
                    className={cn(
                      "w-full h-full rounded-sm flex items-center justify-center text-[10px]",
                      isToday(day.date) && "ring-1 ring-primary",
                      day.total > 0 && "font-medium"
                    )}
                    style={{ backgroundColor: getCellColor(day) }}
                  >
                    {format(day.date, "d")}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" align="center" className="text-xs">
                <div className="font-medium">
                  {format(day.date, "EEEE, MMMM d, yyyy")}
                </div>
                {day.total > 0 ? (
                  <>
                    {day.successful > 0 && (
                      <p className="text-indigo-500">
                        Successful check-ins: {day.successful}
                      </p>
                    )}
                    {day.failed > 0 && (
                      <p className="text-zinc-500">
                        Failed check-ins: {day.failed}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">No check-ins</p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      <div className="flex items-center justify-end space-x-2 mt-1">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-sm bg-indigo-500/50"></div>
          <span className="text-xs text-muted-foreground">Success</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-sm bg-zinc-400/50"></div>
          <span className="text-xs text-muted-foreground">Failed</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-sm bg-purple-500/50"></div>
          <span className="text-xs text-muted-foreground">Mixed</span>
        </div>
      </div>
    </div>
  );
}
