"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NewHabitDialog from "./NewHabitDialog";

export default function NewHabitButton() {
  const [isHovered, setIsHovered] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile devices
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check on initial load
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isMobile ? (
          // Mobile version - Floating Action Button (FAB)
          <motion.div
            className="fixed bottom-6 right-6 z-50"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="relative">
              {/* Pulsating ring animation */}
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/20"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 0.3, 0.7],
                }}
                transition={{
                  duration: 2,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "loop",
                }}
              />
              <Button
                onClick={() => setIsDialogOpen(true)}
                size="icon"
                className="h-14 w-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg relative z-10"
                aria-label="New Habit"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          </motion.div>
        ) : (
          // Desktop version - with animation
          <Button
            onClick={() => setIsDialogOpen(true)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative overflow-hidden group bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
          >
            <Plus className="h-4 w-4" />
            <motion.span
              initial={{ width: 0, opacity: 0, marginLeft: 0 }}
              animate={{
                width: isHovered ? "auto" : 0,
                opacity: isHovered ? 1 : 0,
                marginLeft: isHovered ? 8 : 0,
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="whitespace-nowrap"
            >
              New Habit
            </motion.span>
          </Button>
        )}
      </AnimatePresence>
      <NewHabitDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}
