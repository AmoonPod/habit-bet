"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { MouseEvent } from "react";

interface StatusBadgeProps {
  status: "active" | "failed" | "completed";
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const handleClick = (e: MouseEvent) => {
    // Prevent click from propagating to parent Link
    e.preventDefault();
    e.stopPropagation();
  };

  if (status === "active") {
    return (
      <div onClick={handleClick}>
        <Badge variant="default" className="bg-green-500/10 text-green-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </Badge>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div onClick={handleClick}>
        <Badge
          variant="outline"
          className="bg-red-500/10 text-red-600 border-red-200"
        >
          <XCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      </div>
    );
  }

  return (
    <div onClick={handleClick}>
      <Badge variant="default" className="bg-blue-500/10 text-blue-600">
        <CheckCircle className="h-3 w-3 mr-1" />
        Completed
      </Badge>
    </div>
  );
}
