import React from 'react';
import { motion } from 'framer-motion';
import { FeatureCardProps } from '../../types';

const GlassCard: React.FC<FeatureCardProps> = ({ title, description, icon, delay = 0 }) => {
  const MotionDiv = motion.div as any;

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
      className="relative group p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden"
    >
      {/* Gradient blob for hover effect */}
      <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />
      
      <div className="relative z-10 flex flex-col items-start space-y-4">
        <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-cyan-400 group-hover:text-cyan-300 transition-colors">
          {icon}
        </div>
        <h3 className="text-2xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          {title}
        </h3>
        <p className="text-gray-400 leading-relaxed font-light">
          {description}
        </p>
      </div>
    </MotionDiv>
  );
};

export default GlassCard;