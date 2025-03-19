"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Star, Award, Target, Flame, Zap, Calendar, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// Sample achievement data - would be replaced with real data from API
const achievementCategories = [
    { id: "streak", name: "Streak", description: "Achievements based on consistency" },
    { id: "milestone", name: "Milestones", description: "Achievements for reaching specific goals" },
    { id: "special", name: "Special", description: "Unique and rare achievements" },
];

const achievements = [
    // Streak Achievements
    {
        id: "1",
        title: "First Steps",
        description: "Complete a habit for 3 days in a row",
        category: "streak",
        icon: <Flame className="w-10 h-10 text-orange-500" />,
        progress: 100,
        completed: true,
        completedDate: "2024-03-01",
        reward: "20 points",
        rarity: "common",
    },
    {
        id: "2",
        title: "Consistency Champion",
        description: "Complete a habit for 7 days in a row",
        category: "streak",
        icon: <Flame className="w-10 h-10 text-orange-500" />,
        progress: 100,
        completed: true,
        completedDate: "2024-03-05",
        reward: "50 points",
        rarity: "common",
    },
    {
        id: "3",
        title: "Habit Master",
        description: "Complete any habit for 30 days in a row",
        category: "streak",
        icon: <Flame className="w-10 h-10 text-orange-500" />,
        progress: 53,
        completed: false,
        completedDate: null,
        reward: "200 points",
        rarity: "rare",
    },
    {
        id: "4",
        title: "Iron Will",
        description: "Complete any habit for 100 days in a row",
        category: "streak",
        icon: <Flame className="w-10 h-10 text-orange-500" />,
        progress: 16,
        completed: false,
        completedDate: null,
        reward: "500 points",
        rarity: "epic",
    },

    // Milestone Achievements
    {
        id: "5",
        title: "Goal Setter",
        description: "Create your first goal with at least 3 milestones",
        category: "milestone",
        icon: <Target className="w-10 h-10 text-blue-500" />,
        progress: 100,
        completed: true,
        completedDate: "2024-02-25",
        reward: "30 points",
        rarity: "common",
    },
    {
        id: "6",
        title: "Milestone Master",
        description: "Complete 10 milestones across all your goals",
        category: "milestone",
        icon: <Target className="w-10 h-10 text-blue-500" />,
        progress: 40,
        completed: false,
        completedDate: null,
        reward: "100 points",
        rarity: "uncommon",
    },
    {
        id: "7",
        title: "Goal Achiever",
        description: "Complete your first goal with 100% of milestones",
        category: "milestone",
        icon: <Trophy className="w-10 h-10 text-blue-500" />,
        progress: 0,
        completed: false,
        completedDate: null,
        reward: "200 points",
        rarity: "rare",
    },

    // Special achievements
    {
        id: "8",
        title: "Early Bird",
        description: "Complete a habit before 7:00 AM for 5 days",
        category: "special",
        icon: <Zap className="w-10 h-10 text-purple-500" />,
        progress: 60,
        completed: false,
        completedDate: null,
        reward: "75 points",
        rarity: "uncommon",
    },
    {
        id: "9",
        title: "Weekend Warrior",
        description: "Complete all your habits on both Saturday and Sunday for 3 weekends",
        category: "special",
        icon: <Medal className="w-10 h-10 text-purple-500" />,
        progress: 33,
        completed: false,
        completedDate: null,
        reward: "150 points",
        rarity: "rare",
    },
    {
        id: "10",
        title: "Comeback King",
        description: "Resume a habit after missing more than 5 days",
        category: "special",
        icon: <Award className="w-10 h-10 text-purple-500" />,
        progress: 100,
        completed: true,
        completedDate: "2024-03-10",
        reward: "100 points",
        rarity: "uncommon",
    },
];

const levels = [
    { level: 1, pointsRequired: 0, title: "Beginner" },
    { level: 2, pointsRequired: 100, title: "Novice" },
    { level: 3, pointsRequired: 250, title: "Enthusiast" },
    { level: 4, pointsRequired: 500, title: "Expert" },
    { level: 5, pointsRequired: 1000, title: "Master" },
    { level: 6, pointsRequired: 2000, title: "Legend" },
];

