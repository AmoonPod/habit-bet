"use client";

import React, { useState, useEffect, useRef } from "react";
import { Tables } from "@/supabase/models/database.types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Check,
  Sparkles,
  Camera,
  FileText,
  Loader2,
  AlertCircle,
  XCircle,
  Clock,
} from "lucide-react";
import {
  format,
  isToday,
  addDays,
  addMonths,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isYesterday,
  subDays,
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface CheckInSectionProps {
  habit: Tables<"habits">;
  stakeAmount: number;
}

const CheckInSection: React.FC<CheckInSectionProps> = ({
  habit,
  stakeAmount,
}) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [isCheckInAvailable, setIsCheckInAvailable] = useState(false);
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showFailureDialog, setShowFailureDialog] = useState(false);
  const [forfeitAmount, setForfeitAmount] = useState<number | null>(null);
  const [forfeitMessage, setForfeitMessage] = useState<string | null>(null);
  const [proofContent, setProofContent] = useState<string>("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSubmittingSuccess, setIsSubmittingSuccess] = useState(false);
  const [isSubmittingFailure, setIsSubmittingFailure] = useState(false);
  const [checkInsRemaining, setCheckInsRemaining] = useState<number | null>(
    null
  );
  const [isLoadingCheckIns, setIsLoadingCheckIns] = useState(true);
  const [missedCheckIn, setMissedCheckIn] = useState<Date | null>(null);
  const [showMissedCheckInDialog, setShowMissedCheckInDialog] = useState(false);
  const [isSubmittingMissed, setIsSubmittingMissed] = useState(false);

  // Get verification type from habit
  const verificationType = habit.verification_type || "honor";

  useEffect(() => {
    // Check how many check-ins the user has already done in the current period
    const checkExistingCheckIns = async () => {
      setIsLoadingCheckIns(true);
      try {
        const supabase = createClient();
        const now = new Date();
        let startDate, endDate;

        if (habit.frequency_unit === "day") {
          startDate = startOfDay(now);
          endDate = endOfDay(now);
        } else if (habit.frequency_unit === "week") {
          startDate = startOfWeek(now, { weekStartsOn: 1 }); // Start week on Monday
          endDate = endOfWeek(now, { weekStartsOn: 1 });
        } else {
          // month
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
        }

        // Get existing check-ins for this period
        const { data: existingCheckins, error } = await supabase
          .from("habit_checkins")
          .select("*")
          .eq("habit_uuid", habit.uuid!)
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString());

        if (error) {
          console.error("Error fetching existing check-ins:", error);
          return;
        }

        const frequencyValue = habit.frequency_value || 1;
        const remaining = Math.max(
          0,
          frequencyValue - (existingCheckins?.length || 0)
        );
        setCheckInsRemaining(remaining);

        // Update check-in availability based on remaining check-ins
        setIsCheckInAvailable((prevState) => prevState && remaining > 0);
      } catch (error) {
        console.error("Error checking existing check-ins:", error);
      } finally {
        setIsLoadingCheckIns(false);
      }
    };

    if (habit.uuid) {
      checkExistingCheckIns();
    }
  }, [habit.uuid, habit.frequency_unit, habit.frequency_value]);

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
            })) ||
          (habit.frequency_unit === "month" &&
            isWithinInterval(today, {
              start: startOfMonth(nextCheckIn),
              end: endOfMonth(nextCheckIn),
            }))
      );
    };

    calculateNextCheckIn();
  }, [habit]);

  useEffect(() => {
    // Check for missed check-ins (for daily habits only)
    const checkMissedCheckIns = async () => {
      if (habit.frequency_unit !== "day") return;

      try {
        const supabase = createClient();
        const yesterday = subDays(new Date(), 1);
        const startOfYesterday = startOfDay(yesterday);
        const endOfYesterday = endOfDay(yesterday);

        // Check if there was a check-in yesterday
        const { data: yesterdayCheckins, error } = await supabase
          .from("habit_checkins")
          .select("*")
          .eq("habit_uuid", habit.uuid!)
          .gte("created_at", startOfYesterday.toISOString())
          .lte("created_at", endOfYesterday.toISOString());

        if (error) {
          console.error("Error checking missed check-ins:", error);
          return;
        }

        // If no check-ins yesterday, set missed check-in
        if (!yesterdayCheckins || yesterdayCheckins.length === 0) {
          setMissedCheckIn(yesterday);
        } else {
          setMissedCheckIn(null);
        }
      } catch (error) {
        console.error("Error checking missed check-ins:", error);
      }
    };

    if (habit.uuid && habit.frequency_unit === "day") {
      checkMissedCheckIns();
    }
  }, [habit.uuid, habit.frequency_unit]);

  const getNextCheckInMessage = () => {
    if (!checkInDate) return "";

    if (checkInsRemaining === 0) {
      if (habit.frequency_unit === "day") {
        return `You've completed all check-ins for today. Next check-in available tomorrow.`;
      } else if (habit.frequency_unit === "week") {
        return `You've completed all check-ins for this week. Next check-in available next week.`;
      } else {
        return `You've completed all check-ins for this month. Next check-in available next month.`;
      }
    }

    return `Your next check-in is on ${format(checkInDate, "MMMM d")}`;
  };

  const handleConfirmCheckIn = async (completed: boolean) => {
    // Set the appropriate loading state based on which button was clicked
    if (completed) {
      setIsSubmittingSuccess(true);
    } else {
      setIsSubmittingFailure(true);
    }

    try {
      // Handle different verification types
      let result;

      if (verificationType === "photo" && completed && photoFile) {
        // For photo verification, pass the file to the server action
        result = await checkInHabit(habit.uuid!, completed, "", photoFile);
      } else if (verificationType === "text" && completed) {
        // For text verification, pass the text content
        result = await checkInHabit(habit.uuid!, completed, proofContent);
      } else {
        // For honor system or failed check-ins
        result = await checkInHabit(habit.uuid!, completed);
      }

      if (result.success) {
        setIsCheckInDialogOpen(false);

        // Handle success or failure dialogs
        if (completed) {
          setShowSuccessDialog(true);
        } else {
          // For failed check-ins, show the failure dialog with forfeiture info
          setForfeitAmount(result.forfeitAmount || 0);
          setForfeitMessage(result.message || null);
          setShowFailureDialog(true);
        }

        // Reset proof fields
        setProofContent("");
        setPhotoFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Update remaining check-ins
        if (checkInsRemaining !== null) {
          setCheckInsRemaining(Math.max(0, checkInsRemaining - 1));
          if (checkInsRemaining - 1 <= 0) {
            setIsCheckInAvailable(false);
          }
        }

        // Refresh the page data
        router.refresh();
      } else {
        toast({
          title: "Error",
          description:
            result.message || "Failed to check in. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error during check-in:", error);
      toast({
        title: "Error",
        description: "Failed to check in. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Reset both loading states
      setIsSubmittingSuccess(false);
      setIsSubmittingFailure(false);
    }
  };

  const handleMissedCheckIn = async (completed: boolean) => {
    if (!missedCheckIn) return;

    setIsSubmittingMissed(true);

    try {
      // Handle different verification types
      let result;

      if (verificationType === "photo" && completed && photoFile) {
        result = await checkInHabit(
          habit.uuid!,
          completed,
          "",
          photoFile,
          missedCheckIn
        );
      } else if (verificationType === "text" && completed) {
        result = await checkInHabit(
          habit.uuid!,
          completed,
          proofContent,
          undefined,
          missedCheckIn
        );
      } else {
        result = await checkInHabit(
          habit.uuid!,
          completed,
          undefined,
          undefined,
          missedCheckIn
        );
      }

      if (result.success) {
        setShowMissedCheckInDialog(false);

        if (completed) {
          toast({
            title: "Streak protected!",
            description: `Your check-in for ${format(
              missedCheckIn,
              "MMMM d"
            )} has been recorded. Your streak continues!`,
            variant: "default",
          });
        } else {
          toast({
            title: "Check-in recorded",
            description: `Your missed check-in for ${format(
              missedCheckIn,
              "MMMM d"
            )} has been recorded.`,
            variant: "default",
          });
        }

        // Reset proof fields
        setProofContent("");
        setPhotoFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Reset missed check-in
        setMissedCheckIn(null);

        // Refresh the page data
        router.refresh();
      } else {
        toast({
          title: "Error",
          description:
            result.message ||
            "Failed to record missed check-in. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error during missed check-in:", error);
      toast({
        title: "Error",
        description: "Failed to record missed check-in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingMissed(false);
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

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive",
        });
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      setPhotoFile(file);
    }
  };

  // Render the appropriate verification UI based on verification type
  const renderVerificationUI = () => {
    switch (verificationType) {
      case "photo":
        return (
          <div className="space-y-4 mt-4">
            <Label htmlFor="photo-upload">Upload a photo as proof</Label>
            <Input
              id="photo-upload"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            {photoFile && (
              <p className="text-sm text-green-600">
                Photo selected: {photoFile.name}
              </p>
            )}
          </div>
        );
      case "text":
        return (
          <div className="space-y-4 mt-4">
            <Label htmlFor="text-proof">
              Describe how you completed your habit
            </Label>
            <Textarea
              id="text-proof"
              placeholder="I completed my habit by..."
              value={proofContent}
              onChange={(e) => setProofContent(e.target.value)}
            />
          </div>
        );
      case "honor":
      default:
        return (
          <p className="text-sm text-muted-foreground mt-4 mb-4">
            Simply confirm that you've completed your habit on your honor.
          </p>
        );
    }
  };

  // Reset form when dialog is closed
  const handleDialogChange = (open: boolean) => {
    if (!open) {
      // Reset form state
      setProofContent("");
      setPhotoFile(null);
      setIsSubmittingSuccess(false);
      setIsSubmittingFailure(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
    setIsCheckInDialogOpen(open);
  };

  // Get check-in status message
  const getCheckInStatusMessage = () => {
    if (isLoadingCheckIns) {
      return "Checking status...";
    }

    if (checkInsRemaining === 0) {
      return `You've completed all ${habit.frequency_value} check-ins for this ${habit.frequency_unit}.`;
    }

    if (checkInsRemaining === 1) {
      return `You have 1 check-in remaining for this ${habit.frequency_unit}.`;
    }

    return `You have ${checkInsRemaining} check-ins remaining for this ${habit.frequency_unit}.`;
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
                  : getNextCheckInMessage()}
              </p>
            )}
            {checkInsRemaining !== null && (
              <p className="text-sm font-medium mt-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1 text-blue-500" />
                {getCheckInStatusMessage()}
              </p>
            )}
          </div>

          <Dialog open={isCheckInDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                variant="default"
                disabled={
                  !isCheckInAvailable ||
                  isLoadingCheckIns ||
                  checkInsRemaining === 0
                }
              >
                {isLoadingCheckIns ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Checking status...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Check In
                  </>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Check In</DialogTitle>
                <DialogDescription>{getCheckInQuestion()}</DialogDescription>
              </DialogHeader>

              {renderVerificationUI()}

              <DialogFooter className="mt-4">
                <Button
                  variant={"default"}
                  onClick={() => handleConfirmCheckIn(true)}
                  disabled={
                    isSubmittingSuccess ||
                    isSubmittingFailure ||
                    (verificationType === "photo" && !photoFile) ||
                    (verificationType === "text" && !proofContent)
                  }
                >
                  {isSubmittingSuccess ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Yes, I did it"
                  )}
                </Button>
                <Button
                  variant={"secondary"}
                  onClick={() => handleConfirmCheckIn(false)}
                  disabled={isSubmittingSuccess || isSubmittingFailure}
                >
                  {isSubmittingFailure ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "No, not yet"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Missed check-in dialog */}
          <Dialog
            open={showMissedCheckInDialog}
            onOpenChange={setShowMissedCheckInDialog}
          >
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Record Missed Check-in</DialogTitle>
                <DialogDescription>
                  Did you complete your habit on{" "}
                  {missedCheckIn
                    ? format(missedCheckIn, "MMMM d")
                    : "the missed day"}
                  ?
                </DialogDescription>
              </DialogHeader>

              {renderVerificationUI()}

              <DialogFooter className="mt-4">
                <Button
                  variant={"default"}
                  onClick={() => handleMissedCheckIn(true)}
                  disabled={
                    isSubmittingMissed ||
                    (verificationType === "photo" && !photoFile) ||
                    (verificationType === "text" && !proofContent)
                  }
                >
                  {isSubmittingMissed ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Yes, I did it"
                  )}
                </Button>
                <Button
                  variant={"secondary"}
                  onClick={() => handleMissedCheckIn(false)}
                  disabled={isSubmittingMissed}
                >
                  {isSubmittingMissed ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "No, I missed it"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-4">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-indigo-500" />
            <DialogTitle className="text-xl mb-2">Great job!</DialogTitle>
            <DialogDescription>
              You've successfully checked in for {habit.name}. Keep up the good
              work!
              {checkInsRemaining !== null && checkInsRemaining <= 1 && (
                <p className="mt-2 font-medium">
                  {checkInsRemaining === 0
                    ? `You've completed all check-ins for this ${habit.frequency_unit}.`
                    : `You have 1 check-in remaining for this ${habit.frequency_unit}.`}
                </p>
              )}
            </DialogDescription>
          </div>
          <DialogFooter>
            <Button
              className="w-full"
              variant="default"
              onClick={() => setShowSuccessDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Failure Dialog */}
      <Dialog open={showFailureDialog} onOpenChange={setShowFailureDialog}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-4">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-zinc-500" />
            <DialogTitle className="text-xl mb-2">
              Check-in Recorded
            </DialogTitle>
            <DialogDescription>
              <p>
                You've recorded that you didn't complete {habit.name} this time.
              </p>
              {forfeitAmount !== null && forfeitAmount > 0 && (
                <div className="mt-4 p-4 bg-zinc-50 rounded-lg">
                  <p className="font-medium text-zinc-800">
                    {forfeitMessage ||
                      `You forfeited $${forfeitAmount} of your stake.`}
                  </p>
                  <p className="text-sm text-zinc-700 mt-2">
                    Remember, building habits takes time. Don't give up!
                  </p>
                </div>
              )}
            </DialogDescription>
          </div>
          <DialogFooter>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => setShowFailureDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CheckInSection;
