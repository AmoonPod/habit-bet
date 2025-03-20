"use client";

import React, { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Database } from "@/database.types";
import { resolveMissedCheckin } from "@/app/dashboard/actions";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

// Define the type for a missed check-in record
type MissedCheckin = {
  uuid: string;
  habit_uuid: string;
  period_start: string;
  period_end: string;
  required_checkins: number;
  actual_checkins: number;
  status: string;
  grace_period_end: string;
  created_at: string;
  resolved_at: string | null;
  notification_sent: boolean;
  habits?: {
    name: string;
    frequency_unit: string | null;
    frequency_value: number | null;
    slug?: string;
    stake_uuid?: string;
  } | null;
};

interface MissedCheckInsAlertProps {
  missedCheckins: MissedCheckin[];
  forHabitPage?: boolean;
}

export default function MissedCheckInsAlert({
  missedCheckins,
  forHabitPage = false,
}: MissedCheckInsAlertProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMissedCheckin, setSelectedMissedCheckin] =
    useState<MissedCheckin | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionType, setActionType] = useState<"complete" | "fail" | null>(
    null
  );
  const { toast } = useToast();
  const router = useRouter();

  if (!missedCheckins || missedCheckins.length === 0) {
    return null;
  }

  // Helper function to handle refreshing based on context
  const refreshPage = () => {
    console.log("Refreshing page after action completion");
    // Use a small delay to ensure server-side changes have propagated
    setTimeout(() => {
      router.refresh();

      // If we're on a habit page and have the slug, we can also refresh that specific page
      if (forHabitPage && selectedMissedCheckin?.habits?.slug) {
        console.log(
          `Refreshing habit page: ${selectedMissedCheckin.habits.slug}`
        );
      }
    }, 800);
  };

  // Sort by grace period end (most urgent first)
  const sortedMissedCheckins = [...missedCheckins].sort(
    (a, b) =>
      new Date(a.grace_period_end).getTime() -
      new Date(b.grace_period_end).getTime()
  );

  const handleShowDetails = (missedCheckin: MissedCheckin) => {
    setSelectedMissedCheckin(missedCheckin);
    setIsDialogOpen(true);
  };

  const handleResolve = async (action: "complete" | "fail") => {
    if (!selectedMissedCheckin) {
      toast({
        title: "Error",
        description: "No missed check-in selected",
        variant: "destructive",
      });
      return;
    }

    setActionType(action);
    setIsLoading(true);

    try {
      console.log(
        `Resolving missed check-in: ${selectedMissedCheckin.uuid}`,
        "Action:",
        action,
        "Habit:",
        selectedMissedCheckin.habits?.name
      );

      // Call the server action to resolve the missed check-in
      const result = await resolveMissedCheckin(
        selectedMissedCheckin.uuid,
        action
      );

      console.log("Server action response:", result);

      if (result.success) {
        // Show success toast
        toast({
          title: action === "complete" ? "Check-ins Completed" : "Habit Failed",
          description: result.message,
          variant: action === "complete" ? "default" : "destructive",
        });

        // Close the dialog
        setIsDialogOpen(false);

        // Force a delay to ensure database changes have been applied
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Refresh the page to show updated data
        refreshPage();

        // Force reload after a short delay to ensure server state is fresh
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        console.error("Server action returned error:", result.message);
        // Show error toast
        toast({
          title: "Error",
          description: result.message || "Failed to process your request",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Exception when resolving missed check-in:", error);

      // Show error toast with more details
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setActionType(null);
    }
  };

  // If this is for a specific habit page, show a comprehensive alert
  if (forHabitPage) {
    return (
      <>
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-semibold">Attention Required</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-2">
              You missed required check-ins for this habit. Please address this
              within the grace period to avoid failing the habit.
            </p>

            <div className="space-y-3 mt-3">
              {sortedMissedCheckins.map((missedCheckin) => {
                const graceEnds = new Date(missedCheckin.grace_period_end);
                const timeLeft = formatDistanceToNow(graceEnds, {
                  addSuffix: true,
                });
                const periodStart = new Date(missedCheckin.period_start);
                const periodEnd = new Date(missedCheckin.period_end);

                return (
                  <div
                    key={missedCheckin.uuid}
                    className="bg-red-50 p-3 rounded-md"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">
                          {format(periodStart, "PPP")}
                          {missedCheckin.habits?.frequency_unit !== "day" &&
                            ` to ${format(periodEnd, "PPP")}`}
                        </p>
                        <p className="text-sm text-red-700 mt-1">
                          <span className="font-medium">
                            {missedCheckin.actual_checkins}/
                            {missedCheckin.required_checkins}
                          </span>{" "}
                          check-ins completed
                        </p>
                        <p className="text-xs flex items-center text-red-600 mt-1">
                          <Clock className="h-3 w-3 mr-1" /> Grace period ends{" "}
                          {timeLeft}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleShowDetails(missedCheckin)}
                      >
                        Resolve
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </AlertDescription>
        </Alert>

        {selectedMissedCheckin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Missed Check-ins</DialogTitle>
                <DialogDescription>
                  You missed check-ins for the following period. Please choose
                  how to resolve this.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">Period:</p>
                    <p className="text-sm">
                      {format(
                        new Date(selectedMissedCheckin.period_start),
                        "PPP"
                      )}
                      {selectedMissedCheckin.habits?.frequency_unit !== "day" &&
                        ` to ${format(
                          new Date(selectedMissedCheckin.period_end),
                          "PPP"
                        )}`}
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <p className="text-sm font-medium">Required check-ins:</p>
                    <p className="text-sm">
                      {selectedMissedCheckin.required_checkins}
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <p className="text-sm font-medium">Completed check-ins:</p>
                    <p className="text-sm">
                      {selectedMissedCheckin.actual_checkins}
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <p className="text-sm font-medium">Missing check-ins:</p>
                    <p className="text-sm font-semibold text-red-600">
                      {selectedMissedCheckin.required_checkins -
                        selectedMissedCheckin.actual_checkins}
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <p className="text-sm font-medium">Grace period ends:</p>
                    <p className="text-sm">
                      {format(
                        new Date(selectedMissedCheckin.grace_period_end),
                        "PPP p"
                      )}
                    </p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-4">
                  <p className="text-sm font-medium">Choose how to resolve:</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`flex flex-col items-center justify-between p-4 border rounded-lg transition-colors ${
                        isLoading
                          ? "opacity-70 cursor-not-allowed"
                          : "cursor-pointer hover:bg-green-50 hover:border-green-200"
                      }`}
                      onClick={() => !isLoading && handleResolve("complete")}
                    >
                      {isLoading && actionType === "complete" ? (
                        <Loader2 className="h-8 w-8 mb-2 text-green-500 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-8 w-8 mb-2 text-green-500" />
                      )}
                      <p className="font-medium text-center">
                        Complete Retroactively
                      </p>
                      <p className="text-xs text-center text-muted-foreground mt-1">
                        Add the missing check-ins and continue your habit
                      </p>
                    </div>

                    <div
                      className={`flex flex-col items-center justify-between p-4 border rounded-lg transition-colors ${
                        isLoading
                          ? "opacity-70 cursor-not-allowed"
                          : "cursor-pointer hover:bg-red-50 hover:border-red-200"
                      }`}
                      onClick={() => !isLoading && handleResolve("fail")}
                    >
                      {isLoading && actionType === "fail" ? (
                        <Loader2 className="h-8 w-8 mb-2 text-red-500 animate-spin" />
                      ) : (
                        <XCircle className="h-8 w-8 mb-2 text-red-500" />
                      )}
                      <p className="font-medium text-center">Mark as Failed</p>
                      <p className="text-xs text-center text-muted-foreground mt-1">
                        Admit failure and forfeit your stake
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Cancel"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  }

  // For dashboard, show a more compact alert
  return (
    <>
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="font-semibold">Missed Check-ins</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-2">
            You have missed check-ins for {missedCheckins.length} habit
            {missedCheckins.length > 1 ? "s" : ""}. Please address them within
            the grace period to avoid failing.
          </p>

          <div className="space-y-2 mt-3">
            {sortedMissedCheckins.slice(0, 3).map((missedCheckin) => {
              const graceEnds = new Date(missedCheckin.grace_period_end);
              const timeLeft = formatDistanceToNow(graceEnds, {
                addSuffix: true,
              });

              return (
                <div
                  key={missedCheckin.uuid}
                  className="flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {missedCheckin.habits?.name || "Unknown Habit"}
                    </p>
                    <p className="text-xs flex items-center text-red-600">
                      <Clock className="h-3 w-3 mr-1" /> Grace period ends{" "}
                      {timeLeft}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center"
                    onClick={() => handleShowDetails(missedCheckin)}
                  >
                    Resolve <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              );
            })}

            {missedCheckins.length > 3 && (
              <p className="text-xs text-center mt-2">
                And {missedCheckins.length - 3} more...
              </p>
            )}
          </div>
        </AlertDescription>
      </Alert>

      {selectedMissedCheckin && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Missed Check-ins: {selectedMissedCheckin.habits?.name}
              </DialogTitle>
              <DialogDescription>
                You missed check-ins for the following period. Please choose how
                to resolve this.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm font-medium">Period:</p>
                  <p className="text-sm">
                    {format(
                      new Date(selectedMissedCheckin.period_start),
                      "PPP"
                    )}
                    {selectedMissedCheckin.habits?.frequency_unit !== "day" &&
                      ` to ${format(
                        new Date(selectedMissedCheckin.period_end),
                        "PPP"
                      )}`}
                  </p>
                </div>

                <div className="flex justify-between">
                  <p className="text-sm font-medium">Required check-ins:</p>
                  <p className="text-sm">
                    {selectedMissedCheckin.required_checkins}
                  </p>
                </div>

                <div className="flex justify-between">
                  <p className="text-sm font-medium">Completed check-ins:</p>
                  <p className="text-sm">
                    {selectedMissedCheckin.actual_checkins}
                  </p>
                </div>

                <div className="flex justify-between">
                  <p className="text-sm font-medium">Missing check-ins:</p>
                  <p className="text-sm font-semibold text-red-600">
                    {selectedMissedCheckin.required_checkins -
                      selectedMissedCheckin.actual_checkins}
                  </p>
                </div>

                <div className="flex justify-between">
                  <p className="text-sm font-medium">Grace period ends:</p>
                  <p className="text-sm">
                    {format(
                      new Date(selectedMissedCheckin.grace_period_end),
                      "PPP p"
                    )}
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <p className="text-sm font-medium">Choose how to resolve:</p>

                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`flex flex-col items-center justify-between p-4 border rounded-lg transition-colors ${
                      isLoading
                        ? "opacity-70 cursor-not-allowed"
                        : "cursor-pointer hover:bg-green-50 hover:border-green-200"
                    }`}
                    onClick={() => !isLoading && handleResolve("complete")}
                  >
                    {isLoading && actionType === "complete" ? (
                      <Loader2 className="h-8 w-8 mb-2 text-green-500 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-8 w-8 mb-2 text-green-500" />
                    )}
                    <p className="font-medium text-center">
                      Complete Retroactively
                    </p>
                    <p className="text-xs text-center text-muted-foreground mt-1">
                      Add the missing check-ins and continue your habit
                    </p>
                  </div>

                  <div
                    className={`flex flex-col items-center justify-between p-4 border rounded-lg transition-colors ${
                      isLoading
                        ? "opacity-70 cursor-not-allowed"
                        : "cursor-pointer hover:bg-red-50 hover:border-red-200"
                    }`}
                    onClick={() => !isLoading && handleResolve("fail")}
                  >
                    {isLoading && actionType === "fail" ? (
                      <Loader2 className="h-8 w-8 mb-2 text-red-500 animate-spin" />
                    ) : (
                      <XCircle className="h-8 w-8 mb-2 text-red-500" />
                    )}
                    <p className="font-medium text-center">Mark as Failed</p>
                    <p className="text-xs text-center text-muted-foreground mt-1">
                      Admit failure and forfeit your stake
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Cancel"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