export default function AchievementsPage() {
    const [activeTab, setActiveTab] = useState<string>("all");

    // Calculate user stats
    const totalAchievements = achievements.length;
    const completedAchievements = achievements.filter(a => a.completed).length;
    const completionPercentage = Math.round((completedAchievements / totalAchievements) * 100);

    // Calculate points
    const totalPoints = achievements
        .filter(a => a.completed)
        .reduce((total, achievement) => {
            const pointsValue = parseInt(achievement.reward.split(" ")[0]);
            return total + pointsValue;
        }, 0);

    // Determine current level
    const currentLevel = levels.reduce((highest, level) => {
        if (totalPoints >= level.pointsRequired && level.level > highest.level) {
            return level;
        }
        return highest;
    }, levels[0]);

    // Calculate progress to next level
    const nextLevel = levels.find(l => l.level === currentLevel.level + 1);
    const levelProgress = nextLevel
        ? Math.round(((totalPoints - currentLevel.pointsRequired) / (nextLevel.pointsRequired - currentLevel.pointsRequired)) * 100)
        : 100;

    const filteredAchievements = activeTab === "all"
        ? achievements
        : achievements.filter(a => a.category === activeTab);

    // Group achievements by completion status
    const completedAchievementsList = filteredAchievements.filter(a => a.completed);
    const inProgressAchievementsList = filteredAchievements.filter(a => !a.completed);

    return (
        <div className="w-full p-4 md:p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Achievements</h1>
                <p className="text-muted-foreground">
                    Celebrate your progress and unlock rewards for building consistent habits
                </p>
            </div>

            {/* User Level Card */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Your Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-6 justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-br from-amber-100 to-amber-300 p-3 rounded-full">
                                <Trophy className="w-10 h-10 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{currentLevel.title}</p>
                                <p className="text-muted-foreground">Level {currentLevel.level}</p>
                            </div>
                        </div>

                        <div className="flex flex-col justify-center grow max-w-xs">
                            {nextLevel && (
                                <>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>{totalPoints} points</span>
                                        <span>{nextLevel.pointsRequired} points</span>
                                    </div>
                                    <Progress value={levelProgress} className="h-2" />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {nextLevel.pointsRequired - totalPoints} points until Level {nextLevel.level} ({nextLevel.title})
                                    </p>
                                </>
                            )}
                        </div>

                        <div className="flex flex-col items-center justify-center sm:items-end gap-1 min-w-24">
                            <div className="flex items-center gap-2">
                                <div className="bg-primary/10 p-1.5 rounded-full">
                                    <Award className="w-4 h-4 text-primary" />
                                </div>
                                <span className="text-lg font-semibold">{completedAchievements}/{totalAchievements}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Achievements Unlocked</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Achievement Categories */}
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    {achievementCategories.map(category => (
                        <TabsTrigger key={category.id} value={category.id}>{category.name}</TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value={activeTab} className="space-y-6">
                    {/* Completed Achievements */}
                    {completedAchievementsList.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold mb-3">Unlocked Achievements</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {completedAchievementsList.map(achievement => (
                                    <Card key={achievement.id} className="border-green-200 bg-green-50/30 transition-all hover:shadow-md hover:border-green-300">
                                        <CardHeader className="pb-2 flex flex-row items-center gap-4">
                                            <div className="bg-gradient-to-br from-white to-green-100 p-2 rounded-full border border-green-200">
                                                {achievement.icon}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <CardTitle className="text-base">{achievement.title}</CardTitle>
                                                    <Badge className={getBadgeClass(achievement.rarity)}>{achievement.rarity}</Badge>
                                                </div>
                                                <CardDescription>{achievement.description}</CardDescription>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span className="text-muted-foreground">
                                                        Completed on {formatDate(achievement.completedDate)}
                                                    </span>
                                                </div>
                                                <Badge variant="outline" className="bg-green-100 border-green-200 text-green-800">
                                                    {achievement.reward}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* In Progress Achievements */}
                    {inProgressAchievementsList.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold mb-3">Achievements In Progress</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {inProgressAchievementsList.map(achievement => (
                                    <Card key={achievement.id} className="transition-all hover:shadow-md">
                                        <CardHeader className="pb-2 flex flex-row items-center gap-4">
                                            <div className="bg-gradient-to-br from-white to-gray-100 p-2 rounded-full border border-gray-200">
                                                {achievement.icon}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <CardTitle className="text-base">{achievement.title}</CardTitle>
                                                    <Badge className={getBadgeClass(achievement.rarity)}>{achievement.rarity}</Badge>
                                                </div>
                                                <CardDescription>{achievement.description}</CardDescription>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-medium">Progress</span>
                                                    <span>{achievement.progress}%</span>
                                                </div>
                                                <Progress value={achievement.progress} className="h-1.5" />
                                                <div className="flex justify-between items-center pt-1">
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                        <span className="text-muted-foreground">In progress</span>
                                                    </div>
                                                    <Badge variant="outline" className="border-primary/30 bg-primary/5">
                                                        {achievement.reward}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

function getBadgeClass(rarity: string) {
    switch (rarity) {
        case "common":
            return "bg-slate-100 text-slate-800 hover:bg-slate-100";
        case "uncommon":
            return "bg-blue-100 text-blue-800 hover:bg-blue-100";
        case "rare":
            return "bg-purple-100 text-purple-800 hover:bg-purple-100";
        case "epic":
            return "bg-amber-100 text-amber-800 hover:bg-amber-100";
        default:
            return "bg-slate-100 text-slate-800 hover:bg-slate-100";
    }
}

function formatDate(dateString: string | null) {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
} 