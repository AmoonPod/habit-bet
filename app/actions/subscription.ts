"use server";

import { createClient } from "@/utils/supabase/server";
import {
    getSubscriptionTierDetails,
    Subscription,
    SubscriptionTier,
} from "@/lib/subscription";
import { api } from "@/lib/polar";
import { redirect } from "next/navigation";
import { PricingTier, TIERS } from "@/lib/tiers";
import { Tables } from "@/database.types";

export type SubscriptionResult = {
    success: boolean;
    subscription?: Subscription;
    error?: string;
};

/**
 * Helper function to determine the tier from a product ID using the TIERS mapping
 */
function getTierFromProductId(productId: string | null): SubscriptionTier {
    if (!productId) return "free";

    // Look through TIERS to find a matching product ID
    for (const tier of TIERS) {
        if (
            tier.productId.monthly === productId ||
            tier.productId.yearly === productId
        ) {
            // Convert tier name to lowercase for matching with SubscriptionTier type
            const tierName = tier.name.toLowerCase() as SubscriptionTier;
            return tierName;
        }
    }

    // Default to free if no match found
    return "free";
}

/**
 * Server action to fetch the current user's subscription details
 */
export async function fetchUserSubscription(): Promise<SubscriptionResult> {
    try {
        const supabase = await createClient();

        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth
            .getSession();

        if (sessionError || !session) {
            return {
                success: false,
                error: "Unauthorized",
            };
        }

        const userId = session.user.id;

        // Query the database for subscription data
        const { data: subscriptionData, error: subscriptionError } =
            await supabase
                .from("subscriptions")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

        if (subscriptionError && subscriptionError.code !== "PGRST116") {
            // Error other than "no rows returned"
            console.error("Error fetching subscription:", subscriptionError);
            return {
                success: false,
                error: "Failed to fetch subscription data",
            };
        }

        if (!subscriptionData) {
            // No subscription found, return default free tier
            const freeTier = getSubscriptionTierDetails("free");
            return {
                success: true,
                subscription: {
                    ...freeTier,
                    isActive: true,
                },
            };
        }

        const subscriptionTyped = subscriptionData as Tables<"subscriptions">;

        // Determine the tier from the product ID in the database
        const productId = subscriptionTyped.productId || null;
        console.log("Product ID from database:", productId);

        const tier = getTierFromProductId(productId);
        console.log("Determined tier:", tier);

        const tierDetails = getSubscriptionTierDetails(tier);

        const subscription = {
            ...tierDetails,
            isActive: subscriptionTyped.status === "active",
            expiresAt: subscriptionTyped.currentPeriodEnd,
        };

        return {
            success: true,
            subscription,
        };
    } catch (error) {
        console.error("Unexpected error:", error);
        return {
            success: false,
            error: "Internal server error",
        };
    }
}

/**
 * Server action to cancel the current user's subscription
 */
export async function cancelUserSubscription(): Promise<
    { success: boolean; error?: string }
> {
    try {
        const supabase = await createClient();

        // Get user session
        const { data: { session }, error: sessionError } = await supabase.auth
            .getSession();

        if (sessionError || !session) {
            return { success: false, error: "Unauthorized" };
        }

        const userId = session.user.id;

        // Get current subscription from database
        const { data: subscriptionData, error: subscriptionError } =
            await supabase
                .from("subscriptions")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

        if (subscriptionError && subscriptionError.code !== "PGRST116") {
            console.error("Error fetching subscription:", subscriptionError);
            return {
                success: false,
                error: "Failed to fetch current subscription",
            };
        }

        if (!subscriptionData || subscriptionData.status !== "active") {
            return { success: false, error: "No active subscription found" };
        }

        // TODO: In a real implementation, you would call the Polar API to cancel the subscription
        // For now, we'll just update our database

        // Update our database to mark subscription as cancelled
        const { error: updateError } = await supabase
            .from("subscriptions")
            .update({
                status: "cancelled",
                cancelled_at: new Date().toISOString(),
            })
            .eq("id", subscriptionData.id);

        if (updateError) {
            console.error("Error updating subscription:", updateError);
            return {
                success: false,
                error: "Failed to update subscription status",
            };
        }

        return { success: true };
    } catch (error) {
        console.error("Subscription cancellation error:", error);
        return { success: false, error: "Failed to cancel subscription" };
    }
}

/**
 * Server action to create a checkout session with Polar and redirect the user
 */
export async function createPolarCheckout(
    productId: string,
    billingCycle: "monthly" | "yearly",
): Promise<{ success: boolean; error?: string; checkoutUrl?: string }> {
    try {
        const supabase = await createClient();
        const { data: { session }, error: sessionError } = await supabase.auth
            .getSession();

        if (sessionError || !session) {
            return { success: false, error: "Unauthorized" };
        }

        const user = session.user;

        if (!productId) {
            return { success: false, error: "Invalid product ID" };
        }

        const successUrl =
            `${process.env.NEXT_PUBLIC_APP_URL}/confirmation?checkoutId={CHECKOUT_ID}`;

        // Create checkout session with Polar
        const checkoutSession = await api.checkouts.create({
            productId: productId,
            customerExternalId: user.id,
            customerEmail: user.email,
            customerName: user.user_metadata.full_name ||
                user.email?.split("@")[0] || "Customer",
            successUrl,
        });

        return {
            success: true,
            checkoutUrl: checkoutSession.url,
        };
    } catch (error) {
        console.error("Error creating checkout:", error);
        return { success: false, error: "Failed to create checkout session" };
    }
}
