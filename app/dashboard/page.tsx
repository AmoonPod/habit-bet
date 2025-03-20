"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Target, DollarSign, Flame, Calendar } from "lucide-react";
import HabitProgressBar from "@/components/dashboard/HabitProgressBar";
import {
  format,
  differenceInDays,
  parseISO,
  differenceInWeeks,
  differenceInMonths,
} from "date-fns";
import { Progress } from "@/components/ui/progress";
import WeeklyActivityChart from "@/components/dashboard/WeeklyActivityChart";
import CompletionTrendSection from "@/components/dashboard/CompletionTrendSection";
import NewHabitDialog from "@/components/dashboard/NewHabitDialog";
import StatusBadge from "@/components/dashboard/StatusBadge";
import ResponsiveHabitRow from "@/components/dashboard/ResponsiveHabitRow";
import MissedCheckInsAlert from "@/components/habit/MissedCheckInsAlert";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/ui/use-toast";

// Define types
type Habit = {
  uuid: string;
  name: string | null;
  slug: string | null;
  user_uuid: string | null;
  stake_uuid: string | null;
  icon: string | null;
  color: string | null;
  frequency_value: number | null;
  frequency_unit: string | null;
  duration_value: number | null;
  duration_unit: string | null;
  verification_type: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
  is_public: boolean | null;
  created_at?: string;
};

type Stake = {
  uuid: string;
  amount: number | null;
  status: string | null;
  payment_status: string | null;
  transaction_date?: string | null;
  created_at?: string;
};

type Checkin = {
  uuid: string;
  habit_uuid: string | null;
  created_at: string;
  completed: boolean;
  status: string | null;
  proof_type: string | null;
  proof_content?: string | null;
  proof_verified?: boolean | null;
};

type MissedCheckin = {
  uuid: string;
  habit_uuid: string | null;
  period_start: string;
  period_end: string;
  grace_period_end: string;
  required_checkins: number;
  actual_checkins: number;
  status: string;
  created_at?: string | null;
  resolved_at?: string | null;
  notification_sent?: boolean | null;
  habits: {
    name: string | null;
    frequency_unit: string | null;
    frequency_value: number | null;
    slug?: string | null;
  } | null;
};

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isBackgroundRefreshing, setIsBackgroundRefreshing] = useState(false);
  const { toast } = useToast();

  const refreshData = () => {
    // Use background refreshing instead of a full reload
    setIsBackgroundRefreshing(true);

    // Trigger re-fetch via refresh key
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="w-full p-3 md:p-8 space-y-4 md:space-y-6 relative">
      {isBackgroundRefreshing && (
        <div className="fixed top-4 right-4 bg-primary/10 p-2 rounded-full z-50">
          <div className="loading-spinner w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your habits, monitor progress, and build consistency
          </p>
        </div>
        <NewHabitDialog />
      </div>

      <Suspense fallback={<MissedCheckinsLoader />}>
        <MissedCheckinsSection
          refreshKey={refreshKey}
          refreshData={refreshData}
          setIsBackgroundRefreshing={setIsBackgroundRefreshing}
        />
      </Suspense>

      <Suspense fallback={<HabitsTableSkeleton />}>
        <HabitsTable
          refreshKey={refreshKey}
          refreshData={refreshData}
          setIsBackgroundRefreshing={setIsBackgroundRefreshing}
        />
      </Suspense>

      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards
          refreshKey={refreshKey}
          refreshData={refreshData}
          setIsBackgroundRefreshing={setIsBackgroundRefreshing}
        />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        <Suspense
          fallback={
            <ChartSkeleton
              title="Weekly Activity"
              description="Your check-in pattern across days of the week"
            />
          }
        >
          <WeeklyActivitySection
            refreshKey={refreshKey}
            refreshData={refreshData}
            setIsBackgroundRefreshing={setIsBackgroundRefreshing}
          />
        </Suspense>

        <Suspense
          fallback={
            <ChartSkeleton
              title="Completion Trend"
              description="Your habit completion trend over time"
            />
          }
        >
          <CompletionTrendWrapper
            refreshKey={refreshKey}
            refreshData={refreshData}
            setIsBackgroundRefreshing={setIsBackgroundRefreshing}
          />
        </Suspense>
      </div>
    </div>
  );
}

// MissedCheckins Section
function MissedCheckinsLoader() {
  return (
    <div className="border rounded-lg shadow-sm p-4 animate-pulse bg-card">
      <div className="h-6 w-1/3 bg-muted rounded mb-2"></div>
      <div className="h-4 w-1/2 bg-muted rounded"></div>
    </div>
  );
}

function MissedCheckinsSection({
  refreshKey,
  refreshData,
  setIsBackgroundRefreshing,
}: {
  refreshKey: number;
  refreshData: () => void;
  setIsBackgroundRefreshing: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [missedCheckins, setMissedCheckins] = useState<MissedCheckin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchMissedCheckins() {
      try {
        // Reset data at the beginning of a refresh
        if (isMounted) {
          setMissedCheckins([]);
        }

        const supabase = createClient();
        const now = new Date();

        const { data, error } = await supabase
          .from("missed_checkins")
          .select(
            `
            *,
            habits:habit_uuid (
              name,
              frequency_unit,
              frequency_value,
              slug
            )
          `
          )
          .eq("status", "pending")
          .gte("grace_period_end", now.toISOString());

        if (!isMounted) return;

        if (error) {
          console.error("Error fetching missed check-ins:", error);
          if (isMounted) {
            setMissedCheckins([]);
          }
        } else if (isMounted) {
          // Type assertion to convert from Supabase types to our MissedCheckin type
          setMissedCheckins(data as unknown as MissedCheckin[]);
        }
      } catch (error) {
        console.error("Error in fetchMissedCheckins:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
          setIsBackgroundRefreshing(false);
        }
      }
    }

    fetchMissedCheckins();

    return () => {
      isMounted = false;
    };
  }, [refreshKey, setIsBackgroundRefreshing]);

  if (loading) return <MissedCheckinsLoader />;
  if (missedCheckins.length === 0) return null;

  // Type assertion to handle component prop type expectations
  return (
    <MissedCheckInsAlert
      missedCheckins={missedCheckins as any}
      onActionComplete={refreshData}
    />
  );
}

