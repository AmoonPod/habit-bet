import { Button } from "@/components/ui/button";
import { getHabitBySlug, getStakeByUuid } from "../actions";
import { Tables } from "@/supabase/models/database.types";
import { ChevronLeft, EditIcon, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import CheckInButton from "@/components/habit/CheckInButton";
import HabitStats from "@/components/habit/HabitStats";
import HabitCharts from "@/components/habit/HabitCharts";
import CheckInSection from "@/components/habit/CheckInSection";
import HabitHeader from "@/components/habit/HabitHeader";

export default async function HabitPage({
  params,
}: {
  params: { slug: string };
}) {
  const habit_slug = params.slug;
  const habit: Tables<"habits"> = await getHabitBySlug(
    habit_slug as unknown as string
  );

  const stake: Tables<"habit_stakes"> = await getStakeByUuid(habit.stake_uuid!);

  // Placeholder data - replace with actual data fetching
  const currentStreak = 50;
  const completionRate = 75;
  const totalSaved = 125;
  const nextCheckIn = new Date();

  const handleCheckIn = () => {
    // Implement your check-in logic here (e.g., update database)
    console.log("Check-in confirmed!");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <HabitHeader habit={habit} />
      <CheckInSection habit={habit} stake={stake} />
      <HabitStats
        currentStreak={currentStreak}
        completionRate={completionRate}
        totalSaved={totalSaved}
        nextCheckIn={nextCheckIn}
      />
      <HabitCharts />
    </div>
  );
}
