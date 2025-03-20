"use client";

import { Tables } from "@/supabase/models/database.types";
import Link from "next/link";
import HabitProgressBar from "./HabitProgressBar";
import StatusBadge from "./StatusBadge";
import { useEffect, useState } from "react";

interface ResponsiveHabitRowProps {
  habit: Tables<"habits">;
  stake: Tables<"habit_stakes"> | undefined;
  checkins: Tables<"habit_checkins">[];
  status: "active" | "failed";
}

export default function ResponsiveHabitRow({
  habit,
  stake,
  checkins,
  status,
}: ResponsiveHabitRowProps) {
  const [isWideEnough, setIsWideEnough] = useState(true);

  useEffect(() => {
    const checkWidth = () => {
      setIsWideEnough(window.innerWidth > 400);
    };

    // Set initial value
    checkWidth();

    // Listen for resize events
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  return (
    <Link
      prefetch
      href={`/dashboard/${habit.slug}`}
      className="block hover:bg-muted/30 transition-colors"
    >
      {/* Mobile view */}
      <div
        className={`md:hidden p-3 flex flex-col space-y-2 ${
          status === "failed" ? "bg-muted/20" : ""
        }`}
      >
        <div className="flex justify-between items-center">
          <div
            className={`font-medium line-clamp-1 ${
              status === "failed" ? "text-muted-foreground" : ""
            }`}
          >
            {habit.name}
          </div>
          <StatusBadge status={status} />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {habit.frequency_value}x per {habit.frequency_unit}
          </span>
          <span className={status === "failed" ? "text-muted-foreground" : ""}>
            {stake ? `$${stake.amount}` : "No stake"}
          </span>
        </div>
        <HabitProgressBar
          habit={habit}
          checkins={checkins}
          showPercentage={isWideEnough}
        />
      </div>
    </Link>
  );
}
