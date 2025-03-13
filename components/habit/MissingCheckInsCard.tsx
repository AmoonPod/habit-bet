"use client";

import React, { useState, useEffect } from "react";
import { Tables } from "@/supabase/models/database.types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  Loader2,
} from "lucide-react";
import {
  format,
  parseISO,
  eachDayOfInterval,
  isBefore,
  isAfter,
  isSameDay,
  differenceInDays,
  addDays,
  startOfDay,
  endOfDay,
  startOfWeek,
} from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { checkInHabit } from "@/app/dashboard/[slug]/actions";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface MissingCheckInsCardProps {
  habit: Tables<"habits">;
  checkins: Tables<"habit_checkins">[];
}

export default function MissingCheckInsCard({
  habit,
  checkins,
}: MissingCheckInsCardProps) {
  const router = useRouter();
  const [missingDays, setMissingDays] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    calculateMissingDays();
  }, [habit, checkins]);

  const calculateMissingDays = () => {
    setIsLoading(true);

    try {
      // Parse start date from habit
      const startDate = habit.start_date
        ? parseISO(habit.start_date as string)
        : new Date(habit.created_at);
      const today = new Date();

      // Get all days from start date to today
      const allDays = eachDayOfInterval({
        start: startDate,
        end: today,
      });

      // Filter out days that already have check-ins
      const daysWithCheckIns = new Set();
      checkins.forEach((checkin) => {
        const checkinDate = new Date(checkin.created_at);
        daysWithCheckIns.add(format(checkinDate, "yyyy-MM-dd"));
      });

      // Find missing days based on frequency
      const missing: Date[] = [];

      if (habit.frequency_unit === "day") {
        // For daily habits, every day without a check-in is missing
        allDays.forEach((day) => {
          const dayStr = format(day, "yyyy-MM-dd");
          if (
            !daysWithCheckIns.has(dayStr) &&
            isBefore(day, today) &&
            !isSameDay(day, today)
          ) {
            missing.push(day);
          }
        });
      } else if (habit.frequency_unit === "week") {
        // For weekly habits, we need to check each week
        const weekMap = new Map<
          string,
          { days: Date[]; checkIns: number; requiredCheckIns: number }
        >();

        // Group days by week
        allDays.forEach((day) => {
          const weekStart = format(
            startOfWeek(day, { weekStartsOn: 1 }),
            "yyyy-MM-dd"
          );
          if (!weekMap.has(weekStart)) {
            weekMap.set(weekStart, {
              days: [],
              checkIns: 0,
              requiredCheckIns: habit.frequency_value || 1,
            });
          }
          weekMap.get(weekStart)!.days.push(day);
        });

        // Count check-ins per week
        checkins.forEach((checkin) => {
          const checkinDate = new Date(checkin.created_at);
          const weekStart = format(
            startOfWeek(checkinDate, { weekStartsOn: 1 }),
            "yyyy-MM-dd"
          );
          if (weekMap.has(weekStart)) {
            weekMap.get(weekStart)!.checkIns++;
          }
        });

        // Find weeks with missing check-ins
        weekMap.forEach(({ days, checkIns, requiredCheckIns }, weekStart) => {
          // Only process complete weeks in the past or the current week
          const isCurrentWeek = days.some((day) => isSameDay(day, today));
          const isCompleteWeek = days.length === 7 || isCurrentWeek;

          if (isCompleteWeek && checkIns < requiredCheckIns) {
            // Calculate how many check-ins are missing
            const missingCount = requiredCheckIns - checkIns;

            // Get days without check-ins
            const daysWithoutCheckins = days.filter((day) => {
              const dayStr = format(day, "yyyy-MM-dd");
              return (
                !daysWithCheckIns.has(dayStr) &&
                isBefore(day, today) &&
                !isSameDay(day, today)
              );
            });

            // Add the missing days (up to the required number)
            daysWithoutCheckins.slice(0, missingCount).forEach((day) => {
              missing.push(day);
            });
          }
        });
      } else if (habit.frequency_unit === "month") {
        // Similar logic for monthly habits
        const monthMap = new Map<
          string,
          { days: Date[]; checkIns: number; requiredCheckIns: number }
        >();

        // Group days by month
        allDays.forEach((day) => {
          const monthStart = format(day, "yyyy-MM");
          if (!monthMap.has(monthStart)) {
            monthMap.set(monthStart, {
              days: [],
              checkIns: 0,
              requiredCheckIns: habit.frequency_value || 1,
            });
          }
          monthMap.get(monthStart)!.days.push(day);
        });

        // Count check-ins per month
        checkins.forEach((checkin) => {
          const checkinDate = new Date(checkin.created_at);
          const monthStart = format(checkinDate, "yyyy-MM");
          if (monthMap.has(monthStart)) {
            monthMap.get(monthStart)!.checkIns++;
          }
        });

        // Find months with missing check-ins
        monthMap.forEach(({ days, checkIns, requiredCheckIns }, monthStart) => {
          // Only process complete months in the past or the current month
          const isCurrentMonth = days.some((day) => isSameDay(day, today));
          const isCompleteMonth = days.length >= 28 || isCurrentMonth;

          if (isCompleteMonth && checkIns < requiredCheckIns) {
            // Calculate how many check-ins are missing
            const missingCount = requiredCheckIns - checkIns;

            // Get days without check-ins
            const daysWithoutCheckins = days.filter((day) => {
              const dayStr = format(day, "yyyy-MM-dd");
              return (
                !daysWithCheckIns.has(dayStr) &&
                isBefore(day, today) &&
                !isSameDay(day, today)
              );
            });

            // Add the missing days (up to the required number)
            daysWithoutCheckins.slice(0, missingCount).forEach((day) => {
              missing.push(day);
            });
          }
        });
      }

      // Sort missing days from oldest to newest
      missing.sort((a, b) => a.getTime() - b.getTime());

      setMissingDays(missing);
      setProgress(
        missing.length > 0 ? (currentIndex / missing.length) * 100 : 100
      );
    } catch (error) {
      console.error("Error calculating missing days:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async (completed: boolean) => {
    if (missingDays.length === 0 || currentIndex >= missingDays.length) return;

    setIsSubmitting(true);

    try {
      const result = await checkInHabit(
        habit.uuid!,
        completed,
        undefined,
        undefined,
        missingDays[currentIndex]
      );

      if (result.success) {
        toast({
          title: "Check-in recorded",
          description: `Your check-in for ${format(
            missingDays[currentIndex],
            "MMMM d"
          )} has been recorded.`,
        });

        // Update the list of missing days by removing the current day
        const updatedMissingDays = [...missingDays];
        updatedMissingDays.splice(currentIndex, 1);
        setMissingDays(updatedMissingDays);

        // If there are no more missing days, close the dialog
        if (updatedMissingDays.length === 0) {
          setTimeout(() => {
            setShowDialog(false);
            router.refresh();
          }, 1500);
        } else {
          // Keep the same index unless we're at the end
          if (currentIndex >= updatedMissingDays.length) {
            setCurrentIndex(updatedMissingDays.length - 1);
          }
          // Update progress
          setProgress(
            updatedMissingDays.length > 0
              ? (currentIndex / updatedMissingDays.length) * 100
              : 100
          );
        }
      } else {
        toast({
          title: "Error",
          description:
            result.message || "Failed to record check-in. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error during check-in:", error);
      toast({
        title: "Error",
        description: "Failed to record check-in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (missingDays.length === 0 || currentIndex >= missingDays.length) return;

    // Remove the current day from the list
    const updatedMissingDays = [...missingDays];
    updatedMissingDays.splice(currentIndex, 1);
    setMissingDays(updatedMissingDays);

    // If there are no more missing days, close the dialog
    if (updatedMissingDays.length === 0) {
      setTimeout(() => {
        setShowDialog(false);
        router.refresh();
      }, 1000);
    } else {
      // Keep the same index unless we're at the end
      if (currentIndex >= updatedMissingDays.length) {
        setCurrentIndex(updatedMissingDays.length - 1);
      }
      // Update progress
      setProgress(
        updatedMissingDays.length > 0
          ? (currentIndex / updatedMissingDays.length) * 100
          : 100
      );
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => {
        const newIndex = prev - 1;
        setProgress(
          missingDays.length > 0 ? (newIndex / missingDays.length) * 100 : 100
        );
        return newIndex;
      });
    }
  };

  // Don't show the card if there are no missing days
  if (missingDays.length === 0 && !isLoading) {
    return null;
  }

  return (
    <>
      <Card className="mb-8 border">
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-indigo-500" />
                <h3 className="text-lg font-semibold">
                  {isLoading
                    ? "Checking missing days..."
                    : `${missingDays.length} missing check-ins found`}
                </h3>
              </div>
              <Badge variant="outline">Fill History</Badge>
            </div>

            <p className="text-sm text-muted-foreground">
              {isLoading
                ? "We're analyzing your habit history..."
                : `We found ${missingDays.length} days where you didn't record your habit progress. Would you like to fill in this missing data?`}
            </p>

            {!isLoading && (
              <Button variant="default" onClick={() => setShowDialog(true)}>
                Fill Missing Check-ins
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentIndex < missingDays.length
                ? `Record check-in for ${format(
                    missingDays[currentIndex],
                    "MMMM d, yyyy"
                  )}`
                : "All done!"}
            </DialogTitle>
            <DialogDescription>
              {currentIndex < missingDays.length
                ? `Did you complete your habit "${habit.name}" on this day?`
                : "You've filled in all your missing check-ins."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Progress value={progress} className="h-2 mb-4" />
            <p className="text-sm text-muted-foreground text-center mb-4">
              {currentIndex < missingDays.length
                ? `${currentIndex + 1} of ${missingDays.length}`
                : "Complete!"}
            </p>

            {currentIndex < missingDays.length ? (
              <div className="space-y-6">
                {/* Calendar date display */}
                <div className="flex justify-center">
                  <div className="bg-card border rounded-lg overflow-hidden w-32 text-center">
                    <div className="bg-indigo-100 py-1">
                      <p className="text-xs font-medium text-indigo-700">
                        {format(missingDays[currentIndex], "MMMM")}
                      </p>
                    </div>
                    <div className="py-3">
                      <p className="text-3xl font-bold">
                        {format(missingDays[currentIndex], "d")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(missingDays[currentIndex], "EEEE")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Navigation buttons */}
                <div className="flex justify-between items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0 || isSubmitting}
                    className="h-8 px-2"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm font-medium">
                    {format(missingDays[currentIndex], "MMM d")}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    disabled={isSubmitting}
                    className="h-8 px-2"
                  >
                    Skip
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Button
                    variant="default"
                    onClick={() => handleCheckIn(true)}
                    disabled={isSubmitting}
                    className="h-16 flex flex-col items-center justify-center"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 mb-1 animate-spin" />
                    ) : (
                      <Check className="h-5 w-5 mb-1" />
                    )}
                    <span>Yes, I did it</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleCheckIn(false)}
                    disabled={isSubmitting}
                    className="h-16 flex flex-col items-center justify-center"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 mb-1 animate-spin" />
                    ) : (
                      <X className="h-5 w-5 mb-1" />
                    )}
                    <span>No, I missed it</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <div className="rounded-full bg-indigo-100 p-3">
                  <Check className="h-6 w-6 text-indigo-600" />
                </div>
                <p className="text-center">
                  You've successfully filled in all your missing check-ins!
                </p>
                <Button onClick={() => setShowDialog(false)}>Close</Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
