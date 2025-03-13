import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { Tables } from "@/supabase/models/database.types";
import { enUS } from "date-fns/locale";

interface HabitHeatmapProps {
  data?: Tables<"habit_checkins">[];
}

export default function HabitHeatmap({ data = [] }: HabitHeatmapProps) {
  // Generate an array of dates for the last 30 days
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 29);

  const dateRange = eachDayOfInterval({
    start: thirtyDaysAgo,
    end: today,
  });

  // Create an object to track check-ins by date
  const checkinsMap: Record<string, boolean> = {};

  // Populate the map with real data
  data.forEach((checkin) => {
    const date = new Date(checkin.created_at).toDateString();
    checkinsMap[date] = checkin.status === "true";
  });

  // Create the data array for the heatmap
  const heatmapData = dateRange.map((date) => {
    const dateString = date.toDateString();
    return {
      date,
      completed: checkinsMap[dateString] || false,
    };
  });

  // If there's no data, show a message
  if (data.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Activity Heatmap</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">
            Complete your habits to see your activity here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Activity Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="grid grid-cols-7 gap-1">
            {heatmapData.map((day, i) => (
              <Tooltip key={i}>
                <TooltipTrigger>
                  <div
                    className={`w-full aspect-square rounded transition-colors ${
                      day.completed
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-muted hover:bg-muted-foreground/20"
                    }`}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{format(day.date, "MMM d, yyyy", { locale: enUS })}</p>
                  <p className="text-xs text-muted-foreground">
                    {day.completed ? "Completed" : "Not completed"}
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
