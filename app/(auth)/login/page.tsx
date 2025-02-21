import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginForm() {
  const signIn = async () => {
    "use server";
    const supabase = await createClient();
    const origin = (await headers()).get("origin");
    const { error, data } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
    if (error) {
      console.error(error);
    } else {
      return redirect(data.url);
    }
  };

  return (
    <form action={signIn}>
      <Button type="submit">Login with google</Button>
    </form>
  );
}
