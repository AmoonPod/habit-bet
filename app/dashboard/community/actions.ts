"use server";
import { Tables } from "@/database.types";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface CreatePostProps {
    content: string;
    habit_uuid?: string | null;
    image_url?: string | null;
}

// Define interfaces for post data
export interface Habit {
    uuid: string;
    name: string;
    icon?: string;
    color?: string;
    user_uuid: string;
    created_at: string;
    description?: string;
    status: string;
}

export interface UserMetadata {
    full_name?: string;
    avatar_url?: string;
}

export interface User {
    id: string;
    user_metadata?: UserMetadata;
}

export interface Profile {
    id: string;
    full_name?: string;
    streak_count?: number;
    points?: number;
    level?: number;
}

export interface PostLike {
    uuid: string;
    post_uuid: string;
    user_uuid: string;
    created_at: string;
}

export interface Post {
    uuid: string;
    user_uuid: string;
    habit_uuid?: string | null;
    image_url?: string | null;
    content: string;
    created_at: string;
    updated_at?: string;
    habits?: Habit | null;
    profiles: Tables<"profiles">;
    likes: PostLike[];
    comments: Comment[];
    comment_count: number;
}

export interface Comment {
    uuid: string;
    post_uuid: string;
    user_uuid: string;
    content: string;
    created_at: string;
    updated_at?: string | null;
    profiles: Tables<"profiles">;
}

// Get all public habits for the community feed
export async function getPublicHabits() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("habits")
        .select(`
      *,
      profiles:user_uuid (
        *
      )
    `)
        .eq("is_public", true)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching public habits:", error);
        return [];
    }

    return data || [];
}

// Get all posts for the community feed
export async function getPosts(): Promise<Post[]> {
    const supabase = await createClient();

    console.log("Fetching posts...");

    try {
        // First, fetch the base posts data
        const { data: posts, error: postsError } = await supabase
            .from("posts")
            .select("*")
            .order("created_at", { ascending: false });

        if (postsError) {
            console.error("Error fetching posts:", postsError);
            return [];
        }

        if (!posts || posts.length === 0) {
            console.log("No posts found");
            return [];
        }

        // Get post IDs for additional queries
        const postIds = posts.map((post) => post.uuid);
        const userIds = posts.map((post) => post.user_uuid);

        // Fetch related data in parallel for better performance
        const [
            habitsResult,
            profilesResult,
            likesResult,
            commentsResult,
        ] = await Promise.all([
            // Get related habits
            supabase
                .from("habits")
                .select("*")
                .in(
                    "uuid",
                    posts.filter((p) => p.habit_uuid).map((p) => p.habit_uuid),
                ),

            // Get related profiles - use full profile data
            supabase
                .from("profiles")
                .select("*")
                .in("id", userIds),

            // Get likes for posts
            supabase
                .from("post_likes")
                .select("uuid, post_uuid, user_uuid")
                .in("post_uuid", postIds),

            // Get comments for posts
            supabase
                .from("post_comments")
                .select("*")
                .in("post_uuid", postIds),
        ]);

        // Check for errors in any of the parallel queries
        const errors = [
            habitsResult.error,
            profilesResult.error,
            likesResult.error,
            commentsResult.error,
        ]
            .filter(Boolean);

        if (errors.length > 0) {
            console.error("Errors in fetching related data:", errors);
            // We'll continue with partial data instead of failing completely
        }

        console.log("Profiles data:", profilesResult.data);

        // Build a lookup table for habits by UUID
        const habitsMap: Record<string, Habit> = {};
        (habitsResult.data || []).forEach((habit) => {
            habitsMap[habit.uuid] = habit as Habit;
        });

        // Build a lookup table for profiles by ID
        const profilesMap: Record<string, Tables<"profiles">> = {};
        (profilesResult.data || []).forEach((profile) => {
            profilesMap[profile.id] = profile as Tables<"profiles">;
        });

        // Group likes by post_uuid
        const likesMap: Record<string, PostLike[]> = {};
        (likesResult.data || []).forEach((like) => {
            if (!likesMap[like.post_uuid]) {
                likesMap[like.post_uuid] = [];
            }
            likesMap[like.post_uuid].push(like as PostLike);
        });

        // Count comments by post_uuid
        const commentsCountMap: Record<string, number> = {};
        (commentsResult.data || []).forEach((comment) => {
            if (!commentsCountMap[comment.post_uuid]) {
                commentsCountMap[comment.post_uuid] = 0;
            }
            commentsCountMap[comment.post_uuid]++;
        });

        // Group comments by post_uuid
        const commentsMap: Record<string, Comment[]> = {};
        (commentsResult.data || []).forEach((comment) => {
            if (!commentsMap[comment.post_uuid]) {
                commentsMap[comment.post_uuid] = [];
            }

            // Add profile to comment using the profile lookup
            const commentWithProfile = {
                ...comment,
                profiles: profilesMap[comment.user_uuid],
            } as Comment;

            commentsMap[comment.post_uuid].push(commentWithProfile);
        });

        // Combine the data into a single, well-structured array
        const enrichedPosts: Post[] = posts.map((post) => ({
            ...post,
            habits: post.habit_uuid ? habitsMap[post.habit_uuid] : null,
            profiles: profilesMap[post.user_uuid],
            likes: likesMap[post.uuid] || [],
            comments: commentsMap[post.uuid] || [],
            comment_count: commentsCountMap[post.uuid] || 0,
        }));

        console.log(`Fetched and enriched ${enrichedPosts.length} posts`);
        return enrichedPosts;
    } catch (error) {
        console.error("Unexpected error in getPosts:", error);
        return [];
    }
}

