import { motion } from "framer-motion";

const companies = [
  {
    name: "TechCrunch",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=TC",
  },
  { name: "Forbes", logo: "https://api.dicebear.com/7.x/initials/svg?seed=FB" },
  { name: "Wired", logo: "https://api.dicebear.com/7.x/initials/svg?seed=WR" },
  {
    name: "Product Hunt",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=PH",
  },
];

export default function TrustSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container px-4 mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center text-muted-foreground mb-8"
        >
          Featured in
        </motion.p>

        <div className="flex flex-wrap justify-center items-center gap-12">
          {companies.map((company, i) => (
            <motion.div
              key={company.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group"
            >
              <img
                src={company.logo}
                alt={company.name}
                className="h-8 w-auto opacity-50 group-hover:opacity-70 transition-opacity"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
