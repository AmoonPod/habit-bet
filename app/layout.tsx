import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { SelectedPlanProvider } from "@/hooks/use-selected-plan";
import { SubscriptionProvider } from "@/hooks/use-subscription";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";

const bricolage_Grotesque = Bricolage_Grotesque({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HabitBet",
  description: "Track habits, set stakes, and build consistency",
  manifest: "/manifest.json",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HabitBet",
  },
  applicationName: "HabitBet",
  formatDetection: {
    telephone: false,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className={bricolage_Grotesque.className}>
        <SelectedPlanProvider>
          <SubscriptionProvider>
            {children}
            <ServiceWorkerRegistration />
          </SubscriptionProvider>
        </SelectedPlanProvider>
      </body>
    </html>
  );
}
