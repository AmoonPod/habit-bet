"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useSession } from "@/hooks/use-session";
import { fetchUserSubscription } from "@/app/actions/subscription";
import {
  SubscriptionTier,
  Subscription,
  SUBSCRIPTION_TIERS,
  getSubscriptionTierDetails,
} from "@/lib/subscription";

// Re-export types from lib/subscription for convenience
export type { SubscriptionTier, Subscription };
export { getSubscriptionTierDetails };

interface SubscriptionContextType {
  subscription: Subscription | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  hasFeature: (featureKey: string) => boolean;
  canCreateHabit: (currentCount: number) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: null,
  isLoading: true,
  error: null,
  refresh: async () => {},
  hasFeature: () => false,
  canCreateHabit: () => false,
});

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { session, user } = useSession();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to fetch subscription from server action
  const fetchSubscription = async () => {
    // Skip if no user is logged in
    if (!session) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use the server action instead of API route
      const result = await fetchUserSubscription();
      console.log("result", result);
      if (result.success && result.subscription) {
        setSubscription(result.subscription);
      } else if (result.error) {
        throw new Error(result.error);
      } else {
        // Default to free tier if something went wrong
        setSubscription({
          ...SUBSCRIPTION_TIERS.free,
          isActive: true,
        });
      }
    } catch (err) {
      console.error("Error fetching subscription:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));

      // Fallback to free tier on error
      setSubscription({
        ...SUBSCRIPTION_TIERS.free,
        isActive: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and refetch when session changes
  useEffect(() => {
    fetchSubscription();
  }, [session]);

  // Function to check if the user has a specific feature
  const hasFeature = (featureKey: string): boolean => {
    if (!subscription) return false;
    return subscription.features.includes(featureKey);
  };

  // Function to check if the user can create more habits
  const canCreateHabit = (currentCount: number): boolean => {
    if (!subscription) return false;
    return currentCount < subscription.limits.habits;
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isLoading,
        error,
        refresh: fetchSubscription,
        hasFeature,
        canCreateHabit,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}
