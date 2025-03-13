"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, AlertTriangle, Target, Trophy } from "lucide-react";

interface HabitStatsProps {
  currentStreak: number;
  completionRate: number;
  currentRisk: number;
  nextCheckIn: Date;
}

const HabitStats: React.FC<HabitStatsProps> = ({
  currentStreak,
  completionRate,
  currentRisk,
  nextCheckIn,
}) => {
  const format = (date: Date, formatString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(date).toLocaleDateString("en-US", options);
  };

  return (
    <div className="grid gap-4 md:grid-cols-4 mb-8">
      {[
        { label: "Current Streak", value: currentStreak, icon: Trophy },
        {
          label: "Completion Rate",
          value: `${completionRate}%`,
          icon: Target,
        },
        {
          label: "Current Risk",
          value: `$${currentRisk}`,
          icon: AlertTriangle,
        },
        {
          label: "Next Check-in",
          value: format(nextCheckIn, "MMM d"),
          icon: CalendarIcon,
        },
      ].map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default HabitStats;
