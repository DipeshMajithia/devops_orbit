
import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';

const INSTALL_CMD = 'sudo apt update && sudo apt install nginx';

export default function Phase4EngineRoom() {
  const { completePhase, addScore, addBadge } = useGameStore();
  const [sgRulePlaced, setSgRulePlaced] = useState(false);
  const [draggingOver, setDraggingOver] = useState(false);
  const [terminalInput, setTerminalInput] = useState('');
  const [installProgress, setInstallProgress] = useState(0);
  const [installing, setInstalling] = useState(false);
  const [installDone, setInstallDone] = useState(false);
  const [phaseCompleted, setPhaseCompleted] = useState(false);
  const [terminalVisible, setTerminalVisible] = useState(false);
  const [typingError, setTypingError] = useState(false);
  const terminalInputRef = useRef<HTMLInputElement>(null);
  const hasAutoCompleted = useRef(false);

  // Drag handlers for Security Group
  const handleDragStart = (e: React.DragEvent, item: string) => {
    e.dataTransfer.setData('text/plain', item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggingOver(true);
  };

  const handleDragLeave = () => setDraggingOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggingOver(false);
    const data = e.dataTransfer.getData('text/plain');
    if (data === 'port-80-http' && !sgRulePlaced) {
      setSgRulePlaced(true);
      addScore(75);
      // Show terminal after placing SG rule
      setTimeout(() => setTerminalVisible(true), 600);
    }
  };

  // Terminal validation (like Phase 3)
  const handleTerminalChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (phaseCompleted || installing || installDone || hasAutoCompleted.current) return;
    
    const newValue = e.target.value;
    setTerminalInput(newValue);

    const targetPrefix = INSTALL_CMD.substring(0, newValue.length);
    if (newValue !== targetPrefix) {
      setTypingError(true);
      setTimeout(() => setTypingError(false), 500);
      return;
    }
    setTypingError(false);

    if (newValue === INSTALL_CMD) {
      hasAutoCompleted.current = true;
      // Start simulated installation
      setInstalling(true);
      simulateInstallation();
    }
  }, [phaseCompleted, installing, installDone]);

  const simulateInstallation = () => {
    let progress = 0;
    const steps = [
      { pct: 15, msg: 'Reading package lists...' },
      { pct: 30, msg: 'Building dependency tree...' },
      { pct: 45, msg: 'Reading state information...' },
      { pct: 60, msg: 'The following NEW packages will be installed: nginx' },
      { pct: 75, msg: 'Unpacking nginx (1.24.0-2ubuntu7)...' },
      { pct: 90, msg: 'Setting up nginx (1.24.0-2ubuntu7)...' },
      { pct: 100, msg: 'nginx.service: Unit is running.' },
    ];

    steps.forEach((step, i) => {
      setTimeout(() => {
        setInstallProgress(step.pct);
        if (step.pct === 100) {
          setInstallDone(true);
          addScore(75);
        }
      }, (i + 1) * 700);
    });
  };

  // Auto-focus terminal when visible
  useEffect(() => {
    if (terminalVisible) {
      setTimeout(() => terminalInputRef.current?.focus(), 300);
    }
  }, [terminalVisible]);

  // Check both conditions for phase completion
  useEffect(() => {
    if (sgRulePlaced && installDone && !phaseCompleted) {
      setTimeout(() => {
        completePhase(4);
        addScore(50);
        addBadge({
          id: 'engine-tuner',
          name: 'Engine Tuner',
          icon: '⚙️',
          earnedAt: Date.now(),
        });
        setPhaseCompleted(true);
      }, 1000);
    }
  }, [sgRulePlaced, installDone, phaseCompleted, completePhase, addScore, addBadge]);

  return (
    <div className="p-6 flex flex-col items-center min-h-[500px] relative">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-bold text-white mb-2"
      >
        ⚙️ Engine Room — Nginx & Security Groups
      </motion.h2>
      <p className="text-sm text-cosmic-muted mb-6">
        Configure the firewall and install the web server engine.
      </p>

      {/* Two-part interface */}
      <div className="w-full max-w-2xl grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Security Group Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-cosmic-panel/50 border border-cosmic-border rounded-xl p-4"
        >
          <h3 className="text-xs font-mono text-cosmic-warning mb-3">
            🔥 AWS Security Group — Inbound Rules
          </h3>

          {/* Existing rules */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-[10px] font-mono bg-cosmic-bg/60 px-3 py-2 rounded">
              <span className="text-cosmic-muted">Type</span>
              <span className="text-cosmic-muted">Port</span>
              <span className="text-cosmic-muted">Source</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono bg-cosmic-success/5 border border-cosmic-success/20 px-3 py-2 rounded">
              <span>SSH</span>
              <span>22</span>
              <span>0.0.0.0/0</span>
              <span className="text-cosmic-success">✓</span>
            </div>
            
            {/* Drop Zone for Port 80 */}
            <motion.div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded p-3 min-h-[50px] flex items-center justify-center
                transition-all duration-300
                ${draggingOver ? 'drop-zone-active' : 'border-cosmic-border'}
                ${sgRulePlaced ? 'border-cosmic-success bg-cosmic-success/10' : ''}
              `}
            >
              {sgRulePlaced ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex justify-between text-[10px] font-mono w-full bg-cosmic-success/10 px-3 py-2 rounded"
                >
                  <span>HTTP</span>
                  <span>80</span>
                  <span>0.0.0.0/0</span>
                  <span className="text-cosmic-success">✓</span>
                </motion.div>
              ) : (
                <span className="text-[10px] text-cosmic-muted">
                  🎯 Drag "Port 80 (HTTP)" here
                </span>
              )}
            </motion.div>
          </div>

          {/* Draggable Rule Block */}
          {!sgRulePlaced && (
            <motion.div
              draggable
              onDragStart={(e) => handleDragStart(e, 'port-80-http')}
              className="bg-cosmic-accent/10 border-2 border-cosmic-accent/50 rounded-lg px-4 py-3 cursor-grab active:cursor-grabbing hover:border-cosmic-accent transition-all"
              whileHover={{ scale: 1.03, boxShadow: '0 0 15px rgba(0,240,255,0.3)' }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🌐</span>
                <div>
                  <p className="text-xs font-mono text-cosmic-accent font-bold">Port 80 (HTTP)</p>
                  <p className="text-[9px] text-cosmic-muted">Source: 0.0.0.0/0 (Anywhere)</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Server Engine visualization */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-cosmic-panel/50 border border-cosmic-border rounded-xl p-4 flex flex-col items-center justify-center"
        >
          <h3 className="text-xs font-mono text-cosmic-warning mb-4 text-center">
            SERVER ENGINE STATUS
          </h3>
          
          {/* Engine visual */}
          <motion.div
            className="w-24 h-24 rounded-full border-4 flex items-center justify-center text-4xl relative"
            animate={installDone ? {
              borderColor: ['#00ff88', '#00f0ff', '#00ff88'],
              boxShadow: ['0 0 20px rgba(0,255,136,0.4)', '0 0 40px rgba(0,255,136,0.8)', '0 0 20px rgba(0,255,136,0.4)'],
            } : {
              borderColor: '#1a1a4e',
              boxShadow: '0 0 5px rgba(26,26,78,0.3)',
            }}
            transition={{ duration: 2, repeat: installDone ? Infinity : 0 }}
          >
            {installDone ? '⚡' : '⚙️'}
            
            {/* Orbiting particles when installed */}
            {installDone && (
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <span className="absolute top-0 left-1/2 -translate-x-1/2 text-xs">✦</span>
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs">✦</span>
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xs">✦</span>
                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs">✦</span>
              </motion.div>
            )}
          </motion.div>
          
          <p className={`text-xs font-mono mt-3 ${
            installDone ? 'text-cosmic-success glow-text' : 
            sgRulePlaced ? 'text-cosmic-warning' : 'text-cosmic-muted'
          }`}>
            {installDone ? 'NGINX ACTIVE ✓' : sgRulePlaced ? 'AWAITING INSTALL' : 'OFFLINE'}
          </p>
        </motion.div>
      </div>

      {/* Terminal for Nginx installation */}
      <AnimatePresence>
        {terminalVisible && !phaseCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl"
          >
            <div className="bg-[#0a0a14] border border-cosmic-border rounded-xl overflow-hidden">
              {/* Terminal header */}
              <div className="bg-cosmic-panel px-4 py-2 flex items-center gap-2 border-b border-cosmic-border">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <span className="text-[10px] font-mono text-cosmic-muted ml-2">ubuntu@ip-13-233-4-100:~$</span>
              </div>
              <div className="p-4 min-h-[140px] font-mono text-xs terminal-scan">
                <div className="text-[10px] text-cosmic-muted mb-3">
                  <span className="text-cosmic-accent">ubuntu@server:~$</span> _
                </div>

                {/* Input line */}
                <div className="flex items-center mb-2">
                  <span className="text-cosmic-accent mr-2">$</span>
                  <div className="flex-1 relative">
                    {!terminalInput && !installing && (
                      <span className="absolute left-0 text-cosmic-muted/30 pointer-events-none">
                        sudo apt update && sudo apt install nginx
                      </span>
                    )}
                    <input
                      ref={terminalInputRef}
                      type="text"
                      value={terminalInput}
                      onChange={handleTerminalChange}
                      disabled={installing || installDone}
                      className="w-full bg-transparent border-none outline-none text-xs font-mono text-cosmic-success caret-cosmic-accent"
                      spellCheck={false}
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Typing error */}
                <AnimatePresence>
                  {typingError && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-[10px] text-cosmic-danger">
                      ⚠️ Command mismatch. Type exactly as shown.
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Installation progress */}
                {installing && (
                  <div className="mt-3 space-y-2">
                    <div className="w-full h-1.5 bg-cosmic-bg rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cosmic-accent to-cosmic-success rounded-full"
                        animate={{ width: `${installProgress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <div className="space-y-1">
                      {installProgress >= 15 && <p className="text-[10px] text-cosmic-text">Reading package lists...</p>}
                      {installProgress >= 30 && <p className="text-[10px] text-cosmic-text">Building dependency tree...</p>}
                      {installProgress >= 45 && <p className="text-[10px] text-cosmic-text">Reading state information...</p>}
                      {installProgress >= 60 && <p className="text-[10px] text-cosmic-text">The following NEW packages will be installed: nginx</p>}
                      {installProgress >= 75 && <p className="text-[10px] text-cosmic-text">Unpacking nginx (1.24.0-2ubuntu7)...</p>}
                      {installProgress >= 90 && <p className="text-[10px] text-cosmic-text">Setting up nginx (1.24.0-2ubuntu7)...</p>}
                      {installProgress >= 100 && <p className="text-[10px] text-cosmic-success">✅ nginx.service: active (running)</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Overlay */}
      <AnimatePresence>
        {phaseCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-cosmic-bg/80 flex items-center justify-center rounded-xl z-20"
          >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
              <span className="text-7xl">⚡</span>
              <h2 className="text-2xl font-bold text-cosmic-success mt-4 glow-text">
                Engine Online!
              </h2>
              <p className="text-sm text-cosmic-text mt-2">
                Nginx installed + Port 80 open. The server is live! +200 points
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
