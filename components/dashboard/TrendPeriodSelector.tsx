"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type TimeframeOption =
  | "7days"
  | "30days"
  | "3months"
  | "6months"
  | "1year";

interface TrendPeriodSelectorProps {
  value: TimeframeOption;
  onValueChange: (value: TimeframeOption) => void;
}

export default function TrendPeriodSelector({
  value,
  onValueChange,
}: TrendPeriodSelectorProps) {
  return (
    <Select
      value={value}
      onValueChange={(val) => onValueChange(val as TimeframeOption)}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select timeframe" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Time Period</SelectLabel>
          <SelectItem value="7days">Last 7 days</SelectItem>
          <SelectItem value="30days">Last 30 days</SelectItem>
          <SelectItem value="3months">Last 3 months</SelectItem>
          <SelectItem value="6months">Last 6 months</SelectItem>
          <SelectItem value="1year">Last year</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
