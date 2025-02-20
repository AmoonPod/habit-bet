"use client";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <main
        className={cn(
          "transition-all duration-300",
          isCollapsed ? "md:ml-16" : "md:ml-64",
          "p-8"
        )}
      >
        {children}
      </main>
    </div>
  );
}
