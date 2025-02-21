"use server";
import HabitHeatmap from "@/components/dashboard/HabitHeatmap";
import { Habits } from "@/components/dashboard/Habits";
import NewHabitDialog from "@/components/dashboard/NewHabitDialog";
import ProgressChart from "@/components/dashboard/ProgressChart";
import { Target } from "lucide-react";
import { getHabits } from "./actions";

export default async function DashboardPage() {
  const habits = await getHabits();

  if (habits.length === 0) {
    return (
      <div className="p-8 w-full min-h-screen flex justify-center items-center">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 p-4 bg-primary/10 rounded-full">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Habits Yet</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            Start your journey by creating your first habit. Remember, every
            great achievement begins with a single step!
          </p>
          <NewHabitDialog />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Track your habits and bets</p>
        </div>
        <NewHabitDialog />
      </div>
      <Habits habits={habits} />
      <div className="grid gap-4 md:grid-cols-2">
        <HabitHeatmap />
        <ProgressChart />
      </div>
    </div>
  );
}
