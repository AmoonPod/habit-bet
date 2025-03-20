"use client";

import { cn } from "@/lib/utils";
import { Check, Target, Coins, Trophy, TrendingUp } from "lucide-react";

interface LoginFeaturesProps {
  className?: string;
}

const features = [
  {
    title: "Build lasting habits",
    description: "Create and track habits that stick with real money stakes",
    icon: Target,
  },
  {
    title: "Honor system",
    description:
      "Based on self-reporting - you only pay when you break your streak",
    icon: Check,
  },
  {
    title: "Financial motivation",
    description:
      "Set stakes that matter to you - from $1 to whatever motivates you",
    icon: Coins,
  },
  {
    title: "Track your progress",
    description: "Visual insights show your consistency over time",
    icon: TrendingUp,
  },
];

export function LoginFeatures({ className }: LoginFeaturesProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <h2 className="text-lg font-medium text-center md:text-left mb-2">
        Why choose HabitBet?
      </h2>
      <div className="grid grid-cols-1 gap-3">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="shrink-0 p-1.5 bg-primary/10 rounded-md text-primary">
              <feature.icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center mt-4 text-sm text-muted-foreground">
        <Trophy className="h-4 w-4 mr-1 text-amber-500" />
        <span>92% of users report improved consistency</span>
      </div>
    </div>
  );
}
