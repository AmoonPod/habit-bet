"use client";

import { Button } from "@/components/ui/button";
import { getCustomerPortalLink } from "@/lib/get-customer-portal-link";
import { useState } from "react";
import { toast } from "./use-toast";
import { Loader2 } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { useSelectedPlan } from "@/hooks/use-selected-plan";
import { useRouter } from "next/navigation";

interface SubscribeButtonProps {
  isCurrentPlan: boolean;
  hasSubscription: boolean;
  planPrice: number;
  currentPrice?: number;
  productId: string;
  tierCta: string;
}

export function SubscribeButton({
  isCurrentPlan,
  hasSubscription,
  planPrice,
  currentPrice,
  productId,
  tierCta,
}: SubscribeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { session, user } = useSession();
  const { setSelectedProductId, isReady } = useSelectedPlan();
  const router = useRouter();

  const handleSubscribe = () => {
    if (!isReady) return;

    setIsLoading(true);

    if (!session) {
      setSelectedProductId(productId);
      setTimeout(() => {
        router.push("/login");
        setIsLoading(false);
      }, 0);
      return;
    }

    const customerEmail = encodeURIComponent(user?.email || "");
    const customerName = encodeURIComponent(user?.user_metadata.name || "");
    window.location.href = `/api/polar/checkout?productId=${productId}&customer_email=${customerEmail}&customer_name=${customerName}`;
  };

  const handleCustomerURL = async () => {
    setIsLoading(true);
    try {
      const result = await getCustomerPortalLink();
      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        toast({
          title: "Error",
          description: result.message || "Could not open billing portal",
        });
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCurrentPlan) {
    return (
      <Button variant="outline" className="w-full" disabled={isLoading}>
        Current Plan
      </Button>
    );
  }

  return (
    <Button
      className="w-full cursor-pointer"
      onClick={
        hasSubscription && typeof currentPrice === "number"
          ? handleCustomerURL
          : handleSubscribe
      }
      disabled={isLoading}
    >
      {hasSubscription && typeof currentPrice === "number"
        ? currentPrice < planPrice
          ? "Upgrade"
          : "Downgrade"
        : tierCta}
      {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
    </Button>
  );
}
