"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { BadgeCheck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Plan {
    name: string;
    id: string;
    priceMonthly: string | number;
    priceYearly: string | number;
    description: string;
    features: string[];
    cta: string;
    popular?: boolean;
}

const plans: Plan[] = [
    {
        name: "Free",
        id: "free",
        priceMonthly: "Free",
        priceYearly: "Free",
        description: "Start building better habits with real money stakes.",
        features: [
            "Unlimited Habits",
            "Basic Insights (Progress Charts)",
            "Minimum Stake: $5 per habit",
            "Real Money Stakes",
        ],
        cta: "Current Plan",
    },
    {
        name: "Premium",
        id: "premium",
        priceMonthly: 4.99,
        priceYearly: 49.99,
        description: "Supercharge your habit-building with advanced insights and AI-powered recommendations.",
        features: [
            "All Free Features",
            "Pro Insights (Advanced Analytics)",
            "AI Features (Personalized Recommendations)",
            "Minimum Stake: $1 per habit",
            "Lower Staking Limits",
        ],
        cta: "Upgrade to Premium",
        popular: true,
    }
];

interface UpgradePlanModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function UpgradePlanModal({ isOpen, onClose }: UpgradePlanModalProps) {
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
    const [selectedPlan, setSelectedPlan] = useState<string>("premium");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleUpgrade = async (planId: string) => {
        if (planId === "free") return; // Don't process upgrades for the free plan

        setIsLoading(true);
        setSelectedPlan(planId);

        try {
            // Simulate API call to Polar.sh
            await new Promise(resolve => setTimeout(resolve, 1500));

            // In a real implementation, you would:
            // 1. Create a checkout session with Polar.sh
            // 2. Redirect to their checkout page or show embedded form
            // 3. Handle the webhook for successful payment

            toast({
                title: "Success!",
                description: `You've successfully upgraded to the ${planId} plan.`,
            });

            onClose();
        } catch (error) {
            toast({
                title: "Error",
                description: "There was an error processing your upgrade. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const formatPrice = (price: string | number) => {
        if (typeof price === "string") return price;
        return `$${price.toFixed(2)}`;
    };

    const getYearlySavings = () => {
        const premiumPlan = plans.find(p => p.id === "premium");
        if (!premiumPlan) return null;

        const monthlyPrice = typeof premiumPlan.priceMonthly === 'number' ? premiumPlan.priceMonthly : 0;
        const yearlyPrice = typeof premiumPlan.priceYearly === 'number' ? premiumPlan.priceYearly : 0;
        const monthlyForYear = monthlyPrice * 12;

        if (monthlyPrice === 0) return null;

        const savings = monthlyForYear - yearlyPrice;
        const savingsPercentage = Math.round((savings / monthlyForYear) * 100);

        return savingsPercentage;
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[700px] p-0 overflow-hidden max-h-[85vh] sm:max-h-[90vh] flex flex-col">
                <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
                    <DialogTitle className="text-xl sm:text-2xl font-bold">Upgrade Your Plan</DialogTitle>
                    <DialogDescription>
                        Choose the plan that works best for you and your habits.
                    </DialogDescription>
                </DialogHeader>

                <div className="px-4 sm:px-6 py-3 overflow-y-auto pb-5 sm:pb-6">
                    <div className="flex justify-center mb-4 sm:mb-6">
                        <Tabs
                            value={billingCycle}
                            onValueChange={(value) => setBillingCycle(value as "monthly" | "yearly")}
                            className="w-full max-w-xs"
                        >
                            <TabsList className="grid grid-cols-2">
                                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                                <TabsTrigger value="yearly">
                                    Yearly
                                    <span className="ml-1 sm:ml-1.5 inline-flex items-center rounded-full bg-emerald-100 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium text-emerald-800">
                                        Save {getYearlySavings()}%
                                    </span>
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {plans.map((plan) => {
                            const isCurrentPlan = plan.id === "free";
                            const isPlanSelected = selectedPlan === plan.id && isLoading;
                            const price = billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly;

                            return (
                                <div
                                    key={plan.id}
                                    className={`border rounded-lg p-3 sm:p-4 md:p-5 relative transition-all ${isPlanSelected
                                        ? "border-primary shadow-md"
                                        : "border-border hover:border-muted-foreground/50"
                                        }`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-[10px] sm:text-xs font-medium px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                                            🔥 Most Popular
                                        </div>
                                    )}

                                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                                        <div>
                                            <h3 className="font-bold text-base sm:text-lg">{plan.name}</h3>
                                            <p className="text-muted-foreground text-xs sm:text-sm mt-1">{plan.description}</p>
                                        </div>
                                    </div>

                                    <div className="mb-3 sm:mb-4">
                                        <span className="text-xl sm:text-2xl md:text-3xl font-bold">
                                            {formatPrice(price)}
                                        </span>
                                        {typeof price === "number" && (
                                            <span className="text-muted-foreground text-sm">
                                                {billingCycle === "monthly" ? "/month" : "/year"}
                                            </span>
                                        )}
                                    </div>

                                    <ul className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-5 text-xs sm:text-sm">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start">
                                                <BadgeCheck className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-primary mr-1.5 sm:mr-2 flex-shrink-0 mt-0.5" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        variant={isCurrentPlan ? "outline" : "default"}
                                        className="w-full text-xs sm:text-sm h-8 sm:h-10"
                                        disabled={isCurrentPlan || isPlanSelected}
                                        onClick={() => handleUpgrade(plan.id)}
                                    >
                                        {isCurrentPlan ? "Current Plan" : isPlanSelected ? "Processing..." : "Select Plan"}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 