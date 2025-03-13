import { Tables } from "@/supabase/models/database.types";
import {
    addDays,
    differenceInDays,
    format,
    isAfter,
    isBefore,
    isToday,
    parseISO,
} from "date-fns";

/**
 * Calcola la serie attuale di check-in consecutivi
 */
export function calculateCurrentStreak(
    checkins: Tables<"habit_checkins">[],
): number {
    if (checkins.length === 0) return 0;

    // Ordina i check-in per data (dal più recente al più vecchio)
    const sortedCheckins = [...checkins]
        .filter((checkin) => checkin.status === "true")
        .sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

    if (sortedCheckins.length === 0) return 0;

    // Verifica se l'ultimo check-in è di oggi o ieri (per mantenere la serie)
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
 * Calcola la percentuale di completamento dell'abitudine
 */
export function calculateCompletionRate(
    habit: Tables<"habits">,
    checkins: Tables<"habit_checkins">[],
): number {
    if (!habit.frequency_value || !habit.duration_value) {
        return 0;
    }

    // Conta i check-in riusciti
    const successfulCheckins = checkins.filter(
        (checkin) => checkin.status === "true",
    ).length;

    // Calcola i check-in attesi fino ad oggi
    const startDate = new Date(habit.created_at);
    const today = new Date();

    // Se l'abitudine è stata creata oggi, restituisci 0% o 100% in base ai check-in
    if (differenceInDays(today, startDate) === 0) {
        return successfulCheckins > 0 ? 100 : 0;
    }

    // Calcola il tempo trascorso dall'inizio dell'abitudine
    const elapsedDays = Math.max(1, differenceInDays(today, startDate));
    const elapsedWeeks = Math.max(1, Math.ceil(elapsedDays / 7));
    const elapsedMonths = Math.max(1, Math.ceil(elapsedDays / 30));

    let expectedCheckinsToDate = 0;

    // Calcola i check-in attesi in base alla frequenza
    if (habit.frequency_unit === "day") {
        expectedCheckinsToDate = Math.min(
            elapsedDays * habit.frequency_value,
            habit.frequency_value * habit.duration_value,
        );
    } else if (habit.frequency_unit === "week") {
        expectedCheckinsToDate = Math.min(
            elapsedWeeks * habit.frequency_value,
            habit.frequency_value * habit.duration_value,
        );
    } else if (habit.frequency_unit === "month") {
        expectedCheckinsToDate = Math.min(
            elapsedMonths * habit.frequency_value,
            habit.frequency_value * habit.duration_value,
        );
    }

    // Assicurati che ci sia almeno un check-in atteso
    expectedCheckinsToDate = Math.max(1, expectedCheckinsToDate);

    // Calcola la percentuale
    const percentage = Math.round(
        (successfulCheckins / expectedCheckinsToDate) * 100,
    );

    // Limita la percentuale al 100%
    return Math.min(percentage, 100);
}

/**
 * Calcola il rischio attuale basato sulla posta in gioco e sul tasso di completamento
 */
export function calculateCurrentRisk(
    stakeAmount: number,
    completionRate: number,
): number {
    // Calcola quanto l'utente rischia di perdere in base al tasso di completamento attuale
    // Se il tasso di completamento è basso, il rischio è maggiore
    return Math.round((stakeAmount * (100 - completionRate)) / 100);
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
