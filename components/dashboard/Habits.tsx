"use client";

import { Tables } from "@/supabase/models/database.types";
import HabitCard from "./HabitCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

interface HabitsProps {
  habits: Tables<"habits">[];
  stakes: Record<string, Tables<"habit_stakes">>;
  checkins: Tables<"habit_checkins">[];
  currentPage: number;
  totalPages: number;
}

export function Habits({
  habits,
  stakes,
  checkins,
  currentPage,
  totalPages,
}: HabitsProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  if (habits.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No habits found with the selected filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {habits.map((habit) => {
          // Get the stake corresponding to the habit
          const stake = stakes[habit.stake_uuid || ""] || { amount: 0 };

          // Get check-ins for this habit
          const habitCheckins = checkins.filter(
            (checkin) => checkin.habit_uuid === habit.uuid
          );

          return (
            <HabitCard
              key={habit.uuid}
              habit={habit}
              stake={stake}
              checkins={habitCheckins}
            />
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
