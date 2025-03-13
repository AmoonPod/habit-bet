import Link from "next/link";
import { Button } from "../ui/button";
import { ChevronLeft } from "lucide-react";
import { Tables } from "@/supabase/models/database.types";
import EditHabitDialog from "./EditHabitDialog";
import DeleteHabitDialog from "./DeleteHabitDialog";
import { createClient } from "@/utils/supabase/server";

interface HabitHeaderProps {
  habit: Tables<"habits">;
  hasCheckins: boolean;
}

export default function HabitHeader({ habit, hasCheckins }: HabitHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{habit.name}</h1>
      </div>
      <div className="flex items-center gap-2">
        <EditHabitDialog habit={habit} hasCheckins={hasCheckins} />
        <DeleteHabitDialog habit={habit} hasCheckins={hasCheckins} />
      </div>
    </div>
  );
}
