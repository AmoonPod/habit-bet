"use client";

import { cn } from "@/lib/utils";
import { AnimatedList } from "../magicui/animated-list";

interface HabitStakeItem {
    name: string;
    description: string;
    icon: string;
    color: string;
    time: string;
}

// Example HabitStake notifications (replace with your actual data)
let habitStakeNotifications: HabitStakeItem[] = [
    {
        name: "New Habit Created",
        description: "You started a new habit: Exercise 3x/week",
        time: "2 hours ago",
        icon: "💪",
        color: "#22C55E", // Green
    },
    {
        name: "Stake Placed",
        description: "You staked $50 on your writing habit.",
        time: "1 day ago",
        icon: "💰",
        color: "#F59E0B", // Yellow/Orange
    },
    {
        name: "Success!",
        description: "You completed your meditation habit today!",
        time: "5 minutes ago",
        icon: "✅",
        color: "#3B82F6", // Blue
    },
    {
        name: "Streak Started",
        description: "You're on a 3-day streak for your reading habit!",
        time: "1 hour ago",
        icon: "🔥",
        color: "#EAB308", // Yellow
    },
    {
        name: "Uh Oh!",
        description: "You missed your goal for your coding habit.",
        time: "30 minutes ago",
        icon: "❌",
        color: "#EF4444", // Red
    },
    {
        name: "Payment Processed",
        description: "Your stake of $25 has been charged for failing habit.",
        time: "1 day ago",
        icon: "💸",
        color: "#00C9A7", // Green
    },
];

habitStakeNotifications = Array.from({ length: 5 }, () => habitStakeNotifications).flat();

const HabitStakeNotification = ({
    name,
    description,
    icon,
    color,
    time,
}: HabitStakeItem) => {
    return (
        <figure
            className={cn(
                "relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-2xl p-4",
                // animation styles
                "transition-all duration-200 ease-in-out hover:scale-[103%]",
                // light styles
                "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
                // dark styles
                "transform-gpu dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
            )}
        >
            <div className="flex flex-row items-center gap-3">
                <div
                    className="flex size-10 items-center justify-center rounded-2xl"
                    style={{
                        backgroundColor: color,
                    }}
                >
                    <span className="text-lg">{icon}</span>
                </div>
                <div className="flex flex-col overflow-hidden">
                    <figcaption className="flex flex-row items-center whitespace-pre text-lg font-medium dark:text-white ">
                        <span className="text-sm sm:text-lg">{name}</span>
                        <span className="mx-1">·</span>
                        <span className="text-xs text-gray-500">{time}</span>
                    </figcaption>
                    <p className="text-sm font-normal dark:text-white/60">
                        {description}
                    </p>
                </div>
            </div>
        </figure>
    );
};

export function HabitStakeAnimatedList({
    className,
}: {
    className?: string;
}) {
    return (
        <div
            className={cn(

                "absolute flex h-[500px] w-full flex-col overflow-hidden p-2  z-[99999] top-1 left-1 right-1 bottom-4 pointer-events-none",
                className,
            )}
        >
            <AnimatedList>
                {habitStakeNotifications.map((item, idx) => (
                    <HabitStakeNotification {...item} key={idx} />
                ))}
            </AnimatedList>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background"></div>
        </div >
    );
}
