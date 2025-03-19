"use server";

import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";

export async function getOAuthURL() {
    try {
        const supabase = await createClient();
        const headersList = await headers();
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
                    access_type: "offline",
                    prompt: "consent",
                },
            },
        });

        if (error) {
            console.error("Auth error:", error);
            throw error;
        }

        return { success: true, url: data.url };
    } catch (error) {
        console.error("Sign in error:", error);
        return { success: false, error: String(error) };
    }
}
