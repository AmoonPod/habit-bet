import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Coins, Target } from "lucide-react";

const steps = [
  {
    icon: Target,
    title: "Set Your Goal",
    description:
      "Choose a habit and set your stakes. No upfront payment required.",
  },
  {
    icon: ShieldCheck,
    title: "Honor System",
    description:
      "Check in daily on your progress. We trust you to be honest - that's part of the growth.",
  },
  {
    icon: Coins,
    title: "Win or Learn",
    description:
      "Succeed? Pay nothing. Slip up? Your stake goes to charity or the community pool.",
  },
  {
    icon: ArrowRight,
    title: "Level Up",
    description:
      "Build lasting habits while staying accountable. No subscriptions, just pure motivation.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold tracking-tight mb-4"
          >
            How HabitBet Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            The simplest way to build habits. No subscriptions. No hidden fees.
            Just you, your goals, and your commitment.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                <step.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
