"use client";

import { Suspense, useEffect, useState } from "react";
import {
  getHabitBySlug,
  getStakeByUuid,
  getHabitCheckins,
  getMissedCheckins,
} from "../actions";
import CheckInSection from "@/components/habit/CheckInSection";
import HabitHeader from "@/components/habit/HabitHeader";
import { calculateCurrentStreak } from "@/lib/habit-calculations";
import { calculateHabitProgress } from "@/lib/progress-calculation";
import CheckInsList from "@/components/habit/CheckInsList";
import HabitProgress from "@/components/habit/HabitProgress";
import FailedHabitPayment from "@/components/habit/FailedHabitPayment";
import {
  Trophy,
  Calendar,
  Target,
  Flame,
  Clock,
  Info,
  Activity,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  format,
  differenceInDays,
  parseISO,
  endOfWeek,
  endOfMonth,
  startOfDay,
  startOfWeek,
  startOfMonth,
} from "date-fns";
import MissedCheckInsAlert from "@/components/habit/MissedCheckInsAlert";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";

// Types
type Habit = {
  uuid: string;
  name: string;
  slug: string;
  user_uuid: string;
  stake_uuid: string | null;
  icon: string | null;
  color: string | null;
  frequency_value: number;
  frequency_unit: string;
  duration_value: number | null;
  duration_unit: string | null;
  verification_type: string | null;
  start_date: string | null;
  end_date: string | null;
  status: "active" | "failed" | "completed" | null;
  is_public: boolean | null;
  created_at: string;
};

type Stake = {
  uuid: string;
  amount: number | null;
  status: "active" | "completed" | "pending" | "forfeited" | "cancelled" | null;
  payment_status: "failed" | "pending" | "processing" | "paid" | null;
  transaction_date: string | null;
  created_at: string;
};

type Checkin = {
  uuid: string;
  habit_uuid: string | null;
  created_at: string;
  completed: boolean;
  status: string | null;
  proof_type: string | null;
  proof_content: string | null;
  proof_verified: boolean | null;
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

// Loading skeletons
function HabitHeaderSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-1/3 bg-muted rounded animate-pulse" />
      <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
    </div>
  );
}

function CheckInSectionSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="h-6 w-1/3 bg-muted rounded mb-2" />
        <div className="h-4 w-1/2 bg-muted rounded" />
      </CardHeader>
      <CardContent>
        <div className="h-[200px] bg-muted/30 rounded" />
      </CardContent>
    </Card>
  );
}