// Create a new post
export async function createPost(props: CreatePostProps) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("User not found");
    }

    console.log("Creating post with data:", {
        user_uuid: user.id,
        habit_uuid: props.habit_uuid,
        contentLength: props.content.length,
        hasImage: !!props.image_url,
    });

    const { data, error } = await supabase
        .from("posts")
        .insert({
            user_uuid: user.id,
            habit_uuid: props.habit_uuid,
            content: props.content,
        })
        .select();

    if (error) {
        console.error("Error creating post:", error);
        throw error;
    }

    console.log("Post created successfully:", data);

    revalidatePath("/dashboard/community");

    return { data, error };
}

// Like a post
export async function likePost(postUuid: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("User not found");
    }

    // Check if the user has already liked this post
    const { data: existingLike } = await supabase
        .from("post_likes")
        .select("uuid")
        .eq("post_uuid", postUuid)
        .eq("user_uuid", user.id)
        .single();

    if (existingLike) {
        // User already liked the post, so unlike it
        const { error } = await supabase
            .from("post_likes")
            .delete()
            .eq("uuid", existingLike.uuid);

        if (error) {
            console.error("Error unliking post:", error);
            throw error;
        }
    } else {
        // User hasn't liked the post yet, so like it
        const { error } = await supabase
            .from("post_likes")
            .insert({
                post_uuid: postUuid,
                user_uuid: user.id,
            });

        if (error) {
            console.error("Error liking post:", error);
            throw error;
        }
    }

    revalidatePath("/dashboard/community");

    return { success: true };
}

// Add a comment to a post
export async function addComment(postUuid: string, content: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("User not found");
    }

    const { data, error } = await supabase
        .from("post_comments")
        .insert({
            post_uuid: postUuid,
            user_uuid: user.id,
            content: content,
        })
        .select();

    if (error) {
        console.error("Error adding comment:", error);
        throw error;
    }

    revalidatePath("/dashboard/community");

    return { data, error };
}

