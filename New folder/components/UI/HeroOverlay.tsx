import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

interface HeroOverlayProps {
  onStart?: () => void;
}

const HeroOverlay: React.FC<HeroOverlayProps> = ({ onStart }) => {
  const MotionDiv = motion.div as any;
  const MotionH1 = motion.h1 as any;
  const MotionP = motion.p as any;

  return (
    <section className="relative h-screen w-full flex flex-col items-center justify-center z-10 pointer-events-none">
      <div className="text-center space-y-6 max-w-4xl px-6 pointer-events-auto">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-xs font-semibold tracking-wider uppercase text-cyan-300 backdrop-blur-md">
            Future Interface 2025
          </span>
        </MotionDiv>

        <MotionH1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-6xl md:text-8xl font-bold leading-tight tracking-tighter"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-500">
            Designing the
          </span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
            Impossible.
          </span>
        </MotionH1>

        <MotionP
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-light"
        >
          Experience the next generation of web interactivity. 
          Powered by React 18, Three.js, and advanced motion physics.
        </MotionP>
        
        <MotionDiv
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="pt-8"
        >
          <button 
            onClick={onStart}
            className="group relative px-8 py-4 rounded-full bg-white text-black font-bold text-lg tracking-wide overflow-hidden transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
             <span className="relative z-10">Get Started</span>
             <div className="absolute inset-0 bg-gradient-to-r from-cyan-300 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </MotionDiv>
      </div>

      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <MotionDiv
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-gray-500"
        >
          <ArrowDown size={32} />
        </MotionDiv>
      </MotionDiv>
    </section>
  );
};

export default HeroOverlay;