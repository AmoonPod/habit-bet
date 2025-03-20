"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Session, User } from "@supabase/supabase-js";

type SessionState = {
    session: Session | null;
    user: User | null;
    isLoading: boolean;
    error: Error | null;
};

export function useSession() {
    const supabase = createClient();
    const [state, setState] = useState<SessionState>({
        session: null,
        user: null,
        isLoading: true,
        error: null,
    });

    useEffect(() => {
        // Get the initial session
        const getInitialSession = async () => {
            try {
                const { data, error } = await supabase.auth.getSession();

                if (error) {
                    throw error;
                }

                setState({
                    session: data.session,
                    user: data.session?.user || null,
                    isLoading: false,
                    error: null,
                });
            } catch (error) {
                setState({
                    session: null,
                    user: null,
                    isLoading: false,
                    error: error as Error,
                });
            }
        };

        getInitialSession();

        // Listen for auth changes
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setState({
                    session,
                    user: session?.user || null,
                    isLoading: false,
                    error: null,
                });
            },
        );

        // Cleanup subscription on unmount
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [supabase]);

    return {
        session: state.session,
        user: state.user,
        isLoading: state.isLoading,
        error: state.error,
        signOut: () => supabase.auth.signOut(),
    };
}
