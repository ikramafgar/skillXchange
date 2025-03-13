import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const LoadingSpinner = () => {
  const letters = "Loading...".split("");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % letters.length);
    }, 200); // Controls the speed of sequence

    return () => clearInterval(interval);
  }, [letters.length]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex">
        {letters.map((letter, index) => (
          <motion.span
            key={index}
            className="text-3xl font-mono font-bold text-gray-700"
            animate={{
              y: index === activeIndex ? -20 : 0
            }}
            transition={{
              duration: 0.2,
              ease: "easeInOut"
            }}
          >
            {letter}
          </motion.span>
        ))}
      </div>
    </div>
  );
};

export default LoadingSpinner;