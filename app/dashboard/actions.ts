"use server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface CreateHabitProps {
    name: string;
    icon: string;
    color: string;
    frequency_value: number;
    frequency_unit: string;
    duration_value: number;
    duration_unit: string;
    stake_amount: number;
    start_date: Date;
    end_date: Date;
    verification_type: string; // "honor", "photo", o "text"
}
export async function createHabit(props: CreateHabitProps) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("User not found");
    }
    //create stake in habit_stakes table and return uuid
    const { data: stakeData, error: stakeError } = await supabase
        .from("habit_stakes")
        .insert({
            amount: props.stake_amount,
            status: "pending",
        })
        .select("uuid")
        .single();

    if (stakeError) {
        throw stakeError;
    }

    let stake_uuid = stakeData?.uuid;
    if (!stake_uuid) {
        throw new Error("Failed to create stake");
    }

    const { data, error } = await supabase.from("habits").insert({
        name: props.name,
        user_uuid: user!.id,
        stake_uuid: stake_uuid,
        icon: props.icon,
        color: props.color,
        frequency_value: props.frequency_value,
        frequency_unit: props.frequency_unit,
        duration_value: props.duration_value,
        duration_unit: props.duration_unit,
        verification_type: props.verification_type,
        slug: props.name.toLowerCase().replace(/\s/g, "-"),
        start_date: props.start_date.toISOString(),
        end_date: props.end_date.toISOString(),
    });

    if (error) {
        throw error;
    }

    revalidatePath("/dashboard");

    return { data, error };
}

export async function getHabits() {
    const supabase = await createClient();
    const { data, error } = await supabase.from("habits").select("*");
    if (error) {
        throw error;
    }
    return data;
}

export async function getHabitBySlug(slug: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("slug", slug)
        .single();
    if (error) {
        throw error;
    }
    return data;
}

export async function getStakeByUuid(uuid: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("habit_stakes")
        .select("*")
        .eq("uuid", uuid)
        .single();
    if (error) {
        throw error;
    }
    return data;
}

export async function getHabitCheckins() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("habit_checkins")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        throw error;
    }
    return data || [];
}

export async function getAllStakes() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("habit_stakes")
        .select("*");

    if (error) {
        throw error;
    }
    return data || [];
}

export async function getHabitPayments() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("habit_payments")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        throw error;
    }
    return data || [];
}

export async function getHabitStakes() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("habit_stakes")
        .select("*");

    if (error) {
        console.error("Error fetching habit stakes:", error);
        return [];
    }

    return data || [];
}
