
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { getRandomFailureGif, getRandomSuccessGif } from '../data/gifs';

interface QuizQuestion {
  id: number;
  question: string;
  emoji: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sourcePhase: number;
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: 'Why did you select a specific AWS Region in Phase 1 (Mission Control)?',
    emoji: '🌍',
    options: [
      'To get the coolest regional domain name',
      'To minimize latency by choosing the region closest to users',
      'Because all AWS services are only available in us-east-1',
      'Regions are just for billing — they don\'t affect performance',
    ],
    correctIndex: 1,
    explanation: 'AWS Regions are physically isolated geographic areas. Choosing the closest region to your users reduces latency and improves load times!',
    sourcePhase: 1,
  },
  {
    id: 2,
    question: 'In Phase 2 (The Forge), what file permission did you set for orbital-key.pem and why?',
    emoji: '🔑',
    options: [
      '777 — so anyone can use the key freely',
      '644 — just standard file permissions',
      '400 — owner read-only, because SSH rejects keys with loose permissions',
      '000 — the key encrypts itself automatically',
    ],
    correctIndex: 2,
    explanation: 'SSH strictly requires private keys to have 400 (read-only for owner). Any broader permissions (like 644 or 777) and SSH will refuse to connect!',
    sourcePhase: 2,
  },
  {
    id: 3,
    question: 'What does Nginx do on your EC2 instance (Phase 4: Engine Room)?',
    emoji: '⚙️',
    options: [
      'It\'s a database engine that stores user passwords',
      'It\'s a web server that handles HTTP requests and serves static files or proxies to backends',
      'It replaces the Ubuntu operating system entirely',
      'It blocks all incoming internet traffic by default',
    ],
    correctIndex: 1,
    explanation: 'Nginx is a high-performance web server & reverse proxy. It listens on Port 80, serves static files directly, and can forward dynamic requests to your backend app!',
    sourcePhase: 4,
  },
  {
    id: 4,
    question: 'Why must an S3 bucket name be globally unique and lowercase (Phase 5: Nebula Artifact)?',
    emoji: '🪣',
    options: [
      'Because S3 is just picky about aesthetics',
      'S3 bucket names become part of a global DNS hostname — DNS requires lowercase and uniqueness',
      'Uppercase letters corrupt the stored objects',
      'Only the us-east-1 region enforces this rule',
    ],
    correctIndex: 1,
    explanation: 'Your bucket name becomes http://<bucket>.s3.amazonaws.com. DNS names must be lowercase and globally unique across ALL AWS accounts worldwide!',
    sourcePhase: 5,
  },
  {
    id: 5,
    question: 'You have a Node.js backend API with a PostgreSQL database. Which AWS service should you use to host it?',
    emoji: '🏗️',
    options: [
      'S3 — because it\'s serverless and cheaper',
      'EC2 — because you need a full OS to run Node.js, npm, and connect to databases',
      'Both S3 and EC2 work identically for backends',
      'Neither — you should just use your laptop',
    ],
    correctIndex: 1,
    explanation: 'S3 is for static files (HTML/CSS/JS/images). For dynamic server-side code like Node.js with database access, you need EC2 — a full virtual machine with an OS!',
    sourcePhase: 8,
  },
];

