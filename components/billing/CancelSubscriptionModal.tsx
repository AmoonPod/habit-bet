"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { cancelUserSubscription } from "@/app/actions/subscription";

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CancelSubscriptionModal({
  isOpen,
  onClose,
  onSuccess,
}: CancelSubscriptionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleCancel = async () => {
    setIsLoading(true);

    try {
      // Call the server action to cancel subscription
      const result = await cancelUserSubscription();

      if (!result.success) {
        throw new Error(result.error || "Failed to cancel subscription");
      }

      // Show success state
      setIsSuccess(true);

      // Callback after successful cancellation
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }

      // Close modal after delay
      setTimeout(() => {
        toast({
          title: "Subscription cancelled",
          description: "Your subscription has been successfully cancelled.",
        });
        onClose();
        setIsSuccess(false);
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "There was an error cancelling your subscription. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          // Prevent default form submission behavior
          onClose();
        }
      }}
    >
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[500px] max-h-[85vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        {isSuccess ? (
          <div className="py-6 sm:py-8 flex flex-col items-center justify-center">
            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-green-100 flex items-center justify-center mb-3 sm:mb-4">
              <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              Subscription Cancelled
            </h2>
            <p className="text-center text-muted-foreground text-sm sm:text-base mb-4 sm:mb-6">
              Your subscription has been successfully cancelled. You'll still
              have access until the end of your billing period.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader className="pb-3 sm:pb-4">
              <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                <span>Cancel Subscription</span>
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Are you sure you want to cancel your premium subscription?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 sm:space-y-4 py-1 sm:py-2">
              <div className="bg-muted/50 p-3 rounded-md border border-muted-foreground/20">
                <h3 className="font-medium text-sm mb-2">If you cancel:</h3>
                <ul className="text-sm text-muted-foreground space-y-1.5">
                  <li>• You'll lose access to premium features</li>
                  <li>
                    • Your subscription will remain active until the end of the
                    current billing period
                  </li>
                  <li>• You can resubscribe at any time</li>
                  <li>
                    • Your account will automatically downgrade to the free tier
                  </li>
                </ul>
              </div>

              <DialogFooter className="mt-4 sm:mt-6 pt-2 border-t">
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end w-full gap-2 sm:gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="h-9 sm:h-10 text-xs sm:text-sm"
                    disabled={isLoading}
                  >
                    Keep Subscription
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="h-9 sm:h-10 text-xs sm:text-sm sm:w-auto w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      "Cancel Subscription"
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
