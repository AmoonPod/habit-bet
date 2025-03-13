"use server";
import HabitHeatmap from "@/components/dashboard/HabitHeatmap";
import { HabitsTable } from "@/components/dashboard/HabitsTable";
import { Target, Plus } from "lucide-react";
import { getHabits, getHabitCheckins, getAllStakes } from "./actions";
import DashboardFilters from "@/components/dashboard/DashboardFilters";
import DashboardSummary from "@/components/dashboard/DashboardSummary";
import { Tables } from "@/supabase/models/database.types";
import HabitInsights from "@/components/dashboard/HabitInsights";
import NewHabitButton from "@/components/dashboard/NewHabitButton";
import NewHabitDialog from "@/components/dashboard/NewHabitDialog";

interface SearchParams {
  page?: string;
  filter?: string;
  sort?: string;
}

export default async function HabitsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Wait for searchParams to be available
  const params = await Promise.resolve(searchParams);

  const page = Number(params.page) || 1;
  const filter = params.filter || "all";
  const sort = params.sort || "recent";

  const habits = await getHabits();

  // If there are no habits, show welcome message
  if (habits.length === 0) {
    return (
      <div className="p-8 w-full min-h-screen flex justify-center items-center">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 p-4 bg-primary/10 rounded-full">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Habits Yet</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            Start your journey by creating your first habit. Remember, every
            great achievement begins with a single step!
          </p>
          <p className="text-sm text-muted-foreground">
            Click on the{" "}
            <span className="inline-flex items-center justify-center bg-primary text-primary-foreground rounded-full w-5 h-5 mx-1">
              <Plus className="h-3 w-3" />
            </span>{" "}
            button in the top right to get started.
          </p>
        </div>
      </div>
    );
  }

  // Retrieve check-ins for habits (for charts)
  const checkins = await getHabitCheckins();

  // Retrieve all stakes
  const allStakes = await getAllStakes();

  // Create an object with stakes indexed by uuid
  const stakesMap: Record<string, Tables<"habit_stakes">> = {};
  allStakes.forEach((stake: Tables<"habit_stakes">) => {
    if (stake.uuid) {
      stakesMap[stake.uuid] = stake;
    }
  });

  // Filter and sort habits based on parameters
  let filteredHabits = [...habits];

  // Apply filters
  if (filter === "active") {
    filteredHabits = filteredHabits.filter((habit) => {
      // Logic to determine if a habit is active
      const startDate = new Date(habit.created_at);
      const now = new Date();

      // Calculate end date based on duration
      let endDate;
      if (habit.duration_unit === "day" && habit.duration_value) {
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + habit.duration_value);
      } else if (habit.duration_unit === "week" && habit.duration_value) {
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + habit.duration_value * 7);
      } else if (habit.duration_unit === "month" && habit.duration_value) {
        endDate = new Date(startDate);
        endDate.setMonth(startDate.getMonth() + habit.duration_value);
      } else {
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 30); // Default to 30 days
      }

      // Habit is active if current date is before end date
      return now < endDate;
    });
  } else if (filter === "completed") {
    filteredHabits = filteredHabits.filter((habit) => {
      // Logic to determine if a habit is completed
      const habitCheckins = checkins.filter(
        (checkin) =>
          checkin.habit_uuid === habit.uuid && checkin.status === "true"
      );

      // Calculate total expected check-ins
      const totalExpectedCheckins =
        (habit.frequency_value || 0) * (habit.duration_value || 0);

      // Habit is completed if number of check-ins meets or exceeds expected
      return habitCheckins.length >= totalExpectedCheckins;
    });
  }

  // Apply sorting
  if (sort === "recent") {
    filteredHabits.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } else if (sort === "alphabetical") {
    filteredHabits.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }

  // Pagination
  const itemsPerPage = 10; // Increased for table view
  const totalPages = Math.ceil(filteredHabits.length / itemsPerPage);
  const paginatedHabits = filteredHabits.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="p-4 md:p-8 space-y-6 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Your Habits
          </h1>
          <p className="text-muted-foreground">Track your habits and bets</p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <DashboardFilters currentFilter={filter} currentSort={sort} />
          <NewHabitDialog />
        </div>
      </div>

      {/* Habits summary */}
      <div className="mb-6">
        <DashboardSummary habits={habits} checkins={checkins} />
      </div>

      {/* Habits in table format */}
      <div className="mb-8">
        <HabitsTable
          habits={paginatedHabits as Tables<"habits">[]}
          stakes={stakesMap}
          checkins={checkins}
          currentPage={page}
          totalPages={totalPages}
        />
      </div>

      {/* Charts only if there's enough data */}
      {habits.length > 0 && checkins.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-card rounded-lg border p-4">
            <h2 className="text-xl font-semibold mb-4">Activity Heatmap</h2>
            <HabitHeatmap data={checkins} />
          </div>
          <div className="bg-card rounded-lg border p-4">
            <h2 className="text-xl font-semibold mb-4">Insights</h2>
            <HabitInsights habits={habits} checkins={checkins} />
          </div>
        </div>
      )}
    </div>
  );
}