const QUIZ_ROASTS = [
  { text: "Wrong answer, pilot! Read the question carefully! 🤦" },
  { text: "That's not it! Think about what you learned in the mission! 🧠" },
  { text: "Close, but no! The answer is in the debriefing notes! 📚" },
  { text: "Even the AI opponent is laughing at that one! 😂" },
  { text: "Aree bhai! You learned this in the simulation! Recall it! 🤔" },
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

  const TOTAL_QUESTIONS = quizQuestions.length;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [questionResult, setQuestionResult] = useState<'correct' | 'incorrect' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [phaseCompleted, setPhaseCompleted] = useState(false);
  const [shakeOption, setShakeOption] = useState<number | null>(null);
  const [showRoast, setShowRoast] = useState(false);
  const [roast, setRoast] = useState<{ text: string; gifUrl: string } | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  const [localCorrect, setLocalCorrect] = useState(0);
  const [celebrating, setCelebrating] = useState(false);

  const showRoastFor = (text: string) => {
    setRoast({ text, gifUrl: getRandomFailureGif() });
    setShowRoast(true);
    setTimeout(() => setShowRoast(false), 10000);
  };

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex >= TOTAL_QUESTIONS - 1;
  const allQuestionsAnswered = currentQuestionIndex >= TOTAL_QUESTIONS;

  const handleSelectOption = useCallback(
    (optionIndex: number) => {
      if (selectedOption !== null || phaseCompleted) return;
      setSelectedOption(optionIndex);

      const isCorrect = optionIndex === currentQuestion.correctIndex;

      if (isCorrect) {
        setQuestionResult('correct');
        incrementCardBattleCorrect();
        setLocalCorrect((prev) => prev + 1);
        setShowExplanation(true);
        addScore(80);
        setCelebrating(true);
        setTimeout(() => setCelebrating(false), 2000);
      } else {
        setQuestionResult('incorrect');
        setShakeOption(optionIndex);
        addScore(-15);
        setErrorCount((prev) => {
          const newCount = prev + 1;
          if (newCount >= 2) {
            const roastMsg = QUIZ_ROASTS[Math.floor(Math.random() * QUIZ_ROASTS.length)];
            showRoastFor(roastMsg.text);
            return 0;
          }
          return newCount;
        });
        setTimeout(() => {
          setShakeOption(null);
          setSelectedOption(null);
          setQuestionResult(null);
        }, 1000);
      }
    },
    [selectedOption, phaseCompleted, currentQuestion, incrementCardBattleCorrect, addScore],
  );

  const handleNextQuestion = useCallback(() => {
    if (isLastQuestion) {
      // Quiz complete — victory!
      incrementCardBattleRound();
      completePhase(8);
      addScore(200);
      addBadge({
        id: 'cosmic-pilot',
        name: 'Cosmic Cloud Pilot',
        icon: '⚔️',
        earnedAt: Date.now(),
      });
      setPhaseCompleted(true);
    } else {
      incrementCardBattleRound();
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setQuestionResult(null);
      setShowExplanation(false);
    }
  }, [
    isLastQuestion,
    incrementCardBattleRound,
    completePhase,
    addScore,
    addBadge,
  ]);

  return (
    <div className="p-6 flex flex-col items-center min-h-[500px] relative">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-bold text-white mb-1"
      >
        🧠 Cosmic Knowledge Quiz — Mission Recap
      </motion.h2>
      <p className="text-xs text-cosmic-muted mb-4 text-center">
        Question {currentQuestionIndex + 1} of {TOTAL_QUESTIONS} — Prove you mastered all 8 phases!
      </p>

      {/* Progress Dots */}
      <div className="flex gap-2 mb-6">
        {quizQuestions.map((_, idx) => (
          <motion.div
            key={idx}
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-mono ${
              idx < currentQuestionIndex
                ? 'border-cosmic-success bg-cosmic-success/20 text-cosmic-success'
                : idx === currentQuestionIndex
                  ? 'border-cosmic-accent bg-cosmic-accent/20 text-cosmic-accent animate-pulse-glow'
                  : 'border-cosmic-border text-cosmic-muted'
            }`}
          >
            {idx < currentQuestionIndex ? '✓' : idx + 1}
          </motion.div>
        ))}
      </div>

      {/* Quiz Arena */}
      <div className="w-full max-w-lg space-y-5">
        {/* Question Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          key={currentQuestion.id + '-question'}
          className="bg-gradient-to-br from-cosmic-accent/10 to-cosmic-panel/50 border-2 border-cosmic-accent/40 rounded-2xl p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <motion.span
              className="text-3xl"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {currentQuestion.emoji}
            </motion.span>
            <div>
              <p className="text-[10px] font-mono text-cosmic-accent/70">
                RECAP: PHASE {currentQuestion.sourcePhase}
              </p>
              <p className="text-xs text-cosmic-muted">CLIENT QUIZ CHALLENGE</p>
            </div>
          </div>
          <motion.p
            key={currentQuestion.question}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-cosmic-text leading-relaxed font-bold"
          >
            {currentQuestion.question}
          </motion.p>
        </motion.div>

        {/* Answer Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            let borderClass = 'border-cosmic-border hover:border-cosmic-accent/60';
            let bgClass = 'bg-cosmic-panel/30';
            let indicator = null;

            if (selectedOption === idx && questionResult === 'correct') {
              borderClass = 'border-cosmic-success';
              bgClass = 'bg-cosmic-success/10';
              indicator = '✅';
            } else if (selectedOption === idx && questionResult === 'incorrect') {
              borderClass = 'border-cosmic-danger';
              bgClass = 'bg-cosmic-danger/10';
              indicator = '❌';
            }

            const isCorrectAnswer = questionResult === 'incorrect' && idx === currentQuestion.correctIndex;
            if (isCorrectAnswer) {
              borderClass = 'border-cosmic-success/60';
              bgClass = 'bg-cosmic-success/5';
            }

            return (
              <motion.button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={selectedOption !== null || phaseCompleted}
                className={`w-full text-left border-2 rounded-xl px-4 py-3 transition-all duration-300 ${borderClass} ${bgClass} ${
                  shakeOption === idx ? 'animate-shake' : ''
                }`}
                whileHover={!selectedOption ? { scale: 1.02, x: 4 } : {}}
                whileTap={!selectedOption ? { scale: 0.98 } : {}}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full border border-cosmic-border flex items-center justify-center text-xs font-mono text-cosmic-muted flex-shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-xs text-cosmic-text flex-1">{option}</span>
                  {indicator && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-lg flex-shrink-0"
                    >
                      {indicator}
                    </motion.span>
                  )}
                  {isCorrectAnswer && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-lg flex-shrink-0"
                    >
                      ✅
                    </motion.span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Explanation */}
        <AnimatePresence>
          {showExplanation && questionResult === 'correct' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-cosmic-success/10 border border-cosmic-success/30 rounded-xl p-4"
            >
              <p className="text-xs font-mono text-cosmic-success font-bold mb-1">
                ✅ CORRECT! +80 points
              </p>
              <p className="text-xs text-cosmic-text">{currentQuestion.explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next Button */}
        <AnimatePresence>
          {questionResult === 'correct' && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleNextQuestion}
              className="w-full py-4 rounded-xl font-bold text-sm tracking-wider font-mono
                bg-cosmic-accent/20 border-2 border-cosmic-accent text-cosmic-accent
                hover:bg-cosmic-accent/30 transition-all"
              whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(0,240,255,0.4)' }}
              whileTap={{ scale: 0.98 }}
            >
              {isLastQuestion ? '🏆 COMPLETE THE MISSION' : `➡️ NEXT QUESTION (${TOTAL_QUESTIONS - currentQuestionIndex - 1} left)`}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Celebration effects for correct answer */}
        <AnimatePresence>
          {celebrating && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute text-lg"
                  style={{
                    left: `${Math.random() * 90}%`,
                    top: `${Math.random() * 90}%`,
                  }}
                  initial={{ scale: 0, y: 0 }}
                  animate={{
                    scale: [1, 1.5, 0],
                    y: [-30 - Math.random() * 50, -80 - Math.random() * 60],
                    opacity: [1, 0.8, 0],
                  }}
                  transition={{ duration: 1.5 + Math.random(), ease: 'easeOut' }}
                >
                  {['⭐', '🌟', '✨', '💫', '🎯', '🔥'][i % 6]}
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Score Display */}
      <motion.div
        className="fixed bottom-6 right-6 bg-cosmic-dark/90 border border-cosmic-accent/30 rounded-xl px-4 py-2 font-mono text-xs z-10"
        animate={{ borderColor: ['rgba(0,240,255,0.3)', 'rgba(0,240,255,0.7)', 'rgba(0,240,255,0.3)'] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-cosmic-muted">QUIZ SCORE: </span>
        <span className="text-cosmic-success font-bold">{localCorrect}/{currentQuestionIndex + (questionResult === 'correct' ? 0 : 0)}</span>
      </motion.div>

      {/* Victory Overlay */}
      <AnimatePresence>
        {phaseCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-cosmic-bg/90 flex items-center justify-center rounded-xl z-20"
          >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
              <img
                src={getRandomSuccessGif()}
                alt="Success"
                className="w-56 h-56 object-contain rounded-2xl mx-auto mb-3 border-2 border-cosmic-success/50 shadow-[0_0_30px_rgba(0,255,136,0.3)] bg-black/20"
              />
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
                QUIZ COMPLETE!
              </h2>
              <p className="text-lg text-cosmic-accent mt-2 font-mono font-bold">
                {localCorrect}/{TOTAL_QUESTIONS} CORRECT
              </p>
              <p className="text-sm text-cosmic-text mt-1">
                You've proven your cloud deployment mastery! +200 points
              </p>
              <p className="text-xs text-cosmic-muted mt-2">
                The Finale Screen will appear shortly...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ROAST OVERLAY ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showRoast && roast && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200 }}
              className="bg-cosmic-dark/90 border-2 border-cosmic-danger/60 rounded-2xl p-5 max-w-sm w-full shadow-[0_0_30px_rgba(255,51,102,0.4)] pointer-events-auto"
            >
              <div className="mb-3 rounded-xl overflow-hidden border border-cosmic-danger/30">
                <img src={roast.gifUrl} alt="roast" className="w-full h-40 object-contain bg-black/30" />
              </div>
              <p className="text-lg font-bold text-cosmic-danger text-center glow-text">
                {roast.text}
              </p>
              <p className="text-[9px] font-mono text-cosmic-muted text-center mt-2">
                Quiz yourself, pilot! 🧠
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
