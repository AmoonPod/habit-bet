import NewHabitDialog from "./NewHabitDialog";
import HabitCard from "./HabitCard";
import HabitHeatmap from "./HabitHeatmap";
import ProgressChart from "./ProgressChart";
import DashboardLayout from "./DashboardLayout";
import StatsGrid from "./StatsGrid";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
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
    </DashboardLayout>
  );
}
