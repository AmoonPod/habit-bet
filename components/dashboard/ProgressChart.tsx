import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProgressChart() {
  // Mock data for the chart
  const data = [
    { day: "Mon", completed: 3, total: 4 },
    { day: "Tue", completed: 4, total: 4 },
    { day: "Wed", completed: 2, total: 4 },
    { day: "Thu", completed: 4, total: 4 },
    { day: "Fri", completed: 3, total: 4 },
    { day: "Sat", completed: 1, total: 4 },
    { day: "Sun", completed: 2, total: 4 },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-normal">Weekly Progress</CardTitle>
        <Select defaultValue="this-week">
          <SelectTrigger className="w-[120px] h-8">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this-week">This Week</SelectItem>
            <SelectItem value="last-week">Last Week</SelectItem>
            <SelectItem value="this-month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full flex items-end justify-between gap-2">
          {data.map((item) => (
            <div key={item.day} className="flex flex-col items-center gap-2">
              <div className="w-full flex-1 bg-muted rounded-sm relative">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-primary transition-all duration-300"
                  style={{
                    height: `${(item.completed / item.total) * 100}%`,
                    minHeight: "4px",
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{item.day}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
