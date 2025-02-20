import React from "react";
import FeatureCard from "./FeatureCard";
import { ShieldCheck, Brain, Coins } from "lucide-react";
import { motion } from "framer-motion";

interface FeatureSectionProps {
  features?: Array<{
    title: string;
    description: string;
    icon: any;
  }>;
}

const defaultFeatures = [
  {
    title: "Honor System",
    description:
      "We trust you to be honest about your habits. No tracking apps, no verification - just your integrity.",
    icon: ShieldCheck,
  },
  {
    title: "Psychology-Backed",
    description:
      "Loss aversion is a powerful motivator. When money's on the line, you're more likely to stick to your habits.",
    icon: Brain,
  },
  {
    title: "Free Until You Fail",
    description:
      "Start any habit for free. Only pay if you break your commitment. Your success costs you nothing.",
    icon: Coins,
  },
];

const FeatureSection = ({
  features = defaultFeatures,
}: FeatureSectionProps) => {
  return (
    <section className="w-full py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            The Future of Habit Building
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            No subscriptions. No upfront costs. Just pure motivation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <FeatureCard
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
