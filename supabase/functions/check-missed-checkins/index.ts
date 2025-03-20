// Edge function to check for missed check-ins
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
    addHours,
    differenceInDays,
    endOfDay,
    endOfMonth,
    endOfWeek,
    isAfter,
    isBefore,
    isEqual,
    startOfDay,
    startOfMonth,
    startOfWeek,
    subDays,
    subMonths,
    subWeeks,
} from "https://esm.sh/date-fns@2.30.0";

// Constants
const GRACE_PERIOD_HOURS = 24; // Grace period in hours

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Create a Supabase client with the Admin key
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        );

        // Get all active habits
        const { data: activeHabits, error: habitsError } = await supabaseAdmin
            .from("habits")
            .select(`
        uuid, 
        name, 
        frequency_unit, 
        frequency_value, 
        user_uuid,
        start_date,
        end_date,
        created_at
      `)
            .eq("status", "active");

        if (habitsError) {
            throw habitsError;
        }

        if (!activeHabits || activeHabits.length === 0) {
            return new Response(
                JSON.stringify({ message: "No active habits found" }),
                {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                },
            );
        }

        const now = new Date();
        const processedHabits: any[] = [];

        // Process each active habit
        for (const habit of activeHabits) {
            // Skip habits that haven't started yet or have already ended
            const startDate = habit.start_date
                ? new Date(habit.start_date)
                : new Date(habit.created_at);
            const endDate = habit.end_date ? new Date(habit.end_date) : null;

            if ((startDate && startDate > now) || (endDate && endDate < now)) {
                continue;
            }

            // Determine periods that need to be checked based on frequency unit
            let periods = [];

            switch (habit.frequency_unit) {
                case "day":
                    // For daily habits, check yesterday
                    const yesterday = subDays(now, 1);
                    // Only process if yesterday is after the start date
                    if (
                        isAfter(yesterday, startDate) ||
                        isEqual(yesterday, startDate)
                    ) {
                        periods.push({
                            start: startOfDay(yesterday),
                            end: endOfDay(yesterday),
                        });
                    }
                    break;

                case "week":
                    // For weekly habits, we need to check all completed weeks
                    // since the start date that haven't been checked yet
                    const currentWeekStart = startOfWeek(now, {
                        weekStartsOn: 1,
                    });

                    // Check all previous weeks that might need to be verified
                    // Start from the week before the current one
                    let weekToCheck = subWeeks(currentWeekStart, 1);

                    // Keep going back in time until we reach the start date
                    // but don't check weeks that are before the start date
                    while (
                        isAfter(weekToCheck, startDate) ||
                        isEqual(weekToCheck, startDate)
                    ) {
                        const weekToCheckEnd = endOfWeek(weekToCheck, {
                            weekStartsOn: 1,
                        });

                        // Only check weeks that have completed (entirely in the past)
                        if (isBefore(weekToCheckEnd, now)) {
                            periods.push({
                                start: weekToCheck,
                                end: weekToCheckEnd,
                            });
                        }

                        // Move to the previous week
                        weekToCheck = subWeeks(weekToCheck, 1);
                    }
                    break;

                case "month":
                    // For monthly habits, check all completed months
                    // since the start date that haven't been checked yet
                    const currentMonthStart = startOfMonth(now);

                    // Check all previous months that might need to be verified
                    // Start from the month before the current one
                    let monthToCheck = subMonths(currentMonthStart, 1);

                    // Keep going back in time until we reach the start date
                    // but don't check months that are before the start date
                    while (
                        isAfter(monthToCheck, startDate) ||
                        isEqual(monthToCheck, startDate)
                    ) {
                        const monthToCheckEnd = endOfMonth(monthToCheck);

                        // Only check months that have completed (entirely in the past)
                        if (isBefore(monthToCheckEnd, now)) {
                            periods.push({
                                start: monthToCheck,
                                end: monthToCheckEnd,
                            });
                        }

                        // Move to the previous month
                        monthToCheck = subMonths(monthToCheck, 1);
                    }
                    break;

                default:
                    continue; // Skip if unknown frequency unit
            }

            // Process each period that needs to be checked
            for (const period of periods) {
                // Check if we already have a record for this period
                const { data: existingMissed, error: missedError } =
                    await supabaseAdmin
                        .from("missed_checkins")
                        .select("uuid")
                        .eq("habit_uuid", habit.uuid)
                        .eq("period_start", period.start.toISOString())
                        .eq("period_end", period.end.toISOString());

                if (missedError) {
                    console.error(
                        `Error checking existing missed check-ins for habit ${habit.uuid}:`,
                        missedError,
                    );
                    continue;
                }

                // Skip if we already have a record for this period
                if (existingMissed && existingMissed.length > 0) {
                    continue;
                }

                // Get check-ins for this period
                const { data: checkins, error: checkinsError } =
                    await supabaseAdmin
                        .from("habit_checkins")
                        .select("uuid, created_at, status")
                        .eq("habit_uuid", habit.uuid)
                        .gte("created_at", period.start.toISOString())
                        .lte("created_at", period.end.toISOString());

                if (checkinsError) {
                    console.error(
                        `Error fetching check-ins for habit ${habit.uuid}:`,
                        checkinsError,
                    );
                    continue;
                }

                // Count completed check-ins
                const completedCheckins = checkins?.filter((c) =>
                    c.status === "true"
                ).length || 0;
                const requiredCheckins = habit.frequency_value || 1;

                // If user didn't complete the required number of check-ins
                if (completedCheckins < requiredCheckins) {
                    // Calculate grace period end
                    const graceEnd = addHours(now, GRACE_PERIOD_HOURS);

                    // Create a missed check-in record
                    const { data: missedCheckin, error: createError } =
                        await supabaseAdmin
                            .from("missed_checkins")
                            .insert({
                                habit_uuid: habit.uuid,
                                period_start: period.start.toISOString(),
                                period_end: period.end.toISOString(),
                                required_checkins: requiredCheckins,
                                actual_checkins: completedCheckins,
                                status: "pending",
                                grace_period_end: graceEnd.toISOString(),
                            })
                            .select("uuid")
                            .single();

                    if (createError) {
                        console.error(
                            `Error creating missed check-in record for habit ${habit.uuid}:`,
                            createError,
                        );
                        continue;
                    }

                    processedHabits.push({
                        habit_uuid: habit.uuid,
                        habit_name: habit.name,
                        period: habit.frequency_unit,
                        missed_checkins: requiredCheckins - completedCheckins,
                        missed_checkin_uuid: missedCheckin?.uuid,
                    });
                }
            }
        }

        // Check for expired grace periods and mark habits as failed
        const { data: expiredMissedCheckins, error: expiredError } =
            await supabaseAdmin
                .from("missed_checkins")
                .select(`
        uuid, 
        habit_uuid, 
        period_start, 
        period_end,
        required_checkins,
        actual_checkins
      `)
                .eq("status", "pending")
                .lt("grace_period_end", now.toISOString());

        if (expiredError) {
            console.error(
                "Error fetching expired missed check-ins:",
                expiredError,
            );
        } else if (expiredMissedCheckins && expiredMissedCheckins.length > 0) {
            for (const missed of expiredMissedCheckins) {
                // Mark the habit as failed
                const { error: updateHabitError } = await supabaseAdmin
                    .from("habits")
                    .update({ status: "failed" })
                    .eq("uuid", missed.habit_uuid);

                if (updateHabitError) {
                    console.error(
                        `Error updating habit ${missed.habit_uuid} status:`,
                        updateHabitError,
                    );
                    continue;
                }

                // Update the missed check-in
                const { error: updateMissedError } = await supabaseAdmin
                    .from("missed_checkins")
                    .update({ status: "failed" })
                    .eq("uuid", missed.uuid);

                if (updateMissedError) {
                    console.error(
                        `Error updating missed check-in ${missed.uuid} status:`,
                        updateMissedError,
                    );
                }

                // Get habit stake to update its status
                const { data: habit, error: habitError } = await supabaseAdmin
                    .from("habits")
                    .select("stake_uuid")
                    .eq("uuid", missed.habit_uuid)
                    .single();

                if (habitError || !habit || !habit.stake_uuid) {
                    console.error(
                        `Error fetching habit ${missed.habit_uuid} stake:`,
                        habitError,
                    );
                    continue;
                }

                // Update stake status to forfeited
                const { error: stakeError } = await supabaseAdmin
                    .from("habit_stakes")
                    .update({
                        status: "forfeited",
                        payment_status: "pending",
                    })
                    .eq("uuid", habit.stake_uuid);

                if (stakeError) {
                    console.error(
                        `Error updating stake for habit ${missed.habit_uuid}:`,
                        stakeError,
                    );
                    continue;
                }

                // Create a payment record
                const { error: paymentError } = await supabaseAdmin
                    .from("habit_payments")
                    .insert({
                        stake_uuid: habit.stake_uuid,
                        habit_uuid: missed.habit_uuid,
                        amount: 0, // Will be updated below
                        payment_status: "pending",
                    })
                    .select("uuid")
                    .single();

                if (paymentError) {
                    console.error(
                        `Error creating payment record for habit ${missed.habit_uuid}:`,
                        paymentError,
                    );
                }

                // Get the stake amount
                const { data: stake, error: fetchStakeError } =
                    await supabaseAdmin
                        .from("habit_stakes")
                        .select("amount")
                        .eq("uuid", habit.stake_uuid)
                        .single();

                if (fetchStakeError || !stake) {
                    console.error(
                        `Error fetching stake amount for habit ${missed.habit_uuid}:`,
                        fetchStakeError,
                    );
                    continue;
                }

                // Update the payment amount
                const { error: updatePaymentError } = await supabaseAdmin
                    .from("habit_payments")
                    .update({
                        amount: stake.amount || 0,
                    })
                    .eq("stake_uuid", habit.stake_uuid)
                    .eq("habit_uuid", missed.habit_uuid);

                if (updatePaymentError) {
                    console.error(
                        `Error updating payment amount for habit ${missed.habit_uuid}:`,
                        updatePaymentError,
                    );
                }
            }
        }

        return new Response(
            JSON.stringify({
                message: "Check completed",
                processed: processedHabits,
            }),
            {
                headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json",
                },
            },
        );
    } catch (error) {
        console.error("Error in check-missed-checkins function:", error);
        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : String(error),
            }),
            {
                headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json",
                },
                status: 500,
            },
        );
    }
});
