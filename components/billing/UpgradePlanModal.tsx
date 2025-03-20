"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BadgeCheck, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { createPolarCheckout } from "@/app/actions/subscription";
import { TIERS, type PricingTier } from "@/lib/tiers";

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier?: string;
}

export function UpgradePlanModal({
  isOpen,
  onClose,
  currentTier = "free",
}: UpgradePlanModalProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUpgrade = async (tier: PricingTier) => {
    // Don't process upgrades for the current plan
    if (
      tier.name.toLowerCase() === "free" ||
      tier.name.toLowerCase() === currentTier
    )
      return;

    setIsLoading(true);
    setSelectedPlan(tier.name.toLowerCase());

    try {
      // Get the appropriate product ID based on billing cycle
      const productId = tier.productId[billingCycle];

      // Call server action to create checkout
      const result = await createPolarCheckout(productId, billingCycle);

      if (!result.success || !result.checkoutUrl) {
        throw new Error(result.error || "Failed to create checkout session");
      }

      // Redirect to Polar checkout
      window.location.href = result.checkoutUrl;
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "There was an error processing your upgrade. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  const formatPrice = (price: string | number) => {
    if (typeof price === "string") return price;
    return `$${price.toFixed(2)}`;
  };

  const getYearlySavings = () => {
    const premiumTier = TIERS.find((t) => t.name.toLowerCase() === "premium");
    if (!premiumTier) return null;

    const monthlyPrice =
      typeof premiumTier.price.monthly === "number"
        ? premiumTier.price.monthly
        : 0;
    const yearlyPrice =
      typeof premiumTier.price.yearly === "number"
        ? premiumTier.price.yearly
        : 0;
    const monthlyForYear = monthlyPrice * 12;

    if (monthlyPrice === 0) return null;

    const savings = monthlyForYear - yearlyPrice;
    const savingsPercentage = Math.round((savings / monthlyForYear) * 100);

    return savingsPercentage;
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
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[700px] p-0 overflow-hidden max-h-[85vh] sm:max-h-[90vh] flex flex-col">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
          <DialogTitle className="text-xl sm:text-2xl font-bold">
            Upgrade Your Plan
          </DialogTitle>
          <DialogDescription>
            Choose the plan that works best for you and your habits.
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 sm:px-6 py-3 overflow-y-auto pb-5 sm:pb-6">
          <div className="flex justify-center mb-4 sm:mb-6">
            <Tabs
              value={billingCycle}
              onValueChange={(value) =>
                setBillingCycle(value as "monthly" | "yearly")
              }
              className="w-full max-w-xs"
            >
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">
                  Yearly
                  <span className="ml-1 sm:ml-1.5 inline-flex items-center rounded-full bg-emerald-100 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium text-emerald-800">
                    Save {getYearlySavings()}%
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {TIERS.map((tier) => {
              const tierName = tier.name.toLowerCase();
              const isCurrentPlan = tierName === currentTier;
              const isPlanSelected = selectedPlan === tierName && isLoading;
              const price = tier.price[billingCycle];

              return (
                <div
                  key={tierName}
                  className={`border rounded-lg p-3 sm:p-4 md:p-5 relative transition-all ${
                    isCurrentPlan
                      ? "border-primary/50 bg-primary/5"
                      : isPlanSelected
                      ? "border-primary shadow-md"
                      : "border-border hover:border-muted-foreground/50"
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-[10px] sm:text-xs font-medium px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                      🔥 Most Popular
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <div>
                      <h3 className="font-bold text-base sm:text-lg">
                        {tier.name}
                      </h3>
                      <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                        {tier.description}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3 sm:mb-4">
                    <span className="text-xl sm:text-2xl md:text-3xl font-bold">
                      {formatPrice(price)}
                    </span>
                    {typeof price === "number" && (
                      <span className="text-muted-foreground text-sm">
                        {billingCycle === "monthly" ? "/month" : "/year"}
                      </span>
                    )}
                  </div>

                  <ul className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-5 text-xs sm:text-sm">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <BadgeCheck className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-primary mr-1.5 sm:mr-2 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={isCurrentPlan ? "outline" : "default"}
                    className="w-full text-xs sm:text-sm h-8 sm:h-10"
                    disabled={isCurrentPlan || isPlanSelected}
                    onClick={() => handleUpgrade(tier)}
                  >
                    {isCurrentPlan ? (
                      "Current Plan"
                    ) : isPlanSelected ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      tier.cta
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
