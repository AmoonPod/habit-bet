import { getHabitBySlug, getStakeByUuid, getHabitCheckins } from "../actions";
import { Tables } from "@/supabase/models/database.types";
import CheckInSection from "@/components/habit/CheckInSection";
import HabitHeader from "@/components/habit/HabitHeader";
import {
  calculateCurrentStreak,
  calculateNextCheckInDate,
} from "@/lib/habit-calculations";
import MissingCheckInsCard from "@/components/habit/MissingCheckInsCard";
import CheckInsList from "@/components/habit/CheckInsList";
import HabitProgress from "@/components/habit/HabitProgress";
import FirstCheckInButton from "@/components/habit/FirstCheckInButton";
import {
  Trophy,
  Calendar,
  Target,
  Flame,
  Clock,
  Info,
  Activity,
  AlertCircle,
} from "lucide-react";
import {
  format,
  differenceInDays,
  parseISO,
  isAfter,
  endOfWeek,
  endOfMonth,
  endOfDay,
  startOfDay,
} from "date-fns";

export default async function HabitPage({
  params,
}: {
  params: { slug: string };
}) {
  const habit = await getHabitBySlug(params.slug);
  if (!habit) {
    return <div>Habit not found</div>;
  }

  // Get the stake
  const stake = habit.stake_uuid
    ? await getStakeByUuid(habit.stake_uuid)
    : null;

  // Get check-ins
  const allCheckins = await getHabitCheckins();
  const habitCheckins = allCheckins.filter(
    (checkin) => checkin.habit_uuid === habit.uuid
  );
  const hasCheckins = habitCheckins.length > 0;

  // Calculate stats
  const currentStreak = calculateCurrentStreak(habitCheckins, habit);
  const nextCheckInDate = calculateNextCheckInDate(habit, habitCheckins);

  // Calculate success rate
  const successfulCheckins = habitCheckins.filter(
    (c) => c.status === "true"
  ).length;
  const totalCheckins = habitCheckins.length;
  const consistencyRate =
    totalCheckins > 0
      ? Math.round((successfulCheckins / totalCheckins) * 100)
      : 0;

  // Calculate days active
  const daysSinceStart = habit.start_date
    ? differenceInDays(new Date(), parseISO(habit.start_date))
    : differenceInDays(new Date(), new Date(habit.created_at));

  // Calculate most consistent day
  const dayCount = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  const successDays = habitCheckins
    .filter((c) => c.status === "true")
    .forEach((c) => {
      const day = new Date(c.created_at).getDay();
      dayCount[day as keyof typeof dayCount] += 1;
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

  // Check if habit is failed
  const isFailed = habit.status === "failed";

  // Calculate check-ins remaining for this period
  const frequencyValue = habit.frequency_value || 1;

  // Get check-ins for the current period
  const currentPeriodCheckins = habitCheckins.filter((c) => {
    const now = new Date();
    const checkinDate = new Date(c.created_at);

    if (habit.frequency_unit === "day") {
      return startOfDay(checkinDate).getTime() === startOfDay(now).getTime();
    } else if (habit.frequency_unit === "week") {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
      const weekEnd = endOfWeek(now);

      return checkinDate >= weekStart && checkinDate <= weekEnd;
    } else {
      // month
      return (
        checkinDate.getMonth() === now.getMonth() &&
        checkinDate.getFullYear() === now.getFullYear()
      );
    }
  });

  const checkInsRemaining = Math.max(
    0,
    frequencyValue - currentPeriodCheckins.length
  );

  // Calculate deadline for current period
  const getDeadlineText = () => {
    const now = new Date();

    if (habit.frequency_unit === "day") {
      return "today";
    } else if (habit.frequency_unit === "week") {
      const weekEnd = endOfWeek(now);
      const daysRemaining = differenceInDays(weekEnd, now);
      return daysRemaining === 0
        ? "today"
        : `in ${daysRemaining} days (by Sunday)`;
    } else {
      // month
      const monthEnd = endOfMonth(now);
      const daysRemaining = differenceInDays(monthEnd, now);
      return daysRemaining === 0
        ? "today"
        : `in ${daysRemaining} days (by end of month)`;
    }
  };

  const deadlineText = getDeadlineText();

  // Calculate progress text based on frequency unit and value
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
      // month
      return `${
        frequencyValue - checkInsRemaining
      }/${frequencyValue} check-ins completed this month`;
    }
  };

  const progressText = getProgressText();

  return (
    <div className="p-4 md:p-8 space-y-6 w-full">
      <HabitHeader habit={habit} hasCheckins={hasCheckins} />

      {/* Main Check-in Section with Clear Progress Indicator */}
      <div
        className="mb-6 bg-card rounded-lg border shadow-sm overflow-hidden"
        id="check-in-section"
      >
        <div className="bg-muted/30 p-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-semibold">{habit.name}</h2>
              <p className="text-muted-foreground">
                {stake ? `$${stake.amount} at stake` : "No stake"} ·{" "}
                {habit.frequency_value}x per {habit.frequency_unit}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
                {progressText}
              </div>
              {checkInsRemaining > 0 && (
                <div className="text-sm px-3 py-1 bg-amber-50 text-amber-700 rounded-full flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Due {deadlineText}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {stake && !isFailed && (
          <div className="p-4">
            <CheckInSection habit={habit} stake={stake} />
          </div>
        )}
      </div>

      {/* Show missing check-ins card if the habit has a start date */}
      {habit.start_date && !isFailed && (
        <MissingCheckInsCard habit={habit} checkins={habitCheckins} />
      )}

      {/* Status Banner for Failed Habits */}
      {isFailed && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="font-medium text-red-800">This habit has failed</h3>
          </div>
          <p className="text-sm text-red-700 mt-1">
            You missed a required check-in. This habit can no longer be edited
            or deleted.
          </p>
        </div>
      )}

      {/* Stats Cards - Combined and Simplified */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-card rounded-lg border shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Habit Performance</h3>
            <Activity className="h-4 w-4 text-blue-500" />
          </div>

          <div className="grid grid-cols-2 gap-6 mt-4">
            <div>
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="text-2xl font-bold">{currentStreak}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {habit.frequency_unit === "day"
                  ? "Days streak"
                  : habit.frequency_unit === "week"
                  ? "Weeks streak"
                  : "Months streak"}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold">{consistencyRate}%</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Success rate ({totalCheckins} check-ins)
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Habit Insights</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Target className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                <div>
                  <p className="text-sm">
                    <span className="font-medium">Days active:</span>{" "}
                    {daysSinceStart} days
                  </p>
                </div>
              </li>
              {hasCheckins && (
                <li className="flex items-start">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">Most consistent day:</span>{" "}
                      {mostConsistentDay}
                    </p>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Habit Details</h3>
            <Info className="h-4 w-4 text-green-500" />
          </div>

          <div className="mt-4">
            <ul className="space-y-3">
              <li className="flex items-start">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                <div>
                  <p className="text-sm">
                    <span className="font-medium">Frequency:</span>{" "}
                    {habit.frequency_value} time(s) per {habit.frequency_unit}
                  </p>
                </div>
              </li>
              {habit.duration_value && habit.duration_unit && (
                <li className="flex items-start">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">Duration:</span>{" "}
                      {habit.duration_value} {habit.duration_unit}(s)
                    </p>
                  </div>
                </li>
              )}
              {stake && (
                <li className="flex items-start">
                  <Trophy className="h-4 w-4 text-yellow-500 mt-0.5 mr-2" />
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">At stake:</span> $
                      {stake.amount} {stake.currency || "USD"}
                    </p>
                  </div>
                </li>
              )}
              {habit.description && (
                <li className="flex items-start">
                  <Target className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">Description:</span>{" "}
                      {habit.description}
                    </p>
                  </div>
                </li>
              )}
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Period Progress</h4>

            <div className="h-2 w-full bg-muted rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{
                  width: `${Math.round(
                    ((frequencyValue - checkInsRemaining) / frequencyValue) *
                      100
                  )}%`,
                }}
              />
            </div>

            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>{frequencyValue - checkInsRemaining} completed</span>
              <span>{checkInsRemaining} remaining</span>
            </div>

            {checkInsRemaining > 0 && (
              <p className="text-sm mt-3 text-amber-600 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>
                  Complete {checkInsRemaining} more check-in
                  {checkInsRemaining > 1 ? "s" : ""} by{" "}
                  {habit.frequency_unit === "day"
                    ? "the end of today"
                    : habit.frequency_unit === "week"
                    ? "Sunday"
                    : "the end of the month"}
                  .
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Check-ins Visualization and History */}
      {habitCheckins.length > 0 && (
        <>
          <HabitProgress checkins={habitCheckins} habit={habit} />
          <CheckInsList
            checkins={habitCheckins}
            currentStreak={currentStreak}
          />
        </>
      )}

      {habitCheckins.length === 0 && (
        <div className="bg-muted/50 rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-4">
            No check-ins yet. Start tracking your habit to see your streak.
          </p>
          <FirstCheckInButton />
        </div>
      )}
    </div>
  );
}
