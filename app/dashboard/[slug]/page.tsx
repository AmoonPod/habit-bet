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
import VibeCode from "@/components/habit/VibeCode";
import { Trophy, Calendar, Award, Target, Flame } from "lucide-react";
import { format } from "date-fns";

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
  const stake = habit.stake_uuid ? await getStakeByUuid(habit.stake_uuid) : null;

  // Get check-ins
  const allCheckins = await getHabitCheckins();
  const habitCheckins = allCheckins.filter(
    (checkin) => checkin.habit_uuid === habit.uuid
  );
  const hasCheckins = habitCheckins.length > 0;

  // Calculate stats
  const currentStreak = calculateCurrentStreak(habitCheckins, habit);
  const nextCheckInDate = calculateNextCheckInDate(
    habit,
    habitCheckins
  );

  // Calculate achievement levels
  const successfulCheckins = habitCheckins.filter(c => c.status === "true").length;
  const achievementLevel = Math.floor(successfulCheckins / 5); // Level up every 5 successful check-ins
  const progressToNextLevel = successfulCheckins % 5;
  const progressPercentage = (progressToNextLevel / 5) * 100;

  return (
    <div className="p-4 md:p-8 space-y-6 w-full">
      <HabitHeader habit={habit} hasCheckins={hasCheckins} />

      <div className="mb-6">
        {stake && (
          <CheckInSection habit={habit} stake={stake} />
        )}
      </div>

      {/* Show missing check-ins card if the habit has a start date */}
      {habit.start_date && (
        <MissingCheckInsCard habit={habit} checkins={habitCheckins} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-card rounded-lg border shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Current Streak</h3>
            <Flame className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold">{currentStreak}</div>
          <p className="text-sm text-muted-foreground mt-1">
            {habit.frequency_unit === "day"
              ? "Days in a row"
              : habit.frequency_unit === "week"
                ? "Weeks in a row"
                : "Months in a row"}
          </p>
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Next Check-in</h3>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {nextCheckInDate ? format(nextCheckInDate, "MMM d") : "Today"}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Keep your streak going by checking in regularly
          </p>
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Achievement Level</h3>
            <Award className="h-4 w-4 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold">Level {achievementLevel}</div>
          <div className="mt-2">
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-center">
              {progressToNextLevel}/5 to next level
            </p>
          </div>
        </div>
      </div>

      {/* Check-ins list */}
      {habitCheckins.length > 0 && (
        <>
          <VibeCode checkins={habitCheckins} habit={habit} />
          <CheckInsList checkins={habitCheckins} currentStreak={currentStreak} />
        </>
      )}

      {habitCheckins.length === 0 && (
        <div className="bg-muted/50 rounded-lg p-8 text-center">
          <p className="text-muted-foreground">
            No check-ins yet. Start tracking your habit to see your streak.
          </p>
        </div>
      )}
    </div>
  );
}
