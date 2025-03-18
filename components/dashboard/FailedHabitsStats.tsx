"use client";

import { Tables } from "@/supabase/models/database.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, AlertTriangle, XCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface FailedHabitsStatsProps {
    habits: Tables<"habits">[];
    stakes: Record<string, Tables<"habit_stakes">>;
    payments: Tables<"habit_payments">[];
}

export default function FailedHabitsStats({
    habits,
    stakes,
    payments,
}: FailedHabitsStatsProps) {
    // Calculate total stake amount at risk
    const totalStakeAmount = habits.reduce((total, habit) => {
        const stake = stakes[habit.stake_uuid || ""];
        return total + (stake?.amount || 0);
    }, 0);

    // Calculate paid vs pending payments
    const paidPayments = payments.filter(p => p.payment_status === "paid").length;
    const pendingPayments = payments.filter(p => p.payment_status === "pending").length;

    // Calculate average time to payment
    const [averagePaymentTime, setAveragePaymentTime] = useState<number | null>(null);

    useEffect(() => {
        if (payments.length === 0) return;

        const paidPaymentsWithDates = payments.filter(p =>
            p.payment_status === "paid" && p.payment_date && p.created_at
        );

        if (paidPaymentsWithDates.length === 0) {
            setAveragePaymentTime(null);
            return;
        }

        const totalDays = paidPaymentsWithDates.reduce((total, payment) => {
            const createdDate = new Date(payment.created_at);
            const paidDate = new Date(payment.payment_date!);
            const diffTime = Math.abs(paidDate.getTime() - createdDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return total + diffDays;
        }, 0);

        setAveragePaymentTime(totalDays / paidPaymentsWithDates.length);
    }, [payments]);

    if (habits.length === 0) {
        return null;
    }

    return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <Card className="border-red-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Stake Amount</CardTitle>
                    <DollarSign className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${totalStakeAmount.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                        Total amount from failed habits
                    </p>
                </CardContent>
            </Card>

            <Card className="border-red-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {paidPayments} / {paidPayments + pendingPayments}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Paid vs total payments
                    </p>
                </CardContent>
            </Card>

            <Card className="border-red-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Payment Time</CardTitle>
                    <Clock className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {averagePaymentTime !== null ? `${averagePaymentTime.toFixed(1)} days` : "N/A"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Average time to complete payment
                    </p>
                </CardContent>
            </Card>
        </div>
    );
} 