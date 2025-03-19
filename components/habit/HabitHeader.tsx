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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-2">
      <div className="flex items-center gap-2 md:gap-4">
        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" asChild>
          <Link href="/dashboard">
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
        </Button>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">{habit.name}</h1>
      </div>
      <div className="flex items-center gap-2 self-end sm:self-auto mt-2 sm:mt-0">
        <EditHabitDialog habit={habit} hasCheckins={hasCheckins} />
        <DeleteHabitDialog habit={habit} hasCheckins={hasCheckins} />
      </div>
    </div>
  );
}
