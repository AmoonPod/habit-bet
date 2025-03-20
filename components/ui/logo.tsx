import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  hideText?: boolean;
}

export function Logo({ className, hideText }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="relative">
        <Coins className="w-6 h-6 text-primary" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
      </div>
      {!hideText && <span className="font-bold tracking-tight">HabitBet</span>}
    </div>
  );
}
