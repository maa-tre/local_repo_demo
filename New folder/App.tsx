import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SmoothScroll from './components/Layout/SmoothScroll';
import Experience from './components/3d/Experience';
import HeroOverlay from './components/UI/HeroOverlay';
import ContentSection from './components/UI/ContentSection';
import ParallaxFooter from './components/UI/ParallaxFooter';
import { ArrowLeft, Satellite } from 'lucide-react';

const App: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [showSatellites, setShowSatellites] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="bg-[#030305] text-white selection:bg-cyan-500/30">
      <Experience isStarted={isStarted} showSatellites={showSatellites} />
      
      <AnimatePresence mode="wait">
        {!isStarted ? (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50, transition: { duration: 0.8 } }}
          >
            <SmoothScroll>
              <main className="relative z-10 flex flex-col">
                <HeroOverlay onStart={() => setIsStarted(true)} />
                <ContentSection />
                <div className="h-[20vh] w-full" /> 
                
                <section className="relative h-[50vh] flex items-center justify-center bg-gradient-to-r from-indigo-900/20 to-purple-900/20 backdrop-blur-lg my-20">
                  <div className="text-center">
                    <h3 className="text-4xl font-bold mb-4">Ready to Innovate?</h3>
                    <p className="text-gray-300 max-w-lg mx-auto">
                      Join thousands of developers building the future of the web with Lumina's cutting edge tools.
                    </p>
                  </div>
                </section>

                <ParallaxFooter />
              </main>
            </SmoothScroll>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between p-12"
          >
            {/* Minimal UI for "Started" state */}
            <div className="flex justify-between items-start pointer-events-auto">
               <button 
                 onClick={() => setIsStarted(false)}
                 className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-widest font-bold"
               >
                 <ArrowLeft size={16} /> Back to Home
               </button>
               <div className="text-right flex flex-col items-end">
                 <h2 className="text-2xl font-bold font-display">LUMINA <span className="text-cyan-500">CORE</span></h2>
                 <p className="text-xs text-gray-400 mb-2">System Status: Online</p>
                 
                 {/* Satellite Toggle Control */}
                 <button 
                    onClick={() => setShowSatellites(!showSatellites)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      showSatellites 
                      ? "bg-cyan-500/20 border-cyan-500 text-cyan-300" 
                      : "bg-white/5 border-white/10 text-gray-400"
                    }`}
                 >
                   <Satellite size={12} />
                   {showSatellites ? "SATELLITES ON" : "SATELLITES OFF"}
                 </button>
               </div>
            </div>

            <div className="pointer-events-auto max-w-md">
               <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                 Global Network
               </h1>
               <p className="text-gray-300 leading-relaxed backdrop-blur-md bg-black/20 p-4 rounded-xl border border-white/10">
                 Welcome to the visualization core. Interact with the globe to explore nodes.
                 <br/><br/>
                 <span className="text-xs text-cyan-500">★ Drag to rotate • Scroll to zoom</span>
               </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;