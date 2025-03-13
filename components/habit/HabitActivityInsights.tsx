"use client";

import React, { useMemo, useState } from "react";
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
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  isSameWeek,
  startOfYear,
  endOfYear,
  eachWeekOfInterval,
  eachMonthOfInterval,
  isSameMonth,
  getWeek,
  getMonth,
  getYear,
  addYears,
  subYears,
} from "date-fns";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  BarChart3,
  CalendarDays,
  CalendarRange,
  CheckCircle,
  XCircle,
  CircleSlash,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { Badge } from "@/components/ui/badge";

interface HabitActivityInsightsProps {
  habit: Tables<"habits">;
  checkins: Tables<"habit_checkins">[];
}

export default function HabitActivityInsights({
  habit,
  checkins,
}: HabitActivityInsightsProps) {
  const [currentPeriod, setCurrentPeriod] = useState(new Date());

  // Determine the appropriate view based on habit frequency
  const frequencyUnit = habit.frequency_unit || "day";

  // Daily Habit - Calendar Heatmap
  const DailyCalendarView = () => {
    // Prepare data for the heatmap
    const { days, monthStart, monthEnd } = useMemo(() => {
      const monthStart = startOfMonth(currentPeriod);
      const monthEnd = endOfMonth(currentPeriod);

      // Get all days in the month
      const daysInMonth = eachDayOfInterval({
        start: monthStart,
        end: monthEnd,
      });

      // Map days with check-ins
      const days = daysInMonth.map((day) => {
        // Find check-ins for this day
        const dayCheckins = checkins.filter((checkin) => {
          const checkinDate = new Date(checkin.created_at);
          return isSameDay(checkinDate, day);
        });

        // Count successful and failed check-ins
        const successful = dayCheckins.filter(
          (c) => c.status === "true"
        ).length;
        const failed = dayCheckins.filter((c) => c.status === "false").length;

        // Calculate color intensity based on number of check-ins
        let intensity = 0;
        if (successful > 0 && failed === 0) {
          intensity = Math.min(1, successful * 0.25);
        } else if (failed > 0 && successful === 0) {
          intensity = Math.min(1, failed * 0.25);
        } else if (successful > 0 && failed > 0) {
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
    }, [checkins, currentPeriod]);

    // Functions to navigate between months
    const goToPreviousMonth = () => {
      setCurrentPeriod((prev) => subMonths(prev, 1));
    };

    const goToNextMonth = () => {
      setCurrentPeriod((prev) => addMonths(prev, 1));
    };

    // Function to get cell color
    const getCellColor = (day: {
      successful: number;
      failed: number;
      intensity: number;
      date: Date;
    }) => {
      if (day.successful > 0 && day.failed === 0) {
        return `rgba(99, 102, 241, ${day.intensity})`;
      } else if (day.failed > 0 && day.successful === 0) {
        return `rgba(161, 161, 170, ${day.intensity})`;
      } else if (day.successful > 0 && day.failed > 0) {
        return `rgba(168, 85, 247, ${day.intensity})`;
      }

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
            <h3 className="text-sm font-medium">Calendar View</h3>
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
              {format(currentPeriod, "MMM yyyy")}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={goToNextMonth}
              disabled={
                isSameDay(endOfMonth(currentPeriod), endOfMonth(new Date())) ||
                endOfMonth(currentPeriod) > new Date()
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
  };

  // Weekly Habit - Week by Week View
  const WeeklyView = () => {
    // Prepare data for the weekly view
    const { weeks, startDate, endDate } = useMemo(() => {
      // Use habit start date if available, otherwise use the date of the first check-in
      let startDate;
      if (habit.start_date) {
        startDate = new Date(habit.start_date);
      } else {
        const sortedCheckins = [...checkins].sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        startDate =
          sortedCheckins.length > 0
            ? new Date(sortedCheckins[0].created_at)
            : subWeeks(new Date(), 4); // Default to 4 weeks ago if no data
      }

      // Use habit end date if available, otherwise use current date or date of last check-in
      let endDate;
      if (habit.end_date) {
        endDate = new Date(habit.end_date);
        // If end date is in the future, use current date instead
        if (endDate > new Date()) {
          endDate = new Date();
        }
      } else {
        endDate = new Date();
      }

      // Adjust startDate to the beginning of the week
      startDate = startOfWeek(startDate, { weekStartsOn: 1 });

      // Generate all weeks between start and end date
      const weeksArray = [];
      let currentWeekStart = startDate;
      let weekNumber = 1;

      while (currentWeekStart <= endDate) {
        const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

        // Find check-ins for this week
        const weekCheckins = checkins.filter((checkin) => {
          const checkinDate = new Date(checkin.created_at);
          return checkinDate >= currentWeekStart && checkinDate <= weekEnd;
        });

        // Count successful and failed check-ins
        const successful = weekCheckins.filter(
          (c) => c.status === "true"
        ).length;
        const failed = weekCheckins.filter((c) => c.status === "false").length;

        // Calculate completion status
        let status = "none";
        if (successful >= (habit.frequency_value || 1)) {
          status = "complete";
        } else if (successful > 0) {
          status = "partial";
        } else if (failed > 0) {
          status = "failed";
        }

        weeksArray.push({
          weekStart: currentWeekStart,
          weekEnd: weekEnd,
          weekNumber: weekNumber,
          successful,
          failed,
          status,
          total: successful + failed,
          isCurrentWeek: isSameWeek(new Date(), currentWeekStart, {
            weekStartsOn: 1,
          }),
          isPastWeek: weekEnd < new Date(),
        });

        // Move to next week
        currentWeekStart = addWeeks(currentWeekStart, 1);
        weekNumber++;
      }

      return { weeks: weeksArray, startDate, endDate };
    }, [checkins, habit.start_date, habit.end_date, habit.frequency_value]);

    // Functions to navigate between periods
    const [visibleWeeks, setVisibleWeeks] = useState<number>(8); // Show 8 weeks at a time
    const [startIndex, setStartIndex] = useState<number>(0);

    const goToPreviousPeriod = () => {
      setStartIndex(Math.max(0, startIndex - visibleWeeks));
    };

    const goToNextPeriod = () => {
      setStartIndex(
        Math.min(weeks.length - visibleWeeks, startIndex + visibleWeeks)
      );
    };

    // Get visible weeks
    const displayedWeeks = weeks.slice(startIndex, startIndex + visibleWeeks);

    // Function to get status icon
    const getStatusIcon = (status: string) => {
      switch (status) {
        case "complete":
          return <CheckCircle className="h-5 w-5 text-indigo-500" />;
        case "partial":
          return <CheckCircle className="h-5 w-5 text-purple-500" />;
        case "failed":
          return <XCircle className="h-5 w-5 text-zinc-500" />;
        default:
          return <CircleSlash className="h-5 w-5 text-muted-foreground" />;
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CalendarRange className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Week by Week Progress</h3>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={goToPreviousPeriod}
              disabled={startIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              Weeks {startIndex + 1}-
              {Math.min(startIndex + visibleWeeks, weeks.length)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={goToNextPeriod}
              disabled={startIndex + visibleWeeks >= weeks.length}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {displayedWeeks.map((week, i) => (
            <TooltipProvider key={i}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "flex items-center p-2 rounded-md border",
                      week.isCurrentWeek && "bg-indigo-50 border-indigo-200",
                      !week.isPastWeek && !week.isCurrentWeek && "opacity-50"
                    )}
                  >
                    <div className="mr-3">{getStatusIcon(week.status)}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          Week {week.weekNumber}
                        </span>
                        {week.status === "complete" && (
                          <Badge
                            variant="outline"
                            className="bg-indigo-50 text-indigo-700"
                          >
                            Complete
                          </Badge>
                        )}
                        {week.status === "partial" && (
                          <Badge
                            variant="outline"
                            className="bg-purple-50 text-purple-700"
                          >
                            Partial
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(week.weekStart, "MMM d")} -{" "}
                        {format(week.weekEnd, "MMM d")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {week.successful}/{habit.frequency_value || 1}
                      </p>
                      <p className="text-xs text-muted-foreground">check-ins</p>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  <div className="font-medium">
                    Week {week.weekNumber}: {format(week.weekStart, "MMM d")} -{" "}
                    {format(week.weekEnd, "MMM d")}
                  </div>
                  <p className="text-indigo-500">
                    Successful check-ins: {week.successful}
                  </p>
                  <p className="text-zinc-500">
                    Failed check-ins: {week.failed}
                  </p>
                  <p className="mt-1">
                    {week.status === "complete"
                      ? "✅ Goal achieved!"
                      : week.status === "partial"
                      ? "⚠️ Partially completed"
                      : week.status === "failed"
                      ? "❌ Not completed"
                      : "⚪ No activity"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        <div className="flex items-center justify-end space-x-3 mt-2">
          <div className="flex items-center space-x-1">
            <CheckCircle className="h-4 w-4 text-indigo-500" />
            <span className="text-xs text-muted-foreground">Complete</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="h-4 w-4 text-purple-500" />
            <span className="text-xs text-muted-foreground">Partial</span>
          </div>
          <div className="flex items-center space-x-1">
            <XCircle className="h-4 w-4 text-zinc-500" />
            <span className="text-xs text-muted-foreground">Failed</span>
          </div>
        </div>
      </div>
    );
  };

  // Monthly Habit - Month by Month View
  const MonthlyView = () => {
    // Prepare data for the monthly view
    const { months, startDate, endDate } = useMemo(() => {
      // Use habit start date if available, otherwise use the date of the first check-in
      let startDate;
      if (habit.start_date) {
        startDate = new Date(habit.start_date);
      } else {
        const sortedCheckins = [...checkins].sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        startDate =
          sortedCheckins.length > 0
            ? new Date(sortedCheckins[0].created_at)
            : subMonths(new Date(), 3); // Default to 3 months ago if no data
      }

      // Use habit end date if available, otherwise use current date or date of last check-in
      let endDate;
      if (habit.end_date) {
        endDate = new Date(habit.end_date);
        // If end date is in the future, use current date instead
        if (endDate > new Date()) {
          endDate = new Date();
        }
      } else {
        endDate = new Date();
      }

      // Adjust startDate to the beginning of the month
      startDate = startOfMonth(startDate);

      // Generate all months between start and end date
      const monthsArray = [];
      let currentMonthStart = startDate;
      let monthNumber = 1;

      while (currentMonthStart <= endDate) {
        const monthEnd = endOfMonth(currentMonthStart);

        // Find check-ins for this month
        const monthCheckins = checkins.filter((checkin) => {
          const checkinDate = new Date(checkin.created_at);
          return isSameMonth(checkinDate, currentMonthStart);
        });

        // Count successful and failed check-ins
        const successful = monthCheckins.filter(
          (c) => c.status === "true"
        ).length;
        const failed = monthCheckins.filter((c) => c.status === "false").length;

        // Calculate completion status
        let status = "none";
        if (successful >= (habit.frequency_value || 1)) {
          status = "complete";
        } else if (successful > 0) {
          status = "partial";
        } else if (failed > 0) {
          status = "failed";
        }

        // Calculate progress percentage
        const progressPercentage = Math.min(
          100,
          Math.round((successful / (habit.frequency_value || 1)) * 100)
        );

        monthsArray.push({
          monthStart: currentMonthStart,
          monthEnd: monthEnd,
          monthName: format(currentMonthStart, "MMMM"),
          monthShort: format(currentMonthStart, "MMM"),
          monthNumber: monthNumber,
          successful,
          failed,
          status,
          total: successful + failed,
          isCurrentMonth: isSameMonth(new Date(), currentMonthStart),
          isPastMonth: monthEnd < new Date(),
          progressPercentage,
        });

        // Move to next month
        currentMonthStart = addMonths(currentMonthStart, 1);
        monthNumber++;
      }

      return { months: monthsArray, startDate, endDate };
    }, [checkins, habit.start_date, habit.end_date, habit.frequency_value]);

    // Functions to navigate between periods
    const [visibleMonths, setVisibleMonths] = useState<number>(6); // Show 6 months at a time
    const [startIndex, setStartIndex] = useState<number>(0);

    const goToPreviousPeriod = () => {
      setStartIndex(Math.max(0, startIndex - visibleMonths));
    };

    const goToNextPeriod = () => {
      setStartIndex(
        Math.min(months.length - visibleMonths, startIndex + visibleMonths)
      );
    };

    // Get visible months
    const displayedMonths = months.slice(
      startIndex,
      startIndex + visibleMonths
    );

    // Chart data for monthly performance
    const chartData = displayedMonths.map((month) => ({
      name: `${month.monthShort} (${month.monthNumber})`,
      successful: month.successful,
      failed: month.failed,
      required: habit.frequency_value || 1,
    }));

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Month by Month Progress</h3>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={goToPreviousPeriod}
              disabled={startIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              Months {startIndex + 1}-
              {Math.min(startIndex + visibleMonths, months.length)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={goToNextPeriod}
              disabled={startIndex + visibleMonths >= months.length}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Monthly Performance Chart */}
        <div className="h-[200px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <RechartsTooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-2 border rounded shadow-sm">
                        <p className="font-medium">{data.name}</p>
                        <p className="text-indigo-500">
                          Successful: {data.successful}
                        </p>
                        <p className="text-zinc-500">Failed: {data.failed}</p>
                        <p className="text-muted-foreground mt-1">
                          Required: {data.required} check-ins
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="successful" fill="#6366F1" name="Successful" />
              <Bar dataKey="failed" fill="#A1A1AA" name="Failed" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4">
          {displayedMonths.map((month, i) => (
            <TooltipProvider key={i}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "p-3 rounded-md border",
                      month.isCurrentMonth && "bg-indigo-50 border-indigo-200",
                      !month.isPastMonth &&
                        !month.isCurrentMonth &&
                        "opacity-50"
                    )}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">
                        Month {month.monthNumber}: {month.monthName}
                      </span>
                      {month.status === "complete" && (
                        <CheckCircle className="h-4 w-4 text-indigo-500" />
                      )}
                      {month.status === "partial" && (
                        <CheckCircle className="h-4 w-4 text-purple-500" />
                      )}
                      {month.status === "failed" && (
                        <XCircle className="h-4 w-4 text-zinc-500" />
                      )}
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress:</span>
                      <span className="font-medium">
                        {month.successful}/{habit.frequency_value || 1}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div
                        className={cn(
                          "h-1.5 rounded-full",
                          month.status === "complete"
                            ? "bg-indigo-500"
                            : month.status === "partial"
                            ? "bg-purple-500"
                            : "bg-zinc-500"
                        )}
                        style={{ width: `${month.progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <div className="font-medium">
                    Month {month.monthNumber}: {month.monthName}{" "}
                    {format(month.monthStart, "yyyy")}
                  </div>
                  <p className="text-indigo-500">
                    Successful check-ins: {month.successful}
                  </p>
                  <p className="text-zinc-500">
                    Failed check-ins: {month.failed}
                  </p>
                  <p className="mt-1">
                    {month.status === "complete"
                      ? "✅ Goal achieved!"
                      : month.status === "partial"
                      ? "⚠️ Partially completed"
                      : month.status === "failed"
                      ? "❌ Not completed"
                      : "⚪ No activity"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>
    );
  };

  // Render the appropriate view based on habit frequency
  const renderFrequencyView = () => {
    switch (frequencyUnit) {
      case "day":
        return <DailyCalendarView />;
      case "week":
        return <WeeklyView />;
      case "month":
        return <MonthlyView />;
      default:
        return <DailyCalendarView />;
    }
  };

  // Get the title based on frequency
  const getInsightTitle = () => {
    switch (frequencyUnit) {
      case "day":
        return "Daily Activity";
      case "week":
        return "Weekly Progress";
      case "month":
        return "Monthly Progress";
      default:
        return "Activity Insights";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{getInsightTitle()}</CardTitle>
      </CardHeader>
      <CardContent>{renderFrequencyView()}</CardContent>
    </Card>
  );
}
