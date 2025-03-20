"use client";

import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";

interface HabitBetLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "auth";
}

export function HabitBetLogo({
  className,
  size = "md",
  variant = "default",
}: HabitBetLogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-5xl",
  };

  const coinSizes = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const dotSizes = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-5 h-5",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        className
      )}
    >
      <div className="relative">
        <Coins
          className={cn(
            coinSizes[size],
            variant === "auth" ? "text-primary" : "text-primary"
          )}
        />
        <div
          className={cn(
            "absolute -bottom-1 -right-1 bg-green-500 rounded-full border-2 border-background",
            dotSizes[size]
          )}
        />
      </div>
      <div className="flex flex-col items-center">
        <h1
          className={cn(
            "font-bold tracking-tight",
            sizeClasses[size],
            variant === "auth" ? "text-primary" : "text-primary"
          )}
        >
          HabitBet
        </h1>
        {variant === "auth" && (
          <p className="text-sm mt-1 text-muted-foreground">
            Building better habits, one bet at a time
          </p>
        )}
      </div>
    </div>
  );
}
