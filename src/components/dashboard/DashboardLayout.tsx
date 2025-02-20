import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { useState } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isCollapsed={isCollapsed} onCollapsedChange={setIsCollapsed} />
      <main
        className={cn(
          "transition-all duration-300",
          isCollapsed ? "md:ml-16" : "md:ml-64",
          "p-8",
        )}
      >
        {children}
      </main>
    </div>
  );
}
