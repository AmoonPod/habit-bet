"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tables } from "@/supabase/models/database.types";
import { Target, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  addDays,
  addWeeks,
  addMonths,
} from "date-fns";

interface HabitCardProps {
  habit: Tables<"habits">;
  stake: Tables<"habit_stakes">;
  checkins?: Tables<"habit_checkins">[];
}

export default function HabitCard({
  habit,
  stake,
  checkins = [],
}: HabitCardProps) {
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ value: 0, unit: "days" });

  useEffect(() => {
    // Calculate completion percentage based on habit frequency and check-ins
    calculateCompletionPercentage();

    // Calculate time left
    calculateTimeLeft();
  }, [habit, checkins]);

  const calculateCompletionPercentage = () => {
    if (!habit.frequency_value || !habit.duration_value) {
      setCompletionPercentage(0);
      return;
    }

    // Count successful check-ins
    const successfulCheckins = checkins.filter(
      (checkin) =>
        checkin.habit_uuid === habit.uuid && checkin.status === "true"
    ).length;

    // Calcola il numero di check-in attesi fino ad oggi
    const startDate = new Date(habit.created_at);
    const today = new Date();
    let expectedCheckinsToDate = 0;

    // Calcola il tempo trascorso dall'inizio dell'abitudine
    const elapsedTime = {
      days: Math.max(
        0,
        Math.floor(
          (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        )
      ),
      weeks: Math.max(
        0,
        Math.floor(
          (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
        )
      ),
      months: Math.max(
        0,
        (today.getFullYear() - startDate.getFullYear()) * 12 +
          today.getMonth() -
          startDate.getMonth() +
          (today.getDate() >= startDate.getDate() ? 0 : -1)
      ),
    };

    // Calcola il numero di check-in attesi in base alla frequenza
    if (habit.frequency_unit === "day") {
      expectedCheckinsToDate = Math.min(
        elapsedTime.days * habit.frequency_value,
        habit.frequency_value * habit.duration_value
      );
    } else if (habit.frequency_unit === "week") {
      expectedCheckinsToDate = Math.min(
        elapsedTime.weeks * habit.frequency_value,
        habit.frequency_value * habit.duration_value
      );
    } else if (habit.frequency_unit === "month") {
      expectedCheckinsToDate = Math.min(
        elapsedTime.months * habit.frequency_value,
        habit.frequency_value * habit.duration_value
      );
    }

    // Assicurati che ci sia almeno un check-in atteso
    expectedCheckinsToDate = Math.max(1, expectedCheckinsToDate);

    // Calcola la percentuale basata sui check-in attesi fino ad oggi
    const percentage = Math.round(
      (successfulCheckins / expectedCheckinsToDate) * 100
    );

    // Limita la percentuale a 100%
    setCompletionPercentage(Math.min(percentage, 100));

    // Debug
    console.log({
      habit: habit.name,
      successfulCheckins,
      expectedCheckinsToDate,
      percentage,
      elapsedTime,
    });
  };

  const calculateTimeLeft = () => {
    if (!habit.duration_unit || !habit.duration_value) {
      setTimeLeft({ value: 0, unit: "days" });
      return;
    }

    const startDate = new Date(habit.created_at);
    let endDate;

    // Calculate end date based on duration unit and value
    switch (habit.duration_unit) {
      case "day":
        endDate = addDays(startDate, habit.duration_value);
        break;
      case "week":
        endDate = addWeeks(startDate, habit.duration_value);
        break;
      case "month":
        endDate = addMonths(startDate, habit.duration_value);
        break;
      default:
        endDate = addDays(startDate, 30); // Default to 30 days
    }

    const now = new Date();

    // Mostra il tempo rimanente nella stessa unità della frequenza dell'abitudine
    // per una migliore comprensione da parte dell'utente
    if (habit.frequency_unit === "day") {
      // Se la frequenza è giornaliera, mostra i giorni rimanenti
      const daysLeft = Math.max(0, differenceInDays(endDate, now));
      setTimeLeft({
        value: daysLeft,
        unit: daysLeft === 1 ? "day" : "days",
      });
    } else if (habit.frequency_unit === "week") {
      // Se la frequenza è settimanale, mostra le settimane rimanenti
      const weeksLeft = Math.max(0, differenceInWeeks(endDate, now));
      setTimeLeft({
        value: weeksLeft,
        unit: weeksLeft === 1 ? "week" : "weeks",
      });
    } else if (habit.frequency_unit === "month") {
      // Se la frequenza è mensile, mostra i mesi rimanenti
      const monthsLeft = Math.max(0, differenceInMonths(endDate, now));
      setTimeLeft({
        value: monthsLeft,
        unit: monthsLeft === 1 ? "month" : "months",
      });
    } else {
      // Fallback a giorni se la frequenza non è specificata
      const daysLeft = Math.max(0, differenceInDays(endDate, now));
      setTimeLeft({
        value: daysLeft,
        unit: daysLeft === 1 ? "day" : "days",
      });
    }
  };

  return (
    <Link href={`/dashboard/${habit.slug}`}>
      <Card className="w-full hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{habit.name}</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {habit.frequency_value}/{habit.frequency_unit} • ${stake.amount}{" "}
                at stake
              </p>
              <Progress value={completionPercentage} className="h-2" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <TrendingUp
                  className={`h-4 w-4 ${
                    completionPercentage > 50
                      ? "text-indigo-500"
                      : "text-zinc-500"
                  }`}
                />
                <span
                  className={`text-xs ${
                    completionPercentage > 50
                      ? "text-indigo-500"
                      : "text-zinc-500"
                  }`}
                >
                  {completionPercentage}% Complete
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {timeLeft.value} {timeLeft.unit} left
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
