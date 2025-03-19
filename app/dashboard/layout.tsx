"use client";
import "../globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";

// Create a wrapper component to handle sidebar-specific logic
function DashboardContent({ children }: { children: React.ReactNode }) {
  // Handle viewport dimensions for PWA
  useEffect(() => {
    // Set viewport height variable based on window inner height
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Set initial height
    setViewportHeight();

    // Update on resize and orientation change
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);

    return () => {
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
    };
  }, []);

  return (
    <div className="flex min-h-screen h-[calc(100*var(--vh,1vh))] w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col w-full max-w-full overflow-hidden">
        <div className="p-3 border-b md:hidden flex items-center">
          <SidebarTrigger className="ml-0" />
          <h1 className="ml-3 text-lg font-medium">Habit Bet</h1>
        </div>
        <main className="flex-1 w-full max-w-full overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardContent>
        {children}
      </DashboardContent>
      <Toaster />
    </SidebarProvider>
  );
}
