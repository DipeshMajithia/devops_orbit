import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';

interface Region {
  code: string;
  name: string;
  city: string;
  country: string;
  latency: number; // simulated latency in ms
  flag: string;
}

// Simulated AWS regions with varying latencies
const regions: Region[] = [
  { code: 'us-east-1', name: 'US East (N. Virginia)', city: 'Ashburn', country: 'USA', latency: 45, flag: '🇺🇸' },
  { code: 'us-west-2', name: 'US West (Oregon)', city: 'Portland', country: 'USA', latency: 82, flag: '🇺🇸' },
  { code: 'eu-west-1', name: 'EU West (Ireland)', city: 'Dublin', country: 'Ireland', latency: 95, flag: '🇮🇪' },
  { code: 'ap-south-1', name: 'Asia Pacific (Mumbai)', city: 'Mumbai', country: 'India', latency: 12, flag: '🇮🇳' },
  { code: 'ap-southeast-1', name: 'Asia Pacific (Singapore)', city: 'Singapore', country: 'Singapore', latency: 65, flag: '🇸🇬' },
  { code: 'sa-east-1', name: 'South America (São Paulo)', city: 'São Paulo', country: 'Brazil', latency: 150, flag: '🇧🇷' },
];

export default function Phase1RegionSelect() {
  const { selectedRegion, setSelectedRegion, completePhase, addScore, addBadge } = useGameStore();
  const [pings, setPings] = useState<number[]>(regions.map(() => 0));
  const [showSuccess, setShowSuccess] = useState(false);
  const [shakeRegion, setShakeRegion] = useState<string | null>(null);
  const [phaseCompleted, setPhaseCompleted] = useState(false);

  // Simulate ping sweep animation
  useEffect(() => {
    const revealPings = async () => {
      for (let i = 0; i < regions.length; i++) {
        await new Promise((r) => setTimeout(r, 400));
        setPings((prev) => {
          const next = [...prev];
          next[i] = regions[i].latency;
          return next;
        });
      }
    };
    revealPings();
  }, []);

  const handleRegionClick = useCallback((region: Region) => {
    if (phaseCompleted) return;
    setSelectedRegion(region.code);

    // Check if it's the lowest latency
    const lowestLatency = Math.min(...regions.map((r) => r.latency));
    if (region.latency === lowestLatency) {
      // Success!
      setShowSuccess(true);
      setTimeout(() => {
        completePhase(1);
        addScore(100);
        addBadge({
          id: 'region-scout',
          name: 'Region Scout',
          icon: '🌍',
          earnedAt: Date.now(),
        });
        setPhaseCompleted(true);
      }, 1500);
    } else {
      // Wrong selection
      setShakeRegion(region.code);
      setTimeout(() => setShakeRegion(null), 600);
    }
  }, [phaseCompleted, setSelectedRegion, completePhase, addScore, addBadge]);

  const lowestLatency = Math.min(...regions.map((r) => r.latency));

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[500px]">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-bold text-white mb-2"
      >
        🌍 Mission Control — Region Selection
      </motion.h2>
      <p className="text-sm text-cosmic-muted mb-6">
        Scan the latency signals. Select the region with the LOWEST ping to stabilize your orbit.
      </p>

      {/* Latency Legend */}
      <div className="flex gap-4 mb-6 text-xs font-mono">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-cosmic-success animate-pulse" /> Low (&lt;30ms)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-cosmic-warning" /> Medium (30-100ms)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-cosmic-danger" /> High (&gt;100ms)
        </span>
      </div>

      {/* Region Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-2xl">
        <AnimatePresence>
          {regions.map((region, idx) => {
            const pingRevealed = pings[idx] > 0;
            const isLowest = region.latency === lowestLatency;
            const isSelected = selectedRegion === region.code;
            const isShaking = shakeRegion === region.code;

            return (
              <motion.button
                key={region.code}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: isShaking ? [0, -5, 5, -5, 5, 0] : 0,
                }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => handleRegionClick(region)}
                disabled={phaseCompleted}
                className={`
                  relative p-4 rounded-xl border text-left transition-all duration-300
                  ${isSelected && isLowest
                    ? 'border-cosmic-success bg-cosmic-success/10 animate-pulse-glow'
                    : 'border-cosmic-border bg-cosmic-panel/40 hover:border-cosmic-accent/50'
                  }
                  ${isShaking ? 'border-cosmic-danger bg-cosmic-danger/10 animate-shake' : ''}
                  ${phaseCompleted ? 'cursor-default' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{region.flag}</span>
                  <span className="text-xs font-mono text-cosmic-accent">{region.code}</span>
                </div>
                <p className="text-xs text-cosmic-text mb-1">{region.city}, {region.country}</p>
                
                {/* Latency Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] font-mono mb-1">
                    <span className="text-cosmic-muted">PING</span>
                    {pingRevealed ? (
                      <span className={`
                        ${region.latency < 30 ? 'text-cosmic-success' : ''}
                        ${region.latency >= 30 && region.latency <= 100 ? 'text-cosmic-warning' : ''}
                        ${region.latency > 100 ? 'text-cosmic-danger' : ''}
                      `}>
                        {region.latency}ms
                      </span>
                    ) : (
                      <span className="text-cosmic-muted">---</span>
                    )}
                  </div>
                  <div className="w-full h-2 bg-cosmic-bg rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: pingRevealed ? `${Math.min((region.latency / 200) * 100, 100)}%` : '0%' }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        region.latency < 30 ? 'bg-cosmic-success' :
                        region.latency <= 100 ? 'bg-cosmic-warning' : 'bg-cosmic-danger'
                      }`}
                    />
                  </div>
                </div>

                {/* Secret marker reveals on ping complete */}
                {pingRevealed && isLowest && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute top-2 right-2"
                  >
                    <span className="text-[10px] bg-cosmic-success/20 px-1.5 py-0.5 rounded text-cosmic-success">
                      BEST
                    </span>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-cosmic-bg/80 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ 
                scale: [0, 1.2, 1],
                rotate: [0, 360],
              }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <span className="text-8xl">🛰️</span>
              <h2 className="text-2xl font-bold text-cosmic-success mt-4 glow-text">
                Orbit Stabilized!
              </h2>
              <p className="text-sm text-cosmic-text mt-2">
                You've docked at the lowest-latency region. +100 points
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
