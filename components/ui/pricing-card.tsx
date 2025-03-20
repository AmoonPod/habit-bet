"use client";

import * as React from "react";
import { BadgeCheck } from "lucide-react";
import NumberFlow from "@number-flow/react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import PolarButton from "@/components/ui/polar-button";
import { useToast } from "@/components/ui/use-toast";

export interface PricingTier {
  id: string;
  name: string;
  price: Record<string, number | string>;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  popular?: boolean;
  polarPriceId?: {
    monthly?: string;
    yearly?: string;
  };
  polarProductId?: string; // For one-time purchases
}

interface PricingCardProps {
  tier: PricingTier;
  paymentFrequency: string;
}

export function PricingCard({ tier, paymentFrequency }: PricingCardProps) {
  const price = tier.price[paymentFrequency];
  const isHighlighted = tier.highlighted;
  const isPopular = tier.popular;
  const { toast } = useToast();

  // Get the appropriate Polar price ID based on the payment frequency
  const polarPriceId =
    tier.polarPriceId?.[paymentFrequency as keyof typeof tier.polarPriceId];

  // Handle checkout errors
  const handleCheckoutError = (error: Error) => {
    toast({
      title: "Checkout Error",
      description: "There was a problem initiating checkout. Please try again.",
      variant: "destructive",
    });
  };

  // Determine if the tier is free
  const isFree = typeof price === "string" && price.toLowerCase() === "free";

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
      {isHighlighted && <HighlightedBackground />}
      {isPopular && <PopularBackground />}

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
              Per {paymentFrequency === "yearly" ? "year" : "month"}
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

      {isFree ? (
        <PolarButton
          variant={isHighlighted ? "secondary" : "default"}
          className="w-full"
          // Ensure at least one of these is provided
          productId={tier.polarProductId || undefined}
          priceId={polarPriceId || undefined}
          description={`Sign up for ${tier.name} plan`}
          onCheckoutError={handleCheckoutError}
          // Disable button if neither ID is available
          disabled={!tier.polarProductId && !polarPriceId}
        >
          {tier.cta}
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </PolarButton>
      ) : (
        <PolarButton
          variant={isHighlighted ? "secondary" : "default"}
          className="w-full"
          priceId={polarPriceId || undefined}
          productId={tier.polarProductId || undefined}
          amount={typeof price === "number" ? price : 0}
          currency="USD"
          description={`${tier.name} Plan (${paymentFrequency})`}
          metadata={{
            plan: tier.id,
            frequency: paymentFrequency,
          }}
          onCheckoutError={handleCheckoutError}
          disabled={!polarPriceId && !tier.polarProductId}
        >
          {tier.cta}
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </PolarButton>
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
