import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginForm() {
  const signIn = async () => {
    "use server";

    try {
      const supabase = await createClient();
      const headersList = headers();
      const origin = headersList.get("origin");
      const host = headersList.get("host");

      // Determine the redirect URL based on the environment
      const redirectTo = process.env.NODE_ENV === "development"
        ? `${origin}/auth/callback`
        : `https://${host}/auth/callback`;

      const { error, data } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error("Auth error:", error);
        throw error;
      }

      return redirect(data.url);
    } catch (error) {
      console.error("Sign in error:", error);
      // You might want to redirect to an error page here
      return redirect("/auth/auth-code-error");
    }
  };

  return (
    <form action={signIn}>
      <Button type="submit">Login with Google</Button>
    </form>
  );
}
