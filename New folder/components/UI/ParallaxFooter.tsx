import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const ParallaxFooter: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [-100, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.5, 1]);

  return (
    <footer ref={ref} className="relative z-10 w-full min-h-[60vh] flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] border-t border-white/10">
      <motion.div 
        style={{ y, opacity }}
        className="text-center px-6"
      >
        <h2 className="text-5xl md:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-gray-200 to-gray-800 mb-8">
          LUMINA
        </h2>
        <div className="flex flex-col md:flex-row gap-8 justify-center items-center text-gray-400 font-light">
          <a href="#" className="hover:text-cyan-400 transition-colors">Documentation</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">GitHub</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">Twitter</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">Contact</a>
        </div>
      </motion.div>
      
      <div className="absolute bottom-6 text-xs text-gray-600">
        © 2025 Lumina Interactive. All rights reserved.
      </div>
    </footer>
  );
};

export default ParallaxFooter;