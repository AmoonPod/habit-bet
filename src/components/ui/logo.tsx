import { Coins } from "lucide-react";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <Coins className="w-6 h-6 text-primary" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
      </div>
      <span className="font-bold tracking-tight">habitbet</span>
    </div>
  );
}
