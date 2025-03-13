"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Filter, SortAsc, ChevronDown } from "lucide-react";

interface DashboardFiltersProps {
  currentFilter: string;
  currentSort: string;
}

export default function DashboardFilters({
  currentFilter,
  currentSort,
}: DashboardFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  const updateSearchParams = (name: string, value: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set(name, value);
    router.push(`${pathname}?${params.toString()}`);
  };

  // Get display text for current filter
  const getFilterText = (filter: string) => {
    switch (filter) {
      case "all":
        return "All Habits";
      case "active":
        return "Active";
      case "completed":
        return "Completed";
      default:
        return "All Habits";
    }
  };

  // Get display text for current sort
  const getSortText = (sort: string) => {
    switch (sort) {
      case "recent":
        return "Most Recent";
      case "alphabetical":
        return "Alphabetical";
      default:
        return "Most Recent";
    }
  };

  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>{getFilterText(currentFilter)}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Filter Habits</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => updateSearchParams("filter", "all")}
            className={currentFilter === "all" ? "bg-muted" : ""}
          >
            All Habits
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => updateSearchParams("filter", "active")}
            className={currentFilter === "active" ? "bg-muted" : ""}
          >
            Active
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => updateSearchParams("filter", "completed")}
            className={currentFilter === "completed" ? "bg-muted" : ""}
          >
            Completed
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <SortAsc className="h-4 w-4" />
            <span>{getSortText(currentSort)}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Sort By</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => updateSearchParams("sort", "recent")}
            className={currentSort === "recent" ? "bg-muted" : ""}
          >
            Most Recent
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => updateSearchParams("sort", "alphabetical")}
            className={currentSort === "alphabetical" ? "bg-muted" : ""}
          >
            Alphabetical
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
