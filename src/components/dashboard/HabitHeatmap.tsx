import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";

interface HabitHeatmapProps {
  data?: Array<{ date: string; completed: boolean }>;
}

export default function HabitHeatmap({
  data = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    completed: Math.random() > 0.3,
  })),
}: HabitHeatmapProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Activity Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="grid grid-cols-7 gap-1">
            {data.map((day, i) => (
              <Tooltip key={i}>
                <TooltipTrigger>
                  <div
                    className={`w-full aspect-square rounded transition-colors ${day.completed ? "bg-green-500 hover:bg-green-600" : "bg-muted hover:bg-muted-foreground/20"}`}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{format(new Date(day.date), "MMM d, yyyy")}</p>
                  <p className="text-xs text-muted-foreground">
                    {day.completed ? "Completed" : "Missed"}
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
