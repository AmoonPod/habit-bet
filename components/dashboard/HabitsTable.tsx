"use client";

import { Tables } from "@/supabase/models/database.types";
import HabitTable from "./HabitTable";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useMediaQuery } from "@/hooks/use-media-query";

interface HabitsTableProps {
  habits: Tables<"habits">[];
  stakes: Record<string, Tables<"habit_stakes">>;
  checkins: Tables<"habit_checkins">[];
  currentPage: number;
  totalPages: number;
}

export function HabitsTable({
  habits,
  stakes,
  checkins,
  currentPage,
  totalPages,
}: HabitsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");

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

  // Converti l'oggetto stakes in un array per il componente HabitTable
  const stakesArray = Object.values(stakes);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <h2 className="text-lg font-semibold">Active Habits</h2>
        </div>
        {habits.length > 0 && isMobile && (
          <div className="text-sm text-muted-foreground">
            {habits.length} {habits.length === 1 ? "habit" : "habits"}
          </div>
        )}
      </div>

      <HabitTable habits={habits} stakes={stakesArray} checkins={checkins} />

      {/* Pagination - Responsive design */}
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

          {!isMobile ? (
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
          ) : (
            <div className="flex items-center">
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          )}

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
