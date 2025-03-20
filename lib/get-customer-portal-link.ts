"use server";

import { createClient } from "@/utils/supabase/server";
import { api } from "./polar";

export async function getCustomerPortalLink() {
    const supabase = await createClient();
    const session = await supabase.auth.getSession();

    try {
        if (!session?.data?.session?.user?.id) {
            return {
                success: false,
                message: "User not authenticated",
                url: null,
            };
        }

        // Fetch customerId where userId matches
        const result = await supabase
            .from("subscription")
            .select("customerId")
            .eq("userId", session.data.session.user.id)
            .single();

        const customerId = result.data?.customerId;

        if (!customerId) {
            return {
                success: false,
                message: "No customer ID found",
                url: null,
            };
        }

        // Create a customer session with Polar
        const response = await api.customerSessions.create({
            customerId,
        });

        if (!response?.customerPortalUrl) {
            return {
                success: false,
                message: "Failed to get customer portal link",
                url: null,
            };
        }

        return { success: true, url: response.customerPortalUrl };
    } catch (error) {
        console.error("Error fetching customer portal link:", error);
        return {
            success: false,
            message: "Error fetching customer portal link",
            url: null,
        };
    }
}
