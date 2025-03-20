export interface PricingTier {
    name: string;
    productId: {
        monthly: string;
        yearly: string;
    };
    price: {
        monthly: number | string;
        yearly: number | string;
    };
    description: string;
    features: string[];
    cta: string;
    popular?: boolean;
}

export const TIERS: PricingTier[] = [
    {
        name: "Free",
        productId: {
            monthly: process.env.NEXT_PUBLIC_FREE_PLAN_ID!,
            yearly: process.env.NEXT_PUBLIC_FREE_PLAN_ID!,
        },
        price: {
            monthly: "Free",
            yearly: "Free",
        },
        description: "Start building better habits with real money stakes.",
        features: [
            "5 Habits",
            "Basic Insights (Progress Charts)",
            "Minimum Stake: $5 per habit",
            "Real Money Stakes", // Updated phrasing
        ],
        cta: "Get Started",
    },
    {
        name: "Premium",
        productId: {
            monthly: process.env.NEXT_PUBLIC_PREMIUM_MONTHLY_PLAN_ID!,
            yearly: process.env.NEXT_PUBLIC_PREMIUM_YEARLY_PLAN_ID!,
        },
        price: {
            monthly: 4.99,
            yearly: 49.99,
        },
        description:
            "Supercharge your habit-building with advanced insights and AI-powered recommendations.",
        features: [
            "Unlimited Habits",
            "Pro Insights (Advanced Analytics)",
            "AI Features (Personalized Recommendations)",
            "Minimum Stake: $1 per habit",
            "Lower Staking Limits",
        ],
        cta: "Upgrade to Premium",
        popular: true, // You can mark this as the most popular plan
    },
    // Removed the other tiers as they don't fit our model
];
