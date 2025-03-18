"use client";

import { useState, useEffect } from "react";
import { Tables } from "@/supabase/models/database.types";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    AlertTriangle,
    CheckCircle2,
    CreditCard,
    Loader2,
    XCircle,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface FailedHabitPaymentProps {
    habit: Tables<"habits">;
    stake: Tables<"habit_stakes">;
}

export default function FailedHabitPayment({
    habit,
    stake,
}: FailedHabitPaymentProps) {
    const [payment, setPayment] = useState<Tables<"habit_payments"> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchPayment = async () => {
            setIsLoading(true);
            try {
                const supabase = createClient();
                const { data, error } = await supabase
                    .from("habit_payments")
                    .select("*")
                    .eq("habit_uuid", habit.uuid)
                    .eq("stake_uuid", stake.uuid)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .single();

                if (error && error.code !== "PGRST116") {
                    // PGRST116 is "no rows returned" error, which is fine
                    console.error("Error fetching payment:", error);
                }

                if (data) {
                    setPayment(data);
                }
            } catch (error) {
                console.error("Error in fetchPayment:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (habit.uuid && stake.uuid) {
            fetchPayment();
        }
    }, [habit.uuid, stake.uuid]);

    const handlePayment = async () => {
        setIsProcessing(true);
        try {
            const supabase = createClient();

            // If no payment record exists, create one
            if (!payment) {
                const { data, error } = await supabase
                    .from("habit_payments")
                    .insert({
                        stake_uuid: stake.uuid,
                        habit_uuid: habit.uuid,
                        amount: stake.amount || 0,
                        payment_status: "processing",
                    })
                    .select()
                    .single();

                if (error) throw error;
                setPayment(data);
            } else {
                // Update existing payment record
                const { data, error } = await supabase
                    .from("habit_payments")
                    .update({ payment_status: "processing" })
                    .eq("uuid", payment.uuid)
                    .select()
                    .single();

                if (error) throw error;
                setPayment(data);
            }

            // Update stake payment status
            await supabase
                .from("habit_stakes")
                .update({ payment_status: "processing" })
                .eq("uuid", stake.uuid);

            // TODO: Integrate with your payment provider (e.g., Stripe)
            // For now, we'll simulate a payment process
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Update payment record to paid
            const { data: paidData, error: paidError } = await supabase
                .from("habit_payments")
                .update({
                    payment_status: "paid",
                    payment_date: new Date().toISOString(),
                    payment_method: "credit_card", // Replace with actual payment method
                    transaction_id: `sim_${Date.now()}`, // Replace with actual transaction ID
                })
                .eq("uuid", payment?.uuid || "")
                .select()
                .single();

            if (paidError) throw paidError;
            setPayment(paidData);

            // Update stake payment status
            await supabase
                .from("habit_stakes")
                .update({
                    payment_status: "paid",
                    transaction_date: new Date().toISOString(),
                })
                .eq("uuid", stake.uuid);

            toast({
                title: "Payment successful",
                description: "Thank you for your payment. Keep building better habits!",
                variant: "default",
            });

            // Just refresh the current page to show the updated payment status
            router.refresh();
        } catch (error) {
            console.error("Payment error:", error);

            // Update payment record to failed
            if (payment) {
                const supabase = createClient();
                await supabase
                    .from("habit_payments")
                    .update({ payment_status: "failed" })
                    .eq("uuid", payment.uuid);

                // Update stake payment status
                await supabase
                    .from("habit_stakes")
                    .update({ payment_status: "failed" })
                    .eq("uuid", stake.uuid);
            }

            toast({
                title: "Payment failed",
                description: "There was an error processing your payment. Please try again.",
                variant: "destructive",
            });

            // Refresh the page to show the updated payment status
            router.refresh();
        } finally {
            setIsProcessing(false);
        }
    };

    const getPaymentStatus = () => {
        if (isLoading) {
            return {
                icon: <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />,
                title: "Loading payment status...",
                description: "Please wait while we check your payment status.",
                buttonText: "Loading...",
                buttonVariant: "outline" as const,
                buttonDisabled: true,
            };
        }

        // If no payment record exists yet
        if (!payment) {
            return {
                icon: <AlertTriangle className="h-6 w-6 text-yellow-500" />,
                title: "Payment Required",
                description: `Your stake of $${stake.amount} needs to be paid due to habit failure.`,
                buttonText: "Pay Now",
                buttonVariant: "default" as const,
                buttonDisabled: false,
            };
        }

        switch (payment.payment_status) {
            case "pending":
                return {
                    icon: <AlertTriangle className="h-6 w-6 text-yellow-500" />,
                    title: "Payment Required",
                    description: `Your stake of $${payment.amount} needs to be paid due to habit failure.`,
                    buttonText: "Pay Now",
                    buttonVariant: "default" as const,
                    buttonDisabled: false,
                };
            case "processing":
                return {
                    icon: <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />,
                    title: "Processing Payment",
                    description: "Your payment is being processed...",
                    buttonText: "Processing...",
                    buttonVariant: "outline" as const,
                    buttonDisabled: true,
                };
            case "paid":
                return {
                    icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
                    title: "Payment Complete",
                    description: "Thank you for your honesty. Keep building better habits!",
                    buttonText: "Paid",
                    buttonVariant: "outline" as const,
                    buttonDisabled: true,
                };
            case "failed":
                return {
                    icon: <XCircle className="h-6 w-6 text-red-500" />,
                    title: "Payment Failed",
                    description: "There was an error processing your payment.",
                    buttonText: "Try Again",
                    buttonVariant: "destructive" as const,
                    buttonDisabled: false,
                };
            default:
                return {
                    icon: <AlertTriangle className="h-6 w-6 text-yellow-500" />,
                    title: "Payment Required",
                    description: `Your stake of $${payment.amount} needs to be paid due to habit failure.`,
                    buttonText: "Pay Now",
                    buttonVariant: "default" as const,
                    buttonDisabled: false,
                };
        }
    };

    const status = getPaymentStatus();

    return (
        <Card className="mb-8 border-destructive/20 shadow-sm">
            <CardHeader className="space-y-1">
                <div className="flex items-center space-x-2">
                    <div className="bg-destructive/10 p-2 rounded-full">
                        {status.icon}
                    </div>
                    <div>
                        <CardTitle className="text-lg">{status.title}</CardTitle>
                        <CardDescription>{status.description}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex justify-between items-center py-1 border-b">
                        <span className="text-muted-foreground">Habit</span>
                        <span className="font-medium">{habit.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b">
                        <span className="text-muted-foreground">Stake Amount</span>
                        <span className="font-medium">${payment?.amount || stake.amount}</span>
                    </div>
                    {payment?.payment_status === "paid" && payment?.payment_date && (
                        <>
                            <div className="flex justify-between items-center py-1 border-b">
                                <span className="text-muted-foreground">Paid On</span>
                                <span className="font-medium">
                                    {new Date(payment.payment_date).toLocaleDateString()}
                                </span>
                            </div>
                            {payment.payment_method && (
                                <div className="flex justify-between items-center py-1 border-b">
                                    <span className="text-muted-foreground">Payment Method</span>
                                    <span className="font-medium capitalize">{payment.payment_method}</span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full"
                    variant={status.buttonVariant}
                    onClick={handlePayment}
                    disabled={status.buttonDisabled || isProcessing}
                    size="lg"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            {payment?.payment_status !== "paid" && (
                                <CreditCard className="mr-2 h-4 w-4" />
                            )}
                            {status.buttonText}
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
} 