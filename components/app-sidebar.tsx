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
  Settings,
  ChevronUp,
  LogOut,
  HelpCircle,
  Trophy,
  Target,
  Users,
  BarChart3,
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
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const menuItems = [
  { icon: LayoutDashboard, label: "Habits", href: "/dashboard" },
  { icon: Users, label: "Community", href: "/dashboard/community" },
  { icon: BarChart3, label: "Insights", href: "/dashboard/insights" },
];

export function AppSidebar() {
  const sidebarProvider = useSidebar();
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile on mount and on resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Set initial value
    checkIfMobile();

    // Add event listener for resize
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Set sidebar state based on device
  useEffect(() => {
    if (isMobile) {
      sidebarProvider.setOpen(false);
    }
  }, [isMobile, sidebarProvider]);

  // Auto-close sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile) {
      sidebarProvider.setOpen(false);
    }
  }, [pathname, isMobile, sidebarProvider]);

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
      <Sidebar
        collapsible="icon"
        className="border-r z-40 touch-manipulation relative shrink-0"
      >
        <SidebarHeader className="flex justify-center text-center">
          <Logo hideText={!sidebarProvider.open} />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href} prefetch>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
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
                  <DropdownMenuItem asChild>
                    <a href="/dashboard/settings">Settings</a>
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
      {/* Mobile overlay to close sidebar when clicked outside */}
      {sidebarProvider.open && isMobile && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => sidebarProvider.setOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
