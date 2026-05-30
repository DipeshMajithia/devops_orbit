
import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { getRandomFailureGif, getRandomSuccessGif } from '../data/gifs';
import { MissionDebriefing } from '../components/MissionDebriefing';

const INSTALL_CMD = 'sudo apt update && sudo apt install nginx';

const TERMINAL_ROASTS = [
  { text: "Bro, you trying to break the server? Type the actual command! 💥" },
  { text: "Nginx won't install itself via telepathy! Focus! 🧘" },
  { text: "Wrong command! Are you summoning a demon instead of Nginx? 👾" },
  { text: "sudo apt-get-clue! It's 'install', not whatever you typed! 🤦" },
  { text: "Aree bhai! Read the instruction, then type! 📖" },
  { text: "Your server is crying. Please stop typing gibberish! 😭" },
];

export default function Phase4EngineRoom() {
  const { completePhase, addScore, addBadge } = useGameStore();
  const [sgRulePlaced, setSgRulePlaced] = useState(false);
  const [draggingOver, setDraggingOver] = useState(false);
  const [terminalInput, setTerminalInput] = useState('');
  const [installProgress, setInstallProgress] = useState(0);
  const [installing, setInstalling] = useState(false);
  const [installDone, setInstallDone] = useState(false);
  const [phaseCompleted, setPhaseCompleted] = useState(false);
  const [showDebriefing, setShowDebriefing] = useState(false);
  const [terminalVisible, setTerminalVisible] = useState(false);
  const [typingError, setTypingError] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [showRoast, setShowRoast] = useState(false);
  const [roast, setRoast] = useState<{ text: string; gifUrl: string } | null>(null);
  const [showNginxExplain, setShowNginxExplain] = useState(false);
  const [nginxFileStep, setNginxFileStep] = useState(0); // 0=hidden, 1=explainer, 2=file-create, 3=file-done
  const terminalInputRef = useRef<HTMLInputElement>(null);
  const hasAutoCompleted = useRef(false);

  const showRoastFor = (text: string) => {
    setRoast({ text, gifUrl: getRandomFailureGif() });
    setShowRoast(true);
    setTimeout(() => setShowRoast(false), 10000);
  };

  // Drag handlers for Security Group
  const handleDragStart = (e: any, item: string) => {
    const de = e as React.DragEvent;
    de.dataTransfer.setData('text/plain', item);
    de.dataTransfer.effectAllowed = 'move';
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
      setErrorCount(prev => {
        const newCount = prev + 1;
        if (newCount >= 3 && newCount % 3 === 0) {
          const randomRoast = TERMINAL_ROASTS[Math.floor(Math.random() * TERMINAL_ROASTS.length)];
          showRoastFor(randomRoast.text);
        }
        return newCount;
      });
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
          // Show Nginx explainer after install completes
          setTimeout(() => setShowNginxExplain(true), 800);
        }
      }, (i + 1) * 700);
    });
  };

  const handleCreateNginxFile = () => {
    setNginxFileStep(1);
    // Simulate file creation animation steps
    setTimeout(() => setNginxFileStep(2), 2000);
    setTimeout(() => {
      setNginxFileStep(3);
      addScore(50);
    }, 3500);
  };

  // Auto-focus terminal when visible
  useEffect(() => {
    if (terminalVisible) {
      setTimeout(() => terminalInputRef.current?.focus(), 300);
    }
  }, [terminalVisible]);

  // Manual trigger — user clicks "Transmit Mission Report" button to open debrief
  const handleOpenDebrief = () => {
    setPhaseCompleted(true);
    setShowDebriefing(true);
  };

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

          <p className={`text-xs font-mono mt-3 ${installDone ? 'text-cosmic-success glow-text' :
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

      {/* ── NGINX EXPLAINER + FILE CREATION ─────────────────────────── */}
      <AnimatePresence>
        {showNginxExplain && !phaseCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl"
          >
            {/* Explainer Card */}
            <motion.div
              className="bg-gradient-to-br from-cosmic-accent/5 to-cosmic-panel/50 border-2 border-cosmic-accent/30 rounded-2xl p-5 mb-4"
              animate={{
                borderColor: ['rgba(0,240,255,0.3)', 'rgba(0,240,255,0.6)', 'rgba(0,240,255,0.3)'],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="flex items-center gap-3 mb-3">
                <motion.span
                  className="text-3xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🌐
                </motion.span>
                <div>
                  <h3 className="text-sm font-bold text-cosmic-accent font-mono">
                    HOW NGINX WORKS
                  </h3>
                  <p className="text-[9px] text-cosmic-muted">A visual breakdown</p>
                </div>
              </div>

              {/* Animated flow diagram */}
              <div className="flex items-center justify-between bg-cosmic-dark/50 rounded-xl p-4 mb-3">
                {/* Client */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex flex-col items-center gap-1"
                >
                  <span className="text-2xl">💻</span>
                  <span className="text-[8px] font-mono text-cosmic-text">CLIENT</span>
                  <span className="text-[7px] text-cosmic-muted">Browser</span>
                </motion.div>

                {/* Arrow 1 */}
                <div className="flex flex-col items-center">
                  <motion.span
                    className="text-cosmic-accent text-lg"
                    animate={{ x: [0, 8, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ➡️
                  </motion.span>
                  <span className="text-[7px] font-mono text-cosmic-accent/70">HTTP :80</span>
                </div>

                {/* Nginx Server */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="flex flex-col items-center gap-1 bg-cosmic-accent/10 border-2 border-cosmic-accent/50 rounded-xl p-3"
                >
                  <motion.span
                    className="text-2xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ⚙️
                  </motion.span>
                  <span className="text-[8px] font-mono text-cosmic-accent font-bold">NGINX</span>
                  <span className="text-[7px] text-cosmic-muted">Reverse Proxy</span>
                </motion.div>

                {/* Arrow 2 */}
                <div className="flex flex-col items-center">
                  <motion.span
                    className="text-cosmic-success text-lg"
                    animate={{ x: [0, 8, 0] }}
                    transition={{ duration: 1, delay: 0.5, repeat: Infinity }}
                  >
                    ➡️
                  </motion.span>
                  <span className="text-[7px] font-mono text-cosmic-success/70">FastCGI</span>
                </div>

                {/* App Backend */}
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col items-center gap-1"
                >
                  <motion.span
                    className="text-2xl"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🖥️
                  </motion.span>
                  <span className="text-[8px] font-mono text-cosmic-text">APP</span>
                  <span className="text-[7px] text-cosmic-muted">Node/Python</span>
                </motion.div>
              </div>

              <div className="space-y-1 text-[9px] text-cosmic-text font-mono">
                <p>🔹 Nginx <span className="text-cosmic-accent">receives</span> HTTP requests on Port 80</p>
                <p>🔹 It <span className="text-cosmic-accent">serves static files</span> (HTML/CSS/JS) directly</p>
                <p>🔹 Or <span className="text-cosmic-accent">proxies requests</span> to your backend application</p>
                <p>🔹 Handles <span className="text-cosmic-accent">thousands of connections</span> efficiently</p>
              </div>
            </motion.div>

            {/* Create Nginx File Button */}
            {nginxFileStep === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <p className="text-xs text-cosmic-muted mb-3 font-mono">
                  Now let's configure Nginx to serve your website!
                </p>
                <motion.button
                  onClick={handleCreateNginxFile}
                  className="px-6 py-3 bg-cosmic-accent/10 border-2 border-cosmic-accent/50 rounded-xl font-mono text-sm text-cosmic-accent hover:bg-cosmic-accent/20 transition-all"
                  whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(0,240,255,0.3)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  📝 CREATE NGINX CONFIG
                </motion.button>
              </motion.div>
            )}

            {/* File Creation Animation */}
            {nginxFileStep >= 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-cosmic-dark/80 border border-cosmic-success/30 rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <motion.span
                    animate={nginxFileStep === 2 ? { rotate: 360 } : {}}
                    transition={{ duration: 1.5, repeat: nginxFileStep === 2 ? Infinity : 0, ease: 'linear' }}
                    className="text-lg"
                  >
                    {nginxFileStep === 2 ? '⚡' : nginxFileStep === 3 ? '✅' : '📄'}
                  </motion.span>
                  <span className="text-xs font-mono text-cosmic-accent font-bold">
                    /etc/nginx/sites-available/orbital-mission
                  </span>
                </div>

                {/* Animated file content writing */}
                <div className="bg-[#0a0a14] border border-cosmic-border rounded-lg p-3 font-mono text-[10px]">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <span className="text-cosmic-accent">server</span> {'{'}
                  </motion.div>
                  {nginxFileStep >= 2 && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="ml-4"
                      >
                        <span className="text-cosmic-glow">listen</span> <span className="text-cosmic-success">80</span>;
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="ml-4"
                      >
                        <span className="text-cosmic-glow">root</span> <span className="text-cosmic-text">/var/www/orbital-mission</span>;
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="ml-4"
                      >
                        <span className="text-cosmic-glow">index</span> <span className="text-cosmic-text">index.html</span>;
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                        className="ml-4"
                      >
                        <span className="text-cosmic-glow">location</span> / {'{'}
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 }}
                        className="ml-8"
                      >
                        <span className="text-cosmic-glow">try_files</span> <span className="text-cosmic-text">$uri $uri/ =404</span>;
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 }}
                        className="ml-4"
                      >
                        {'}'}
                      </motion.div>
                    </>
                  )}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: nginxFileStep >= 2 ? 1.0 : 0.4 }}
                  >
                    {'}'}
                  </motion.div>
                </div>

                {nginxFileStep >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 space-y-1"
                  >
                    <p className="text-[9px] text-cosmic-muted font-mono">
                      <span className="text-cosmic-accent">$</span> sudo ln -s /etc/nginx/sites-available/orbital-mission /etc/nginx/sites-enabled/
                    </p>
                    <p className="text-[9px] text-cosmic-muted font-mono">
                      <span className="text-cosmic-accent">$</span> sudo nginx -t <span className="text-cosmic-success">→ syntax ok</span>
                    </p>
                    <p className="text-[9px] text-cosmic-muted font-mono">
                      <span className="text-cosmic-accent">$</span> sudo systemctl reload nginx
                    </p>
                  </motion.div>
                )}

                {nginxFileStep === 3 && !phaseCompleted && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 text-center space-y-2"
                  >
                    <p className="text-sm font-bold text-cosmic-success font-mono glow-text">
                      🎉 NGINX CONFIGURED & SERVING!
                    </p>
                    <p className="text-[10px] text-cosmic-text">
                      Your website is now live at http://13.233.4.100
                    </p>
                    <p className="text-[9px] text-cosmic-muted italic">
                      Take a moment to explain to your crew what just happened...
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={handleOpenDebrief}
                      className="mt-3 px-6 py-2.5 bg-gradient-to-r from-cosmic-accent/30 to-cosmic-glow/30 border-2 border-cosmic-accent rounded-full
                                 text-sm font-bold font-mono text-cosmic-accent glow-text
                                 hover:from-cosmic-accent/40 hover:to-cosmic-glow/40 hover:shadow-[0_0_25px_rgba(0,240,255,0.5)]
                                 transition-all duration-300 animate-pulse"
                    >
                      📡 TRANSMIT MISSION REPORT
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            )}
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
              <img
                src={getRandomSuccessGif()}
                alt="Success"
                className="w-56 h-56 object-contain rounded-2xl mx-auto mb-3 border-2 border-cosmic-success/50 shadow-[0_0_30px_rgba(0,255,136,0.3)] bg-black/20"
              />
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
                Try again in 10 seconds...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ── MISSION DEBRIEFING ── */}
      <AnimatePresence>
        {showDebriefing && (
          <MissionDebriefing
            phase={4}
            title="The Engine Room — Nginx & Security Groups"
            emoji="⚙️"
            badge={{ id: 'engine-tuner', name: 'Engine Tuner', icon: '⚙️' }}
            score={50}
            sections={[
              {
                title: '🛡️ AWS Security Groups',
                items: ['Security Groups are virtual firewalls around your EC2 instance', 'They control inbound (ingress) and outbound (egress) traffic', 'By default, AWS blocks ALL inbound traffic — Port 80 must be explicitly opened', 'A single rule opened HTTP access from 0.0.0.0/0 (the entire internet)'],
                icon: '🔥',
              },
              {
                title: '📦 apt update & apt install',
                items: ['apt update refreshes the package index from Ubuntu repositories', 'apt install nginx downloads and sets up the Nginx web server', 'sudo grants temporary root privileges for system-wide changes', 'Nginx starts as a systemd service and listens on Port 80'],
                icon: '⬇️',
              },
              {
                title: '🌐 What You Just Built',
                items: ['Your EC2 instance now runs Nginx — a production-grade web server', 'HTTP traffic from anywhere in the world can reach Port 80', 'If you visit http://13.233.4.100 in a browser, you\'ll see the Nginx welcome page', 'This is the traditional "server-based" hosting model (IaaS)'],
                icon: '🏗️',
              },
              {
                title: '📋 Next Steps',
                items: ['EC2 path is now fully operational! You\'ve built a live web server', 'Phase 5 pivots to AWS S3 — a completely serverless approach', 'S3 requires no OS, no package updates, and no firewall rules'],
                icon: '➡️',
              },
            ]}
            onContinue={() => {
              setShowDebriefing(false);
              completePhase(4);
              addScore(50);
              addBadge({
                id: 'engine-tuner',
                name: 'Engine Tuner',
                icon: '⚙️',
                earnedAt: Date.now(),
              });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
