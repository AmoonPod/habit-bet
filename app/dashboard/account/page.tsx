"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AccountRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.push("/dashboard/settings");
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <p className="text-muted-foreground">Redirecting to settings...</p>
        </div>
    );
} 