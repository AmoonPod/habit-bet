import { Tables } from "@/supabase/models/database.types";
import { Card, CardContent } from "../ui/card";
import CheckInButton from "./CheckInButton";

interface CheckInSectionProps {
  habit: Tables<"habits">;
  stake: Tables<"habit_stakes">;
}

export default function CheckInSection(params: CheckInSectionProps) {
  return (
    <Card className="mb-8 relative overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl font-semibold">
              Ready for Today's {params.habit.name}?
            </h3>
            <p className="text-muted-foreground">
              ${params.stake.amount} at stake • {50} days left
            </p>
          </div>
          <CheckInButton
            habitName={params.habit.name!}
            stakeAmount={params.stake.amount!}
          />
        </div>
      </CardContent>
    </Card>
  );
}
