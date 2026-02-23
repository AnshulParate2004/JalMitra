import { motion } from "framer-motion";

const CTASection = () => {
  return (
    <section className="relative section-padding bg-background bg-grid">

      <div className="relative z-10 container mx-auto text-center max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to ensure <span className="gradient-text">safe water</span>?
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            Deploy JalSuraksha sensors across your water network and start monitoring in minutes. No complex setup required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:shadow-[0_0_30px_hsl(186_100%_50%/0.4)] transition-all duration-300"
            >
              Get Started Free
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl glass text-foreground font-semibold hover:bg-card/60 transition-all duration-300"
            >
              Schedule Demo
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
