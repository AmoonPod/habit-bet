"use client";
import React from "react";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { motion } from "framer-motion";

interface Testimonial {
  name: string;
  role: string;
  content: string;
  avatarUrl: string;
}

interface TestimonialsSectionProps {
  testimonials?: Testimonial[];
}

const defaultTestimonials: Testimonial[] = [
  {
    name: "Sarah J.",
    role: "Definitely Real Person",
    content: "I bet $50 I'd meditate daily. Now I'm both mindful AND richer!",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  },
  {
    name: "Mike R.",
    role: "Totally Not Made Up",
    content:
      "Lost my first bet on exercising, but the motivation to not lose again got me in the best shape ever!",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
  },
  {
    name: "Alex P.",
    role: "Real Human Being",
    content:
      "The honor system makes me feel guilty enough to actually do my habits. My wallet thanks you!",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  },
];

export function TestimonialsSection({
  testimonials = defaultTestimonials,
}: TestimonialsSectionProps) {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">
          Don't Just Take Our Word For It
        </h2>
        <p className="text-center text-gray-600 mb-12">
          Here's what our definitely real users have to say*
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-white">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={testimonial.avatarUrl}
                        alt={testimonial.name}
                      />
                      <AvatarFallback>
                        {testimonial.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                      <h3 className="font-semibold text-gray-900">
                        {testimonial.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">
                    "{testimonial.content}"
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 mt-8">
          *Any resemblance to real persons is purely coincidental
        </p>
      </div>
    </section>
  );
}
