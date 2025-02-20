import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp } from "lucide-react";

interface HabitCardProps {
  title?: string;
  frequency?: string;
  stake?: number;
  progress?: number;
  daysLeft?: number;
}

export default function HabitCard({
  title = "Go to the Gym",
  frequency = "3x per week",
  stake = 10,
  progress = 66,
  daysLeft = 5,
}: HabitCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Target className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {frequency} • ${stake} at stake
            </p>
            <Progress value={progress} className="h-2" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-xs text-green-500">
                {progress}% Complete
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {daysLeft} days left
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
