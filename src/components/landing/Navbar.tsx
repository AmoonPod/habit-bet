import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Logo } from "../ui/logo";

export default function Navbar() {
  const navigate = useNavigate();

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
            className="text-sm bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            onClick={() => navigate("/dashboard")}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Start Free
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => navigate("/dashboard")}
        >
          <LogIn className="h-5 w-5" />
        </Button>
      </div>
    </nav>
  );
}
