// Subscription tiers shared between client and server
export type SubscriptionTier = "free" | "premium";

// Subscription status
export interface Subscription {
    tier: SubscriptionTier;
    isActive: boolean;
    expiresAt?: string | null; // ISO date string
    features: string[]; // List of feature keys available
    limits: {
        habits: number; // Number of habits allowed
        minStake: number; // Minimum stake amount
    };
}

// Default subscription tiers - exported as a constant for use on both client and server
export const SUBSCRIPTION_TIERS: Record<
    SubscriptionTier,
    Omit<Subscription, "isActive" | "expiresAt">
> = {
    free: {
        tier: "free",
        features: ["basic_tracking", "basic_insights"],
        limits: {
            habits: 5,
            minStake: 5,
        },
    },
    premium: {
        tier: "premium",
        features: [
            "basic_tracking",
            "basic_insights",
            "advanced_insights",
            "unlimited_habits",
            "ai_recommendations",
            "lower_stakes",
        ],
        limits: {
            habits: Infinity,
            minStake: 1,
        },
    },
};

// Helper function to get features for a specific tier
export function getSubscriptionTierDetails(
    tier: SubscriptionTier,
): Omit<Subscription, "isActive" | "expiresAt"> {
    return SUBSCRIPTION_TIERS[tier] || SUBSCRIPTION_TIERS.free;
}
