
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';

interface BattleRound {
  id: number;
  scenario: string;
  clientIcon: string;
  correctCard: 'ec2' | 's3';
  explanation: string;
}

const battleRounds: BattleRound[] = [
  {
    id: 1,
    scenario: 'We need a scalable runtime environment to host a dynamic Node.js backend API with database access.',
    clientIcon: '🏢',
    correctCard: 'ec2',
    explanation: 'EC2 provides a full OS environment where you can install Node.js, configure databases, and run server-side code.',
  },
  {
    id: 2,
    scenario: 'We need to host a global React landing page cheaply, requiring absolutely zero OS patch maintenance.',
    clientIcon: '🌐',
    correctCard: 's3',
    explanation: 'S3 static website hosting is serverless — no servers to patch, and you only pay for storage/bandwidth.',
  },
  {
    id: 3,
    scenario: 'Our web traffic spiked 500% in 2 minutes; we need instant, infinite scaling of static files with no scaling configuration.',
    clientIcon: '📈',
    correctCard: 's3',
    explanation: 'S3 automatically scales to handle any traffic spike without any configuration — true serverless elasticity.',
  },
];

export default function Phase8CosmicShowdown() {
  const {
    completePhase,
    addScore,
    addBadge,
    cardBattleRounds,
    cardBattleCorrect,
    incrementCardBattleRound,
    incrementCardBattleCorrect,
  } = useGameStore();

  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [selectedCard, setSelectedCard] = useState<'ec2' | 's3' | null>(null);
  const [roundResult, setRoundResult] = useState<'correct' | 'incorrect' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [phaseCompleted, setPhaseCompleted] = useState(false);
  const [shakeCard, setShakeCard] = useState<'ec2' | 's3' | null>(null);

  const currentRound = battleRounds[currentRoundIndex];
  const isLastRound = currentRoundIndex >= 2;
  const allCorrect = cardBattleCorrect >= 3;

  const handlePlayCard = useCallback((card: 'ec2' | 's3') => {
    if (selectedCard || phaseCompleted) return;
    setSelectedCard(card);

    const isCorrect = card === currentRound.correctCard;
    
    if (isCorrect) {
      setRoundResult('correct');
      incrementCardBattleCorrect();
      setShowExplanation(true);
      addScore(100);
    } else {
      setRoundResult('incorrect');
      setShakeCard(card);
      setTimeout(() => {
        setShakeCard(null);
        setSelectedCard(null);
        setRoundResult(null);
      }, 800);
      // Penalty
      addScore(-25);
    }
  }, [selectedCard, phaseCompleted, currentRound, incrementCardBattleCorrect, addScore]);

  const handleNextRound = useCallback(() => {
    if (isLastRound) {
      // All 3 rounds complete
      incrementCardBattleRound();
      if (allCorrect || (cardBattleCorrect + (roundResult === 'correct' ? 1 : 0) >= 3)) {
        // Victory
        setTimeout(() => {
          completePhase(8);
          addScore(300);
          addBadge({
            id: 'cosmic-pilot',
            name: 'Cosmic Cloud Pilot',
            icon: '⚔️',
            earnedAt: Date.now(),
          });
          setPhaseCompleted(true);
        }, 500);
      }
    } else {
      incrementCardBattleRound();
      setCurrentRoundIndex((prev) => prev + 1);
      setSelectedCard(null);
      setRoundResult(null);
      setShowExplanation(false);
    }
  }, [isLastRound, incrementCardBattleRound, completePhase, addScore, addBadge, roundResult, cardBattleCorrect, allCorrect]);

  return (
    <div className="p-6 flex flex-col items-center min-h-[500px] relative">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-bold text-white mb-2"
      >
        ⚔️ Cosmic Showdown — EC2 vs S3
      </motion.h2>
      <p className="text-sm text-cosmic-muted mb-4 text-center">
        Round {currentRoundIndex + 1} of 3 — Play the correct card to defeat the client requirement!
      </p>

      {/* Round Progress */}
      <div className="flex gap-2 mb-6">
        {[0, 1, 2].map((r) => (
          <motion.div
            key={r}
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-mono ${
              r < currentRoundIndex
                ? 'border-cosmic-success bg-cosmic-success/20 text-cosmic-success'
                : r === currentRoundIndex
                  ? 'border-cosmic-accent bg-cosmic-accent/20 text-cosmic-accent animate-pulse-glow'
                  : 'border-cosmic-border text-cosmic-muted'
            }`}
          >
            {r < currentRoundIndex ? '✓' : r + 1}
          </motion.div>
        ))}
      </div>

      {/* Battle Arena */}
      <div className="w-full max-w-lg space-y-6">
        {/* Opponent Card (Client Requirement) */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          key={currentRound.id + '-opponent'}
          className="bg-gradient-to-br from-cosmic-danger/10 to-cosmic-panel/50 border-2 border-cosmic-danger/40 rounded-2xl p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{currentRound.clientIcon}</span>
            <div>
              <p className="text-xs font-mono text-cosmic-danger">AI OPPONENT</p>
              <p className="text-[10px] text-cosmic-muted">THE CLIENT REQUIREMENT</p>
            </div>
          </div>
          <motion.p
            key={currentRound.scenario}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-cosmic-text leading-relaxed"
          >
            "{currentRound.scenario}"
          </motion.p>
        </motion.div>

        {/* VS Divider */}
        <div className="flex items-center justify-center">
          <motion.span
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="text-3xl"
          >
            ⚔️
          </motion.span>
          <span className="text-xs font-mono text-cosmic-muted mx-2">VS</span>
          <motion.span
            animate={{ rotate: [360, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="text-3xl"
          >
            ⚔️
          </motion.span>
        </div>

        {/* Player Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* EC2 Card */}
          <motion.button
            onClick={() => handlePlayCard('ec2')}
            disabled={selectedCard !== null || phaseCompleted}
            className={`
              bg-gradient-to-br from-cosmic-accent/10 to-cosmic-panel/50 border-2 rounded-2xl p-5 
              transition-all duration-300 card-hover text-left
              ${selectedCard === 'ec2'
                ? roundResult === 'correct'
                  ? 'border-cosmic-success bg-cosmic-success/20'
                  : roundResult === 'incorrect'
                    ? 'border-cosmic-danger bg-cosmic-danger/20'
                    : 'border-cosmic-accent'
                : 'border-cosmic-border hover:border-cosmic-accent/70'
              }
              ${shakeCard === 'ec2' ? 'animate-shake border-cosmic-danger' : ''}
            `}
            whileHover={!selectedCard ? { scale: 1.03, y: -4 } : {}}
            whileTap={!selectedCard ? { scale: 0.97 } : {}}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🖥️</span>
              <span className="text-xs font-mono text-cosmic-accent">YOUR CARD</span>
            </div>
            <h3 className="text-sm font-bold text-white mb-1">EC2 Server Instance</h3>
            <p className="text-[10px] text-cosmic-muted leading-relaxed">
              IaaS Virtual Machine<br />
              Full OS control (Ubuntu)<br />
              Runs Node.js, Python, DBs<br />
              Auto-scaling groups
            </p>
            {selectedCard === 'ec2' && roundResult === 'correct' && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 text-cosmic-success text-lg"
              >
                ✅
              </motion.span>
            )}
          </motion.button>

          {/* S3 Card */}
          <motion.button
            onClick={() => handlePlayCard('s3')}
            disabled={selectedCard !== null || phaseCompleted}
            className={`
              bg-gradient-to-br from-cosmic-glow/10 to-cosmic-panel/50 border-2 rounded-2xl p-5 
              transition-all duration-300 card-hover text-left relative
              ${selectedCard === 's3'
                ? roundResult === 'correct'
                  ? 'border-cosmic-success bg-cosmic-success/20'
                  : roundResult === 'incorrect'
                    ? 'border-cosmic-danger bg-cosmic-danger/20'
                    : 'border-cosmic-accent'
                : 'border-cosmic-border hover:border-cosmic-glow/70'
              }
              ${shakeCard === 's3' ? 'animate-shake border-cosmic-danger' : ''}
            `}
            whileHover={!selectedCard ? { scale: 1.03, y: -4 } : {}}
            whileTap={!selectedCard ? { scale: 0.97 } : {}}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🪣</span>
              <span className="text-xs font-mono text-cosmic-glow">YOUR CARD</span>
            </div>
            <h3 className="text-sm font-bold text-white mb-1">S3 Static Bucket</h3>
            <p className="text-[10px] text-cosmic-muted leading-relaxed">
              Serverless Object Storage<br />
              Zero OS maintenance<br />
              Infinite automatic scaling<br />
              Static files only (HTML/CSS/JS)
            </p>
            {selectedCard === 's3' && roundResult === 'correct' && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 text-cosmic-success text-lg"
              >
                ✅
              </motion.span>
            )}
          </motion.button>
        </div>

        {/* Result & Explanation */}
        <AnimatePresence>
          {roundResult === 'correct' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-cosmic-success/10 border border-cosmic-success/30 rounded-xl p-4"
            >
              <p className="text-xs font-mono text-cosmic-success font-bold mb-1">
                ✅ CORRECT CARD PLAYED!
              </p>
              {showExplanation && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-cosmic-text"
                >
                  {currentRound.explanation}
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next Round Button */}
        <AnimatePresence>
          {roundResult === 'correct' && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleNextRound}
              className="w-full py-4 rounded-xl font-bold text-sm tracking-wider font-mono
                bg-cosmic-accent/20 border-2 border-cosmic-accent text-cosmic-accent
                hover:bg-cosmic-accent/30 transition-all"
              whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(0,240,255,0.4)' }}
              whileTap={{ scale: 0.98 }}
            >
              {isLastRound ? '🏆 CLAIM VICTORY' : '➡️ NEXT ROUND'}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Success Overlay */}
      <AnimatePresence>
        {phaseCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-cosmic-bg/90 flex items-center justify-center rounded-xl z-20"
          >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-8xl"
              >
                🏆
              </motion.div>
              <h2 className="text-3xl font-bold text-cosmic-success mt-4 glow-text">
                ALL ROUNDS DEFEATED!
              </h2>
              <p className="text-sm text-cosmic-text mt-2">
                Perfect score: {cardBattleCorrect}/3 correct deployments. +300 points
              </p>
              <p className="text-xs text-cosmic-accent mt-1">
                Preparing mission finale...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
