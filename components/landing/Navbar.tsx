"use client";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { Logo } from "../ui/logo";
import { useRouter } from "next/navigation";

export function Navbar() {
  const router = useRouter();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b">
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
            onClick={() => router.push("/dashboard")}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Start Free
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => router.push("/dashboard")}
        >
          <LogIn className="h-5 w-5" />
        </Button>
      </div>
    </nav>
  );
}
