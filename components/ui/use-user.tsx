"use client";

import { Tables } from "@/database.types";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";


export const useUser = () => {
    const [user, setUser] = useState<Tables<"profiles"> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                const supabase = createClient();

                // Get user info
                const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

                if (authError) {
                    throw authError;
                }

                if (!authUser) {
                    setUser(null);
                    return;
                }

                // Get user profile
                const { data: profileData, error: profileError } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", authUser.id)
                    .single();

                if (profileError && profileError.code !== "PGRST116") {
                    console.error("Error fetching profile:", profileError);
                }

                setUser(profileData);
            } catch (err) {
                console.error("Error in useUser:", err);
                setError(err instanceof Error ? err : new Error("Unknown error"));
            } finally {
                setLoading(false);
            }
        };

        fetchUser();

        // Setup subscription for auth changes
        const supabase = createClient();
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                fetchUser();
            } else {
                setUser(null);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    return { user, loading, error };
}; 