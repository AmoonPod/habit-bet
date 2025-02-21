import { getHabitBySlug, getStakeByUuid } from "../actions";
import { Tables } from "@/supabase/models/database.types";
import HabitStats from "@/components/habit/HabitStats";
import HabitCharts from "@/components/habit/HabitCharts";
import CheckInSection from "@/components/habit/CheckInSection";
import HabitHeader from "@/components/habit/HabitHeader";

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

  // Placeholder data - replace with actual data fetching
  const currentStreak = 50;
  const completionRate = 75;
  const totalSaved = 125;
  const nextCheckIn = new Date();

  return (
    <div className="container mx-auto px-4 py-8 ">
      <HabitHeader habit={habit} />
      <CheckInSection habit={habit} stakeAmount={stake.amount!} />
      <HabitStats
        currentStreak={currentStreak}
        completionRate={completionRate}
        totalSaved={totalSaved}
        nextCheckIn={nextCheckIn}
      />
      <HabitCharts />
    </div>
  );
}
