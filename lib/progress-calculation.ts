import { Tables } from "@/supabase/models/database.types";
import {
    differenceInDays,
    differenceInMonths,
    differenceInWeeks,
    parseISO,
} from "date-fns";

/**
 * Calculates the progress percentage for a habit based on its total required check-ins.
 * Used consistently across the entire application to ensure uniform calculation.
 */
export function calculateHabitProgress(
    habit: Tables<"habits">,
    checkins: Tables<"habit_checkins">[],
): {
    successfulCheckins: number;
    totalRequiredCheckins: number;
    progressPercentage: number;
    isCompleted: boolean;
} {
    // Get required values from habit
    const frequencyUnit = habit.frequency_unit || "day";
    const frequencyValue = habit.frequency_value || 1;
    const durationValue = habit.duration_value || 1;
    const startDate = habit.start_date
        ? parseISO(habit.start_date)
        : new Date(habit.created_at);

    // Count successful check-ins
    const habitCheckins = checkins.filter(
        (checkin) => checkin.habit_uuid === habit.uuid,
    );
    const successfulCheckins = habitCheckins.filter(
        (checkin) => checkin.status === "true",
    ).length;

    // Calculate total required check-ins for the entire habit
    const now = new Date();
    let totalRequiredCheckins = 0;

    if (frequencyUnit === "day") {
        // For daily habits
        let totalDays = 0;
        if (habit.duration_unit === "day") {
            totalDays = durationValue;
        } else if (habit.duration_unit === "week") {
            totalDays = durationValue * 7;
        } else if (habit.duration_unit === "month") {
            // Approximate days in a month
            totalDays = durationValue * 30;
        }
        totalRequiredCheckins = frequencyValue * totalDays;
    } else if (frequencyUnit === "week") {
        // For weekly habits
        if (habit.duration_unit === "day") {
            const totalDays = durationValue;
            const totalWeeks = totalDays / 7;
            totalRequiredCheckins = frequencyValue * Math.ceil(totalWeeks);
        } else if (habit.duration_unit === "week") {
            totalRequiredCheckins = frequencyValue * durationValue;
        } else if (habit.duration_unit === "month") {
            // Approximate weeks in months
            const totalWeeks = durationValue * 4.33; // ~4.33 weeks per month
            totalRequiredCheckins = frequencyValue * Math.ceil(totalWeeks);
        }
    } else if (frequencyUnit === "month") {
        // For monthly habits
        if (habit.duration_unit === "day") {
            const totalDays = durationValue;
            const totalMonths = totalDays / 30;
            totalRequiredCheckins = frequencyValue * Math.ceil(totalMonths);
        } else if (habit.duration_unit === "week") {
            const totalWeeks = durationValue;
            const totalMonths = totalWeeks / 4.33; // ~4.33 weeks per month
            totalRequiredCheckins = frequencyValue * Math.ceil(totalMonths);
        } else if (habit.duration_unit === "month") {
            totalRequiredCheckins = frequencyValue * durationValue;
        }
    }

    // Calculate the progress percentage based on completed vs total required
    const progressPercentage = Math.min(
        Math.round(
            (successfulCheckins / Math.max(totalRequiredCheckins, 1)) * 100,
        ),
        100,
    );

    // Determine if habit is completed
    const isCompleted = successfulCheckins >= totalRequiredCheckins;

    return {
        successfulCheckins,
        totalRequiredCheckins,
        progressPercentage,
        isCompleted,
    };
}
