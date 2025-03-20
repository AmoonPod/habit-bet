"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  CalendarCheck,
  Wallet,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Squares } from "@/components/ui/squares-background";
import { ConfettiExplosion } from "@/components/ui/confetti-explosion";
import { useSearchParams } from "next/navigation";

const REDIRECT_COUNTDOWN_SECONDS = 20;

export default function ConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutId = searchParams.get("checkoutId") || "";

  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_COUNTDOWN_SECONDS);
  const [showConfetti, setShowConfetti] = useState(true);

  // Set up the redirect timer
  useEffect(() => {
    // Navigate to dashboard when timer reaches 0
    if (secondsLeft === 0) {
      router.push("/dashboard");
      return;
    }

    // Decrease the timer by 1 second
    const timer = setTimeout(() => {
      setSecondsLeft(secondsLeft - 1);
    }, 1000);

    // Clean up the timer
    return () => clearTimeout(timer);
  }, [secondsLeft, router]);

  // Hide confetti after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Calculate circle progress for the timer
  const circleSize = 36;
  const circleStrokeWidth = 3;
  const radius = circleSize / 2 - circleStrokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference * (1 - secondsLeft / REDIRECT_COUNTDOWN_SECONDS);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Confetti effect - rendered only once due to key */}
      {showConfetti && (
        <ConfettiExplosion
          key="confetti-explosion"
          duration={5000}
          particleCount={150}
        />
      )}

      {/* Background pattern */}
      <Squares
        direction="diagonal"
        speed={0.2}
        squareSize={40}
        className="absolute inset-0 opacity-20"
      />

      <div className="container px-4 mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md mx-auto"
        >
          <Card className="p-8 shadow-lg border-2 border-green-100 dark:border-green-900/30 bg-white dark:bg-slate-950">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: 0.1,
              }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-primary mb-6 mx-auto flex items-center justify-center"
            >
              <CheckCircle2 className="h-10 w-10 text-white" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <div className="flex justify-center w-full mb-4">
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 flex items-center justify-center">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Payment Successful
                </Badge>
              </div>

              <h1 className="text-2xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                You're All Set!
              </h1>

              <p className="text-center text-muted-foreground mb-6">
                Your payment has been processed successfully. Time to focus on
                building your habits!
              </p>
            </motion.div>

            {/* Benefit highlights */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-6 space-y-3"
            >
              <div className="flex items-start">
                <div className="bg-primary/10 rounded-full p-1.5 mr-3 mt-0.5">
                  <CalendarCheck className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">
                    Premium Access Unlocked
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Enjoy all premium features for your habit tracking journey
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-primary/10 rounded-full p-1.5 mr-3 mt-0.5">
                  <Wallet className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">
                    {checkoutId
                      ? `Confirmation #${checkoutId}`
                      : "Payment Confirmed"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    A receipt has been sent to your email
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col items-center"
            >
              <Button
                onClick={() => router.push("/dashboard")}
                size="lg"
                className="w-full mb-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 group"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>

              <div className="flex items-center text-sm text-muted-foreground">
                <div className="relative inline-flex mr-2">
                  <svg
                    width={circleSize}
                    height={circleSize}
                    className="transform -rotate-90"
                  >
                    <circle
                      cx={circleSize / 2}
                      cy={circleSize / 2}
                      r={radius}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={circleStrokeWidth}
                      strokeDasharray={circumference}
                      strokeDashoffset={0}
                      className="text-muted-foreground/20"
                    />
                    <circle
                      cx={circleSize / 2}
                      cy={circleSize / 2}
                      r={radius}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={circleStrokeWidth}
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      className="text-primary transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                    {secondsLeft}
                  </span>
                </div>
                Redirecting to dashboard automatically
              </div>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
