"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Flame,
    Trophy,
    Award,
    Star,
    MessageSquare,
    Heart,
    BarChart,
    Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface LeaderboardItemProps {
    position: number;
    entry: {
        id: string;
        first_name?: string;
        last_name?: string;
        streak_count?: number;
        points?: number;
        level?: number;
        post_count?: number;
        likes_received?: number;
        comments_made?: number;
        composite_score?: number;
        users?: {
            user_metadata?: {
                full_name?: string;
                avatar_url?: string;
            }
        };
    };
    isCurrentUser: boolean;
}

export function LeaderboardItem({ position, entry, isCurrentUser }: LeaderboardItemProps) {
    // Format display name
    const fullName =
        entry.first_name && entry.last_name
            ? `${entry.first_name} ${entry.last_name}`
            : entry.users?.user_metadata?.full_name || "Anonymous User";

    // Get first letter for avatar fallback
    const firstLetter = fullName[0]?.toUpperCase() || "U";

    // Get avatar URL from user metadata
    const avatarUrl = entry.users?.user_metadata?.avatar_url || "";

    // Get medal icon and color based on position
    const getMedal = () => {
        switch (position) {
            case 1:
                return <Trophy className="h-5 w-5 text-yellow-500" />;
            case 2:
                return <Trophy className="h-5 w-5 text-gray-400" />;
            case 3:
                return <Trophy className="h-5 w-5 text-amber-700" />;
            default:
                return <span className="font-semibold">{position}</span>;
        }
    };

    // Tooltip text for composite score explanation with more detailed breakdown
    const scoreExplanation = `
        Composite score calculation:
        • Streak Days (40%): ${entry.streak_count || 0} × 10 = ${(entry.streak_count || 0) * 10}
        • Posts (20%): ${entry.post_count || 0} × 5 = ${(entry.post_count || 0) * 5}
        • Likes Received (20%): ${entry.likes_received || 0} × 2 = ${(entry.likes_received || 0) * 2}
        • Comments Made (10%): ${entry.comments_made || 0} × 1 = ${entry.comments_made || 0}
        • Points (10%): ${entry.points || 0} × 1 = ${entry.points || 0}
        = Total: ${entry.composite_score || 0} points
    `;

    return (
        <div
            className={cn(
                "flex items-center justify-between p-3 rounded-md",
                isCurrentUser ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800" :
                    position <= 3 ? "bg-gray-50 dark:bg-gray-800/50" : ""
            )}
        >
            <div className="flex items-center space-x-3">
                <div className="w-8 text-center">
                    {getMedal()}
                </div>
                <Avatar className={cn(
                    position === 1 && "ring-2 ring-yellow-500",
                    position === 2 && "ring-2 ring-gray-400",
                    position === 3 && "ring-2 ring-amber-700"
                )}>
                    <AvatarImage src={avatarUrl} alt={fullName} />
                    <AvatarFallback>{firstLetter}</AvatarFallback>
                </Avatar>
                <div>
                    <div className="font-medium flex items-center">
                        {fullName}
                        {isCurrentUser && (
                            <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                        )}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center">
                        <Award className="h-3 w-3 mr-1" /> Level {entry.level || 1}
                        <span className="mx-1">•</span>
                        <BarChart className="h-3 w-3 mr-1" /> {entry.post_count || 0} posts
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <div className="flex flex-col items-center">
                    <div className="flex items-center">
                        <Flame className="h-4 w-4 text-orange-500 mr-1" />
                        <span>{entry.streak_count || 0}</span>
                    </div>
                    <span className="text-xs text-gray-500">Streak</span>
                </div>

                <div className="flex flex-col items-center">
                    <div className="flex items-center">
                        <Heart className="h-4 w-4 text-red-500 mr-1" />
                        <span>{entry.likes_received || 0}</span>
                    </div>
                    <span className="text-xs text-gray-500">Likes</span>
                </div>

                <div className="flex flex-col items-center">
                    <div className="flex items-center">
                        <Star className="h-4 w-4 text-blue-500 mr-1" />
                        <span>{entry.composite_score || 0}</span>
                    </div>
                    <span className="text-xs text-gray-500">Score</span>
                </div>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex flex-col items-center cursor-help">
                                <div className="flex items-center">
                                    <Info className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                </div>
                                <span className="text-xs text-gray-500">Info</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                            <div className="text-sm">
                                <p className="font-bold mb-1">Leaderboard Scoring System</p>
                                <p className="text-xs mb-2 text-muted-foreground">Scores are calculated based on activity and engagement.</p>

                                {isCurrentUser && (
                                    <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800">
                                        <p className="font-semibold text-xs mb-1">Your Score Breakdown:</p>
                                        <ul className="text-xs space-y-1">
                                            <li className="flex justify-between">
                                                <span>Streak Days (×10):</span>
                                                <span className="font-medium">{(entry.streak_count || 0) * 10}</span>
                                            </li>
                                            <li className="flex justify-between">
                                                <span>Posts (×5):</span>
                                                <span className="font-medium">{(entry.post_count || 0) * 5}</span>
                                            </li>
                                            <li className="flex justify-between">
                                                <span>Likes Received (×2):</span>
                                                <span className="font-medium">{(entry.likes_received || 0) * 2}</span>
                                            </li>
                                            <li className="flex justify-between">
                                                <span>Comments Made (×1):</span>
                                                <span className="font-medium">{entry.comments_made || 0}</span>
                                            </li>
                                            <li className="flex justify-between">
                                                <span>Points (×1):</span>
                                                <span className="font-medium">{entry.points || 0}</span>
                                            </li>
                                            <li className="flex justify-between border-t pt-1 mt-1 font-semibold">
                                                <span>Total Score:</span>
                                                <span>{entry.composite_score || 0}</span>
                                            </li>
                                        </ul>
                                    </div>
                                )}

                                <p className="font-medium text-xs mb-1">Scoring Weights:</p>
                                <ul className="list-disc pl-5 space-y-0.5 text-xs">
                                    <li>Streak Days: ×10 points (40% weight)</li>
                                    <li>Posts Created: ×5 points (20% weight)</li>
                                    <li>Likes Received: ×2 points (20% weight)</li>
                                    <li>Comments Made: ×1 point (10% weight)</li>
                                    <li>Points Earned: ×1 point (10% weight)</li>
                                </ul>

                                <p className="text-xs mt-2 text-muted-foreground">Improve your rank by maintaining your streaks, creating quality content, and engaging with the community!</p>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
} 