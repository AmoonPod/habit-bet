"use client";

import React, { useState, useEffect } from "react";
import { Tables } from "@/supabase/models/database.types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import {
  format,
  isToday,
  addDays,
  addMonths,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
} from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { checkInHabit } from "@/app/dashboard/[slug]/actions";
import { toast } from "../ui/use-toast";

interface CheckInSectionProps {
  habit: Tables<"habits">;
  stakeAmount: number;
}

const CheckInSection: React.FC<CheckInSectionProps> = ({
  habit,
  stakeAmount,
}) => {
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [isCheckInAvailable, setIsCheckInAvailable] = useState(false);
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  useEffect(() => {
    // Calculate the next check-in date based on the habit's frequency
    const calculateNextCheckIn = () => {
      const today = new Date();
      let nextCheckIn: Date;

      if (habit.frequency_unit === "day") {
        nextCheckIn = today; // Check in today
      } else if (habit.frequency_unit === "week") {
        // Assuming the week starts on Monday
        const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
        const currentWeekEnd = endOfWeek(today, { weekStartsOn: 1 });

        if (
          isWithinInterval(today, {
            start: currentWeekStart,
            end: currentWeekEnd,
          })
        ) {
          nextCheckIn = currentWeekStart; // Check in this week
        } else {
          const daysUntilNextCheckIn = (7 - today.getDay() + 1) % 7;
          nextCheckIn = addDays(today, daysUntilNextCheckIn);
        }
      } else {
        // Monthly
        const firstDayOfMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          1
        );
        const lastDayOfMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0
        );

        if (
          isWithinInterval(today, {
            start: firstDayOfMonth,
            end: lastDayOfMonth,
          })
        ) {
          nextCheckIn = firstDayOfMonth; // Check in this month
        } else {
          nextCheckIn = addMonths(firstDayOfMonth, 1);
        }
      }

      setCheckInDate(nextCheckIn);
      setIsCheckInAvailable(
        isToday(nextCheckIn) ||
          (habit.frequency_unit === "week" &&
            isWithinInterval(today, {
              start: startOfWeek(nextCheckIn, { weekStartsOn: 1 }),
              end: endOfWeek(nextCheckIn, { weekStartsOn: 1 }),
            }))
      );
    };

    calculateNextCheckIn();
  }, [habit]);

  const getNextCheckInMessage = () => {
    if (!checkInDate) return "";

    return `Your next check-in is on ${format(checkInDate, "MMMM d")}`;
  };

  const handleConfirmCheckIn = async (completed: boolean) => {
    setIsCheckInDialogOpen(false); // Close the check-in dialog
    try {
      await checkInHabit(habit.uuid!, completed);
      setShowSuccessDialog(true); // Show the success dialog
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check in. Please try again.",
        variant: "destructive",
      });
    }
  };
  const getCheckInQuestion = () => {
    if (habit.frequency_unit === "day") {
      return `Did you complete your habit today, ${format(
        new Date(),
        "MMMM d"
      )}?`;
    } else if (habit.frequency_unit === "week") {
      // Assuming the week starts on Monday
      const startOfWeekDate = startOfWeek(new Date(), { weekStartsOn: 1 });
      const endOfWeekDate = endOfWeek(new Date(), { weekStartsOn: 1 });
      return `Did you complete your habit at least ${
        habit.frequency_value
      } times this week (starting ${format(
        startOfWeekDate,
        "MMMM d"
      )}, ending ${format(endOfWeekDate, "MMMM d")})?`;
    } else {
      const firstDayOfMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      );
      return `Did you complete your habit at least ${
        habit.frequency_value
      } times this month (${format(firstDayOfMonth, "MMMM")})?`;
    }
  };

  return (
    <Card className="mb-8 relative overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4">
          <div className="space-y-1">
            <h3 className="text-2xl font-semibold">Ready for {habit.name}?</h3>
            <p className="text-muted-foreground">${stakeAmount} at stake</p>
            {checkInDate && (
              <p className="text-sm text-muted-foreground">
                {isCheckInAvailable
                  ? "It's time to check in!"
                  : `Check-in available on ${format(checkInDate, "MMMM d")}`}
              </p>
            )}
          </div>

          <Dialog
            open={isCheckInDialogOpen}
            onOpenChange={setIsCheckInDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                disabled={!isCheckInAvailable}
              >
                <Check className="mr-2 h-5 w-5" />
                Check In
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Check In</DialogTitle>
                <DialogDescription>{getCheckInQuestion()}</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant={"default"}
                  onClick={() => handleConfirmCheckIn(true)}
                >
                  Yes
                </Button>
                <Button
                  variant={"secondary"}
                  onClick={() => handleConfirmCheckIn(false)}
                >
                  No
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check-in Successful!</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <div className="flex flex-col items-center justify-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg">Great job! Keep up the momentum.</p>
              <p className="text-sm text-muted-foreground mt-2">
                {getNextCheckInMessage()}
              </p>
            </div>
          </DialogDescription>
          <DialogFooter>
            <Button onClick={() => setShowSuccessDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CheckInSection;
