"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { createPost, getUserHabits, Habit } from "@/app/dashboard/community/actions";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Image, Plus, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

interface CreatePostDialogProps {
    user?: User;
    onPostCreated?: () => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function CreatePostDialog({
    user,
    onPostCreated,
    open,
    onOpenChange
}: CreatePostDialogProps) {
    const [content, setContent] = useState("");
    const [habits, setHabits] = useState<Habit[]>([]);
    const [selectedHabit, setSelectedHabit] = useState<string>("none");
    const [isLoading, setIsLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [imageName, setImageName] = useState("");
    const [internalDialogOpen, setInternalDialogOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const supabase = createClient();

    // Determine if we're using controlled or uncontrolled open state
    const isControlled = open !== undefined && onOpenChange !== undefined;
    const dialogOpen = isControlled ? open : internalDialogOpen;
    const setDialogOpen = isControlled
        ? onOpenChange
        : setInternalDialogOpen;

    // Get current user from Supabase auth if not provided
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        async function getUser() {
            if (!user) {
                const { data: { user: authUser } } = await supabase.auth.getUser();
                setCurrentUser(authUser);
            }
        }

        getUser();
    }, [user, supabase]);

    const actualUser = user || currentUser;

    // Get user's display name and avatar from auth metadata
    const displayName = actualUser?.user_metadata?.full_name || "User";
    const avatarUrl = actualUser?.user_metadata?.avatar_url;

    // Fetch user's habits when dialog opens
    const handleDialogOpen = async (open: boolean) => {
        setDialogOpen(open);

        if (open) {
            try {
                const userHabits = await getUserHabits();
                setHabits(userHabits);
            } catch (error) {
                console.error("Error fetching habits:", error);
                toast({
                    title: "Error",
                    description: "Failed to load your habits. Please try again.",
                    variant: "destructive",
                });
            }
        } else {
            // Reset form on close
            setContent("");
            setSelectedHabit("none");
            setImageUrl("");
            setImageName("");
        }
    };

    const handleCreatePost = async () => {
        if (!content.trim()) return;

        setIsLoading(true);
        try {
            // Convert "none" value to null for the API
            const habitUuid = selectedHabit === "none" ? null : selectedHabit;

            await createPost({
                content,
                habit_uuid: habitUuid,
                image_url: imageUrl,
            });

            setDialogOpen(false);
            toast({
                title: "Post created",
                description: "Your post has been published successfully.",
            });

            // Call the callback if provided
            if (onPostCreated) {
                onPostCreated();
            }
        } catch (error) {
            console.error("Error creating post:", error);
            toast({
                title: "Error",
                description: "Failed to create post. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // For demo purposes, we'll just store the file name
            // In a real app, you would upload this to Supabase storage
            setImageName(file.name);

            // Create a local URL for preview
            const url = URL.createObjectURL(file);
            setImageUrl(url);
        }
    };

    const removeImage = () => {
        setImageUrl("");
        setImageName("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={handleDialogOpen}>
            <DialogTrigger asChild>
                <Button className="w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Create Post
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[500px] p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create a Post</DialogTitle>
                    <DialogDescription>
                        Share your progress or thoughts with the community
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 sm:space-y-6 py-3 sm:py-4">
                    <div className="flex items-center space-x-3">
                        <Avatar>
                            <AvatarImage src={avatarUrl} />
                            <AvatarFallback>{displayName[0]?.toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{displayName}</span>
                    </div>

                    <Textarea
                        placeholder="What's on your mind?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-24 sm:min-h-32"
                    />

                    {habits.length > 0 && (
                        <div className="space-y-2">
                            <Label htmlFor="habit" className="text-sm sm:text-base">Link to a habit (optional)</Label>
                            <Select
                                value={selectedHabit || "none"}
                                onValueChange={setSelectedHabit}
                            >
                                <SelectTrigger id="habit" className="w-full">
                                    <SelectValue placeholder="Select a habit to link" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[40vh]">
                                    <SelectItem value="none">None</SelectItem>
                                    {habits.map((habit) => (
                                        <SelectItem
                                            key={habit.uuid}
                                            value={habit.uuid}
                                            className="flex items-center"
                                        >
                                            <div className="flex items-center">
                                                {habit.icon && (
                                                    <Icon
                                                        name={habit.icon as any}
                                                        className="h-4 w-4 mr-2"
                                                        style={{ color: habit.color || "#4F46E5" }}
                                                    />
                                                )}
                                                {habit.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {selectedHabit !== "none" && (
                                <div className="mt-2">
                                    <Badge variant="outline" className="flex items-center space-x-1">
                                        {(() => {
                                            const habit = habits.find(h => h.uuid === selectedHabit);
                                            return (
                                                <>
                                                    {habit?.icon && (
                                                        <Icon
                                                            name={habit.icon as any}
                                                            className="h-3 w-3 mr-1"
                                                            style={{ color: habit.color || "#4F46E5" }}
                                                        />
                                                    )}
                                                    {habit?.name}
                                                </>
                                            );
                                        })()}
                                    </Badge>
                                </div>
                            )}
                        </div>
                    )}

                    {/* <div className="space-y-2">
                        <Label>Add an image (optional)</Label>
                        <div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                            />

                            {!imageUrl ? (
                                <Button
                                    variant="outline"
                                    className="w-full h-24 border-dashed flex flex-col gap-2"
                                    onClick={handleImageClick}
                                >
                                    <Image className="h-5 w-5" />
                                    <span>Click to add an image</span>
                                </Button>
                            ) : (
                                <div className="relative">
                                    <img
                                        src={imageUrl}
                                        alt="Preview"
                                        className="w-full h-32 object-cover rounded-md"
                                    />
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-6 w-6"
                                        onClick={removeImage}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {imageName}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div> */}
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-4 pt-2">
                    <Button
                        type="submit"
                        onClick={handleCreatePost}
                        disabled={isLoading || !content.trim()}
                        className="w-full sm:w-auto"
                    >
                        {isLoading ? "Posting..." : "Post"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 