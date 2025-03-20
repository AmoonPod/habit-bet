"use client";

import * as React from "react";
import { BadgeCheck } from "lucide-react";
import NumberFlow from "@number-flow/react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PricingTier } from "@/lib/tiers";
import { SubscriptionAwareCTA } from "./subscription-aware-cta";
import { useSession } from "@/hooks/use-session";
import { useSubscription } from "@/hooks/use-subscription";
import { SubscriptionTier } from "@/lib/subscription";

interface PricingCardProps {
  tier: PricingTier;
  paymentFrequency: string;
}

export function PricingCard({ tier, paymentFrequency }: PricingCardProps) {
  const price = tier.price[paymentFrequency as keyof typeof tier.price];
  const isHighlighted = tier.popular;
  const isPopular = tier.popular;
  const { session } = useSession();
  const { subscription } = useSubscription();

  // Map pricing tier name to subscription tier
  const subscriptionTier: SubscriptionTier =
    tier.name.toLowerCase() === "premium" ? "premium" : "free";

  // Determine if this is the user's current plan
  const isCurrentPlan =
    session && subscription?.tier === subscriptionTier && subscription.isActive;

  // Get appropriate product ID for this tier/frequency
  const productId =
    tier.productId[paymentFrequency as keyof typeof tier.productId];

  return (
    <Card
      className={cn(
        "relative flex flex-col gap-8 overflow-hidden p-6",
        isHighlighted
          ? "bg-slate-950 text-white dark:bg-slate-50 dark:text-slate-950"
          : "bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-50",
        isPopular && "ring-2 ring-slate-900 dark:ring-slate-50"
      )}
    >
      <h2 className="flex items-center gap-3 text-xl font-medium capitalize">
        {tier.name}
        {isPopular && (
          <Badge variant="secondary" className="mt-1 z-10">
            🔥 Most Popular
          </Badge>
        )}
      </h2>

      <div className="relative h-12">
        {typeof price === "number" ? (
          <>
            <NumberFlow
              format={{
                style: "currency",
                currency: "USD",
                trailingZeroDisplay: "stripIfInteger",
              }}
              value={price}
              className="text-4xl font-medium"
            />
            <p className="-mt-2 text-xs text-slate-500 dark:text-slate-400">
              Per month
            </p>
          </>
        ) : (
          <h1 className="text-4xl font-medium">{price}</h1>
        )}
      </div>

      <div className="flex-1 space-y-2">
        <h3 className="text-sm font-medium">{tier.description}</h3>
        <ul className="space-y-2">
          {tier.features.map((feature, index) => (
            <li
              key={index}
              className={cn(
                "flex items-center gap-2 text-sm font-medium",
                isHighlighted
                  ? "text-white dark:text-slate-950"
                  : "text-slate-500 dark:text-slate-400"
              )}
            >
              <BadgeCheck className="h-4 w-4" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {isCurrentPlan ? (
        <div
          className={cn(
            "w-full py-2 px-4 text-center rounded-md border-2",
            isHighlighted
              ? "border-white/20 text-white"
              : "border-gray-200 text-gray-600"
          )}
        >
          Current Plan
        </div>
      ) : (
        <SubscriptionAwareCTA
          targetTier={subscriptionTier}
          defaultProductId={productId}
          className={cn(
            "w-full",
            isHighlighted
              ? "bg-white text-slate-950 hover:bg-gray-100"
              : undefined
          )}
        >
          {tier.cta}
        </SubscriptionAwareCTA>
      )}
    </Card>
  );
}

const HighlightedBackground = () => (
  <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:45px_45px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
);

const PopularBackground = () => (
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
);
