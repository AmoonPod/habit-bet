"use client";

import { useState } from "react";
import { Tables } from "@/supabase/models/database.types";
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
import { IconPicker } from "@/components/ui/icon-picker";
import { ColorPicker } from "@/components/ui/color-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Info, Pencil } from "lucide-react";
import { editHabit } from "@/app/dashboard/[slug]/actions";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { IconName } from "@/components/ui/icon-picker";
import { Icon } from "@/components/ui/icon";

interface EditHabitDialogProps {
  habit: Tables<"habits">;
  hasCheckins: boolean;
}

export default function EditHabitDialog({
  habit,
  hasCheckins,
}: EditHabitDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(habit.name || "");
  const [selectedIcon, setSelectedIcon] = useState<IconName | null>(
    (habit.icon as IconName) || null
  );
  const [selectedColor, setSelectedColor] = useState(habit.color || "#4F46E5");
  const [verificationType, setVerificationType] = useState(
    habit.verification_type || "honor"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "The habit name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await editHabit({
        habit_uuid: habit.uuid!,
        name,
        icon: selectedIcon || undefined,
        color: selectedColor,
        verification_type: verificationType,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Habit updated successfully",
        });
        setOpen(false);
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.message || "Unable to update habit",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating habit:", error);
      toast({
        title: "Error",
        description: "Unable to update habit. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine which verification types are allowed
  const getVerificationTypeOptions = () => {
    if (!hasCheckins) {
      // If no check-ins, all options are available
      return [
        { value: "honor", label: "Honor System" },
        { value: "text", label: "Text Description" },
        { value: "photo", label: "Photo Proof" },
      ];
    }

    // If has check-ins, only allow same or stricter verification types
    const currentType = habit.verification_type || "honor";
    const options = [];

    // Always include current type
    if (currentType === "honor") {
      options.push({ value: "honor", label: "Honor System" });
      options.push({ value: "text", label: "Text Description" });
      options.push({ value: "photo", label: "Photo Proof" });
    } else if (currentType === "text") {
      options.push({ value: "text", label: "Text Description" });
      options.push({ value: "photo", label: "Photo Proof" });
    } else if (currentType === "photo") {
      options.push({ value: "photo", label: "Photo Proof" });
    }

    return options;
  };

  const verificationOptions = getVerificationTypeOptions();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit Habit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Habit</DialogTitle>
          <DialogDescription>
            Make changes to your habit. You can only make verification stricter
            if you already have check-ins.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Habit Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Go to the gym"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Icon</Label>
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

            <div className="space-y-2">
              <Label>Color</Label>
              <ColorPicker
                className="h-10 w-full"
                value={selectedColor}
                onChange={setSelectedColor}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Verification Method</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>
                      {hasCheckins
                        ? "You can only make verification stricter once you have check-ins."
                        : "Choose how you want to verify habit completion:"}
                    </p>
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                      <li>
                        <strong>Honor System</strong>: Simply confirm you did it
                      </li>
                      <li>
                        <strong>Text Description</strong>: Describe how you
                        completed it
                      </li>
                      <li>
                        <strong>Photo Proof</strong>: Upload a photo as evidence
                      </li>
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <RadioGroup
              value={verificationType}
              onValueChange={setVerificationType}
              className="space-y-3"
            >
              {verificationOptions.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-2 border p-3 rounded-md"
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="font-medium">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
