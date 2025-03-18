"use client";

import { Tables } from "@/supabase/models/database.types";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ChevronRight, XCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useMediaQuery } from "@/hooks/use-media-query";
import { format } from "date-fns";

interface FailedHabitsSectionProps {
    habits: Tables<"habits">[];
    stakes: Record<string, Tables<"habit_stakes">>;
    payments: Tables<"habit_payments">[];
}

export default function FailedHabitsSection({
    habits,
    stakes,
    payments,
}: FailedHabitsSectionProps) {
    const isMobile = useMediaQuery("(max-width: 768px)");

    if (habits.length === 0) {
        return null;
    }

    // Get payment status for a habit
    const getPaymentStatus = (habit: Tables<"habits">) => {
        const payment = payments.find(p => p.habit_uuid === habit.uuid);
        return payment?.payment_status || "pending";
    };

    // Get stake amount for a habit
    const getStakeAmount = (habit: Tables<"habits">) => {
        const stake = stakes[habit.stake_uuid || ""];
        return stake?.amount || 0;
    };

    // Get payment status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "paid":
                return <Badge className="bg-green-500 hover:bg-green-600">Paid</Badge>;
            case "processing":
                return <Badge className="bg-blue-500 hover:bg-blue-600">Processing</Badge>;
            case "failed":
                return <Badge className="bg-red-500 hover:bg-red-600">Failed</Badge>;
            case "pending":
            default:
                return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
        }
    };

    // Get payment status icon
    const getStatusIcon = (status: string) => {
        switch (status) {
            case "paid":
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case "processing":
                return <AlertTriangle className="h-4 w-4 text-blue-500" />;
            case "failed":
                return <XCircle className="h-4 w-4 text-red-500" />;
            case "pending":
            default:
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
        }
    };

    // Mobile view - cards
    if (isMobile) {
        return (
            <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <h2 className="text-lg font-semibold">Failed Habits</h2>
                </div>

                <div className="space-y-3">
                    {habits.map((habit) => {
                        const paymentStatus = getPaymentStatus(habit);
                        const stakeAmount = getStakeAmount(habit);

                        return (
                            <Link href={`/dashboard/${habit.slug}`} key={habit.uuid}>
                                <Card className="cursor-pointer hover:shadow-md transition-shadow border-red-200 shadow-sm">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: habit.color || "#EF4444" }}
                                                />
                                                <h3 className="font-medium">{habit.name}</h3>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Stake Amount</p>
                                                <p className="font-medium">${stakeAmount}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Payment Status</p>
                                                <div className="flex items-center space-x-1">
                                                    {getStatusIcon(paymentStatus)}
                                                    <span className="capitalize font-medium">{paymentStatus}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Failed On</p>
                                                <p className="font-medium">{format(new Date(habit.created_at), "MMM d, yyyy")}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Verification</p>
                                                <Badge variant="outline" className="font-normal">
                                                    {habit.verification_type === "honor" && "Honor"}
                                                    {habit.verification_type === "photo" && "Photo"}
                                                    {habit.verification_type === "text" && "Text"}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Desktop view - table
    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <h2 className="text-lg font-semibold">Failed Habits</h2>
            </div>

            <Card className="border-red-200 shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Habit</TableHead>
                                <TableHead>Stake Amount</TableHead>
                                <TableHead>Payment Status</TableHead>
                                <TableHead>Failed On</TableHead>
                                <TableHead>Verification</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {habits.map((habit) => {
                                const paymentStatus = getPaymentStatus(habit);
                                const stakeAmount = getStakeAmount(habit);

                                return (
                                    <TableRow key={habit.uuid} className="hover:bg-red-50 dark:hover:bg-red-950/10">
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: habit.color || "#EF4444" }}
                                                />
                                                <span className="font-medium">{habit.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>${stakeAmount}</TableCell>
                                        <TableCell>
                                            {getStatusBadge(paymentStatus)}
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(habit.created_at), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {habit.verification_type === "honor" && "Honor"}
                                                {habit.verification_type === "photo" && "Photo"}
                                                {habit.verification_type === "text" && "Text"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Link href={`/dashboard/${habit.slug}`}>
                                                <ChevronRight className="h-4 w-4" />
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
} 