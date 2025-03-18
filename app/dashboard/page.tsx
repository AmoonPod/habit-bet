"use server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  CalendarDays,
  TrendingUp,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  BarChart3,
  Flame,
  Calendar,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getHabits, getHabitCheckins, getHabitStakes } from "./actions";
import HabitProgressBar from "@/components/dashboard/HabitProgressBar";
import {
  format,
  differenceInDays,
  parseISO,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isSameWeek,
  isSameMonth,
  differenceInWeeks,
  differenceInMonths,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import { Progress } from "@/components/ui/progress";
import WeeklyActivityChart from "@/components/dashboard/WeeklyActivityChart";
import CompletionTrendSection from "@/components/dashboard/CompletionTrendSection";
import NewHabitDialog from "@/components/dashboard/NewHabitDialog";
import StatusBadge from "@/components/dashboard/StatusBadge";

export default async function DashboardPage() {
  // Fetch data
  const habits = await getHabits();
  const stakes = await getHabitStakes();
  const allCheckins = await getHabitCheckins();

  // Separate active and failed habits
  const activeHabits = habits.filter((habit) => habit.status !== "failed");
  const failedHabits = habits.filter((habit) => habit.status === "failed");

  // Calculate overall statistics
  const totalStakedAmount = stakes.reduce(
    (total, stake) => total + (Number(stake.amount) || 0),
    0
  );
  const activeStakedAmount = stakes
    .filter((stake) =>
      habits.some(
        (habit) => habit.stake_uuid === stake.uuid && habit.status !== "failed"
      )
    )
    .reduce((total, stake) => total + (Number(stake.amount) || 0), 0);

  const lostStakedAmount = stakes
    .filter((stake) =>
      habits.some(
        (habit) => habit.stake_uuid === stake.uuid && habit.status === "failed"
      )
    )
    .reduce((total, stake) => total + (Number(stake.amount) || 0), 0);

  // Calculate completion rates for all habits
  const habitCompletionRates = habits.map((habit) => {
    const habitCheckins = allCheckins.filter(
      (checkin) => checkin.habit_uuid === habit.uuid
    );
    const totalCheckins = habitCheckins.length;
    const successfulCheckins = habitCheckins.filter(
      (c) => c.status === "true"
    ).length;

    // Calculate consistency rate
    const consistencyRate =
      totalCheckins > 0
        ? Math.round((successfulCheckins / totalCheckins) * 100)
        : 0;

    // Calculate streak and periods
    let periodsCompleted = 0;

    if (habit.start_date) {
      const startDate = parseISO(habit.start_date);
      const now = new Date();

      if (habit.frequency_unit === "day") {
        periodsCompleted = differenceInDays(now, startDate);
      } else if (habit.frequency_unit === "week") {
        periodsCompleted = differenceInWeeks(now, startDate);
      } else if (habit.frequency_unit === "month") {
        periodsCompleted = differenceInMonths(now, startDate);
      }
    }

    return {
      habitUuid: habit.uuid,
      habitName: habit.name,
      consistencyRate,
      totalCheckins,
      successfulCheckins,
      periodsCompleted,
      status: habit.status,
    };
  });

  // Calculate weekly activity data
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyActivity = daysOfWeek.map((day) => {
    const dayIndex = daysOfWeek.indexOf(day);
    const checkinsOnDay = allCheckins.filter(
      (checkin) => new Date(checkin.created_at).getDay() === dayIndex
    );
    return {
      day,
      total: checkinsOnDay.length,
      successful: checkinsOnDay.filter((c) => c.status === "true").length,
    };
  });

  // Get most productive day
  const mostProductiveDay = [...weeklyActivity].sort(
    (a, b) => b.successful - a.successful
  )[0];

  // Generate completion trend data for up to 1 year
  const generateCompletionTrendData = () => {
    // Create an array for 365 days
    const last365Days = new Array(365)
      .fill(0)
      .map((_, index) => {
        const date = new Date();
        date.setDate(date.getDate() - index);
        return format(date, "yyyy-MM-dd");
      })
      .reverse();

    // Map the dates to check-in data
    return last365Days.map((date) => {
      const checkinsOnDay = allCheckins.filter(
        (checkin) => format(new Date(checkin.created_at), "yyyy-MM-dd") === date
      );
      return {
        date,
        total: checkinsOnDay.length,
        completed: checkinsOnDay.filter((c) => c.status === "true").length,
      };
    });
  };

  const completionTrendData = generateCompletionTrendData();

  // Calculate habit with highest consistency
  const mostConsistentHabit = [...habitCompletionRates]
    .filter((h) => h.totalCheckins > 0)
    .sort((a, b) => b.consistencyRate - a.consistencyRate)[0];

  return (
    <div className="w-full p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your habits, monitor progress, and build consistency
          </p>
        </div>
        <NewHabitDialog />
      </div>

      {/* All Habits Table (moved to top) */}
      <div className="border rounded-lg shadow-sm bg-card">
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Your Habits</h2>
            <p className="text-sm text-muted-foreground">
              View and manage all your habits in one place
            </p>
          </div>
        </div>
        <div className="border-b">
          <div className="grid grid-cols-6 p-4 font-medium bg-muted/50">
            <div className="col-span-2">Habit</div>
            <div>Frequency</div>
            <div>Stake</div>
            <div>Progress</div>
            <div>Status</div>
          </div>
        </div>
        <div className="divide-y">
          {/* Active Habits First */}
          {activeHabits.map((habit) => {
            const habitCheckins = allCheckins.filter(
              (checkin) => checkin.habit_uuid === habit.uuid
            );
            const totalCheckins = habitCheckins.length;
            const successfulCheckins = habitCheckins.filter(
              (c) => c.status === "true"
            ).length;

            // Find matching stake
            const stake = stakes.find((s) => s.uuid === habit.stake_uuid);

            return (
              <Link
                key={habit.uuid}
                href={`/dashboard/${habit.slug}`}
                className="block hover:bg-muted/30 transition-colors"
              >
                <div className="grid grid-cols-6 p-4 items-center">
                  <div className="col-span-2 font-medium">{habit.name}</div>
                  <div>
                    {habit.frequency_value}x per {habit.frequency_unit}
                  </div>
                  <div>{stake ? `$${stake.amount}` : "No stake"}</div>
                  <div className="w-32">
                    <HabitProgressBar habit={habit} checkins={habitCheckins} />
                  </div>
                  <div>
                    <StatusBadge status="active" />
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Failed Habits Last */}
          {failedHabits.map((habit) => {
            const habitCheckins = allCheckins.filter(
              (checkin) => checkin.habit_uuid === habit.uuid
            );
            const totalCheckins = habitCheckins.length;
            const successfulCheckins = habitCheckins.filter(
              (c) => c.status === "true"
            ).length;

            // Find matching stake
            const stake = stakes.find((s) => s.uuid === habit.stake_uuid);

            return (
              <Link
                key={habit.uuid}
                href={`/dashboard/${habit.slug}`}
                className="block hover:bg-muted/30 transition-colors"
              >
                <div className="grid grid-cols-6 p-4 items-center bg-muted/20">
                  <div className="col-span-2 font-medium text-muted-foreground">
                    {habit.name}
                  </div>
                  <div className="text-muted-foreground">
                    {habit.frequency_value}x per {habit.frequency_unit}
                  </div>
                  <div className="text-muted-foreground">
                    {stake ? `$${stake.amount}` : "No stake"}
                  </div>
                  <div className="w-32">
                    <HabitProgressBar habit={habit} checkins={habitCheckins} />
                  </div>
                  <div>
                    <StatusBadge status="failed" />
                  </div>
                </div>
              </Link>
            );
          })}

          {habits.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                You don't have any habits yet. Create your first habit to start
                tracking your progress.
              </p>
              <Link href="/new-habit">
                <Button>Create Your First Habit</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Habits</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{habits.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeHabits.length} active, {failedHabits.length} failed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Amount at Stake
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalStakedAmount.toFixed(2)}
            </div>
            <div className="mt-1 h-1 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{
                  width: `${
                    (activeStakedAmount / Math.max(totalStakedAmount, 1)) * 100
                  }%`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ${activeStakedAmount.toFixed(2)} active, $
              {lostStakedAmount.toFixed(2)} lost
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Most Productive Day
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mostProductiveDay?.day || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {mostProductiveDay
                ? `${mostProductiveDay.successful} successful check-ins`
                : "No data yet"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Most Consistent Habit
            </CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">
              {mostConsistentHabit?.habitName || "N/A"}
            </div>
            {mostConsistentHabit && (
              <div className="flex items-center gap-1 mt-1">
                <Progress
                  value={mostConsistentHabit.consistencyRate}
                  className="h-1.5"
                />
                <span className="text-xs text-muted-foreground">
                  {mostConsistentHabit.consistencyRate}%
                </span>
              </div>
            )}
            {!mostConsistentHabit && (
              <p className="text-xs text-muted-foreground">
                No habits with check-ins yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      {habits.length > 0 && (
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
              <CardDescription>
                Your check-in pattern across days of the week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <WeeklyActivityChart data={weeklyActivity} />
              </div>
            </CardContent>
          </Card>

          {/* Completion trend section with period selector */}
          <CompletionTrendSection trendData={completionTrendData} />
        </div>
      )}
    </div>
  );
}
