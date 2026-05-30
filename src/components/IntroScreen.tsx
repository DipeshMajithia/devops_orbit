
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroScreenProps {
  onStart: () => void;
}

const storyFragments = [
  {
    id: 0,
    text: "In the beginning... there was nothing.",
    type: "narrator",
  },
  {
    id: 1,
    text: "Well, not *nothing* nothing. There was a man named Jeff who really, REALLY liked warehouses. He built the world's biggest digital warehouse and called it AWS.",
    type: "narrator",
  },
  {
    id: 2,
    text: "Meanwhile, developers everywhere were suffering from a terrible disease called 'It Works On My Machine.' Symptoms included: boss asking why the site was down, and mumbled excuses about server capacity.",
    type: "narrator",
  },
  {
    id: 3,
    text: "Then came DevOps — the ancient art of making developers and operations engineers sit in the same room until they learned to be friends. It involved a lot of coffee, automated deployments, and fewer 3 AM phone calls.",
    type: "narrator",
  },
  {
    id: 4,
    text: "YOU have been chosen, brave cadet, to master the two sacred paths of deployment:",
    type: "narrator",
  },
  {
    id: 5,
    text: "🖥️  EC2 — The mighty virtual machine. Rent a slice of a supercomputer. Full control, but you must feed it updates and whisper `systemctl restart` to it every full moon.",
    type: "ec2",
  },
  {
    id: 6,
    text: "⭐  S3 — The serverless star. Hurl your files into the cosmos and AWS handles the rest. No babysitting, just infinite scaling and a bill smaller than your coffee budget.",
    type: "s3",
  },
  {
    id: 7,
    text: "Today, you'll pilot a spaceship through 8 orbital phases: from selecting a home region to battling an AI opponent in the ultimate EC2 vs S3 showdown. There will be dragons (metaphorically), treasure (AWS knowledge), and a very shiny certificate at the end.",
    type: "narrator",
  },
  {
    id: 8,
    text: "Are you ready to become a CERTIFIED CLOUD PILOT? 🚀",
    type: "final",
  },
];

const typeStyles: Record<string, { border: string; glow: string; bg: string; accent: string }> = {
  narrator: {
    border: "border-cosmic-accent/30",
    glow: "shadow-[0_0_20px_rgba(0,240,255,0.15)]",
    bg: "bg-cosmic-panel/20",
    accent: "text-cosmic-accent",
  },
  ec2: {
    border: "border-cosmic-warning/30",
    glow: "shadow-[0_0_20px_rgba(255,170,0,0.2)]",
    bg: "bg-cosmic-warning/5",
    accent: "text-cosmic-warning",
  },
  s3: {
    border: "border-cosmic-success/30",
    glow: "shadow-[0_0_20px_rgba(0,255,136,0.2)]",
    bg: "bg-cosmic-success/5",
    accent: "text-cosmic-success",
  },
  final: {
    border: "border-cosmic-glow/40",
    glow: "shadow-[0_0_30px_rgba(123,47,255,0.4)]",
    bg: "bg-cosmic-glow/10",
    accent: "text-cosmic-glow",
  },
};

