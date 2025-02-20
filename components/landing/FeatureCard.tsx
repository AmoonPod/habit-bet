import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { motion } from "framer-motion";
import { Zap, Heart, Brain } from "lucide-react";

interface FeatureCardProps {
  title?: string;
  description?: string;
  icon?: typeof Zap;
}

const defaultFeatures = [
  {
    title: "Power Up Your Habits",
    description: "Transform your daily routines into rewarding challenges",
    icon: Zap,
  },
  {
    title: "Health First",
    description: "Focus on building healthy, sustainable habits",
    icon: Heart,
  },
  {
    title: "Mind Over Matter",
    description: "Use psychology-backed approaches to habit formation",
    icon: Brain,
  },
][0]; // Get first item as default

const FeatureCard = ({
  title = defaultFeatures.title,
  description = defaultFeatures.description,
  icon: Icon = defaultFeatures.icon,
}: FeatureCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="w-[350px] bg-white"
    >
      <Card className="h-[400px] border-2 border-gray-200 hover:border-primary transition-colors duration-300">
        <CardHeader className="text-center">
          <div className="mx-auto p-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <Icon className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-center text-gray-600 text-base">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FeatureCard;
