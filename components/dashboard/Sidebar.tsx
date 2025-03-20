import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import {
  Menu,
  LogOut,
  LayoutDashboard,
  TrendingUp,
  Calendar,
  ChevronRight,
} from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed: boolean;
  onCollapsedChange: (isCollapsed: boolean) => void;
}

export function Sidebar({
  className,
  isCollapsed,
  onCollapsedChange,
}: SidebarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: "Overview", href: "#" },
    { icon: TrendingUp, label: "Progress", href: "#" },
    { icon: Calendar, label: "Calendar", href: "#" },
  ];

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed left-4 top-4 z-40"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <div className="h-full bg-card">
            <div className="p-4 h-14 border-b flex items-center">
              <span className="font-semibold">HabitBet</span>
            </div>
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col fixed top-0 left-0 z-20 h-full bg-card border-r transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          className
        )}
      >
        <div className="h-14 border-b flex items-center justify-between px-4">
          {!isCollapsed && <span className="font-semibold">HabitBet</span>}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onCollapsedChange(!isCollapsed)}
          >
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform",
                !isCollapsed && "rotate-180"
              )}
            />
          </Button>
        </div>

        <div className="flex flex-col flex-1">
          {!isCollapsed && <SidebarContent />}

          {/* Collapsed State */}
          {isCollapsed && (
            <div className="py-2">
              {menuItems.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  size="icon"
                  className="w-16 h-12"
                  title={item.label}
                >
                  <item.icon className="h-4 w-4" />
                </Button>
              ))}
              <Button
                variant="ghost"
                size="icon"
                className="w-16 h-12 text-red-500 hover:text-red-600 hover:bg-red-50"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function SidebarContent() {
  const menuItems = [
    { icon: LayoutDashboard, label: "Overview", href: "#" },
    { icon: TrendingUp, label: "Progress", href: "#" },
    { icon: Calendar, label: "Calendar", href: "#" },
  ];

  return (
    <div className="flex flex-col flex-1 p-4">
      <ScrollArea className="flex-1 -mr-4">
        <div className="space-y-2 pr-4">
          {menuItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              size="sm"
              className="w-full justify-start"
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </div>
      </ScrollArea>
      <Button
        variant="ghost"
        size="sm"
        className="mt-2 w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </div>
  );
}
