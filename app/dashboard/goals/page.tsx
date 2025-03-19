"use client";

import { useState } from "react";
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Target, Plus, Calendar, Check, AlignJustify, Medal, BarChart3, ChevronRight, CheckCircle2, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

// Sample mock data - would be replaced with actual API calls in production
const initialGoals = [
    {
        id: "1",
        title: "Get in shape for summer",
        description: "Build a consistent workout routine and eat healthier",
        category: "health",
        deadline: "2024-08-31",
        status: "in-progress",
        progress: 35,
        relatedHabits: ["Morning Workout", "No Fast Food"],
        milestones: [
            { id: "m1", title: "Lost 5 pounds", completed: true },
            { id: "m2", title: "Complete 30 workouts", completed: false },
            { id: "m3", title: "Fit into old jeans", completed: false },
        ]
    },
    {
        id: "2",
        title: "Learn Spanish",
        description: "Become conversational in Spanish by the end of the year",
        category: "learning",
        deadline: "2024-12-31",
        status: "in-progress",
        progress: 20,
        relatedHabits: ["15 min Spanish Practice"],
        milestones: [
            { id: "m4", title: "Learn 500 words", completed: true },
            { id: "m5", title: "Complete beginner course", completed: false },
            { id: "m6", title: "Have a 5-minute conversation", completed: false },
        ]
    },
    {
        id: "3",
        title: "Save for vacation",
        description: "Save $2000 for summer vacation",
        category: "finance",
        deadline: "2024-07-01",
        status: "in-progress",
        progress: 65,
        relatedHabits: ["No Unnecessary Spending"],
        milestones: [
            { id: "m7", title: "Save first $500", completed: true },
            { id: "m8", title: "Save $1000", completed: true },
            { id: "m9", title: "Book flights with saved money", completed: false },
        ]
    }
];

const categories = [
    { value: "health", label: "Health & Fitness" },
    { value: "learning", label: "Learning & Skills" },
    { value: "finance", label: "Finance" },
    { value: "career", label: "Career" },
    { value: "personal", label: "Personal Development" },
    { value: "other", label: "Other" },
];

