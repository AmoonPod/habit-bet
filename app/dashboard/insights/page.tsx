"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    BarChart3,
    PieChart,
    Calendar,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    Flame,
    Clock3,
    Award,
    Star,
    Users,
    ArrowRight,
    Filter,
    Sparkles,
    BrainCircuit,
    Lightbulb,
    CheckCircle2,
    Trophy,
    Target,
    ChevronDown,
} from "lucide-react";

// Mock data - would be replaced with real data from API
// Sample weekly activity data
const weeklyActivityData = [
    { day: "Mon", completed: 4, missed: 1 },
    { day: "Tue", completed: 5, missed: 0 },
    { day: "Wed", completed: 3, missed: 2 },
    { day: "Thu", completed: 5, missed: 0 },
    { day: "Fri", completed: 2, missed: 3 },
    { day: "Sat", completed: 4, missed: 1 },
    { day: "Sun", completed: 3, missed: 2 },
];

// Sample habit completion by category
const habitCategoriesData = [
    { category: "Health", completionRate: 85, count: 3 },
    { category: "Learning", completionRate: 72, count: 2 },
    { category: "Finance", completionRate: 90, count: 1 },
    { category: "Personal", completionRate: 65, count: 2 },
];

// Sample monthly trend data for the last 6 months
const monthlyTrendData = [
    { month: "Nov", completionRate: 72 },
    { month: "Dec", completionRate: 68 },
    { month: "Jan", completionRate: 75 },
    { month: "Feb", completionRate: 82 },
    { month: "Mar", completionRate: 85 },
    { month: "Apr", completionRate: 88 },
];

// Sample habit data
const habitsData = [
    {
        id: "h1",
        name: "Morning Workout",
        category: "Health",
        streak: 24,
        completionRate: 87,
        streak7day: 7,
        streak30day: 22,
        change: 5,
        trending: "up",
    },
    {
        id: "h2",
        name: "Read 20 Pages",
        category: "Learning",
        streak: 18,
        completionRate: 76,
        streak7day: 5,
        streak30day: 18,
        change: -3,
        trending: "down",
    },
    {
        id: "h3",
        name: "Meditation",
        category: "Wellness",
        streak: 30,
        completionRate: 92,
        streak7day: 7,
        streak30day: 28,
        change: 8,
        trending: "up",
    },
    {
        id: "h4",
        name: "No Fast Food",
        category: "Health",
        streak: 12,
        completionRate: 65,
        streak7day: 4,
        streak30day: 15,
        change: 2,
        trending: "up",
    },
    {
        id: "h5",
        name: "Budget Review",
        category: "Finance",
        streak: 8,
        completionRate: 90,
        streak7day: 2,
        streak30day: 8,
        change: 0,
        trending: "neutral",
    },
];

// Sample AI insights
const aiInsights = [
    {
        id: "insight-1",
        title: "Consistency Pattern",
        description: "You're most consistent with your habits on Tuesdays and Thursdays. Consider scheduling harder habits on these days.",
        type: "pattern",
        icon: <BrainCircuit className="h-5 w-5 text-purple-500" />,
    },
    {
        id: "insight-2",
        title: "Morning vs Evening",
        description: "Habits scheduled in the morning have a 23% higher completion rate than those in the evening.",
        type: "comparison",
        icon: <Sparkles className="h-5 w-5 text-amber-500" />,
    },
    {
        id: "insight-3",
        title: "Habit Stack Opportunity",
        description: "Your 'Morning Workout' and 'Meditation' habits could be stacked together for better consistency.",
        type: "suggestion",
        icon: <Lightbulb className="h-5 w-5 text-yellow-500" />,
    },
    {
        id: "insight-4",
        title: "Weekend Drop-off",
        description: "Your completion rate drops by 18% on weekends. Creating a weekend-specific routine might help.",
        type: "warning",
        icon: <BrainCircuit className="h-5 w-5 text-purple-500" />,
    },
];

// Summary stats
const summaryStats = {
    activeHabits: 5,
    completionRate: 82,
    weeklyChange: 3.5,
    longestStreak: 30,
    totalCheckIns: 143,
    consistentDays: 24,
};

