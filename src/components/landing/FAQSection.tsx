import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is it really free?",
    answer:
      "Yes! You only pay if you fail to keep your habit. Think of it as reverse-pricing: success costs nothing.",
  },
  {
    question: "What happens to the money if I fail?",
    answer:
      "You choose: either donate it to charity or contribute to the community success pool, which rewards consistent users.",
  },
  {
    question: "How do you prevent cheating?",
    answer:
      "We don't - and that's the point. The honor system makes you accountable to yourself, which is more powerful than any external verification.",
  },
  {
    question: "What's the catch?",
    answer:
      "No catch! We believe in radical transparency. Our business model is simple: we take a small percentage of failed bets to keep the lights on.",
  },
  {
    question: "Is this gambling?",
    answer:
      "Not at all. This is a commitment device where you're in complete control. You're betting on yourself, not chance.",
  },
];

export default function FAQSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container px-4 mx-auto max-w-3xl">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold tracking-tight mb-4"
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-muted-foreground"
          >
            Everything you need to know about our radical approach to habit
            building
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
