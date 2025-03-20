"use client";
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { Button } from "@/components/ui/button";
import { PricingSection } from "@/components/pricing-section";
import { Footer } from "@/components/ui/footer";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-session";

export default function Home() {
  const router = useRouter();
  const { session } = useSession();

  const handleCtaClick = () => {
    if (session) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      <Navbar />
      <main>
        <HeroSection />
        <div id="how-it-works">
          <HowItWorksSection />
        </div>
        <div id="testimonials">
          <TestimonialsSection />
        </div>
        <div id="pricing" className="container px-4 mx-auto">
          <PricingSection />
        </div>
        <div id="faq">
          <FAQSection />
        </div>

        {/* CTA Section */}
        <section className="py-24 bg-primary">
          <div className="container px-4 mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold text-white mb-6"
            >
              Ready to Stake Your Claim on Success?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-white/80 mb-8 max-w-2xl mx-auto"
            >
              Join thousands who are using the power of real stakes to build
              lasting habits. Remember: You only pay if you don't succeed!
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                variant="secondary"
                className="text-sm sm:text-lg group px-4 sm:px-6"
                onClick={handleCtaClick}
              >
                Stake Your First Habit & Earn Success
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </motion.div>
  );
}
