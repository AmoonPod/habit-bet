import { Tables } from "@/supabase/models/database.types";
import HabitCard from "./HabitCard";

export function Habits(params: { habits: any }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {params.habits.map((habit: Tables<"habits">) => {
        return (
          <HabitCard
            key={habit.uuid}
            color={habit.color}
            icon={habit.icon}
            name={habit.name}
            frequency_value={habit.frequency_value}
            frequency_unit={habit.frequency_unit}
            duration_value={habit.duration_value}
            duration_unit={habit.duration_unit}
            slug={habit.slug}
            stake_uuid={habit.stake_uuid}
            created_at={habit.created_at}
            user_uuid={habit.user_uuid}
            uuid={habit.uuid}
          />
        );
      })}
    </div>
  );
}
