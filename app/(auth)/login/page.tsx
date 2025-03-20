"use client";
import { getOAuthURL } from "./action";
import { PostLoginRedirect } from "@/components/post-login-redirect";
import { GoogleLoginButton } from "@/components/ui/google-login-button";
import { HabitBetLogo } from "@/components/ui/habit-bet-logo";
import { AuthBackground } from "@/components/ui/auth-background";
import { LoginFeatures } from "@/components/ui/login-features";
import Link from "next/link";
import { useSelectedPlan } from "@/hooks/use-selected-plan";
import { useEffect, useState } from "react";

// Main login page component
export default function LoginPage() {
  const { selectedProductId, isReady } = useSelectedPlan();
  const [isLoading, setIsLoading] = useState(false);

  // Determine the proper redirect target based on whether a plan is selected
  const getRedirectTarget = () => {
    if (selectedProductId) {
      console.log("Plan selected, will redirect to checkout after login");
      // We want to redirect to PostLoginRedirect which will handle the checkout flow
      return "/post-login-redirect";
    } else {
      console.log("No plan selected, will redirect to dashboard after login");
      // Just go to dashboard
      return "/dashboard";
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);

    // Wait for the context to be ready
    if (!isReady) {
      console.log("Context not ready yet, waiting...");
      setTimeout(handleSignIn, 100);
      return;
    }

    try {
      // Get the redirect target based on whether a plan is selected
      const redirectTarget = getRedirectTarget();

      // Call the server action to get the OAuth URL with the proper redirect
      const result = await getOAuthURL(redirectTarget);

      if (result.success && result.url) {
        // Log for debugging
        console.log(`Redirecting to OAuth with target: ${redirectTarget}`);
        // Use window.location for the redirect
        window.location.href = result.url;
      } else {
        console.error("Failed to get OAuth URL:", result.error);
        // Navigate to error page if URL is not available
        window.location.href = "/auth/auth-code-error";
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* This component will handle redirects after login */}
      <PostLoginRedirect />

      {/* Background effects */}
      <AuthBackground />

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left column - Logo and login */}
        <div className="flex-1 flex flex-col items-center justify-center px-5 py-12">
          <div className="w-full max-w-md space-y-10">
            <div className="space-y-6 text-center">
              <HabitBetLogo size="lg" variant="auth" />

              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  Welcome to HabitBet
                </h1>
                <p className="text-muted-foreground">
                  Sign in to continue building better habits
                </p>
              </div>
            </div>

            {/* Login button */}
            <div className="space-y-6">
              <GoogleLoginButton onClick={handleSignIn} isLoading={isLoading} />

              <div className="text-center text-sm text-muted-foreground">
                <p>By continuing, you agree to our</p>
                <div className="flex justify-center space-x-2">
                  <Link href="/terms" className="underline hover:text-primary">
                    Terms of Service
                  </Link>
                  <span>and</span>
                  <Link
                    href="/privacy"
                    className="underline hover:text-primary"
                  >
                    Privacy Policy
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Features (only visible on larger screens) */}
        <div className="hidden lg:flex flex-1 bg-muted/30 border-l">
          <div className="w-full max-w-lg mx-auto flex items-center p-12">
            <LoginFeatures />
          </div>
        </div>
      </div>
    </>
  );
}
