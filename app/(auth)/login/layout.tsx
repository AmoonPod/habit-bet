import "../../globals.css";
import { createClient } from "@/utils/supabase/server";
import { Bricolage_Grotesque } from "next/font/google";
import { redirect } from "next/navigation";

const bricolage_Grotesque = Bricolage_Grotesque({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={bricolage_Grotesque.className}>{children}</body>
    </html>
  );
}
