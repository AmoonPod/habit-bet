import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";

import "../globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

const bricolage_Grotesque = Bricolage_Grotesque({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HabitBet",
  description: "Build better habits through radical trust",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <main className={bricolage_Grotesque.className}>
        <SidebarTrigger />
      </main>

      {children}
    </SidebarProvider>
  );
}
