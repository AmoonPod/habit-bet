"use client";
import React from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { ArrowRight, Coins, Target, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { Squares } from "@/components/ui/squares-background";

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  onCtaClick?: () => void;
}

export function HeroSection({
  title = "Earn Your Success. Stake Your Habits.",
  subtitle = "The world's first honor-system habit tracker. Earn your success, one habit at a time. Start for free and only pay when you break your streak. Real change starts with you.",
  ctaText = "Earn Your First Success",
  onCtaClick,
}: HeroSectionProps) {
  const router = useRouter();

  const handleCtaClick = () => {
    router.push("/dashboard");
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background">
      <Squares
        direction="diagonal"
        speed={0.2}
        squareSize={40}
        className="absolute inset-0"
      />

      <div className="container px-4 mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center rounded-full border px-4 py-1 text-sm bg-background/50 backdrop-blur-sm"
          >
            <span className="text-green-500">100% Free to Start</span>
            <div className="mx-2 h-4 w-[1px] bg-border" />
            <span className="text-muted-foreground">
              No Credit Card Required
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-5xl sm:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            {subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button
              size="lg"
              onClick={onCtaClick || handleCtaClick}
              className="text-sm sm:text-lg group px-4 sm:px-6 group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {ctaText}
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-sm sm:text-lg group px-4 sm:px-6 group"
              onClick={() =>
                document
                  .getElementById("how-it-works")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              See How It Works
            </Button>
          </motion.div>

          {/*  <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="grid grid-cols-3 gap-8 pt-8 border-t"
          >
            {[
              { label: "Success Rate", value: "92%", icon: Target },
              { label: "Honor System", value: "100%", icon: ShieldCheck },
              { label: "Avg. Savings", value: "$240", icon: Coins },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
                className="space-y-2"
              >
                <stat.icon className="w-5 h-5 text-primary mx-auto" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>*/}
        </motion.div>
      </div>
    </div>
  );
}
