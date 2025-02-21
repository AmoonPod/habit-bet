import * as React from "react";
import { PricingCard, type PricingTier } from "@/components/ui/pricing-card";
import { Tab } from "@/components/ui/pricing-tab";

export const PAYMENT_FREQUENCIES = ["monthly", "yearly"];

export const TIERS = [
  {
    id: "free",
    name: "Free",
    price: {
      monthly: "Free",
      yearly: "Free",
    },
    description: "Start building better habits with real money stakes.",
    features: [
      "Unlimited Habits",
      "Basic Insights (Progress Charts)",
      "Minimum Stake: $5 per habit",
      "Real Money Stakes", // Updated phrasing
    ],
    cta: "Get Started",
  },
  {
    id: "premium",
    name: "Premium",
    price: {
      monthly: 4.99,
      yearly: 49.99,
    },
    description:
      "Supercharge your habit-building with advanced insights and AI-powered recommendations.",
    features: [
      "All Free Features",
      "Pro Insights (Advanced Analytics)",
      "AI Features (Personalized Recommendations)",
      "Minimum Stake: $1 per habit",
      "Lower Staking Limits",
    ],
    cta: "Upgrade to Premium",
    popular: true, // You can mark this as the most popular plan
  },
  // Removed the other tiers as they don't fit our model
];

export function PricingSection() {
  const [selectedFrequency, setSelectedFrequency] = React.useState(
    PAYMENT_FREQUENCIES[0]
  );

  return (
    <section className="flex flex-col items-center gap-10 py-10">
      <div className="space-y-7 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-center">
            Simple Pricing
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose the best plan for your needs
          </p>
        </div>
        <div className="mx-auto flex w-fit rounded-full bg-slate-100 p-1 dark:bg-slate-800">
          {PAYMENT_FREQUENCIES.map((freq) => (
            <Tab
              key={freq}
              text={freq}
              selected={selectedFrequency === freq}
              setSelected={setSelectedFrequency}
              discount={freq === "yearly"}
            />
          ))}
        </div>
      </div>

      <div className="grid w-full max-w-6xl gap-6 sm:grid-cols-2 xl:grid-cols-2">
        {TIERS.map((tier) => (
          <PricingCard
            key={tier.name}
            tier={tier}
            paymentFrequency={selectedFrequency}
          />
        ))}
      </div>
    </section>
  );
}
