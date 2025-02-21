"use server";
import { createClient } from "@/utils/supabase/server";

export async function checkInHabit(
    habit_uuid: string,
    completed: boolean,
): Promise<void> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("habit_checkins")
        .insert({
            habit_uuid,
            completed,
        });
    if (error) {
        throw error;
    }
}