// Get leaderboard data
export async function getLeaderboard() {
    const supabase = await createClient();

    try {
        console.log("Fetching leaderboard data...");

        // Fetch data from the enhanced habits_leaderbord view that includes user profile info
        const { data: leaderboardBaseData, error: leaderboardError } =
            await supabase
                .from("habits_leaderbord")
                .select("user_uuid, count, full_name, avatar_url");

        if (leaderboardError) {
            console.error(
                "Error fetching habit leaderboard data:",
                leaderboardError,
            );
            return [];
        }

        if (!leaderboardBaseData || leaderboardBaseData.length === 0) {
            console.log("No leaderboard data found");
            return [];
        }

        // Get all user IDs for additional metrics queries
        const userUuids = leaderboardBaseData.map((entry) => entry.user_uuid);

        // Fetch post counts
        const { data: postCountsData, error: postCountsError } = await supabase
            .from("posts")
            .select("user_uuid")
            .in("user_uuid", userUuids);

        // Count posts per user
        const postCounts: Record<string, number> = {};
        if (postCountsData && !postCountsError) {
            postCountsData.forEach((post: { user_uuid: string }) => {
                if (!postCounts[post.user_uuid]) {
                    postCounts[post.user_uuid] = 0;
                }
                postCounts[post.user_uuid]++;
            });
        } else if (postCountsError) {
            console.error("Error fetching post counts:", postCountsError);
        }

        // Fetch comment counts
        const { data: commentsData, error: commentsError } = await supabase
            .from("post_comments")
            .select("user_uuid")
            .in("user_uuid", userUuids);

        // Count comments per user
        const commentCounts: Record<string, number> = {};
        if (commentsData && !commentsError) {
            commentsData.forEach((comment: { user_uuid: string }) => {
                if (!commentCounts[comment.user_uuid]) {
                    commentCounts[comment.user_uuid] = 0;
                }
                commentCounts[comment.user_uuid]++;
            });
        } else if (commentsError) {
            console.error("Error fetching comment counts:", commentsError);
        }

        // Fetch all posts to count likes
        const { data: postsData, error: postsError } = await supabase
            .from("posts")
            .select(`
                uuid,
                user_uuid
            `)
            .in("user_uuid", userUuids);

        // Fetch likes for all those posts
        const likeCounts: Record<string, number> = {};

        if (postsData && !postsError) {
            const postIds = postsData.map((post: { uuid: string }) =>
                post.uuid
            );
            const postOwnerMap: Record<string, string> = {};

            // Create a map of post UUID to user UUID
            postsData.forEach((post: { uuid: string; user_uuid: string }) => {
                postOwnerMap[post.uuid] = post.user_uuid;
            });

            // Fetch likes
            const { data: likesData, error: likesError } = await supabase
                .from("post_likes")
                .select("post_uuid")
                .in("post_uuid", postIds);

            if (likesData && !likesError) {
                likesData.forEach((like: { post_uuid: string }) => {
                    const ownerUuid = postOwnerMap[like.post_uuid];
                    if (ownerUuid) {
                        if (!likeCounts[ownerUuid]) {
                            likeCounts[ownerUuid] = 0;
                        }
                        likeCounts[ownerUuid]++;
                    }
                });
            } else if (likesError) {
                console.error("Error fetching likes:", likesError);
            }
        } else if (postsError) {
            console.error("Error fetching posts for like counts:", postsError);
        }

        // Calculate points and levels
        const pointsMap: Record<string, number> = {};
        const levelMap: Record<string, number> = {};

        // Points calculation
        userUuids.forEach((id) => {
            // Get the check-in count from the leaderboard data
            const user = leaderboardBaseData.find((entry) =>
                entry.user_uuid === id
            );
            const checkInCount = user ? user.count : 0;
            const postsCount = postCounts[id] || 0;
            const likesCount = likeCounts[id] || 0;
            const commentsCount = commentCounts[id] || 0;

            // Calculate total points
            pointsMap[id] = (checkInCount * 10) + // Check-ins (×10)
                (postsCount * 5) + // Posts (×5)
                (likesCount * 2) + // Likes received (×2)
                (commentsCount * 1); // Comments (×1)

            // Calculate level based on points
            if (pointsMap[id] < 10) levelMap[id] = 1;
            else if (pointsMap[id] < 25) levelMap[id] = 2;
            else if (pointsMap[id] < 50) levelMap[id] = 3;
            else if (pointsMap[id] < 100) levelMap[id] = 4;
            else if (pointsMap[id] < 200) levelMap[id] = 5;
            else if (pointsMap[id] < 350) levelMap[id] = 6;
            else if (pointsMap[id] < 500) levelMap[id] = 7;
            else if (pointsMap[id] < 750) levelMap[id] = 8;
            else if (pointsMap[id] < 1000) levelMap[id] = 9;
            else levelMap[id] = 10;
        });

        // Create the enhanced leaderboard data
        const enhancedLeaderboardData = leaderboardBaseData.map((entry) => {
            const id = entry.user_uuid;
            const checkInCount = entry.count || 0;
            const userPostCount = postCounts[id] || 0;
            const userLikeCount = likeCounts[id] || 0;
            const userCommentCount = commentCounts[id] || 0;
            const points = pointsMap[id] || 0;
            const level = levelMap[id] || 1;

            // Calculate composite score with weights
            const compositeScore = (checkInCount * 10) + // Habit check-ins (×10)
                (userPostCount * 5) + // Posts created (×5)
                (userLikeCount * 2) + // Likes received (×2)
                (userCommentCount * 1) + // Comments made (×1)
                (points * 1); // Base points

            return {
                id: id,
                first_name: entry.full_name
                    ? entry.full_name.split(" ")[0]
                    : "",
                last_name: entry.full_name
                    ? entry.full_name.split(" ").slice(1).join(" ")
                    : "",
                avatar_url: entry.avatar_url,
                post_count: userPostCount,
                likes_received: userLikeCount,
                comments_made: userCommentCount,
                streak_count: checkInCount,
                points,
                level,
                composite_score: compositeScore,
            };
        });

        // Sort by composite score and return
        return enhancedLeaderboardData
            .sort((a, b) => b.composite_score - a.composite_score)
            .slice(0, 100);
    } catch (error) {
        console.error("Error in getLeaderboard:", error);
        return [];
    }
}

