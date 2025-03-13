"use client";
import { Logo } from "@/components/ui/logo";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Calendar,
  Settings,
  ChevronUp,
  LogOut,
  HelpCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const menuItems = [
  { icon: LayoutDashboard, label: "Habits", href: "/dashboard" },
  { icon: Calendar, label: "Calendar", href: "/dashboard/calendar" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  { icon: HelpCircle, label: "Help", href: "/help" },
];

export function AppSidebar() {
  const sidebarProvider = useSidebar();
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="flex justify-center text-center">
          <Logo hideText={!sidebarProvider.open} />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild>
                    <a href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="w-full justify-between">
                    <div
                      className={cn(
                        "flex items-center gap-2",
                        !sidebarProvider.open && "w-full justify-center"
                      )}
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                        <AvatarFallback>
                          {user?.user_metadata?.full_name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      {sidebarProvider.open && (
                        <span className="truncate">
                          {user?.user_metadata?.full_name || "User"}
                        </span>
                      )}
                    </div>
                    {sidebarProvider.open && (
                      <ChevronUp className="ml-auto h-4 w-4" />
                    )}
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <DropdownMenuItem>
                    <span>Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Billing</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-500 hover:text-red-600"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
