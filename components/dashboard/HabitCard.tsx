import { getStakeByUuid } from "@/app/dashboard/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tables } from "@/supabase/models/database.types";
import { Target, TrendingUp } from "lucide-react";
import Link from "next/link"; // Import Link from Next.js

export default async function HabitCard(habit: Tables<"habits">) {
  const stake: Tables<"habit_stakes"> = await getStakeByUuid(habit.stake_uuid!);
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
              <Progress value={50} className="h-2" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-500">{50}% Complete</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {50} days left
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
