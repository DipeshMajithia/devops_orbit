
import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';

const TARGET_COMMAND = 'ssh -i orbital-key.pem ubuntu@13.233.4.100';
const EXPECTED_PROMPT = 'Type command to connect using orbital-key.pem:';

export default function Phase3HyperTerminal() {
  const { completePhase, addScore, addBadge } = useGameStore();
  const [userInput, setUserInput] = useState('');
  const [connectionProgress, setConnectionProgress] = useState(0); // 0-100
  const [phaseCompleted, setPhaseCompleted] = useState(false);
  const [showBeam, setShowBeam] = useState(false);
  const [typingError, setTypingError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const hasAutoCompleted = useRef(false);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Validate character-by-character as user types
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (phaseCompleted || hasAutoCompleted.current) return;
    
    const newValue = e.target.value;
    setUserInput(newValue);

    // Check character-by-character match
    const targetPrefix = TARGET_COMMAND.substring(0, newValue.length);
    if (newValue !== targetPrefix) {
      // Mismatch detected
      setTypingError(true);
      setTimeout(() => setTypingError(false), 500);
      // Don't update if it doesn't match
      return;
    }
    setTypingError(false);

    // Calculate progress based on match
    const progress = Math.floor((newValue.length / TARGET_COMMAND.length) * 100);
    setConnectionProgress(progress);

    // Show beam animation when there's partial correct input
    if (newValue.length > 0 && newValue === targetPrefix) {
      setShowBeam(true);
    }

    // Check if command is fully correct
    if (newValue === TARGET_COMMAND) {
      setConnectionProgress(100);
      setShowBeam(true);
      hasAutoCompleted.current = true;
      
      // Success!
      setTimeout(() => {
        completePhase(3);
        addScore(200);
        addBadge({
          id: 'terminal-ninja',
          name: 'Terminal Ninja',
          icon: '💻',
          earnedAt: Date.now(),
        });
        setPhaseCompleted(true);
      }, 1200);
    }
  }, [phaseCompleted, completePhase, addScore, addBadge]);

  // Get highlighted portions of the command
  const getColoredCommand = () => {
    const correctPortion = TARGET_COMMAND.substring(0, userInput.length);
    const remainingPortion = TARGET_COMMAND.substring(userInput.length);
    
    return (
      <span className="text-xs font-mono">
        {userInput.split('').map((char, i) => {
          const targetChar = TARGET_COMMAND[i];
          const isMatch = char === targetChar;
          return (
            <span key={i} className={isMatch ? 'text-cosmic-success' : 'text-cosmic-danger'}>
              {char}
            </span>
          );
        })}
        {remainingPortion && (
          <span className="text-cosmic-muted/40">{remainingPortion}</span>
        )}
      </span>
    );
  };

  return (
    <div className="p-6 flex flex-col items-center min-h-[500px]">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-bold text-white mb-2"
      >
        💻 Hyper-Terminal — SSH Connection
      </motion.h2>
      <p className="text-sm text-cosmic-muted mb-6">
        Establish an encrypted bridge to your cloud server.
      </p>

      {/* Connection visualization */}
      <div className="w-full max-w-lg flex items-center justify-between mb-6 relative">
        {/* Local Computer */}
        <motion.div
          className="flex flex-col items-center"
          animate={showBeam ? { y: [0, -5, 0] } : {}}
          transition={{ duration: 1, repeat: showBeam ? Infinity : 0 }}
        >
          <div className="w-16 h-16 bg-cosmic-panel border-2 border-cosmic-accent rounded-xl flex items-center justify-center text-3xl">
            💻
          </div>
          <span className="text-[10px] font-mono text-cosmic-accent mt-2">LOCAL</span>
          <span className="text-[9px] text-cosmic-muted">Orbit Station</span>
        </motion.div>

        {/* Beam/Bridge */}
        <div className="flex-1 mx-4 relative h-16 flex items-center">
          {/* Connection beam */}
          <div className="w-full h-1 bg-cosmic-bg rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cosmic-accent via-cosmic-glow to-cosmic-accent"
              animate={{ width: `${connectionProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          {/* Animated particles in the beam */}
          {showBeam && connectionProgress > 0 && connectionProgress < 100 && (
            <motion.div
              className="absolute top-1/2 -translate-y-1/2"
              animate={{ 
                left: ['0%', `${connectionProgress}%`],
                opacity: [1, 0.5, 1],
              }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              <span className="text-lg">⚡</span>
            </motion.div>
          )}

          {/* Connection percentage */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
            <span className={`text-[10px] font-mono ${
              connectionProgress === 100 ? 'text-cosmic-success' : 'text-cosmic-accent'
            }`}>
              {connectionProgress}%
            </span>
          </div>
        </div>

        {/* Cloud Server */}
        <motion.div
          className="flex flex-col items-center"
          animate={connectionProgress === 100 ? { 
            boxShadow: ['0 0 10px rgba(0,255,136,0.4)', '0 0 25px rgba(0,255,136,0.8)', '0 0 10px rgba(0,255,136,0.4)']
          } : {}}
          transition={{ duration: 1, repeat: connectionProgress === 100 ? Infinity : 0 }}
        >
          <div className={`w-16 h-16 border-2 rounded-xl flex items-center justify-center text-3xl ${
            connectionProgress === 100 
              ? 'bg-cosmic-success/10 border-cosmic-success' 
              : connectionProgress > 0 
                ? 'bg-cosmic-panel border-cosmic-accent/50' 
                : 'bg-cosmic-panel border-cosmic-border'
          }`}>
            ☁️
          </div>
          <span className="text-[10px] font-mono text-cosmic-muted mt-2">REMOTE</span>
          <span className="text-[9px] text-cosmic-muted">13.233.4.100</span>
        </motion.div>
      </div>

      {/* Terminal Window */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-[#0a0a14] border border-cosmic-border rounded-xl overflow-hidden"
      >
        {/* Terminal Header */}
        <div className="bg-cosmic-panel px-4 py-2 flex items-center gap-2 border-b border-cosmic-border">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
          <span className="text-[10px] font-mono text-cosmic-muted ml-2">orbital-station:~$ terminal</span>
        </div>

        {/* Terminal Body */}
        <div 
          ref={terminalRef}
          className="p-4 min-h-[200px] font-mono text-sm terminal-scan"
        >
          {/* SSH Config hint */}
          <div className="text-[10px] text-cosmic-muted mb-3">
            <span className="text-cosmic-accent">orbital-station:~$</span> ssh-connect --status
          </div>
          <div className="text-[10px] text-cosmic-muted mb-4">
            <span className="text-cosmic-warning">[INFO]</span> Key: orbital-key.pem (chmod 400) ✓<br />
            <span className="text-cosmic-warning">[INFO]</span> Target: ubuntu@13.233.4.100:22<br />
            <span className="text-cosmic-accent">[AWAIT]</span> {EXPECTED_PROMPT}
          </div>

          {/* User input line */}
          <div className="flex items-center">
            <span className="text-cosmic-accent mr-2">$</span>
            <div className="flex-1 relative">
              {/* Ghost text (target) */}
              {!userInput && (
                <span className="absolute left-0 text-cosmic-muted/30 pointer-events-none text-xs">
                  ssh -i orbital-key.pem ubuntu...
                </span>
              )}
              {/* Actual input */}
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={handleInputChange}
                disabled={phaseCompleted}
                className={`w-full bg-transparent border-none outline-none text-xs font-mono
                  ${typingError ? 'text-cosmic-danger' : 'text-cosmic-success'}
                  caret-cosmic-accent`}
                placeholder=""
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
              />
            </div>
            {/* Blinking cursor when not typing */}
            {!userInput && !phaseCompleted && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="w-2 h-4 bg-cosmic-accent ml-0.5"
              />
            )}
          </div>

          {/* Typed command display */}
          {userInput && (
            <div className="mt-3 text-xs">
              <span className="text-cosmic-muted">Typing: </span>
              <motion.span
                key={userInput.length}
                initial={{ backgroundColor: 'rgba(0,255,136,0.2)' }}
                animate={{ backgroundColor: 'transparent' }}
                transition={{ duration: 0.3 }}
              >
                {getColoredCommand()}
              </motion.span>
            </div>
          )}

          {/* Error flash */}
          <AnimatePresence>
            {typingError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-2 text-[10px] text-cosmic-danger"
              >
                ⚠️ Syntax mismatch! Check your command.
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success message */}
          {connectionProgress === 100 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3"
            >
              <p className="text-xs text-cosmic-success">
                ✅ SSH connection established successfully!
              </p>
              <p className="text-[10px] text-cosmic-muted mt-1">
                Welcome to Ubuntu 24.04.1 LTS (GNU/Linux 6.8.0-31-generic x86_64)
              </p>
              <p className="text-[10px] text-cosmic-muted">
                ubuntu@ip-13-233-4-100:~$
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-1.5 h-3 bg-cosmic-success ml-0.5 align-middle"
                />
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Success Overlay */}
      <AnimatePresence>
        {phaseCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-cosmic-bg/80 flex items-center justify-center rounded-xl z-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="text-7xl inline-block"
              >
                🌐
              </motion.span>
              <h2 className="text-2xl font-bold text-cosmic-success mt-4 glow-text">
                Connection Established!
              </h2>
              <p className="text-sm text-cosmic-text mt-2">
                SSH session active on ubuntu@13.233.4.100. +200 points
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
