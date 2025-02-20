"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, Trophy, DollarSign } from "lucide-react";

export default function StatsGrid() {
  const stats = [
    {
      title: "Active Habits",
      value: "5",
      description: "3 on track",
      icon: Target,
    },
    {
      title: "Current Stakes",
      value: "$85",
      description: "$45 at risk",
      icon: DollarSign,
    },
    {
      title: "Success Rate",
      value: "87%",
      description: "Last 30 days",
      icon: TrendingUp,
    },
    {
      title: "Achievements",
      value: "12",
      description: "2 this week",
      icon: Trophy,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
