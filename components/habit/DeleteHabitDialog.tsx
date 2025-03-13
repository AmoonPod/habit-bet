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
import { Trash2, AlertTriangle } from "lucide-react";
import { deleteHabit } from "@/app/dashboard/[slug]/actions";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface DeleteHabitDialogProps {
  habit: Tables<"habits">;
  hasCheckins: boolean;
}

export default function DeleteHabitDialog({
  habit,
  hasCheckins,
}: DeleteHabitDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsSubmitting(true);

    try {
      const result = await deleteHabit(habit.uuid!);

      if (result.success) {
        toast({
          title: "Success",
          description: "Habit deleted successfully",
        });
        setOpen(false);
        router.push("/dashboard");
      } else {
        toast({
          title: "Error",
          description: result.message || "Unable to delete habit",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting habit:", error);
      toast({
        title: "Error",
        description: "Unable to delete habit. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-red-500 border-red-200 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Habit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Habit</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this habit?
          </DialogDescription>
        </DialogHeader>

        {hasCheckins ? (
          <div className="space-y-4">
            <div className="bg-amber-50 p-4 rounded-md">
              <h4 className="font-medium text-amber-800 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Cannot Delete
              </h4>
              <p className="text-amber-700 text-sm mt-1">
                This habit has check-ins and cannot be deleted.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              You are about to delete <strong>{habit.name}</strong>. This action
              cannot be undone.
            </p>

            {habit.stake_uuid && (
              <div className="bg-amber-50 p-4 rounded-md">
                <h4 className="font-medium text-amber-800 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Warning
                </h4>
                <p className="text-amber-700 text-sm mt-1">
                  This habit has a stake. Deleting it will cancel the stake.
                </p>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Deleting..." : "Delete Habit"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