// Habits Table
function HabitsTableSkeleton() {
  return (
    <div className="border rounded-lg shadow-sm bg-card overflow-hidden">
      <div className="p-3 md:p-4 border-b flex justify-between items-center">
        <div>
          <h2 className="text-base md:text-xl font-semibold">Your Habits</h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            View and manage all your habits in one place
          </p>
        </div>
      </div>
      <div className="border-b hidden md:block">
        <div className="grid grid-cols-6 p-4 font-medium bg-muted/50">
          <div className="col-span-2">Habit</div>
          <div>Frequency</div>
          <div>Stake</div>
          <div>Progress</div>
          <div>Status</div>
        </div>
      </div>
      <div className="divide-y">
        {Array(3)
          .fill(0)
          .map((_, index) => (
            <div key={index} className="p-4 animate-pulse">
              <div className="hidden md:grid md:grid-cols-6 items-center">
                <div className="col-span-2">
                  <div className="h-5 bg-muted rounded w-3/4"></div>
                </div>
                <div>
                  <div className="h-5 bg-muted rounded w-1/2"></div>
                </div>
                <div>
                  <div className="h-5 bg-muted rounded w-1/3"></div>
                </div>
                <div className="pr-4">
                  <div className="h-2 bg-muted rounded w-full"></div>
                </div>
                <div>
                  <div className="h-5 bg-muted rounded w-16"></div>
                </div>
              </div>
              <div className="md:hidden">
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="flex justify-between mb-2">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                </div>
                <div className="h-2 bg-muted rounded w-full"></div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function HabitsTable({
  refreshKey,
  refreshData,
  setIsBackgroundRefreshing,
}: {
  refreshKey: number;
  refreshData: () => void;
  setIsBackgroundRefreshing: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stakes, setStakes] = useState<Stake[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        // Reset data at the beginning of the fetch
        if (isMounted) {
          setHabits([]);
          setStakes([]);
          setCheckins([]);
        }

        const supabase = createClient();

        // Fetch habits
        const { data: habitsData, error: habitsError } = await supabase
          .from("habits")
          .select("*");

        if (!isMounted) return;

        if (habitsError) {
          console.error("Error fetching habits:", habitsError);
        } else if (isMounted) {
          setHabits(habitsData as unknown as Habit[]);
        }

        // Fetch stakes
        const { data: stakesData, error: stakesError } = await supabase
          .from("habit_stakes")
          .select("*");

        if (!isMounted) return;

        if (stakesError) {
          console.error("Error fetching stakes:", stakesError);
        } else if (isMounted) {
          setStakes(stakesData as unknown as Stake[]);
        }

        // Fetch checkins
        const { data: checkinsData, error: checkinsError } = await supabase
          .from("habit_checkins")
          .select("*")
          .order("created_at", { ascending: false });

        if (!isMounted) return;

        if (checkinsError) {
          console.error("Error fetching checkins:", checkinsError);
        } else if (isMounted) {
          setCheckins(checkinsData as unknown as Checkin[]);
        }
      } catch (error) {
        console.error("Error in fetchData:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
          setIsBackgroundRefreshing(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [refreshKey, setIsBackgroundRefreshing]);

  if (loading) return <HabitsTableSkeleton />;

  // Separate active and failed habits
  const activeHabits = habits.filter((habit) => habit.status !== "failed");
  const failedHabits = habits.filter((habit) => habit.status === "failed");

  return (
    <div className="border rounded-lg shadow-sm bg-card overflow-hidden">
      <div className="p-3 md:p-4 border-b flex justify-between items-center">
        <div>
          <h2 className="text-base md:text-xl font-semibold">Your Habits</h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            View and manage all your habits in one place
          </p>
        </div>
      </div>

      {/* Display headers only on larger screens */}
      <div className="border-b hidden md:block">
        <div className="grid grid-cols-6 p-4 font-medium bg-muted/50">
          <div className="col-span-2">Habit</div>
          <div>Frequency</div>
          <div>Stake</div>
          <div>Progress</div>
          <div>Status</div>
        </div>
      </div>

      {/* Responsive list of habits */}
      <div className="divide-y">
        {/* Active Habits First */}
        {activeHabits.map((habit) => {
          const habitCheckins = checkins.filter(
            (checkin) => checkin.habit_uuid === habit.uuid
          );
          // Find matching stake
          const stake = stakes.find((s) => s.uuid === habit.stake_uuid);

          return (
            <div key={habit.uuid}>
              {/* Desktop view */}
              <Link
                href={`/dashboard/${habit.slug}`}
                className="hidden md:block hover:bg-muted/30 transition-colors"
              >
                <div className="grid grid-cols-6 p-4 items-center">
                  <div className="col-span-2 font-medium truncate">
                    {habit.name}
                  </div>
                  <div className="whitespace-nowrap">
                    {habit.frequency_value}x per {habit.frequency_unit}
                  </div>
                  <div className="whitespace-nowrap">
                    {stake ? `$${stake.amount}` : "No stake"}
                  </div>
                  <div className="pr-4">
                    <HabitProgressBar
                      habit={habit as any}
                      checkins={habitCheckins as any}
                    />
                  </div>
                  <div>
                    <StatusBadge status="active" />
                  </div>
                </div>
              </Link>

              {/* Mobile view */}
              <div className="md:hidden">
                <ResponsiveHabitRow
                  habit={habit as any}
                  stake={stake as any}
                  checkins={habitCheckins as any}
                  status="active"
                />
              </div>
            </div>
          );
        })}

        {/* Failed Habits Last */}
        {failedHabits.map((habit) => {
          const habitCheckins = checkins.filter(
            (checkin) => checkin.habit_uuid === habit.uuid
          );
          const totalCheckins = habitCheckins.length;
          const successfulCheckins = habitCheckins.filter(
            (c) => c.status === "true"
          ).length;

          // Find matching stake
          const stake = stakes.find((s) => s.uuid === habit.stake_uuid);

          return (
            <div key={habit.uuid}>
              {/* Desktop view for failed habits */}
              <Link
                href={`/dashboard/${habit.slug}`}
                className="hidden md:block hover:bg-muted/30 transition-colors"
              >
                <div className="grid grid-cols-6 p-4 items-center bg-muted/20">
                  <div className="col-span-2 font-medium text-muted-foreground truncate">
                    {habit.name}
                  </div>
                  <div className="text-muted-foreground whitespace-nowrap">
                    {habit.frequency_value}x per {habit.frequency_unit}
                  </div>
                  <div className="text-muted-foreground whitespace-nowrap">
                    {stake ? `$${stake.amount}` : "No stake"}
                  </div>
                  <div className="pr-4">
                    <HabitProgressBar
                      habit={habit as any}
                      checkins={habitCheckins as any}
                    />
                  </div>
                  <div>
                    <StatusBadge status="failed" />
                  </div>
                </div>
              </Link>

              {/* Mobile view */}
              <div className="md:hidden">
                <ResponsiveHabitRow
                  habit={habit as any}
                  stake={stake as any}
                  checkins={habitCheckins as any}
                  status="failed"
                />
              </div>
            </div>
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
  );
}

// Stats Cards
function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {Array(4)
        .fill(0)
        .map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="h-5 w-1/2 bg-muted rounded"></div>
              <div className="h-4 w-4 bg-muted rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-1/3 bg-muted rounded mb-2"></div>
              <div className="h-4 w-2/3 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}

function StatsCards({
  refreshKey,
  refreshData,
  setIsBackgroundRefreshing,
}: {
  refreshKey: number;
  refreshData: () => void;
  setIsBackgroundRefreshing: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stakes, setStakes] = useState<Stake[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Reset data before fetching
      setHabits([]);
      setStakes([]);
      setCheckins([]);

      const supabase = createClient();

      // Fetch habits
      const { data: habitsData, error: habitsError } = await supabase
        .from("habits")
        .select("*");

      if (habitsError) {
        console.error("Error fetching habits:", habitsError);
      } else {
        setHabits(habitsData as unknown as Habit[]);
      }

      // Fetch stakes
      const { data: stakesData, error: stakesError } = await supabase
        .from("habit_stakes")
        .select("*");

      if (stakesError) {
        console.error("Error fetching stakes:", stakesError);
      } else {
        setStakes(stakesData as unknown as Stake[]);
      }

      // Fetch checkins
      const { data: checkinsData, error: checkinsError } = await supabase
        .from("habit_checkins")
        .select("*")
        .order("created_at", { ascending: false });

      if (checkinsError) {
        console.error("Error fetching checkins:", checkinsError);
      } else {
        setCheckins(checkinsData as unknown as Checkin[]);
      }

      setLoading(false);
      setIsBackgroundRefreshing(false);
    }

    fetchData();
  }, [refreshKey, setIsBackgroundRefreshing]);

  if (loading) return <StatsCardsSkeleton />;

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

  // Calculate weekly activity data
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyActivity = daysOfWeek.map((day) => {
    const dayIndex = daysOfWeek.indexOf(day);
    const checkinsOnDay = checkins.filter(
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

  // Calculate habit with highest consistency
  const habitCompletionRates = habits.map((habit) => {
    const habitCheckins = checkins.filter(
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

  const mostConsistentHabit = [...habitCompletionRates]
    .filter((h) => h.totalCheckins > 0)
    .sort((a, b) => b.consistencyRate - a.consistencyRate)[0];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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
  );
}

// Charts
function ChartSkeleton({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="col-span-1 animate-pulse">
      <CardHeader>
        <div className="h-6 w-1/3 bg-muted rounded mb-2"></div>
        <div className="h-4 w-2/3 bg-muted rounded"></div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] bg-muted/30 rounded"></div>
      </CardContent>
    </Card>
  );
}

function WeeklyActivitySection({
  refreshKey,
  refreshData,
  setIsBackgroundRefreshing,
}: {
  refreshKey: number;
  refreshData: () => void;
  setIsBackgroundRefreshing: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [weeklyActivity, setWeeklyActivity] = useState<
    { day: string; total: number; successful: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCheckins() {
      // Reset data before fetching
      setWeeklyActivity([]);

      const supabase = createClient();

      const { data: checkinsData, error } = await supabase
        .from("habit_checkins")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching checkins:", error);
        return;
      }

      // Calculate weekly activity data
      const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const weeklyActivityData = daysOfWeek.map((day) => {
        const dayIndex = daysOfWeek.indexOf(day);
        const checkinsOnDay = (checkinsData as any[]).filter(
          (checkin) => new Date(checkin.created_at).getDay() === dayIndex
        );
        return {
          day,
          total: checkinsOnDay.length,
          successful: checkinsOnDay.filter((c) => c.status === "true").length,
        };
      });

      setWeeklyActivity(weeklyActivityData);
      setLoading(false);
      setIsBackgroundRefreshing(false);
    }

    fetchCheckins();
  }, [refreshKey, setIsBackgroundRefreshing]);

  if (loading) {
    return (
      <ChartSkeleton
        title="Weekly Activity"
        description="Your check-in pattern across days of the week"
      />
    );
  }

  return (
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
  );
}

function CompletionTrendWrapper({
  refreshKey,
  refreshData,
  setIsBackgroundRefreshing,
}: {
  refreshKey: number;
  refreshData: () => void;
  setIsBackgroundRefreshing: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [trendData, setTrendData] = useState<
    { date: string; total: number; completed: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCheckins() {
      // Reset data before fetching
      setTrendData([]);

      const supabase = createClient();

      const { data: checkinsData, error } = await supabase
        .from("habit_checkins")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching checkins:", error);
        return;
      }

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
          const checkinsOnDay = (checkinsData as any[]).filter(
            (checkin) =>
              format(new Date(checkin.created_at), "yyyy-MM-dd") === date
          );
          return {
            date,
            total: checkinsOnDay.length,
            completed: checkinsOnDay.filter((c) => c.status === "true").length,
          };
        });
      };

      setTrendData(generateCompletionTrendData());
      setLoading(false);
      setIsBackgroundRefreshing(false);
    }

    fetchCheckins();
  }, [refreshKey, setIsBackgroundRefreshing]);

  if (loading) {
    return (
      <ChartSkeleton
        title="Completion Trend"
        description="Your habit completion trend over time"
      />
    );
  }

  return <CompletionTrendSection trendData={trendData} />;
}
