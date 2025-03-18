"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CompletionTrendChart from "@/components/dashboard/CompletionTrendChart";
import TrendPeriodSelector from "@/components/dashboard/TrendPeriodSelector";
import { subDays, subMonths, subYears, isAfter, parseISO } from "date-fns";

type CompletionData = {
  date: string;
  total: number;
  completed: number;
};

type TimeframeOption = "7days" | "30days" | "3months" | "6months" | "1year";

interface CompletionTrendSectionProps {
  trendData: CompletionData[];
}

export default function CompletionTrendSection({
  trendData,
}: CompletionTrendSectionProps) {
  const [timeframe, setTimeframe] = useState<TimeframeOption>("30days");

  // Filter data based on selected timeframe
  const filterDataByTimeframe = (
    data: CompletionData[],
    selectedTimeframe: TimeframeOption
  ) => {
    const now = new Date();
    let cutoffDate: Date;

    switch (selectedTimeframe) {
      case "7days":
        cutoffDate = subDays(now, 7);
        break;
      case "30days":
        cutoffDate = subDays(now, 30);
        break;
      case "3months":
        cutoffDate = subMonths(now, 3);
        break;
      case "6months":
        cutoffDate = subMonths(now, 6);
        break;
      case "1year":
        cutoffDate = subYears(now, 1);
        break;
      default:
        cutoffDate = subDays(now, 30);
    }

    return data.filter((item) => isAfter(parseISO(item.date), cutoffDate));
  };

  const filteredData = filterDataByTimeframe(trendData, timeframe);

  // Get timeframe description for the card
  const getTimeframeDescription = () => {
    switch (timeframe) {
      case "7days":
        return "last 7 days";
      case "30days":
        return "last 30 days";
      case "3months":
        return "last 3 months";
      case "6months":
        return "last 6 months";
      case "1year":
        return "last year";
      default:
        return "last 30 days";
    }
  };

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row justify-between items-start space-y-0 pb-2">
        <div>
          <CardTitle>Completion Trend</CardTitle>
          <CardDescription>
            Your habit completion trend over the {getTimeframeDescription()}
          </CardDescription>
        </div>
        <TrendPeriodSelector
          value={timeframe}
          onValueChange={(value) => setTimeframe(value as TimeframeOption)}
        />
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <CompletionTrendChart data={filteredData} timeframe={timeframe} />
        </div>
      </CardContent>
    </Card>
  );
}
