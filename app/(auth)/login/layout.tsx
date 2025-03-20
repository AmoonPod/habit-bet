import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Optional: Check if user is already authenticated and redirect if needed

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
