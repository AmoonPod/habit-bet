"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Check,
  Activity,
  Brain,
  Heart,
  Book,
  Dumbbell,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Icon } from "@/components/ui/icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { IconPicker } from "@/components/ui/icon-picker";
import type { IconName } from "@/components/ui/icon-picker";
import { ColorPicker } from "@/components/ui/color-picker";

export default function NewHabitDialog() {
  const [step, setStep] = useState(1);
  const [selectedIcon, setSelectedIcon] = useState<IconName | null>(null);
  const [selectedColor, setSelectedColor] = useState("#4F46E5");
  const [habitData, setHabitData] = useState({
    name: "",
    frequency: "",
    stake: "",
    duration: "",
  });
  const [open, setOpen] = useState(false);
  const [customFrequency, setCustomFrequency] = useState({
    times: "",
    period: "week",
  });
  const [durationUnit, setDurationUnit] = useState("week");

  const isStepValid = () => {
    switch (step) {
      case 1:
        return habitData.name && selectedIcon && selectedColor;
      case 2:
        if (habitData.frequency === "custom") {
          return customFrequency.times && Number(customFrequency.times) > 0;
        }
        return habitData.frequency;
      case 3:
        return (
          habitData.stake &&
          Number(habitData.stake) >= 1 &&
          Number(habitData.stake) <= 500
        );
      case 4:
        const maxDuration = {
          day: 365,
          week: 52,
          month: 12,
        }[durationUnit];
        return (
          habitData.duration &&
          Number(habitData.duration) >= 1 &&
          Number(habitData.duration) <= maxDuration!
        );
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else {
      triggerConfetti();
      setTimeout(() => setOpen(false), 2000);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };
  const coinPath = confetti.shapeFromPath({
    path: "M16 4c-8.84 0-16 7.16-16 16s7.16 16 16 16 16-7.16 16-16-7.16-16-16-16zm0 28c-6.63 0-12-5.37-12-12s5.37-12 12-12 12 5.37 12 12-5.37 12-12 12zm2-17h-4v2h4v2h-3v2h3v2h-4v2h4c1.1 0 2-.9 2-2v-6c0-1.1-.9-2-2-2z",
  });
  const triggerConfetti = () => {
    confetti({
      particleCount: 500,
      spread: 70,
      colors: ["#00000", "#EEEEEE", "#33333"],
      shapes: [coinPath],
      origin: { y: 0.6 },
    });
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <Label htmlFor="habit">Habit Name</Label>
              <Input
                id="habit"
                placeholder="e.g., Go to the gym"
                value={habitData.name}
                onChange={(e) =>
                  setHabitData({ ...habitData, name: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <Label>Choose an icon</Label>
                <IconPicker onSelect={(icon) => setSelectedIcon(icon)}>
                  <Button variant="outline" className="w-full justify-start">
                    {selectedIcon ? (
                      <>
                        <Icon name={selectedIcon} className="mr-2 h-4 w-4" />
                      </>
                    ) : (
                      "Select an icon"
                    )}
                  </Button>
                </IconPicker>
              </div>

              <div className="space-y-4">
                <Label>Choose a color</Label>
                <ColorPicker
                  className="h-10 w-full"
                  value={selectedColor}
                  onChange={setSelectedColor}
                />
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <Label htmlFor="frequency">
                How often do you want to do this?
              </Label>
              <Select
                value={habitData.frequency}
                onValueChange={(value) =>
                  setHabitData({ ...habitData, frequency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="3x-week">3x per week</SelectItem>
                  <SelectItem value="5x-week">5x per week</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="custom">Custom Schedule</SelectItem>
                </SelectContent>
              </Select>

              {habitData.frequency === "custom" && (
                <div className="space-y-4 mt-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="times">Times</Label>
                      <Input
                        id="times"
                        type="number"
                        min="1"
                        placeholder="2"
                        value={customFrequency.times}
                        onChange={(e) =>
                          setCustomFrequency({
                            ...customFrequency,
                            times: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="period">Per</Label>
                      <Select
                        value={customFrequency.period}
                        onValueChange={(value) =>
                          setCustomFrequency({
                            ...customFrequency,
                            period: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="day">Day</SelectItem>
                          <SelectItem value="week">Week</SelectItem>
                          <SelectItem value="month">Month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <Label htmlFor="stake">How much do you want to stake?</Label>
              <Input
                id="stake"
                type="number"
                placeholder="10"
                min="1"
                max="500"
                value={habitData.stake}
                onChange={(e) =>
                  setHabitData({ ...habitData, stake: e.target.value })
                }
              />
              <p className="text-sm text-muted-foreground">
                Min: $1 - Max: $500
              </p>
              {Number(habitData.stake) > 500 && (
                <p className="text-sm text-red-500">
                  Maximum stake amount is $500
                </p>
              )}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <Label>For how long?</Label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="4"
                    min="1"
                    value={habitData.duration}
                    onChange={(e) =>
                      setHabitData({ ...habitData, duration: e.target.value })
                    }
                  />
                </div>
                <div className="flex-1">
                  <Select value={durationUnit} onValueChange={setDurationUnit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Days</SelectItem>
                      <SelectItem value="week">Weeks</SelectItem>
                      <SelectItem value="month">Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {durationUnit === "week" && "Choose between 1-52 weeks"}
                {durationUnit === "day" && "Choose between 1-365 days"}
                {durationUnit === "month" && "Choose between 1-12 months"}
              </p>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Habit Bet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Habit Bet</DialogTitle>
          <DialogDescription>
            Step {step} of 4:{" "}
            {step === 1
              ? "Basic Info"
              : step === 2
              ? "Frequency"
              : step === 3
              ? "Stake"
              : "Duration"}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
        </div>
        <DialogFooter className="flex justify-between">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          )}
          <Button onClick={handleNext} disabled={!isStepValid()}>
            {step === 4 ? (
              "Create Habit"
            ) : (
              <>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
