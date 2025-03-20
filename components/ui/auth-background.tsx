"use client";

import { cn } from "@/lib/utils";

interface AuthBackgroundProps {
  className?: string;
}

export function AuthBackground({ className }: AuthBackgroundProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 -z-10 opacity-30 pointer-events-none",
        className
      )}
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />

      {/* Coin shapes */}
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary opacity-10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-green-500 opacity-10 blur-3xl" />
    </div>
  );
}
