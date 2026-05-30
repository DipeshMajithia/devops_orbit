
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroScreenProps {
  onStart: () => void;
}

const storyFragments = [
  {
    id: 0,
    text: "ALERT: MULTIVERSE COLLAPSE IMMINENT... The year is 2026. You are a brilliant student developer. You just finished your final project. You hit 'Run' on your laptop. It works perfectly. You are a genius. Or so you think...",
    type: "narrator",
  },
  {
    id: 1,
    text: "You proudly send the link to your Professor, your friends, and a potential employer. 100 people click it at the exact same time. Your laptop smells like burning plastic. The screen freezes. The server is dead. Welcome to the real world.",
    type: "narrator",
  },
  {
    id: 2,
    text: "See, humanity has been plagued for decades by a curse known as 'The Localhost Illusion.' Symptoms include: crying in front of a broken monitor and desperately whispering, 'But... it worked on my machine!'",
    type: "narrator",
  },
  {
    id: 3,
    text: "To save mankind, an elite faction was formed: The DevOps Order. Half software engineer, half infrastructure wizard. They don't just write code; they command the massive, roaring digital warehouses built by the Overlord Jeff (aka AWS).",
    type: "narrator",
  },
  {
    id: 4,
    text: "Today, you leave the safety of your local computer. The DevOps Council has granted you access to the cockpit of a cloud-grade starship. To survive the journey, you must master the two Sacred Paths of Power...",
    type: "narrator",
  },
  {
    id: 5,
    text: "🖥️ PATH A: EC2 (The Iron Titan) — Rent a literal chunk of a supercomputer. You have total control over the operating system. You are god of this machine. But beware: if you forget to patch it, configure the firewall, or reboot it... it WILL explode.",
    type: "ec2",
  },
  {
    id: 6,
    text: "⭐ PATH B: S3 (The Cosmic Void) — True serverless magic. You hurl your code and files directly into a boundless quantum dimension. No servers to maintain, infinite automatic scaling, and a price tag cheaper than a single college textbook.",
    type: "s3",
  },
  {
    id: 7,
    text: "Your simulation will blast through 8 orbital phases. You'll dodge rogue hackers, configure security groups, and face off against a Boss AI in an EC2 vs S3 deathmatch. If you win, you claim the ultimate treasure: Cloud Sovereignty (and a shiny certificate).",
    type: "narrator",
  },
  {
    id: 8,
    text: "Your peers are watching. Your future career is on the line. The terminal is loaded. Are you ready to become a Cloud Pilot? 🚀",
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
