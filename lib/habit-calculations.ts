import { Tables } from "@/supabase/models/database.types";
import {
    addDays,
    differenceInDays,
    differenceInMonths,
    endOfMonth,
    format,
    isAfter,
    isBefore,
    isSameMonth,
    isToday,
    isWithinInterval,
    parseISO,
    startOfMonth,
} from "date-fns";

/**
 * Calcola la serie attuale di check-in consecutivi
 */
export function calculateCurrentStreak(
    checkins: Tables<"habit_checkins">[],
    habit?: Tables<"habits">,
): number {
    if (checkins.length === 0) return 0;

    // Ordina i check-in per data (dal più recente al più vecchio)
    const sortedCheckins = [...checkins]
        .filter((checkin) => checkin.status === "true")
        .sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

    if (sortedCheckins.length === 0) return 0;

    // Handle monthly habits differently
    if (habit && habit.frequency_unit === "month") {
        const today = new Date();
        const currentMonth = startOfMonth(today);

        // Check if there's a check-in in the current month
        const hasCurrentMonthCheckIn = sortedCheckins.some((checkin) =>
            isSameMonth(new Date(checkin.created_at), today)
        );

        if (hasCurrentMonthCheckIn) {
            // Start counting consecutive months
            let streak = 1;
            let monthToCheck = startOfMonth(addDays(currentMonth, -1)); // Previous month

            // Go back in time month by month
            while (true) {
                const hasCheckInForMonth = sortedCheckins.some((checkin) =>
                    isSameMonth(new Date(checkin.created_at), monthToCheck)
                );

                if (hasCheckInForMonth) {
                    streak++;
                    monthToCheck = startOfMonth(addDays(monthToCheck, -1)); // Go to previous month
                } else {
                    break; // Break the streak when a month is missed
                }
            }

            return streak;
        }

        return 0; // No check-in in current month means streak is 0
    }

    // For daily and weekly habits, use the existing logic
    const lastCheckInDate = new Date(sortedCheckins[0].created_at);
    const today = new Date();
    const yesterday = addDays(today, -1);

    if (
        !isToday(lastCheckInDate) &&
        differenceInDays(today, lastCheckInDate) > 1
    ) {
        return 0; // La serie è interrotta se l'ultimo check-in è più vecchio di ieri
    }

    // Conta i giorni consecutivi
    let streak = 1;
    for (let i = 0; i < sortedCheckins.length - 1; i++) {
        const currentDate = new Date(sortedCheckins[i].created_at);
        const prevDate = new Date(sortedCheckins[i + 1].created_at);

        // Se la differenza è di 1 giorno, continua la serie
        if (differenceInDays(currentDate, prevDate) === 1) {
            streak++;
        } else {
            break; // Serie interrotta
        }
    }

    return streak;
}

/**
 * Calcola la data del prossimo check-in
 */
export function calculateNextCheckInDate(
    habit: Tables<"habits">,
    checkins: Tables<"habit_checkins">[],
): Date {
    const today = new Date();

    // Se non ci sono check-in, il prossimo è oggi
    if (checkins.length === 0) {
        return today;
    }

    // Ordina i check-in per data (dal più recente al più vecchio)
    const sortedCheckins = [...checkins].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const lastCheckInDate = new Date(sortedCheckins[0].created_at);

    // Se l'ultimo check-in è di oggi, il prossimo dipende dalla frequenza
    if (isToday(lastCheckInDate)) {
        if (habit.frequency_unit === "day" && habit.frequency_value === 1) {
            // Se è giornaliero, il prossimo è domani
            return addDays(today, 1);
        } else {
            // Altrimenti, il prossimo è ancora oggi (più check-in al giorno)
            return today;
        }
    }

    // Se l'ultimo check-in non è di oggi, il prossimo è oggi
    return today;
}
