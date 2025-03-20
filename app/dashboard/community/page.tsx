"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import {
  Trophy,
  Plus,
  Loader2,
  RefreshCcw,
  Flame,
  Heart,
  Star,
  MessageSquare,
  InfoIcon,
  PenIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { PostCard } from "@/components/community/PostCard";
import { CreatePostDialog } from "@/components/community/CreatePostDialog";
import { LeaderboardItem } from "@/components/community/LeaderboardItem";
import { getPosts, getLeaderboard, Post } from "./actions";

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const { toast } = useToast();
  const [showScoringInfo, setShowScoringInfo] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        // First, get the current user
        const supabase = createClient();
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Authentication error:", userError);
          throw new Error("Failed to authenticate. Please log in again.");
        }

        if (user) {
          setCurrentUserId(user.id);
        } else {
          console.warn("No user found in auth state");
        }

        // Fetch posts
        const postsData = await getPosts();
        setPosts(postsData);

        // Fetch leaderboard data
        setIsLeaderboardLoading(true);
        try {
          const leaderboardResult = await getLeaderboard();
          console.log("Leaderboard result:", leaderboardResult);
          if (Array.isArray(leaderboardResult)) {
            setLeaderboardData(leaderboardResult);
          } else {
            console.error(
              "Invalid leaderboard data received:",
              leaderboardResult
            );
            setLeaderboardData([]); // Set to empty array as fallback
          }
        } catch (leaderboardError) {
          console.error("Error loading leaderboard:", leaderboardError);
          setLeaderboardData([]); // Set to empty array on error
        } finally {
          setIsLeaderboardLoading(false);
        }
      } catch (err) {
        console.error("Error loading community data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load community data"
        );
        toast({
          title: "Error",
          description:
            err instanceof Error
              ? err.message
              : "Failed to load community data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [toast]);

  const handlePostDeleted = async () => {
    try {
      setIsLoading(true);
      const postsData = await getPosts();
      setPosts(postsData);
      toast({
        title: "Success",
        description: "The post has been deleted successfully.",
      });
    } catch (err) {
      console.error("Error refreshing posts:", err);
      toast({
        title: "Error",
        description: "Failed to refresh posts after deletion.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostCreated = async () => {
    try {
      setIsLoading(true);
      const postsData = await getPosts();
      setPosts(postsData);
      setIsCreatePostOpen(false);
      toast({
        title: "Success",
        description: "Your post has been published successfully!",
      });
    } catch (err) {
      console.error("Error refreshing posts:", err);
      toast({
        title: "Error",
        description: "Your post was created but we couldn't refresh the feed.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const postsData = await getPosts();
      setPosts(postsData);
      toast({
        title: "Refreshed",
        description: "The post feed has been updated.",
      });
    } catch (err) {
      console.error("Error refreshing data:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh data");
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to refresh data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full p-3 md:p-6 space-y-4 md:space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2 md:mb-4 w-full">
        <h1 className="text-xl md:text-2xl font-bold">Community</h1>
        <div className="flex space-x-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={refreshData}
            disabled={isLoading}
            size="sm"
            className="text-sm"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4 mr-1" />
            )}
            <span className="hidden sm:inline ml-1">Refresh</span>
          </Button>

          <CreatePostDialog
            open={isCreatePostOpen}
            onOpenChange={setIsCreatePostOpen}
            onPostCreated={handlePostCreated}
          />
        </div>
      </div>

      <Tabs defaultValue="feed" className="w-full max-w-full">
        <TabsList className="mb-4 md:mb-6 w-full sm:w-auto">
          <TabsTrigger value="feed" className="flex-1 sm:flex-initial">
            Feed
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex-1 sm:flex-initial">
            Leaderboard
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="feed"
          className="space-y-3 md:space-y-4 w-full max-w-full"
        >
          {isLoading ? (
            // Loading skeletons
            Array(3)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="mb-4 w-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                  <CardFooter>
                    <div className="flex space-x-4">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </CardFooter>
                </Card>
              ))
          ) : error ? (
            <Card className="text-center py-8 w-full">
              <CardContent className="pt-6">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={refreshData}>Retry</Button>
              </CardContent>
            </Card>
          ) : posts.length === 0 ? (
            <Card className="text-center py-8 w-full">
              <CardContent className="pt-6">
                <p className="text-gray-500 mb-4">
                  No posts yet. Be the first to post!
                </p>
                <Button onClick={() => setIsCreatePostOpen(true)}>
                  Create Post
                </Button>
              </CardContent>
            </Card>
          ) : (
            // Post listing
            <div className="w-full">
              {posts.map((post) => (
                <PostCard
                  key={post.uuid}
                  post={post}
                  currentUserId={currentUserId}
                  onPostDeleted={handlePostDeleted}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="w-full max-w-full">
          <Card className="w-full h-fit">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Trophy size={20} className="flex-shrink-0" />
                <span className="truncate">Community Leaderboard</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Top community members ranked by a composite score that rewards
                streak consistency, content creation, engagement, and quality.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-4 md:px-6">
              {isLeaderboardLoading ? (
                <div className="space-y-2 w-full">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 sm:h-14 w-full" />
                  ))}
                </div>
              ) : leaderboardData.length > 0 ? (
                <div className="space-y-2 w-full">
                  <Button
                    variant="ghost"
                    className="w-full justify-between mb-2 text-xs sm:text-sm font-medium"
                    onClick={() => setShowScoringInfo(!showScoringInfo)}
                  >
                    <span className="flex items-center gap-1">
                      <InfoIcon size={16} className="flex-shrink-0" /> How are
                      scores calculated?
                    </span>
                    {showScoringInfo ? (
                      <ChevronUp size={16} className="flex-shrink-0" />
                    ) : (
                      <ChevronDown size={16} className="flex-shrink-0" />
                    )}
                  </Button>

                  {showScoringInfo && (
                    <div className="rounded-lg bg-secondary p-3 sm:p-4 text-sm mb-4 animate-in fade-in-50 duration-200 w-full">
                      <ul className="list-disc pl-4 sm:pl-5 space-y-1 text-xs text-muted-foreground">
                        <li>
                          <span className="font-medium flex items-center flex-wrap gap-1">
                            <Flame size={14} className="flex-shrink-0" />{" "}
                            <span>Habit consistency:</span>
                          </span>{" "}
                          Streak counts (40%)
                        </li>
                        <li>
                          <span className="font-medium flex items-center flex-wrap gap-1">
                            <PenIcon size={14} className="flex-shrink-0" />{" "}
                            <span>Content creation:</span>
                          </span>{" "}
                          Posts made (20%)
                        </li>
                        <li>
                          <span className="font-medium flex items-center flex-wrap gap-1">
                            <Heart size={14} className="flex-shrink-0" />{" "}
                            <span>Content quality:</span>
                          </span>{" "}
                          Likes received (20%)
                        </li>
                        <li>
                          <span className="font-medium flex items-center flex-wrap gap-1">
                            <MessageSquare
                              size={14}
                              className="flex-shrink-0"
                            />{" "}
                            <span>Engagement:</span>
                          </span>{" "}
                          Comments made (10%)
                        </li>
                        <li>
                          <span className="font-medium flex items-center flex-wrap gap-1">
                            <Star size={14} className="flex-shrink-0" />{" "}
                            <span>Platform points:</span>
                          </span>{" "}
                          Achievements & levels (10%)
                        </li>
                      </ul>
                    </div>
                  )}

                  <div className="w-full space-y-2">
                    {leaderboardData.map((entry, index) => (
                      <LeaderboardItem
                        key={entry.id}
                        entry={entry}
                        position={index + 1}
                        isCurrentUser={entry.id === currentUserId}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground w-full">
                  <p>No leaderboard data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
