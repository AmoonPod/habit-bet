"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO, subDays, isAfter } from "date-fns";
import { useState, useEffect } from "react";

interface CompletionTrendProps {
  data: {
    date: string;
    total: number;
    completed: number;
  }[];
  timeframe?: "7days" | "30days" | "3months" | "6months" | "1year";
}

export default function CompletionTrendChart({
  data,
  timeframe = "30days",
}: CompletionTrendProps) {
  const [filteredData, setFilteredData] = useState(data);

  // Filter data based on selected timeframe
  useEffect(() => {
    const now = new Date();
    let cutoffDate = now;

    switch (timeframe) {
      case "7days":
        cutoffDate = subDays(now, 7);
        break;
      case "30days":
        cutoffDate = subDays(now, 30);
        break;
      case "3months":
        cutoffDate = subDays(now, 90);
        break;
      case "6months":
        cutoffDate = subDays(now, 180);
        break;
      case "1year":
        cutoffDate = subDays(now, 365);
        break;
      default:
        cutoffDate = subDays(now, 30);
    }

    const filtered = data.filter((item) => {
      const itemDate = parseISO(item.date);
      return (
        isAfter(itemDate, cutoffDate) ||
        itemDate.toDateString() === cutoffDate.toDateString()
      );
    });

    setFilteredData(filtered);
  }, [data, timeframe]);

  // Determine appropriate tickCount based on timeframe
  const getTickCount = () => {
    switch (timeframe) {
      case "7days":
        return 7;
      case "30days":
        return 7;
      case "3months":
        return 6;
      case "6months":
        return 6;
      case "1year":
        return 12;
      default:
        return 7;
    }
  };

  // Format date for x-axis based on timeframe
  const formatXAxisDate = (date: string) => {
    const parsedDate = parseISO(date);

    switch (timeframe) {
      case "7days":
        return format(parsedDate, "EEE");
      case "30days":
        return format(parsedDate, "MMM d");
      case "3months":
      case "6months":
      case "1year":
        return format(parsedDate, "MMM");
      default:
        return format(parsedDate, "MMM d");
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={filteredData}>
        <defs>
          <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatXAxisDate}
          tickCount={getTickCount()}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const date = parseISO(payload[0].payload.date);
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Date
                      </span>
                      <span className="font-bold text-sm">
                        {format(date, "MMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Completed
                      </span>
                      <span className="font-bold text-sm">
                        {payload[0].payload.completed} /{" "}
                        {payload[0].payload.total}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Area
          type="monotone"
          dataKey="completed"
          stroke="#0ea5e9"
          fillOpacity={1}
          fill="url(#colorCompleted)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