export default function IntroScreen({ onStart }: IntroScreenProps) {
  const [fragmentIndex, setFragmentIndex] = useState(0);
  const [showFragment, setShowFragment] = useState(true);

  const handleNext = () => {
    if (fragmentIndex < storyFragments.length - 1) {
      setShowFragment(false);
      setTimeout(() => {
        setFragmentIndex((prev) => prev + 1);
        setShowFragment(true);
      }, 300);
    } else {
      setShowFragment(false);
      setTimeout(onStart, 600);
    }
  };

  const handleSkip = () => {
    setShowFragment(false);
    setTimeout(onStart, 400);
  };

  const current = storyFragments[fragmentIndex];
  const style = typeStyles[current.type] || typeStyles.narrator;

  return (
    <div className="min-h-screen bg-cosmic-bg stars-bg relative overflow-hidden flex flex-col">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none cosmic-grid opacity-20" />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-96 sm:h-96 rounded-full border border-cosmic-accent/8 animate-[spin_40s_linear_infinite]" />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 rounded-full border border-cosmic-glow/6 animate-[spin_25s_linear_infinite_reverse]" />
      </div>

      {/* Header bar */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-cosmic-border/40 bg-cosmic-dark/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="text-xl sm:text-2xl">🛰️</span>
          <div>
            <h1 className="text-sm sm:text-base font-mono font-bold text-cosmic-accent glow-text">
              DEVOPS ORBIT
            </h1>
            <p className="text-[10px] font-mono text-cosmic-muted">
              Cloud Deployment Simulator v1.0
            </p>
          </div>
        </div>
        <button
          onClick={handleSkip}
          className="text-[10px] sm:text-xs font-mono text-cosmic-muted/50 hover:text-cosmic-text border border-cosmic-border/30 hover:border-cosmic-border px-3 py-1.5 rounded-lg transition-all"
        >
          SKIP INTRO →
        </button>
      </div>

      {/* Main content area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        {/* Phase indicator dots */}
        <div className="flex gap-2 mb-6 sm:mb-8">
          {storyFragments.map((_, i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-500 ${i < fragmentIndex
                ? 'bg-cosmic-accent/60'
                : i === fragmentIndex
                  ? 'bg-cosmic-accent shadow-[0_0_8px_rgba(0,240,255,0.6)]'
                  : 'bg-cosmic-border/40'
                }`}
              animate={i === fragmentIndex ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
          ))}
        </div>

        {/* Story card */}
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {showFragment && (
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.96 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className={`w-full border rounded-2xl p-5 sm:p-8 backdrop-blur-sm ${style.border} ${style.glow} ${style.bg}`}
              >
                {/* Card header */}
                <div className="flex items-center gap-2 mb-5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  <span className="ml-2 text-[10px] font-mono text-cosmic-muted/60">
                    TRANSMISSION_{String(current.id).padStart(2, "0")}.LOG
                  </span>
                  <span className={`ml-auto text-[9px] font-mono uppercase tracking-widest ${style.accent}`}>
                    {current.type === 'narrator' ? 'MISSION BRIEFING' : current.type === 'ec2' ? 'PATH A · IaaS' : current.type === 's3' ? 'PATH B · STORAGE' : 'FINAL BROADCAST'}
                  </span>
                </div>

                {/* Text */}
                <motion.p
                  className="text-base sm:text-xl lg:text-2xl font-mono text-cosmic-text leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                >
                  {current.text}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action button */}
        <motion.button
          onClick={handleNext}
          className={`
            mt-6 sm:mt-8 px-6 sm:px-10 py-3 sm:py-3.5 rounded-xl font-mono text-sm sm:text-base font-bold uppercase tracking-widest
            border transition-all duration-300
            ${fragmentIndex === storyFragments.length - 1
              ? 'bg-cosmic-glow/15 border-cosmic-glow/50 text-cosmic-glow hover:bg-cosmic-glow/25 shadow-[0_0_20px_rgba(123,47,255,0.3)]'
              : 'bg-cosmic-accent/8 border-cosmic-accent/40 text-cosmic-accent hover:bg-cosmic-accent/15 hover:border-cosmic-accent/60'}
          `}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          {fragmentIndex === storyFragments.length - 1
            ? '🚀 LAUNCH MISSION'
            : '▼ NEXT TRANSMISSION'}
        </motion.button>

        {/* Progress hint */}
        <p className="mt-3 text-[10px] font-mono text-cosmic-muted/40">
          {fragmentIndex < storyFragments.length - 1
            ? `Transmission ${fragmentIndex + 1} of ${storyFragments.length}`
            : 'Final transmission — click to begin your journey'}
        </p>
      </div>
    </div>
  );
}