export default function GoalsPage() {
    const [goals, setGoals] = useState(initialGoals);
    const [newGoalOpen, setNewGoalOpen] = useState(false);
    const [newMilestoneOpen, setNewMilestoneOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        deadline: "",
        relatedHabits: []
    });
    const [newMilestone, setNewMilestone] = useState({
        title: ""
    });
    const { toast } = useToast();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (value: string) => {
        setFormData(prev => ({ ...prev, category: value }));
    };

    const handleCreateGoal = () => {
        // Validation
        if (!formData.title || !formData.category || !formData.deadline) {
            toast({
                title: "Missing information",
                description: "Please fill in all required fields",
                variant: "destructive"
            });
            return;
        }

        const newGoal = {
            id: Date.now().toString(),
            title: formData.title,
            description: formData.description,
            category: formData.category,
            deadline: formData.deadline,
            status: "in-progress",
            progress: 0,
            relatedHabits: [],
            milestones: []
        };

        setGoals(prev => [newGoal, ...prev]);
        setFormData({
            title: "",
            description: "",
            category: "",
            deadline: "",
            relatedHabits: []
        });
        setNewGoalOpen(false);

        toast({
            title: "Goal Created",
            description: "Your new goal has been created successfully",
        });
    };

    const handleAddMilestone = () => {
        if (!newMilestone.title || !selectedGoal) return;

        const milestone = {
            id: `m${Date.now()}`,
            title: newMilestone.title,
            completed: false
        };

        setGoals(prev => prev.map(goal =>
            goal.id === selectedGoal.id
                ? { ...goal, milestones: [...goal.milestones, milestone] }
                : goal
        ));

        setNewMilestone({ title: "" });
        setNewMilestoneOpen(false);

        toast({
            title: "Milestone Added",
            description: "New milestone has been added to your goal",
        });
    };

    const toggleMilestoneCompletion = (goalId: string, milestoneId: string) => {
        setGoals(prev => prev.map(goal => {
            if (goal.id !== goalId) return goal;

            const updatedMilestones = goal.milestones.map(milestone =>
                milestone.id === milestoneId
                    ? { ...milestone, completed: !milestone.completed }
                    : milestone
            );

            // Recalculate progress percentage
            const completedMilestones = updatedMilestones.filter(m => m.completed).length;
            const newProgress = Math.round((completedMilestones / updatedMilestones.length) * 100);

            return {
                ...goal,
                milestones: updatedMilestones,
                progress: newProgress
            };
        }));
    };

    const deleteGoal = (goalId: string) => {
        setGoals(prev => prev.filter(goal => goal.id !== goalId));

        toast({
            title: "Goal Deleted",
            description: "The goal has been deleted successfully",
        });
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "health": return "bg-green-100 text-green-800";
            case "learning": return "bg-blue-100 text-blue-800";
            case "finance": return "bg-purple-100 text-purple-800";
            case "career": return "bg-yellow-100 text-yellow-800";
            case "personal": return "bg-orange-100 text-orange-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="w-full p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Goals</h1>
                    <p className="text-muted-foreground">
                        Define and track your larger life objectives, supported by your daily habits
                    </p>
                </div>
                <Dialog open={newGoalOpen} onOpenChange={setNewGoalOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            New Goal
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Create New Goal</DialogTitle>
                            <DialogDescription>
                                Set a meaningful goal that your habits will help you achieve.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="title" className="text-right">
                                    Title
                                </Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                    placeholder="e.g., Run a marathon"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="description" className="text-right">
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                    placeholder="What does this goal mean to you?"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="category" className="text-right">
                                    Category
                                </Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={handleCategoryChange}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(category => (
                                            <SelectItem key={category.value} value={category.value}>
                                                {category.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="deadline" className="text-right">
                                    Target Date
                                </Label>
                                <Input
                                    id="deadline"
                                    name="deadline"
                                    type="date"
                                    value={formData.deadline}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" onClick={handleCreateGoal}>Create Goal</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {goals.map(goal => (
                    <Card key={goal.id} className="transition-all hover:shadow-md">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Badge className={cn("mb-2", getCategoryColor(goal.category))}>
                                        {categories.find(c => c.value === goal.category)?.label || goal.category}
                                    </Badge>
                                    <CardTitle className="text-xl">{goal.title}</CardTitle>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteGoal(goal.id)}>
                                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </div>
                            <CardDescription className="text-sm h-10 line-clamp-2">{goal.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                            <div className="flex items-center mb-4">
                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Target: {new Date(goal.deadline).toLocaleDateString()}</span>
                            </div>

                            <div className="mb-4">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium">Progress</span>
                                    <span className="text-sm font-medium">{goal.progress}%</span>
                                </div>
                                <Progress value={goal.progress} className="h-2" />
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-medium mb-2">Milestones</h4>
                                {goal.milestones.length > 0 ? (
                                    <ul className="space-y-1">
                                        {goal.milestones.slice(0, 3).map(milestone => (
                                            <li
                                                key={milestone.id}
                                                className="flex items-center text-sm cursor-pointer hover:bg-slate-50 p-1 rounded"
                                                onClick={() => toggleMilestoneCompletion(goal.id, milestone.id)}
                                            >
                                                <div className={cn(
                                                    "h-4 w-4 rounded-full mr-2 flex items-center justify-center border",
                                                    milestone.completed ? "bg-primary border-primary" : "border-gray-300"
                                                )}>
                                                    {milestone.completed && <Check className="h-3 w-3 text-primary-foreground" />}
                                                </div>
                                                <span className={cn(milestone.completed && "line-through text-muted-foreground")}>
                                                    {milestone.title}
                                                </span>
                                            </li>
                                        ))}
                                        {goal.milestones.length > 3 && (
                                            <li className="text-xs text-muted-foreground pl-6">
                                                + {goal.milestones.length - 3} more milestones
                                            </li>
                                        )}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No milestones added yet</p>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="pt-2">
                            <div className="flex justify-between items-center w-full">
                                <Dialog open={newMilestoneOpen && selectedGoal?.id === goal.id} onOpenChange={(open) => {
                                    setNewMilestoneOpen(open);
                                    if (open) setSelectedGoal(goal);
                                }}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <Plus className="h-3 w-3 mr-1" />
                                            Add Milestone
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Add New Milestone</DialogTitle>
                                            <DialogDescription>
                                                Create a measurable milestone for "{goal.title}"
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="milestone-title" className="text-right">
                                                    Milestone
                                                </Label>
                                                <Input
                                                    id="milestone-title"
                                                    value={newMilestone.title}
                                                    onChange={(e) => setNewMilestone({ title: e.target.value })}
                                                    className="col-span-3"
                                                    placeholder="e.g., Complete first 5K run"
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" onClick={handleAddMilestone}>Add Milestone</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                                <a href={`/dashboard/goals/${goal.id}`} className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    <span>View Details</span>
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </a>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
} 