"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tables } from "@/supabase/models/database.types";
import { useState, useMemo } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  subWeeks,
  isWithinInterval,
} from "date-fns";
import { it } from "date-fns/locale";

interface ProgressChartProps {
  data?: Tables<"habit_checkins">[];
}

export default function ProgressChart({ data = [] }: ProgressChartProps) {
  const [period, setPeriod] = useState<
    "this-week" | "last-week" | "this-month"
  >("this-week");

  const chartData = useMemo(() => {
    const today = new Date();
    let dateRange: Date[];
    let labels: string[];

    // Definisci l'intervallo di date in base al periodo selezionato
    if (period === "this-week") {
      const weekStart = startOfWeek(today, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
      dateRange = eachDayOfInterval({ start: weekStart, end: weekEnd });
      labels = dateRange.map((date) => format(date, "EEE", { locale: it }));
    } else if (period === "last-week") {
      const lastWeekStart = startOfWeek(subWeeks(today, 1), {
        weekStartsOn: 1,
      });
      const lastWeekEnd = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
      dateRange = eachDayOfInterval({ start: lastWeekStart, end: lastWeekEnd });
      labels = dateRange.map((date) => format(date, "EEE", { locale: it }));
    } else {
      // this-month - mostra solo le settimane
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      dateRange = eachDayOfInterval({ start: monthStart, end: monthEnd });

      // Raggruppa per settimana
      const weeks: Date[][] = [];
      let currentWeek: Date[] = [];

      dateRange.forEach((date) => {
        if (date.getDay() === 1 && currentWeek.length > 0) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
        currentWeek.push(date);
      });

      if (currentWeek.length > 0) {
        weeks.push(currentWeek);
      }

      // Usa solo la prima data di ogni settimana per l'etichetta
      dateRange = weeks.map((week) => week[0]);
      labels = dateRange.map((date) => `W${Math.ceil(date.getDate() / 7)}`);
    }

    // Calcola il numero di check-in completati per ogni giorno/settimana
    const completedCounts = dateRange.map((date) => {
      if (period === "this-month") {
        // Per il mese, conta i check-in per settimana
        const weekStart = date;
        const weekEnd = new Date(
          Math.min(
            new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate() + 6
            ).getTime(),
            new Date(date.getFullYear(), date.getMonth() + 1, 0).getTime()
          )
        );

        return data.filter((checkin) => {
          const checkinDate = new Date(checkin.created_at);
          return (
            isWithinInterval(checkinDate, { start: weekStart, end: weekEnd }) &&
            checkin.status === "true"
          );
        }).length;
      } else {
        // Per le settimane, conta i check-in per giorno
        return data.filter((checkin) => {
          const checkinDate = new Date(checkin.created_at);
          return (
            checkinDate.toDateString() === date.toDateString() &&
            checkin.status === "true"
          );
        }).length;
      }
    });

    // Calcola il numero totale di abitudini per ogni giorno/settimana
    // Questo è un valore fittizio, in un'app reale dovresti calcolare il numero effettivo di abitudini
    // che dovevano essere completate in quel giorno/settimana
    const totalCounts = dateRange.map(() =>
      Math.max(1, Math.round(data.length / 7))
    );

    return {
      labels,
      completed: completedCounts,
      total: totalCounts,
    };
  }, [data, period]);

  // Se non ci sono dati, mostra un messaggio
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-normal">
            Progresso Settimanale
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">
            Completa le tue abitudini per vedere il tuo progresso qui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-normal">
          Progresso Settimanale
        </CardTitle>
        <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
          <SelectTrigger className="w-[120px] h-8">
            <SelectValue placeholder="Seleziona periodo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this-week">Questa Settimana</SelectItem>
            <SelectItem value="last-week">Settimana Scorsa</SelectItem>
            <SelectItem value="this-month">Questo Mese</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full flex items-end justify-between gap-2">
          {chartData.labels.map((label, index) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 flex-1"
            >
              <div className="w-full flex-1 bg-muted rounded-sm relative">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-primary transition-all duration-300"
                  style={{
                    height: `${
                      (chartData.completed[index] / chartData.total[index]) *
                      100
                    }%`,
                    minHeight: "4px",
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
