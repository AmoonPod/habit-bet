import { getHabitBySlug, getStakeByUuid, getHabitCheckins } from "../actions";
import { Tables } from "@/supabase/models/database.types";
import HabitStats from "@/components/habit/HabitStats";
import CheckInSection from "@/components/habit/CheckInSection";
import HabitHeader from "@/components/habit/HabitHeader";
import {
  calculateCurrentStreak,
  calculateCompletionRate,
  calculateCurrentRisk,
  calculateNextCheckInDate,
} from "@/lib/habit-calculations";
import HabitActivityInsights from "@/components/habit/HabitActivityInsights";
import HabitInsights from "@/components/habit/HabitInsights";
import MissingCheckInsCard from "@/components/habit/MissingCheckInsCard";

export default async function HabitPage({
  params,
}: {
  params: { slug: string };
}) {
  const habit_slug = params.slug;
  const habit: Tables<"habits"> = await getHabitBySlug(
    habit_slug as unknown as string
  );

  const stake: Tables<"habit_stakes"> = await getStakeByUuid(habit.stake_uuid!);

  // Get habit check-ins
  const allCheckins = await getHabitCheckins();
  const habitCheckins = allCheckins.filter(
    (checkin) => checkin.habit_uuid === habit.uuid
  );
  const hasCheckins = habitCheckins.length > 0;

  // Calculate real statistics based on actual data
  const currentStreak = calculateCurrentStreak(habitCheckins);
  const completionRate = calculateCompletionRate(habit, habitCheckins);
  const currentRisk = calculateCurrentRisk(stake.amount || 0, completionRate);
  const nextCheckIn = calculateNextCheckInDate(habit, habitCheckins);

  return (
    <div className="p-4 md:p-8 space-y-6 w-full">
      <HabitHeader habit={habit} hasCheckins={hasCheckins} />

      <div className="mb-6">
        <CheckInSection habit={habit} stakeAmount={stake.amount!} />
      </div>

      {/* Show missing check-ins card if the habit has a start date */}
      {habit.start_date && (
        <MissingCheckInsCard habit={habit} checkins={habitCheckins} />
      )}

      <div className="mb-6">
        <HabitStats
          currentStreak={currentStreak}
          completionRate={completionRate}
          currentRisk={currentRisk}
          nextCheckIn={nextCheckIn}
        />
      </div>

      {habitCheckins.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-6 mb-8">
            <HabitActivityInsights habit={habit} checkins={habitCheckins} />
            <div>
              <h2 className="text-xl font-semibold mb-4">Habit Insights</h2>
              <HabitInsights habit={habit} checkins={habitCheckins} />
            </div>
          </div>
        </>
      )}

      {habitCheckins.length === 0 && (
        <div className="bg-muted/50 rounded-lg p-8 text-center">
          <p className="text-muted-foreground">
            No check-ins yet. Start tracking your habit to see analytics and
            insights.
          </p>
        </div>
      )}
    </div>
  );
}
