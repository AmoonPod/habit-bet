"use client";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { Logo } from "../ui/logo";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-session";

export function Navbar() {
  const router = useRouter();
  const { session } = useSession();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLoginClick = () => {
    if (session) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  return (
    <nav className=" sticky top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Logo />

        <div className="hidden md:flex items-center space-x-6">
          <Button
            variant="ghost"
            className="text-sm"
            onClick={() => scrollToSection("how-it-works")}
          >
            How it Works
          </Button>
          <Button
            variant="ghost"
            className="text-sm"
            onClick={() => scrollToSection("testimonials")}
          >
            Success Stories
          </Button>
          <Button
            variant="ghost"
            className="text-sm"
            onClick={() => scrollToSection("faq")}
          >
            FAQ
          </Button>
          <Button
            variant="default"
            className="text-sm"
            onClick={handleLoginClick}
          >
            <LogIn className="mr-2 h-4 w-4" />
            {session ? "Dashboard" : "Start Free"}
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={handleLoginClick}
        >
          <LogIn className="h-5 w-5" />
        </Button>
      </div>
    </nav>
  );
}
