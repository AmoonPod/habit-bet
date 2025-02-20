"use client";
import HabitCard from "@/components/dashboard/HabitCard";
import HabitHeatmap from "@/components/dashboard/HabitHeatmap";
import NewHabitDialog from "@/components/dashboard/NewHabitDialog";
import ProgressChart from "@/components/dashboard/ProgressChart";
import StatsGrid from "@/components/dashboard/StatsGrid";

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Track your habits and bets</p>
        </div>
        <NewHabitDialog />
      </div>

      <StatsGrid />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <HabitCard />
        <HabitCard
          title="Daily Meditation"
          frequency="Daily"
          stake={5}
          progress={80}
          daysLeft={2}
        />
        <HabitCard
          title="Read 30 mins"
          frequency="5x per week"
          stake={15}
          progress={40}
          daysLeft={10}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <HabitHeatmap />
        <ProgressChart />
      </div>
    </div>
  );
}
