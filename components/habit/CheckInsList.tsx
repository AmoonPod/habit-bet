"use client";

import { Tables } from "@/supabase/models/database.types";
import { format } from "date-fns";
import { CheckCircle, XCircle, Calendar, Award, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

interface CheckInsListProps {
    checkins: Tables<"habit_checkins">[];
    currentStreak: number;
}

export default function CheckInsList({ checkins, currentStreak }: CheckInsListProps) {
    if (checkins.length === 0) {
        return null;
    }

    // Sort check-ins by date (newest first)
    const sortedCheckins = [...checkins].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return (
        <Card className="mb-4 md:mb-6">
            <CardHeader className="pb-2 md:pb-3 px-4 py-3 md:p-6">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base md:text-lg font-semibold">Check-in History</CardTitle>
                    <div className="flex items-center space-x-1">
                        <Flame className="h-4 md:h-5 w-4 md:w-5 text-orange-500" />
                        <span className="font-bold text-base md:text-lg">{currentStreak}</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
                <ScrollArea className="h-[250px] md:h-[300px] pr-2 md:pr-4">
                    <div className="space-y-3 md:space-y-4 relative">
                        {/* Vertical timeline line */}
                        <div className="absolute left-2 md:left-3 top-0 bottom-0 w-0.5 bg-muted" />

                        {sortedCheckins.map((checkin, index) => {
                            const isSuccess = checkin.status === "true";
                            const date = new Date(checkin.created_at);
                            const formattedDate = format(date, "MMMM d, yyyy");
                            const formattedTime = format(date, "h:mm a");

                            return (
                                <motion.div
                                    key={checkin.uuid}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="relative pl-6 md:pl-8"
                                >
                                    {/* Timeline dot */}
                                    <div
                                        className={cn(
                                            "absolute left-0 top-1.5 h-5 w-5 md:h-6 md:w-6 rounded-full flex items-center justify-center",
                                            isSuccess ? "bg-green-100" : "bg-red-100"
                                        )}
                                    >
                                        {isSuccess ? (
                                            <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                                        ) : (
                                            <XCircle className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
                                        )}
                                    </div>

                                    <div className="bg-card rounded-lg border p-2 md:p-3 shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-sm md:text-base">{formattedDate}</p>
                                                <p className="text-xs md:text-sm text-muted-foreground">{formattedTime}</p>
                                            </div>
                                            <Badge
                                                variant={isSuccess ? "default" : "destructive"}
                                                className={cn(
                                                    "text-xs px-2 py-0.5 h-5 md:h-6",
                                                    isSuccess ? "bg-green-500 hover:bg-green-600" : ""
                                                )}
                                            >
                                                {isSuccess ? "Completed" : "Missed"}
                                            </Badge>
                                        </div>

                                        {checkin.proof_content && (
                                            <div className="mt-2 text-xs md:text-sm">
                                                <p className="text-muted-foreground">Proof:</p>
                                                <p className="mt-1 break-words">{checkin.proof_content}</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
} 