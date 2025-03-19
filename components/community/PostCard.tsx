"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    likePost,
    deletePost,
    getComments,
    deleteComment,
    Post,
    Comment
} from "@/app/dashboard/community/actions";
import {
    Heart,
    MessageSquare,
    MoreVertical,
    Trash2,
    AlertTriangle,
    Loader2
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { addComment } from "@/app/dashboard/community/actions";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PostCardProps {
    post: Post;
    currentUserId: string;
    onPostDeleted?: () => void;
}

export function PostCard({ post, currentUserId, onPostDeleted }: PostCardProps) {
    const [isLiked, setIsLiked] = useState(
        post.likes?.some((like) => like.user_uuid === currentUserId) || false
    );
    const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
    const [commentCount, setCommentCount] = useState(
        typeof post.comments === 'number' ? post.comments :
            (post.comment_count || 0)
    );
    const [showCommentForm, setShowCommentForm] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [showComments, setShowComments] = useState(false);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const { toast } = useToast();

    // Format display name from user's metadata or profile
    const displayName =
        post.profiles?.full_name ||
        "User";

    // Get avatar image
    const avatarUrl = post.profiles?.avatar_url || "";

    // Format date
    const formattedDate = post.created_at
        ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
        : "";

    const handleLikeClick = async () => {
        // Immediately toggle the like state - fully optimistic
        const newLikedState = !isLiked;
        setIsLiked(newLikedState);
        setLikeCount(newLikedState ? likeCount + 1 : Math.max(0, likeCount - 1));

        try {
            // Call the API in the background
            await likePost(post.uuid);
            // No need to update UI since we already did it optimistically
        } catch (error) {
            console.error("Error toggling like:", error);
            // Revert on error
            setIsLiked(!newLikedState); // Revert to the previous state
            setLikeCount(!newLikedState ? likeCount : Math.max(0, likeCount - 1)); // Revert count
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update like status",
                variant: "destructive",
            });
        }
    };

    const handleDeletePost = async () => {
        setIsDeleting(true);
        setDeleteError(null);
        try {
            const result = await deletePost(post.uuid);
            toast({
                title: "Post deleted",
                description: "Your post has been deleted successfully.",
            });
            if (onPostDeleted) {
                onPostDeleted();
            }
        } catch (error) {
            console.error("Error deleting post:", error);
            setDeleteError(error instanceof Error ? error.message : "Failed to delete post");
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete post",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
            setShowDeleteAlert(false);
        }
    };

    const handleSubmitComment = async () => {
        if (!commentText.trim()) return;

        setIsSubmitting(true);
        try {
            await addComment(post.uuid, commentText);
            setCommentText("");
            setCommentCount(commentCount + 1);
            loadComments();
            toast({
                title: "Comment added",
                description: "Your comment has been added successfully.",
            });
        } catch (error) {
            console.error("Error adding comment:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to add comment",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const loadComments = async () => {
        setIsLoadingComments(true);
        try {
            const commentsData = await getComments(post.uuid);
            setComments(commentsData);
            setCommentCount(commentsData.length);
        } catch (error) {
            console.error("Error loading comments:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to load comments",
                variant: "destructive",
            });
        } finally {
            setIsLoadingComments(false);
        }
    };

    const toggleComments = async () => {
        const newState = !showComments;
        setShowComments(newState);

        if (newState && comments.length === 0) {
            loadComments();
        }
    };

    return (
        <Card className="w-full mb-4">
            <CardHeader className="px-4 py-3 md:p-6 space-y-2 md:space-y-3">
                <div className="flex justify-between items-start w-full">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 md:h-10 md:w-10">
                            <AvatarImage src={avatarUrl} alt={displayName} />
                            <AvatarFallback>
                                {displayName[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-medium text-sm md:text-base line-clamp-1">
                                {displayName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {formattedDate}
                            </span>
                        </div>
                    </div>

                    {post.user_uuid === currentUserId && (
                        <div className="relative">
                            <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-36">
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                <span>Delete</span>
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <AlertDialogContent className="max-w-[90vw] md:max-w-md">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete your post and all its comments.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-destructive hover:bg-destructive/90"
                                            onClick={handleDeletePost}
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Deleting...
                                                </>
                                            ) : (
                                                "Delete Post"
                                            )}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="px-4 py-2 md:px-6 md:py-3 space-y-2 md:space-y-4 w-full">
                <p className="text-sm md:text-base whitespace-pre-wrap break-words">{post.content}</p>
                {post.image_url && (
                    <div className="mt-2 md:mt-4 rounded-md overflow-hidden max-h-96 w-full">
                        <img
                            src={post.image_url}
                            alt="Post attachment"
                            className="w-full h-auto object-contain"
                        />
                    </div>
                )}

                {post.habits && (
                    <div className="mt-3 flex items-center space-x-2">
                        <Badge
                            className="flex items-center space-x-1"
                            style={{
                                backgroundColor: post.habits.color || "#4F46E5",
                                color: "white"
                            }}
                        >
                            {post.habits.icon && <Icon name={post.habits.icon as any} className="h-3 w-3 mr-1" />}
                            {post.habits.name}
                        </Badge>
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex items-center justify-between px-4 py-2 md:px-6 md:py-3 border-t w-full">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`flex items-center gap-1 text-xs md:text-sm ${isLiked ? 'text-red-500' : ''}`}
                        onClick={handleLikeClick}
                    >
                        <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500' : ''}`} />
                        {likeCount > 0 && likeCount}
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1 text-xs md:text-sm"
                        onClick={toggleComments}
                    >
                        <MessageSquare className="h-4 w-4" />
                        {commentCount > 0 && commentCount}
                    </Button>
                </div>
            </CardFooter>

            {showComments && (
                <div className="border-t px-4 py-3 md:px-6 md:py-4 w-full">
                    <div className="mb-4 w-full">
                        <div className="flex items-start gap-2 w-full">
                            <Avatar className="h-7 w-7 mt-1 shrink-0">
                                <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 w-full">
                                <Textarea
                                    placeholder="Write a comment..."
                                    className="min-h-[80px] text-sm w-full"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                />
                                <div className="mt-2 flex justify-end">
                                    <Button
                                        size="sm"
                                        disabled={commentText.trim() === '' || isSubmitting}
                                        onClick={handleSubmitComment}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                Posting...
                                            </>
                                        ) : (
                                            "Post"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 w-full">
                        {isLoadingComments ? (
                            <div className="flex justify-center py-4 w-full">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : comments.length === 0 ? (
                            <div className="text-center py-4 text-sm text-muted-foreground w-full">
                                No comments yet. Be the first to comment!
                            </div>
                        ) : (
                            <div className="w-full">
                                {comments.map((comment) => (
                                    <CommentItem
                                        key={comment.uuid}
                                        comment={comment}
                                        currentUserId={currentUserId}
                                        onCommentDeleted={loadComments}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Card>
    );
}

// Comment item component with delete functionality
interface CommentItemProps {
    comment: Comment;
    currentUserId: string;
    onCommentDeleted: () => void;
}

function CommentItem({ comment, currentUserId, onCommentDeleted }: CommentItemProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const { toast } = useToast();

    const handleDeleteComment = async () => {
        setIsDeleting(true);
        try {
            await deleteComment(comment.uuid);
            toast({
                title: "Comment deleted",
                description: "Your comment has been deleted successfully.",
            });
            // Call the callback to refresh comments and update count
            onCommentDeleted();
        } catch (error) {
            console.error("Error deleting comment:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete comment",
                variant: "destructive"
            });
        } finally {
            setIsDeleting(false);
            setShowDeleteAlert(false);
        }
    };

    return (
        <div className="flex items-start space-x-2 p-2 bg-muted/20 rounded-md">
            <Avatar className="h-6 w-6">
                <AvatarImage src={comment.profiles?.avatar_url || ""} />
                <AvatarFallback>
                    {(comment.profiles?.full_name?.[0] || "U").toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex items-baseline justify-between">
                    <span className="text-xs font-medium">
                        {comment.profiles?.full_name || "User"}
                    </span>
                    <div className="flex items-center space-x-1">
                        <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>

                        {comment.user_uuid === currentUserId && (
                            <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5"
                                        disabled={isDeleting}
                                    >
                                        <Trash2 className="h-3 w-3 text-red-500" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="flex items-center">
                                            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" /> Delete Comment
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete this comment? This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDeleteComment}
                                            className="bg-red-500 hover:bg-red-600"
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? "Deleting..." : "Delete"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                </div>
                <p className="text-sm mt-1">{comment.content}</p>
            </div>
        </div>
    );
} 