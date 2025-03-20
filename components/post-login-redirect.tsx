"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelectedPlan } from "@/hooks/use-selected-plan";
import { useSession } from "@/hooks/use-session";

export function PostLoginRedirect() {
  const { selectedProductId, clearSelectedPlan, isReady } = useSelectedPlan();
  const { session, user, isLoading } = useSession();
  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  // Add debug logs
  const addDebugInfo = (message: string) => {
    console.log(`[PostLoginRedirect] ${message}`);
    setDebugInfo((prev) => [...prev, message]);
  };

  // Add a fallback timer to ensure we don't get stuck
  useEffect(() => {
    // If we're on the post-login-redirect page, add a fallback timer
    if (
      typeof window !== "undefined" &&
      window.location.pathname.includes("post-login-redirect")
    ) {
      addDebugInfo("Detected we're on the post-login-redirect page");

      // Safety fallback - if we haven't redirected in 10 seconds, force a redirect to dashboard
      const fallbackTimer = setTimeout(() => {
        addDebugInfo(
          "Fallback timer triggered - forcing redirect to dashboard"
        );
        window.location.href = "/dashboard";
      }, 10000);

      return () => clearTimeout(fallbackTimer);
    }
  }, []);

  useEffect(() => {
    // Only proceed if we're not already loading, we haven't checked already, the context is ready, and we're not already redirecting
    if (isLoading) {
      addDebugInfo("Session is still loading, waiting...");
      return;
    }

    if (!isReady) {
      addDebugInfo("Selected plan context is not ready yet, waiting...");
      return;
    }

    if (hasChecked) {
      addDebugInfo("Already checked for redirect, doing nothing");
      return;
    }

    if (isRedirecting) {
      addDebugInfo("Already redirecting, doing nothing");
      return;
    }

    // Mark as checked to prevent multiple redirects
    setHasChecked(true);
    addDebugInfo("Marked as checked, proceeding with redirect check");

    if (!session) {
      addDebugInfo("No session found, user is not logged in");
      // User is not logged in, do nothing
      return;
    }

    addDebugInfo(`User is logged in (${user?.email})`);

    // User is logged in
    if (selectedProductId) {
      // User had previously selected a plan before login, redirect to checkout
      addDebugInfo(
        `Found selected product ID: ${selectedProductId}, preparing checkout redirect`
      );

      // Set redirecting flag to prevent any further redirects
      setIsRedirecting(true);

      // Store the productId before clearing it to ensure we have it for redirect
      const productIdToUse = selectedProductId;
      addDebugInfo(`Stored product ID for use: ${productIdToUse}`);

      // Clear the selected plan so we don't loop
      clearSelectedPlan();
      addDebugInfo("Cleared selected plan from context");

      // Use a timeout to ensure state is properly updated before navigation
      addDebugInfo("Setting timeout for redirect to checkout");
      setTimeout(() => {
        // Direct redirect to the polar checkout API
        addDebugInfo(
          `Executing redirect to checkout with productId: ${productIdToUse}`
        );
        window.location.href = `/api/polar/checkout?productId=${productIdToUse}`;
      }, 100);
    } else {
      // No selected plan, just redirect to dashboard
      addDebugInfo("No selected product ID found, will redirect to dashboard");

      if (window.location.pathname.includes("post-login-redirect")) {
        addDebugInfo(
          "On redirect page but no product ID - redirecting to dashboard"
        );
        setTimeout(() => {
          router.push("/dashboard");
        }, 0);
      } else {
        addDebugInfo("Not on redirect page, no action needed");
      }
    }
  }, [
    session,
    isLoading,
    selectedProductId,
    user,
    router,
    clearSelectedPlan,
    hasChecked,
    isReady,
    isRedirecting,
  ]);

  // This component doesn't render anything visible
  return null;
}
