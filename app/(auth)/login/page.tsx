"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { getOAuthURL } from "./action";

// Create the server action

function LoginButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      // Call the server action to get the OAuth URL
      const result = await getOAuthURL();

      if (result.success && result.url) {
        // Use window.location for the redirect
        window.location.href = result.url;
      } else {
        console.error("Failed to get OAuth URL:", result.error);
        // Navigate to error page if URL is not available
        window.location.href = "/auth/auth-code-error";
      }
    } catch (error) {
      console.error("Error during sign in:", error);
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleSignIn} disabled={isLoading}>
      {isLoading ? "Redirecting..." : "Login with Google"}
    </Button>
  );
}

// Main login page component
export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">HabitBet</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to continue to your account
          </p>
        </div>
        <div className="mt-8 flex justify-center">
          <LoginButton />
        </div>
      </div>
    </div>
  );
}
