"use client";

import { useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { useSubscription } from "@/hooks/use-subscription";
import { SubscriptionTier } from "@/lib/subscription";
import { useRouter } from "next/navigation";
import { useSelectedPlan } from "@/hooks/use-selected-plan";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface SubscriptionAwareCTAProps extends Omit<ButtonProps, "onClick"> {
  targetTier: SubscriptionTier;
  fallbackHref?: string;
  children: React.ReactNode;
  defaultProductId?: string;
}

export function SubscriptionAwareCTA({
  targetTier,
  fallbackHref = "/login",
  children,
  defaultProductId,
  ...buttonProps
}: SubscriptionAwareCTAProps) {
  const router = useRouter();
  const { session } = useSession();
  const { subscription, isLoading: isLoadingSubscription } = useSubscription();
  const { setSelectedProductId, isReady } = useSelectedPlan();
  const [isLoading, setIsLoading] = useState(false);

  // Determine appropriate action based on user state
  const handleClick = async () => {
    setIsLoading(true);

    // Ensure the selected plan context is ready before proceeding
    if (!isReady) {
      setIsLoading(false);
      toast({
        title: "Please wait",
        description: "The application is still initializing",
        variant: "default",
      });
      return;
    }

    // If not logged in, save product ID and redirect to login
    if (!session) {
      if (defaultProductId) {
        console.log(
          "Saving product ID for post-login redirect:",
          defaultProductId
        );
        // Save the selected product ID for post-login redirect
        setSelectedProductId(defaultProductId);

        // Wait a moment to ensure the product ID is saved before redirecting
        setTimeout(() => {
          router.push(fallbackHref);
        }, 100);
      } else {
        router.push(fallbackHref);
      }
      return;
    }

    // If subscription is loading, do nothing yet
    if (isLoadingSubscription) {
      setIsLoading(false);
      return;
    }

    // If user already has this tier
    if (subscription?.tier === targetTier && subscription.isActive) {
      toast({
        title: "You're already subscribed",
        description: `You already have the ${targetTier} plan.`,
        variant: "default",
      });
      setIsLoading(false);
      router.push("/dashboard");
      return;
    }

    // If user has premium but clicks on free
    if (
      subscription?.tier === "premium" &&
      targetTier === "free" &&
      subscription.isActive
    ) {
      toast({
        description:
          "You already have the premium plan which includes all features.",
        variant: "default",
      });
      setIsLoading(false);
      router.push("/dashboard");
      return;
    }

    // If user wants to upgrade from free to premium
    if (subscription?.tier === "free" && targetTier === "premium") {
      if (defaultProductId) {
        // Redirect to checkout
        window.location.href = `/api/polar/checkout?productId=${defaultProductId}`;
      } else {
        // Redirect to pricing page if no productId is provided
        router.push("/pricing");
      }
      return;
    }

    // Default fallback: go to dashboard
    setIsLoading(false);
    router.push("/dashboard");
  };

  return (
    <Button onClick={handleClick} disabled={isLoading} {...buttonProps}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        children
      )}
    </Button>
  );
}
