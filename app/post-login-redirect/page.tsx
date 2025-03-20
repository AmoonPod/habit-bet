"use client";

import { PostLoginRedirect } from "@/components/post-login-redirect";
import { useEffect, useState } from "react";

export default function PostLoginRedirectPage() {
  const [message, setMessage] = useState("Redirecting you to checkout...");

  // Update message after a timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessage(
        "If you're not redirected automatically, please wait a moment..."
      );
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      {/* This component will handle redirects after login */}
      <PostLoginRedirect />

      <div className="text-center p-8 max-w-md">
        <div className="mb-6 relative">
          <div className="w-12 h-12 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin mx-auto"></div>
        </div>
        <h1 className="text-2xl font-bold mb-4">Processing Your Request</h1>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