// Main page component
export default function HabitPage({ params }: { params: { slug: string } }) {
  // For the current version of NextJS, params can still be accessed directly
  // In future, you'll need to unwrap with React.use()
  const slug = params.slug;

  const [habit, setHabit] = useState<Habit | null>(null);
  const [stake, setStake] = useState<Stake | null>(null);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [missedCheckins, setMissedCheckins] = useState<MissedCheckin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isBackgroundRefreshing, setIsBackgroundRefreshing] = useState(false);
  const [initialFetch, setInitialFetch] = useState(true);

  const refreshData = () => {
    // Instead of setting loading=true which causes the page to show skeleton,
    // we set a background refresh state
    setIsBackgroundRefreshing(true);

    // Increment the refresh key to trigger a data reload
    setRefreshKey((prev) => prev + 1);
  };

  // Separate useEffect for tracking the initial fetch
  useEffect(() => {
    // Mark that we've completed the initial fetch cycle
    if (initialFetch && !loading) {
      setInitialFetch(false);
    }
  }, [loading, initialFetch]);

  useEffect(() => {
    let isMounted = true;

    async function fetchHabitData() {
      // Only show full loading state on initial load
      if (initialFetch && isMounted) {
        setLoading(true);
      }

      try {
        const supabase = createClient();

        // Fetch habit data
        const { data: habitData, error } = await supabase
          .from("habits")
          .select("*")
          .eq("slug", slug)
          .single();

        // If component unmounted during fetch, don't proceed
        if (!isMounted) return;

        if (error) {
          console.error("Error fetching habit:", error);
          if (isMounted) {
            setLoading(false);
            setIsBackgroundRefreshing(false);
          }
          return;
        }

        if (habitData) {
          // Ensure required fields are present
          const habitWithRequiredFields = {
            ...habitData,
            name: habitData.name || "Untitled Habit",
            slug: habitData.slug || "",
            user_uuid: habitData.user_uuid || "",
            frequency_value: habitData.frequency_value || 1,
            frequency_unit: habitData.frequency_unit || "day",
            created_at: habitData.created_at || new Date().toISOString(),
          } as Habit;

          if (isMounted) {
            setHabit(habitWithRequiredFields);
          }

          // Fetch stake if exists
          if (habitData.stake_uuid) {
            const { data: stakeData } = await supabase
              .from("habit_stakes")
              .select("*")
              .eq("uuid", habitData.stake_uuid)
              .single();

            // If component unmounted during fetch, don't proceed
            if (!isMounted) return;

            if (stakeData) {
              // Ensure created_at is present
              const stakeWithCreatedAt = {
                ...stakeData,
                created_at: stakeData.created_at || new Date().toISOString(),
              } as Stake;

              if (isMounted) {
                setStake(stakeWithCreatedAt);
              }
            }
          }

          // Clear previous data only when fetching new data
          if (isMounted && isBackgroundRefreshing) {
            setCheckins([]);
            setMissedCheckins([]);
          }

          // Fetch check-ins
          const { data: checkinsData } = await supabase
            .from("habit_checkins")
            .select("*")
            .eq("habit_uuid", habitData.uuid)
            .order("created_at", { ascending: false });

          // If component unmounted during fetch, don't proceed
          if (!isMounted) return;

          if (checkinsData) {
            // Ensure proof_content is not undefined
            const checkinsWithProofContent = checkinsData.map(
              (checkin: any) => ({
                ...checkin,
                proof_content: checkin.proof_content || null,
              })
            ) as Checkin[];

            if (isMounted) {
              setCheckins(checkinsWithProofContent);
            }
          }

          // Fetch missed check-ins
          const { data: missedCheckinsData } = await supabase
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
            .eq("habit_uuid", habitData.uuid)
            .eq("status", "pending");

          // If component unmounted during fetch, don't proceed
          if (!isMounted) return;

          if (missedCheckinsData && isMounted) {
            setMissedCheckins(missedCheckinsData as MissedCheckin[]);
          }
        }
      } catch (error) {
        console.error("Error in data fetching:", error);
      } finally {
        // Reset loading states
        if (isMounted) {
          setLoading(false);
          setIsBackgroundRefreshing(false);
        }
      }
    }

    fetchHabitData();

    return () => {
      isMounted = false;
    };
  }, [slug, refreshKey, initialFetch, isBackgroundRefreshing]);

  // If initial loading, show skeleton
  if (loading) {
    return (
      <div className="p-3 md:p-6 space-y-4 md:space-y-6 w-full">
        <Suspense fallback={<HabitHeaderSkeleton />}>
          <HabitHeaderSkeleton />
        </Suspense>
        <Suspense fallback={<CheckInSectionSkeleton />}>
          <CheckInSectionSkeleton />
        </Suspense>
      </div>
    );
  }

  if (!habit) {
    return <div>Habit not found</div>;
  }

  const hasCheckins = checkins.length > 0;
  const isFailed = habit.status === "failed";

  // Calculate stats
  const currentStreak = calculateCurrentStreak(checkins, habit);

  // Calculate success rate
  const successfulCheckins = checkins.filter((c) => c.status === "true").length;

  // Calculate overall completion progress
  let totalRequiredCheckins = 0;
  let completionProgress = 0;

  if (habit.frequency_value && habit.duration_value) {
    const { progressPercentage, totalRequiredCheckins: requiredCheckins } =
      calculateHabitProgress(habit, checkins);

    completionProgress = progressPercentage;
    totalRequiredCheckins = requiredCheckins;
  }

  // Get unique dates with check-ins
  const uniqueCheckInDates = new Set();
  checkins.forEach((checkin) => {
    const date = format(new Date(checkin.created_at), "yyyy-MM-dd");
    uniqueCheckInDates.add(date);
  });

  // The total number of unique days with activity
  const daysActive = uniqueCheckInDates.size;

  // Calculate most consistent day
  const dayCount = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  checkins.forEach((checkin) => {
    const day = new Date(checkin.created_at).getDay();
    dayCount[day as keyof typeof dayCount]++;
  });

  // Find the day with the most check-ins
  let mostConsistentDayIndex = 0;
  let maxCount = 0;

  Object.keys(dayCount).forEach((dayKey) => {
    const day = parseInt(dayKey);
    if (dayCount[day as keyof typeof dayCount] > maxCount) {
      maxCount = dayCount[day as keyof typeof dayCount];
      mostConsistentDayIndex = day;
    }
  });

  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const mostConsistentDay = weekdays[mostConsistentDayIndex];

  // Calculate check-ins remaining for this period
  const frequencyValue = habit.frequency_value || 1;

  // Get check-ins for the current period
  const now = new Date();
  let periodStart: Date;
  let periodEnd: Date;

  if (habit.frequency_unit === "day") {
    periodStart = startOfDay(now);
    periodEnd = endOfWeek(now);
  } else if (habit.frequency_unit === "week") {
    periodStart = startOfWeek(now);
    periodEnd = endOfWeek(now);
  } else {
    periodStart = startOfMonth(now);
    periodEnd = endOfMonth(now);
  }

  const currentPeriodCheckins = checkins.filter((c) => {
    const checkinDate = new Date(c.created_at);
    return checkinDate >= periodStart && checkinDate <= periodEnd;
  });

  const checkInsRemaining = Math.max(
    0,
    frequencyValue - currentPeriodCheckins.length
  );

  // Calculate deadline text
  const getDeadlineText = () => {
    if (habit.frequency_unit === "day") {
      return "today";
    } else if (habit.frequency_unit === "week") {
      const weekEnd = endOfWeek(now);
      const daysRemaining = differenceInDays(weekEnd, now);
      return daysRemaining === 0
        ? "today"
        : `in ${daysRemaining} days (by Sunday)`;
    } else {
      const monthEnd = endOfMonth(now);
      const daysRemaining = differenceInDays(monthEnd, now);
      return daysRemaining === 0
        ? "today"
        : `in ${daysRemaining} days (by end of month)`;
    }
  };

  const deadlineText = getDeadlineText();

  // Calculate progress text
  const getProgressText = () => {
    if (checkInsRemaining === 0) {
      return `All ${frequencyValue} check-ins complete for this ${habit.frequency_unit}!`;
    }

    if (habit.frequency_unit === "day") {
      return `${
        frequencyValue - checkInsRemaining
      }/${frequencyValue} check-ins completed today`;
    } else if (habit.frequency_unit === "week") {
      return `${
        frequencyValue - checkInsRemaining
      }/${frequencyValue} check-ins completed this week`;
    } else {
      return `${
        frequencyValue - checkInsRemaining
      }/${frequencyValue} check-ins completed this month`;
    }
  };

  const progressText = getProgressText();

  // Render content with transparent overlay during background refresh
  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 w-full relative">
      {isBackgroundRefreshing && (
        <div className="fixed top-4 right-4 bg-primary/10 p-2 rounded-full z-50">
          <div className="loading-spinner w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <Suspense fallback={<HabitHeaderSkeleton />}>
        <HabitHeader habit={habit} hasCheckins={hasCheckins} />
      </Suspense>

      {missedCheckins.length > 0 && !isFailed && (
        <MissedCheckInsAlert
          missedCheckins={missedCheckins as any}
          forHabitPage={true}
          onActionComplete={refreshData}
        />
      )}

      {isFailed && (
        <>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-4 md:h-5 w-4 md:w-5 text-red-500 mr-2" />
              <h3 className="font-medium text-sm md:text-base text-red-800">
                This habit has failed
              </h3>
            </div>
            <p className="text-xs md:text-sm text-red-700 mt-1">
              You missed a required check-in. This habit can no longer be edited
              or deleted.
            </p>
          </div>

          {stake && (
            <div className="mb-4 md:mb-6">
              <FailedHabitPayment habit={habit} stake={stake} />
            </div>
          )}
        </>
      )}

      {!isFailed && (
        <Suspense fallback={<CheckInSectionSkeleton />}>
          <div
            className="mb-4 md:mb-6 bg-card rounded-lg border shadow-sm overflow-hidden"
            id="check-in-section"
          >
            <div className="bg-muted/30 p-3 md:p-4 border-b">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold line-clamp-1">
                    {habit.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {progressText}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  Due {deadlineText}
                </div>
              </div>
            </div>

            <div className="p-3 md:p-4">
              {stake ? (
                <CheckInSection
                  habit={habit}
                  stake={stake}
                  onCheckInComplete={refreshData}
                />
              ) : (
                <div className="text-center text-sm text-muted-foreground">
                  No stake associated with this habit
                </div>
              )}
            </div>
          </div>
        </Suspense>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <Suspense fallback={<CheckInSectionSkeleton />}>
          <Card className="mb-4 md:mb-6">
            <CardHeader className="pb-2 md:pb-3 px-4 py-3 md:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base md:text-lg font-semibold">
                  Habit Performance
                </CardTitle>
                <Activity className="h-4 md:h-5 w-4 md:w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mt-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 md:h-5 w-4 md:w-5 text-orange-500" />
                    <span className="text-xl md:text-2xl font-bold">
                      {currentStreak}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    {habit.frequency_unit === "day"
                      ? "Days streak"
                      : habit.frequency_unit === "week"
                      ? "Weeks streak"
                      : "Months streak"}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 md:h-5 w-4 md:w-5 text-blue-500" />
                    <span className="text-xl md:text-2xl font-bold">
                      {completionProgress}%
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    Completion progress
                  </p>
                  <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${completionProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {successfulCheckins}/{totalRequiredCheckins} required
                    check-ins
                  </p>
                </div>
              </div>

              <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Habit Insights</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Target className="h-4 w-4 text-muted-foreground mt-0.5 mr-2 shrink-0" />
                    <div>
                      <p className="text-xs md:text-sm">
                        <span className="font-medium">Days active:</span>{" "}
                        {daysActive} days
                      </p>
                    </div>
                  </li>
                  {hasCheckins && (
                    <li className="flex items-start">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 mr-2 shrink-0" />
                      <div>
                        <p className="text-xs md:text-sm break-words">
                          <span className="font-medium">
                            Most consistent day:
                          </span>{" "}
                          {mostConsistentDay}
                        </p>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </Suspense>

        <Suspense fallback={<CheckInSectionSkeleton />}>
          <Card className="mb-4 md:mb-6">
            <CardHeader className="pb-2 md:pb-3 px-4 py-3 md:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base md:text-lg font-semibold">
                  Habit Details
                </CardTitle>
                <Info className="h-4 md:h-5 w-4 md:w-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
              <div className="mt-4">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5 mr-2 shrink-0" />
                    <div>
                      <p className="text-xs md:text-sm break-words">
                        <span className="font-medium">Frequency:</span>{" "}
                        {habit.frequency_value} time(s) per{" "}
                        {habit.frequency_unit}
                      </p>
                    </div>
                  </li>
                  {habit.duration_value && habit.duration_unit && (
                    <li className="flex items-start">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 mr-2 shrink-0" />
                      <div>
                        <p className="text-xs md:text-sm break-words">
                          <span className="font-medium">Duration:</span>{" "}
                          {habit.duration_value} {habit.duration_unit}(s)
                        </p>
                      </div>
                    </li>
                  )}
                  {/* Start Date */}
                  <li className="flex items-start">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 mr-2 shrink-0" />
                    <div>
                      <p className="text-xs md:text-sm break-words">
                        <span className="font-medium">Start date:</span>{" "}
                        {habit.start_date
                          ? format(parseISO(habit.start_date), "MMM d, yyyy")
                          : format(new Date(habit.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  </li>
                  {/* End Date */}
                  <li className="flex items-start">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 mr-2 shrink-0" />
                    <div>
                      <p className="text-xs md:text-sm break-words">
                        <span className="font-medium">End date:</span>{" "}
                        {habit.end_date
                          ? format(parseISO(habit.end_date), "MMM d, yyyy")
                          : "Not specified"}
                      </p>
                    </div>
                  </li>
                  {stake && (
                    <li className="flex items-start">
                      <Trophy className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 shrink-0" />
                      <div>
                        <p className="text-xs md:text-sm break-words">
                          <span className="font-medium">At stake:</span> $
                          {stake.amount}
                        </p>
                      </div>
                    </li>
                  )}
                </ul>
              </div>

              <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Period Progress</h4>

                <div className="h-2 w-full bg-muted rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{
                      width: `${Math.round(
                        ((frequencyValue - checkInsRemaining) /
                          frequencyValue) *
                          100
                      )}%`,
                    }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{frequencyValue - checkInsRemaining} completed</span>
                  <span>{checkInsRemaining} remaining</span>
                </div>

                {checkInsRemaining > 0 ? (
                  <p className="text-xs md:text-sm mt-3 text-amber-600 flex items-start gap-1">
                    <Clock className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>
                      Complete {checkInsRemaining} more check-in
                      {checkInsRemaining > 1 ? "s" : ""} by{" "}
                      {habit.frequency_unit === "day"
                        ? "the end of today"
                        : habit.frequency_unit === "week"
                        ? "Sunday"
                        : "the end of the month"}{" "}
                      to avoid failing this habit.
                    </span>
                  </p>
                ) : (
                  <p className="text-xs md:text-sm mt-3 text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 shrink-0" />
                    <span>
                      All check-ins complete for this {habit.frequency_unit}!
                    </span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </Suspense>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <Suspense fallback={<CheckInSectionSkeleton />}>
          <HabitProgress habit={habit} checkins={checkins} />
        </Suspense>

        <Suspense fallback={<CheckInSectionSkeleton />}>
          <CheckInsList checkins={checkins} currentStreak={currentStreak} />
        </Suspense>
      </div>
    </div>
  );
}
