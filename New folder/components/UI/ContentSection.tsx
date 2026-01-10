import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Layers, Zap, Globe, Cpu, Palette, Shield } from 'lucide-react';
import GlassCard from './GlassCard';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    title: "3D Immersion",
    description: "Seamlessly integrated 3D environments that react to user input in real-time.",
    icon: <Layers size={24} />
  },
  {
    title: "Lightning Fast",
    description: "Optimized bundle sizes and GPU acceleration for 60fps performance.",
    icon: <Zap size={24} />
  },
  {
    title: "Global Edge",
    description: "Deployed on the edge for minimal latency regardless of user location.",
    icon: <Globe size={24} />
  },
  {
    title: "AI Powered",
    description: "Smart interfaces that adapt to user behavior patterns dynamically.",
    icon: <Cpu size={24} />
  },
  {
    title: "Modern Aesthetics",
    description: "Glassmorphism, neon accents, and clean typography for 2025.",
    icon: <Palette size={24} />
  },
  {
    title: "Secure Core",
    description: "Enterprise-grade security built into every layer of the application.",
    icon: <Shield size={24} />
  }
];

const ContentSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const MotionH2 = motion.h2 as any;

  // GSAP Text Reveal Effect
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.fromTo(titleRef.current,
          {
            backgroundPosition: "200% center"
          },
          {
            backgroundPosition: "0% center",
            duration: 2,
            scrollTrigger: {
              trigger: titleRef.current,
              start: "top 80%",
              end: "bottom 20%",
              scrub: 1
            }
          }
        );
      }
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative z-10 w-full px-6 py-24 md:py-32 bg-black/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 space-y-4">
          <MotionH2 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-sm font-bold tracking-widest text-cyan-500 uppercase"
          >
            Core Features
          </MotionH2>
          <h3 
            ref={titleRef}
            className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-[linear-gradient(to_right,#ffffff,#ffffff,#6b7280,#ffffff,#ffffff)] bg-[size:200%_auto]"
          >
            Engineered for <br />
            <span className="text-white">Next Level Performance</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <GlassCard 
              key={index}
              {...feature}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContentSection;