import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import { useGameStore } from '../store/useGameStore';

interface FinaleScreenProps {
  onClose: () => void;
}

export default function FinaleScreen({ onClose }: FinaleScreenProps) {
  const { score, badges, resetGame } = useGameStore();
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 1024, height: 768 });
  const [step, setStep] = useState(0);

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    // Stop confetti after 8 seconds
    const timer = setTimeout(() => setShowConfetti(false), 10000);
    // Auto-advance steps
    const s1 = setTimeout(() => setStep(1), 1500);
    const s2 = setTimeout(() => setStep(2), 3000);
    const s3 = setTimeout(() => setStep(3), 4500);
    return () => {
      clearTimeout(timer);
      clearTimeout(s1);
      clearTimeout(s2);
      clearTimeout(s3);
    };
  }, []);

  const handleRestart = useCallback(() => {
    resetGame();
    onClose();
  }, [resetGame, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-cosmic-bg/95 flex items-center justify-center overflow-hidden"
    >
      {/* Confetti */}
      {showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={400}
          colors={['#00f0ff', '#7b2fff', '#00ff88', '#ff3366', '#ffaa00', '#ffffff']}
          recycle={true}
          tweenDuration={8000}
        />
      )}

      {/* Stars background */}
      <div className="absolute inset-0 stars-bg opacity-50" />

      <div className="relative z-10 text-center max-w-2xl px-6">
        {/* Step 0: Big Trophy */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={step >= 0 ? { scale: 1, rotate: 0 } : {}}
          transition={{ type: 'spring', stiffness: 120, damping: 12 }}
          className="mb-8"
        >
          <motion.span
            animate={{ 
              y: [0, -15, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="text-[120px] inline-block"
          >
            🏆
          </motion.span>
        </motion.div>

        {/* Step 1: Title */}
        <AnimatePresence>
          {step >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-cosmic-accent via-cosmic-glow to-cosmic-success bg-clip-text text-transparent">
                  Mission Accomplished
                </span>
              </h1>
              <p className="text-2xl text-cosmic-accent glow-text font-mono tracking-wider">
                CERTIFIED CLOUD PILOT
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 2: Stats Dashboard */}
        <AnimatePresence>
          {step >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mt-8 grid grid-cols-3 gap-4"
            >
              <motion.div
                className="bg-cosmic-panel/50 border border-cosmic-accent/30 rounded-xl p-4"
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0,240,255,0.3)' }}
              >
                <p className="text-3xl font-bold text-cosmic-warning glow-text">{score}</p>
                <p className="text-[10px] font-mono text-cosmic-muted mt-1">TOTAL SCORE</p>
              </motion.div>
              <motion.div
                className="bg-cosmic-panel/50 border border-cosmic-success/30 rounded-xl p-4"
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0,255,136,0.3)' }}
              >
                <p className="text-3xl font-bold text-cosmic-success glow-text">{badges.length}</p>
                <p className="text-[10px] font-mono text-cosmic-muted mt-1">BADGES EARNED</p>
              </motion.div>
              <motion.div
                className="bg-cosmic-panel/50 border border-cosmic-glow/30 rounded-xl p-4"
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(123,47,255,0.3)' }}
              >
                <p className="text-3xl font-bold text-cosmic-accent glow-text">8/8</p>
                <p className="text-[10px] font-mono text-cosmic-muted mt-1">PHASES COMPLETE</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 3: Badges Showcase & Summary */}
        <AnimatePresence>
          {step >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mt-8"
            >
              {/* Badges */}
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {badges.map((badge, i) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.15 }}
                    className="bg-cosmic-panel/50 border border-cosmic-border rounded-lg px-3 py-2 flex items-center gap-2"
                  >
                    <span className="text-xl">{badge.icon}</span>
                    <span className="text-[10px] font-mono text-cosmic-text">{badge.name}</span>
                  </motion.div>
                ))}
              </div>

              {/* Summary */}
              <motion.div
                className="bg-cosmic-panel/30 border border-cosmic-border rounded-xl p-5 text-left"
              >
                <h3 className="text-sm font-mono text-cosmic-accent mb-3">
                  📊 MISSION SUMMARY
                </h3>
                <div className="space-y-2 text-xs text-cosmic-text">
                  <p>🌍 <span className="text-cosmic-muted">Phase 1:</span> AWS Region selected based on latency analysis</p>
                  <p>🔨 <span className="text-cosmic-muted">Phase 2:</span> EC2 instance forged with secure SSH key</p>
                  <p>💻 <span className="text-cosmic-muted">Phase 3:</span> SSH connection established to remote server</p>
                  <p>⚙️ <span className="text-cosmic-muted">Phase 4:</span> Nginx installed + Security Group configured</p>
                  <p>🌟 <span className="text-cosmic-muted">Phase 5:</span> S3 bucket created with unique DNS name</p>
                  <p>📦 <span className="text-cosmic-muted">Phase 6:</span> Static assets uploaded with correct metadata</p>
                  <p>🛡️ <span className="text-cosmic-muted">Phase 7:</span> Public access policy configured securely</p>
                  <p>⚔️ <span className="text-cosmic-muted">Phase 8:</span> EC2 vs S3 mastery demonstrated</p>
                </div>
              </motion.div>

              {/* Skills earned summary */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="mt-4 flex flex-wrap justify-center gap-2"
              >
                {[
                  'AWS EC2 Provisioning',
                  'SSH Key Authentication',
                  'Security Groups',
                  'Nginx Web Server',
                  'S3 Bucket Creation',
                  'Bucket Policies (IAM)',
                  'Static Website Hosting',
                  'Serverless vs IaaS',
                ].map((skill, i) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2.5 + i * 0.1 }}
                    className="text-[10px] font-mono bg-cosmic-success/10 border border-cosmic-success/20 px-2 py-1 rounded-full text-cosmic-success"
                  >
                    ✓ {skill}
                  </motion.span>
                ))}
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3.5 }}
                className="mt-8 flex gap-4 justify-center"
              >
                <motion.button
                  onClick={handleRestart}
                  className="px-8 py-4 rounded-xl font-bold text-sm tracking-wider font-mono
                    bg-cosmic-accent/20 border-2 border-cosmic-accent text-cosmic-accent
                    hover:bg-cosmic-accent/30 transition-all"
                  whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(0,240,255,0.4)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  🔄 RESTART MISSION
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
