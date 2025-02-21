"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CheckInButtonProps {
  habitName: string;
  stakeAmount: number;
}

const CheckInButton: React.FC<CheckInButtonProps> = ({
  habitName,
  stakeAmount,
}) => {
  const [showCheckInSuccess, setShowCheckInSuccess] = useState(false);

  const handleCheckIn = () => {
    // Simulate check-in success
    setShowCheckInSuccess(true);
    setTimeout(() => {
      setShowCheckInSuccess(false);
    }, 3000); // Hide after 3 seconds
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
          >
            <Check className="mr-2 h-5 w-5" />
            Check In
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check In</DialogTitle>
            <DialogDescription>
              Confirm your check-in for today.
            </DialogDescription>
          </DialogHeader>
          <Button
            className="w-full bg-gradient-to-r from-green-500 to-green-600"
            onClick={handleCheckIn}
          >
            Confirm Check-in for {habitName}
          </Button>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {showCheckInSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-0 flex items-center justify-center bg-green-500/95 text-white rounded-md"
          >
            <div className="text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Great job!</h3>
              <p>Keep up the momentum!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CheckInButton;