export default function InsightsPage() {
    const [timeRange, setTimeRange] = useState("30d");

    return (
        <div className="w-full p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
                    <p className="text-muted-foreground">
                        Analyze your habit patterns and get personalized recommendations
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Select time range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">Last 7 days</SelectItem>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                            <SelectItem value="90d">Last 90 days</SelectItem>
                            <SelectItem value="1y">Last year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Overall Completion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between">
                            <div>
                                <div className="text-3xl font-bold">{summaryStats.completionRate}%</div>
                                <div className="flex items-center gap-1 text-xs mt-1">
                                    {summaryStats.weeklyChange > 0 ? (
                                        <>
                                            <ArrowUpRight className="h-3 w-3 text-green-500" />
                                            <span className="text-green-500">+{summaryStats.weeklyChange}%</span>
                                        </>
                                    ) : summaryStats.weeklyChange < 0 ? (
                                        <>
                                            <ArrowDownRight className="h-3 w-3 text-red-500" />
                                            <span className="text-red-500">{summaryStats.weeklyChange}%</span>
                                        </>
                                    ) : (
                                        <span className="text-muted-foreground">No change</span>
                                    )}
                                    <span className="text-muted-foreground">from last week</span>
                                </div>
                            </div>
                            <div className="flex h-14 items-center">
                                {/* Simple visual chart */}
                                <div className="flex items-end h-full space-x-1">
                                    {monthlyTrendData.map((month, i) => (
                                        <div
                                            key={i}
                                            className="bg-primary/80 w-2 rounded-t"
                                            style={{ height: `${month.completionRate * 0.14}px` }}
                                        ></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Longest Streak</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="flex items-center">
                                    <span className="text-3xl font-bold">{summaryStats.longestStreak}</span>
                                    <span className="text-muted-foreground ml-1">days</span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">Meditation habit</div>
                            </div>
                            <div className="bg-amber-100 p-2 rounded-full">
                                <Flame className="h-6 w-6 text-amber-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Consistent Days</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="flex items-center">
                                    <span className="text-3xl font-bold">{summaryStats.consistentDays}</span>
                                    <span className="text-muted-foreground ml-1">days</span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    All habits completed as planned
                                </div>
                            </div>
                            <div className="bg-green-100 p-2 rounded-full">
                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview" className="flex gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="habits" className="flex gap-2">
                        <Star className="h-4 w-4" />
                        Habits Analysis
                    </TabsTrigger>
                    <TabsTrigger value="ai" className="flex gap-2">
                        <BrainCircuit className="h-4 w-4" />
                        AI Insights
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    {/* Weekly Activity Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Weekly Activity</CardTitle>
                            <CardDescription>
                                Your habit completion pattern throughout the week
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] flex items-end justify-between space-x-2">
                                {weeklyActivityData.map((day) => (
                                    <div key={day.day} className="flex flex-col items-center space-y-2">
                                        <div className="flex flex-col items-center w-14">
                                            <div
                                                className="bg-red-100 w-full rounded-t"
                                                style={{ height: `${day.missed * 30}px` }}
                                            >
                                                {day.missed > 0 && (
                                                    <div className="text-xs text-center text-red-600 font-medium">
                                                        {day.missed}
                                                    </div>
                                                )}
                                            </div>
                                            <div
                                                className="bg-green-100 w-full"
                                                style={{ height: `${day.completed * 30}px` }}
                                            >
                                                {day.completed > 0 && (
                                                    <div className="text-xs text-center text-green-600 font-medium">
                                                        {day.completed}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-xs font-medium">{day.day}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-center mt-4 space-x-6">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-green-100 mr-2"></div>
                                    <span className="text-sm">Completed</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-red-100 mr-2"></div>
                                    <span className="text-sm">Missed</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Habit Categories */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Habit Categories</CardTitle>
                                <CardDescription>
                                    Completion rates by habit category
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {habitCategoriesData.map((category) => (
                                        <div key={category.category}>
                                            <div className="flex justify-between mb-1">
                                                <div className="flex items-center">
                                                    <span className="font-medium">{category.category}</span>
                                                    <Badge variant="outline" className="ml-2 text-xs">
                                                        {category.count} habits
                                                    </Badge>
                                                </div>
                                                <span className="text-sm font-medium">{category.completionRate}%</span>
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-2.5">
                                                <div
                                                    className="bg-primary h-2.5 rounded-full"
                                                    style={{ width: `${category.completionRate}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Monthly Trend */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Monthly Trend</CardTitle>
                                <CardDescription>
                                    Your completion rate over the last 6 months
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[220px] flex items-end justify-between space-x-2 pt-6">
                                    {monthlyTrendData.map((month) => (
                                        <div key={month.month} className="flex flex-col items-center space-y-2">
                                            <div
                                                className="bg-primary/80 w-12 rounded-lg"
                                                style={{ height: `${month.completionRate * 2}px` }}
                                            >
                                                <div className="text-xs text-center text-primary-foreground pt-1 font-medium">
                                                    {month.completionRate}%
                                                </div>
                                            </div>
                                            <div className="text-xs font-medium">{month.month}</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="habits" className="space-y-4">
                    <Card>
                        <CardHeader className="pb-0">
                            <div className="flex justify-between items-center">
                                <CardTitle>Habit Performance</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm">
                                        <Filter className="h-4 w-4 mr-2" />
                                        Filter
                                    </Button>
                                    <Select defaultValue="completion">
                                        <SelectTrigger className="w-[160px]">
                                            <SelectValue placeholder="Sort by" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="completion">Completion Rate</SelectItem>
                                            <SelectItem value="streak">Current Streak</SelectItem>
                                            <SelectItem value="trend">Trending</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <CardDescription>
                                Detailed performance metrics for each of your habits
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mt-4 space-y-2">
                                {habitsData.map((habit) => (
                                    <Card key={habit.id} className="overflow-hidden">
                                        <div className="flex p-4 items-center gap-4">
                                            <div className="min-w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Trophy className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between">
                                                    <div>
                                                        <h3 className="font-medium">{habit.name}</h3>
                                                        <Badge variant="outline" className="mt-1 text-xs">
                                                            {habit.category}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-medium text-lg">{habit.completionRate}%</div>
                                                        <div className="flex items-center text-xs">
                                                            {habit.trending === "up" ? (
                                                                <>
                                                                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                                                                    <span className="text-green-500">+{habit.change}%</span>
                                                                </>
                                                            ) : habit.trending === "down" ? (
                                                                <>
                                                                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                                                                    <span className="text-red-500">{habit.change}%</span>
                                                                </>
                                                            ) : (
                                                                <span className="text-muted-foreground">No change</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-4 mt-3">
                                                    <div className="flex flex-col">
                                                        <div className="text-xs text-muted-foreground">Current Streak</div>
                                                        <div className="flex items-center mt-1">
                                                            <Flame className="h-4 w-4 text-orange-500 mr-1" />
                                                            <span className="font-medium">{habit.streak} days</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <div className="text-xs text-muted-foreground">Last 7 Days</div>
                                                        <div className="flex items-center mt-1">
                                                            <span className="font-medium">{habit.streak7day}/7 days</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <div className="text-xs text-muted-foreground">Last 30 Days</div>
                                                        <div className="flex items-center mt-1">
                                                            <span className="font-medium">{habit.streak30day}/30 days</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="ai" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>AI-Powered Insights</CardTitle>
                            <CardDescription>
                                Personalized insights and suggestions based on your habit data
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {aiInsights.map((insight) => (
                                    <Card key={insight.id} className="border-primary/20 hover:border-primary transition-colors">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center gap-2">
                                                {insight.icon}
                                                <CardTitle className="text-base">{insight.title}</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm">{insight.description}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <div className="mt-6">
                                <h3 className="text-lg font-medium mb-3">Recommendations</h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                                        <div className="bg-blue-100 p-2 rounded-full">
                                            <Target className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-sm">Optimize Your Morning Routine</h4>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Based on your data, try scheduling your "Meditation" habit right after
                                                "Morning Workout" to build a more consistent routine.
                                            </p>
                                            <Button variant="link" className="h-auto p-0 mt-1 text-sm">
                                                Apply Suggestion <ArrowRight className="h-3 w-3 ml-1" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                                        <div className="bg-purple-100 p-2 rounded-full">
                                            <Users className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-sm">Join the "30-Day Meditation Challenge"</h4>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Your meditation habit is strong! Consider joining the community challenge
                                                to maintain momentum and connect with others.
                                            </p>
                                            <Button variant="link" className="h-auto p-0 mt-1 text-sm">
                                                View Challenge <ArrowRight className="h-3 w-3 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 