// Get user's habits for post creation
export async function getUserHabits() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("user_uuid", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching user habits:", error);
        return [];
    }

    return data || [];
}

// Delete a post
export async function deletePost(postUuid: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("User not found. Please log in again.");
    }

    try {
        // First check if the post exists and belongs to the user
        const { data: post, error: postError } = await supabase
            .from("posts")
            .select("user_uuid")
            .eq("uuid", postUuid)
            .single();

        if (postError) {
            if (postError.code === "PGRST116") {
                throw new Error(
                    "Post not found. It may have been already deleted.",
                );
            }
            console.error("Error fetching post:", postError);
            throw new Error(
                "Failed to verify post ownership. Please try again.",
            );
        }

        if (post.user_uuid !== user.id) {
            throw new Error("You can only delete your own posts.");
        }

        // Delete associated likes first (foreign key constraint)
        const { error: likesError } = await supabase
            .from("post_likes")
            .delete()
            .eq("post_uuid", postUuid);

        if (likesError) {
            console.error("Error deleting post likes:", likesError);
            // Continue with deletion attempt even if removing likes fails
        }

        // Delete associated comments (foreign key constraint)
        const { error: commentsError } = await supabase
            .from("post_comments")
            .delete()
            .eq("post_uuid", postUuid);

        if (commentsError) {
            console.error("Error deleting post comments:", commentsError);
            // Continue with deletion attempt even if removing comments fails
        }

        // Delete the post
        const { error: deleteError } = await supabase
            .from("posts")
            .delete()
            .eq("uuid", postUuid);

        if (deleteError) {
            console.error("Error deleting post:", deleteError);
            throw new Error("Failed to delete post. Please try again.");
        }

        revalidatePath("/dashboard/community");

        return { success: true };
    } catch (error) {
        console.error("Error in deletePost:", error);
        // Re-throw custom errors, but wrap other errors
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("An unexpected error occurred. Please try again.");
    }
}

// Get comments for a post
export async function getComments(postUuid: string): Promise<Comment[]> {
    const supabase = await createClient();

    console.log("Fetching comments for post:", postUuid);

    try {
        // First, fetch the comments
        const { data: comments, error } = await supabase
            .from("post_comments")
            .select("*")
            .eq("post_uuid", postUuid)
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Error fetching comments:", error);
            return [];
        }

        if (!comments || comments.length === 0) {
            console.log("No comments found for post:", postUuid);
            return [];
        }

        // Get user IDs for additional queries
        const userIds = comments.map((comment) => comment.user_uuid);

        // Fetch profiles
        const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("*")
            .in("id", userIds);

        // Check for errors
        if (profilesError) {
            console.error(
                "Error fetching profiles for comments:",
                profilesError,
            );
        }

        // Build lookup tables
        const profilesMap: Record<string, Tables<"profiles">> = {};
        (profilesData || []).forEach((profile) => {
            profilesMap[profile.id] = profile as Tables<"profiles">;
        });

        // Combine the data
        const enrichedComments: Comment[] = comments.map((comment) => ({
            ...comment,
            profiles: profilesMap[comment.user_uuid] || null,
        }));

        console.log(`Fetched and enriched ${enrichedComments.length} comments`);
        return enrichedComments;
    } catch (error) {
        console.error("Unexpected error in getComments:", error);
        return [];
    }
}

// Delete a comment
export async function deleteComment(commentUuid: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("User not found. Please log in again.");
    }

    try {
        // First check if the comment exists and belongs to the user
        const { data: comment, error: commentError } = await supabase
            .from("post_comments")
            .select("user_uuid, post_uuid")
            .eq("uuid", commentUuid)
            .single();

        if (commentError) {
            if (commentError.code === "PGRST116") {
                throw new Error(
                    "Comment not found. It may have been already deleted.",
                );
            }
            console.error("Error fetching comment:", commentError);
            throw new Error(
                "Failed to verify comment ownership. Please try again.",
            );
        }

        if (comment.user_uuid !== user.id) {
            throw new Error("You can only delete your own comments.");
        }

        // Delete the comment
        const { error: deleteError } = await supabase
            .from("post_comments")
            .delete()
            .eq("uuid", commentUuid);

        if (deleteError) {
            console.error("Error deleting comment:", deleteError);
            throw new Error("Failed to delete comment. Please try again.");
        }

        revalidatePath("/dashboard/community");

        return {
            success: true,
            post_uuid: comment.post_uuid, // Return post_uuid for client-side context
        };
    } catch (error) {
        console.error("Error in deleteComment:", error);
        // Re-throw custom errors, but wrap other errors
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("An unexpected error occurred. Please try again.");
    }
}
