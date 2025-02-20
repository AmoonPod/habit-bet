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
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewHabitDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Habit Bet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Habit Bet</DialogTitle>
          <DialogDescription>
            Set up a new habit and put your money where your motivation is.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="habit">Habit Name</Label>
            <Input id="habit" placeholder="e.g., Go to the gym" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="3x-week">3x per week</SelectItem>
                <SelectItem value="5x-week">5x per week</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="stake">Stake Amount ($)</Label>
            <Input id="stake" type="number" placeholder="10" min="1" step="1" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="duration">Duration (weeks)</Label>
            <Input
              id="duration"
              type="number"
              placeholder="4"
              min="1"
              max="52"
              step="1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Start Habit Bet</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
