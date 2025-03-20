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
    is_public: boolean;
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
        is_public: props.is_public,
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

export async function getHabitPaymentByHabitUuid(habitUuid: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("habit_payments")
        .select("*")
        .eq("habit_uuid", habitUuid)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error("Error fetching habit payment:", error);
        return null;
    }
    return data;
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

export async function getMissedCheckins(habit_uuid?: string) {
    const supabase = await createClient();
    const now = new Date();

    let query = supabase
        .from("missed_checkins")
        .select(`
            *,
            habits:habit_uuid (
                name,
                frequency_unit,
                frequency_value
            )
        `)
        .eq("status", "pending")
        .gte("grace_period_end", now.toISOString())
        .order("period_end", { ascending: false });

    // If a specific habit UUID is provided, filter by it
    if (habit_uuid) {
        query = query.eq("habit_uuid", habit_uuid);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching missed check-ins:", error);
        return [];
    }

    return data || [];
}

export async function resolveMissedCheckin(
    missed_checkin_uuid: string,
    action: "complete" | "fail",
): Promise<{ success: boolean; message?: string }> {
    const supabase = await createClient();

    try {
        // Get the missed check-in details
        const { data: missedCheckin, error: fetchError } = await supabase
            .from("missed_checkins")
            .select("*, habits:habit_uuid (*)")
            .eq("uuid", missed_checkin_uuid)
            .single();

        if (fetchError || !missedCheckin) {
            return {
                success: false,
                message: "Failed to fetch missed check-in details",
            };
        }

        // Check if it's still in the grace period
        const now = new Date();
        const gracePeriodEnd = new Date(missedCheckin.grace_period_end);

        if (now > gracePeriodEnd) {
            return {
                success: false,
                message: "Grace period has expired for this missed check-in",
            };
        }

        if (action === "complete") {
            // Create the missing check-ins
            const missingCount = missedCheckin.required_checkins -
                missedCheckin.actual_checkins;
            const periodStartDate = new Date(missedCheckin.period_start);

            // Create all the missing check-ins
            for (let i = 0; i < missingCount; i++) {
                const { error: checkInError } = await supabase
                    .from("habit_checkins")
                    .insert({
                        habit_uuid: missedCheckin.habit_uuid,
                        completed: true,
                        status: "true",
                        // Use the period date, not the current date
                        created_at: periodStartDate.toISOString(),
                        proof_type: "retroactive",
                    });

                if (checkInError) {
                    console.error(
                        "Error creating retroactive check-in:",
                        checkInError,
                    );
                    return {
                        success: false,
                        message: "Failed to create retroactive check-in",
                    };
                }
            }

            // Update the missed check-in as resolved
            const { error: updateError } = await supabase
                .from("missed_checkins")
                .update({
                    status: "resolved",
                    resolved_at: now.toISOString(),
                })
                .eq("uuid", missed_checkin_uuid);

            if (updateError) {
                return {
                    success: false,
                    message: "Failed to update missed check-in status",
                };
            }

            // Revalidate the habit page
            if (missedCheckin.habits?.slug) {
                revalidatePath(`/dashboard/${missedCheckin.habits.slug}`);
            }

            return {
                success: true,
                message: "Retroactive check-ins completed successfully",
            };
        } else if (action === "fail") {
            // Mark the habit as failed
            const { error: habitError } = await supabase
                .from("habits")
                .update({ status: "failed" })
                .eq("uuid", missedCheckin.habit_uuid);

            if (habitError) {
                return {
                    success: false,
                    message: "Failed to update habit status",
                };
            }

            // Handle the stake if it exists
            if (missedCheckin.habits?.stake_uuid) {
                const { error: stakeError } = await supabase
                    .from("habit_stakes")
                    .update({
                        status: "forfeited",
                        payment_status: "pending",
                        transaction_date: now.toISOString(),
                    })
                    .eq("uuid", missedCheckin.habits.stake_uuid);

                if (stakeError) {
                    return {
                        success: false,
                        message: "Failed to update stake status",
                    };
                }

                // Create a payment record
                const { data: stakeData } = await supabase
                    .from("habit_stakes")
                    .select("amount")
                    .eq("uuid", missedCheckin.habits.stake_uuid)
                    .single();

                if (stakeData) {
                    const { error: paymentError } = await supabase
                        .from("habit_payments")
                        .insert({
                            stake_uuid: missedCheckin.habits.stake_uuid,
                            habit_uuid: missedCheckin.habit_uuid,
                            amount: stakeData.amount || 0,
                            payment_status: "pending",
                        });

                    if (paymentError) {
                        return {
                            success: false,
                            message: "Failed to create payment record",
                        };
                    }
                }
            }

            // Update the missed check-in as failed
            const { error: updateError } = await supabase
                .from("missed_checkins")
                .update({
                    status: "failed",
                    resolved_at: now.toISOString(),
                })
                .eq("uuid", missed_checkin_uuid);

            if (updateError) {
                return {
                    success: false,
                    message: "Failed to update missed check-in status",
                };
            }

            // Revalidate the habit page
            if (missedCheckin.habits?.slug) {
                revalidatePath(`/dashboard/${missedCheckin.habits.slug}`);
            }

            return {
                success: true,
                message: "Habit has been marked as failed",
            };
        } else {
            return {
                success: false,
                message: "Invalid action specified",
            };
        }
    } catch (error) {
        console.error("Error resolving missed check-in:", error);
        return {
            success: false,
            message: "An unexpected error occurred",
        };
    }
}
