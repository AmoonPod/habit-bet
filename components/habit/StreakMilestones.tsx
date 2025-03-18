"use client";

import { Tables } from "@/supabase/models/database.types";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Award, Star, Medal, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

interface StreakMilestonesProps {
    currentStreak: number;
    habit: Tables<"habits">;
}

interface Milestone {
    threshold: number;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
}

export default function StreakMilestones({ currentStreak, habit }: StreakMilestonesProps) {
    const [showConfetti, setShowConfetti] = useState(false);
    const [reachedMilestones, setReachedMilestones] = useState<Milestone[]>([]);
    const [nextMilestone, setNextMilestone] = useState<Milestone | null>(null);
    const { width, height } = useWindowSize();

    const milestones: Milestone[] = [
        {
            threshold: 1,
            title: "First Step",
            description: "You've started your journey!",
            icon: <Star className="h-5 w-5" />,
            color: "text-blue-500"
        },
        {
            threshold: 3,
            title: "Habit Forming",
            description: "You're building momentum!",
            icon: <Trophy className="h-5 w-5" />,
            color: "text-green-500"
        },
        {
            threshold: 7,
            title: "One Week Wonder",
            description: "A full week of consistency!",
            icon: <Award className="h-5 w-5" />,
            color: "text-purple-500"
        },
        {
            threshold: 14,
            title: "Two Week Triumph",
            description: "Two weeks of dedication!",
            icon: <Medal className="h-5 w-5" />,
            color: "text-orange-500"
        },
        {
            threshold: 21,
            title: "Habit Master",
            description: "21 days to form a habit!",
            icon: <Crown className="h-5 w-5" />,
            color: "text-yellow-500"
        },
        {
            threshold: 30,
            title: "Monthly Marvel",
            description: "A full month of consistency!",
            icon: <Crown className="h-5 w-5" />,
            color: "text-red-500"
        },
        {
            threshold: 60,
            title: "Dedication Champion",
            description: "Two months of unwavering commitment!",
            icon: <Crown className="h-5 w-5" />,
            color: "text-pink-500"
        },
        {
            threshold: 90,
            title: "Quarterly Conqueror",
            description: "Three months of excellence!",
            icon: <Crown className="h-5 w-5" />,
            color: "text-indigo-500"
        },
        {
            threshold: 180,
            title: "Half-Year Hero",
            description: "Six months of incredible dedication!",
            icon: <Crown className="h-5 w-5" />,
            color: "text-teal-500"
        },
        {
            threshold: 365,
            title: "Year-Long Legend",
            description: "A full year of amazing consistency!",
            icon: <Crown className="h-5 w-5" />,
            color: "text-amber-500"
        },
    ];

    useEffect(() => {
        // Find all milestones that have been reached
        const reached = milestones.filter(m => currentStreak >= m.threshold);
        setReachedMilestones(reached);

        // Find the next milestone to achieve
        const next = milestones.find(m => currentStreak < m.threshold);
        setNextMilestone(next || null);

        // Show confetti if a new milestone was just reached
        if (reached.length > 0 && reached[reached.length - 1].threshold === currentStreak) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
        }
    }, [currentStreak]);

    if (reachedMilestones.length === 0 && !nextMilestone) {
        return null;
    }

    return (
        <Card className="mb-8">
            {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={200} />}

            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Streak Milestones</CardTitle>
                    <Trophy className="h-5 w-5 text-yellow-500" />
                </div>
            </CardHeader>

            <CardContent>
                <div className="space-y-6">
                    {/* Latest milestone celebration */}
                    {reachedMilestones.length > 0 && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-4 border border-yellow-200 shadow-sm"
                        >
                            <div className="flex items-center space-x-3">
                                <div className={cn("p-2 rounded-full bg-yellow-100", reachedMilestones[reachedMilestones.length - 1].color)}>
                                    {reachedMilestones[reachedMilestones.length - 1].icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{reachedMilestones[reachedMilestones.length - 1].title}</h3>
                                    <p className="text-sm text-muted-foreground">{reachedMilestones[reachedMilestones.length - 1].description}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Next milestone */}
                    {nextMilestone && (
                        <div className="bg-muted rounded-lg p-4 border shadow-sm">
                            <h3 className="font-medium text-sm mb-2">Next milestone:</h3>
                            <div className="flex items-center space-x-3">
                                <div className={cn("p-2 rounded-full bg-muted/80", nextMilestone.color)}>
                                    {nextMilestone.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold">{nextMilestone.title}</h3>
                                    <p className="text-xs text-muted-foreground">{nextMilestone.description}</p>
                                    <div className="mt-2">
                                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"
                                                style={{ width: `${(currentStreak / nextMilestone.threshold) * 100}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1 text-right">
                                            {currentStreak}/{nextMilestone.threshold} {habit.frequency_unit}s
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Milestone timeline */}
                    {reachedMilestones.length > 1 && (
                        <div className="mt-4">
                            <h3 className="font-medium text-sm mb-3">Your milestone journey:</h3>
                            <div className="flex flex-wrap gap-2">
                                {reachedMilestones.map((milestone, index) => (
                                    <motion.div
                                        key={milestone.threshold}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={cn(
                                            "p-1.5 rounded-full border",
                                            milestone.color.replace("text-", "border-"),
                                            index === reachedMilestones.length - 1 ? "ring-2 ring-offset-2" : ""
                                        )}
                                        title={milestone.title}
                                    >
                                        {milestone.icon}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 