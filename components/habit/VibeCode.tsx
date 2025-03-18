"use client";

import { Tables } from "@/supabase/models/database.types";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface VibeCodeProps {
    checkins: Tables<"habit_checkins">[];
    habit: Tables<"habits">;
}

export default function VibeCode({ checkins, habit }: VibeCodeProps) {
    const [colors, setColors] = useState<string[]>([]);

    useEffect(() => {
        // Generate a unique color palette based on the habit name
        const habitName = habit.name || "Habit";
        const habitNameSum = habitName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const baseHue = habitNameSum % 360;

        // Create a palette of colors with the same hue but different saturations/lightness
        const palette = [
            `hsl(${baseHue}, 80%, 65%)`,
            `hsl(${baseHue}, 70%, 55%)`,
            `hsl(${baseHue}, 60%, 45%)`,
            `hsl(${(baseHue + 30) % 360}, 70%, 60%)`,
            `hsl(${(baseHue + 60) % 360}, 80%, 70%)`,
        ];

        // Generate colors based on check-in patterns
        const generatedColors = [];
        const sortedCheckins = [...checkins].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        // Fill a 6x6 grid (36 cells) with colors based on check-in patterns
        for (let i = 0; i < 36; i++) {
            if (i < sortedCheckins.length) {
                const checkin = sortedCheckins[i];
                const isSuccess = checkin.status === "true";

                if (isSuccess) {
                    // For successful check-ins, use a color from the palette based on the day of the week
                    const date = new Date(checkin.created_at);
                    const dayIndex = date.getDay();
                    generatedColors.push(palette[dayIndex % palette.length]);
                } else {
                    // For missed check-ins, use a muted color
                    generatedColors.push("hsl(0, 0%, 85%)");
                }
            } else {
                // For empty cells, use a very light background
                generatedColors.push("hsl(0, 0%, 95%)");
            }
        }

        setColors(generatedColors);
    }, [checkins, habit.name]);

    return (
        <Card className="mb-8">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Your VibeCode</CardTitle>
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="grid grid-cols-6 gap-1 p-2 bg-muted rounded-lg shadow-inner"
                    >
                        {colors.map((color, index) => (
                            <motion.div
                                key={index}
                                initial={{ scale: 0, borderRadius: "50%" }}
                                animate={{ scale: 1, borderRadius: "12%" }}
                                transition={{ delay: index * 0.01, duration: 0.3 }}
                                className="w-10 h-10 rounded-sm"
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </motion.div>

                    <p className="text-sm text-muted-foreground mt-4 text-center max-w-md">
                        Your VibeCode is a unique visual pattern generated from your habit consistency.
                        Each square represents a check-in, with colors based on your success patterns.
                        Keep checking in to evolve your VibeCode!
                    </p>

                    <div className="mt-4 flex items-center justify-center">
                        <div className="flex items-center space-x-2 mr-4">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[0] }} />
                            <span className="text-xs text-muted-foreground">Completed</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-[hsl(0,0%,85%)]" />
                            <span className="text-xs text-muted-foreground">Missed</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 