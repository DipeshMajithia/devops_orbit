import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';

export default function Phase2Forge() {
  const { completePhase, addScore, addBadge, keyPermission, setKeyPermission } = useGameStore();
  const [selectedOS, setSelectedOS] = useState<string>('');
  const [selectedInstance, setSelectedInstance] = useState<string>('');
  const [forging, setForging] = useState(false);
  const [keyDropped, setKeyDropped] = useState(false);
  const [keyCaught, setKeyCaught] = useState(false);
  const [showChmod, setShowChmod] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [phaseCompleted, setPhaseCompleted] = useState(false);
  const [shakeField, setShakeField] = useState<string | null>(null);
  const keyRef = useRef<HTMLDivElement>(null);

  const correctOS = 'ubuntu';
  const correctInstance = 't2.micro';

  const handleForge = useCallback(() => {
    if (!selectedOS || !selectedInstance) {
      if (!selectedOS) setShakeField('os');
      if (!selectedInstance) setShakeField('instance');
      setTimeout(() => setShakeField(null), 600);
      return;
    }

    if (selectedOS !== correctOS || selectedInstance !== correctInstance) {
      if (selectedOS !== correctOS) setShakeField('os');
      if (selectedInstance !== correctInstance) setShakeField('instance');
      setTimeout(() => setShakeField(null), 600);
      return;
    }

    setForging(true);
    // Simulate forging animation then drop the key
    setTimeout(() => {
      setForging(false);
      setKeyDropped(true);
    }, 2500);
  }, [selectedOS, selectedInstance]);

  const handleCatchKey = useCallback(() => {
    if (keyCaught) return;
    setKeyCaught(true);
    setShowChmod(true);
    addScore(50);
  }, [keyCaught, addScore]);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setSliderValue(val);
    setKeyPermission(val);

    if (val === 400) {
      // Success!
      setTimeout(() => {
        completePhase(2);
        addScore(150);
        addBadge({
          id: 'forge-master',
          name: 'Forge Master',
          icon: '🔨',
          earnedAt: Date.now(),
        });
        setPhaseCompleted(true);
      }, 800);
    }
  }, [setKeyPermission, completePhase, addScore, addBadge]);

  return (
    <div className="p-6 flex flex-col items-center min-h-[500px] relative">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-bold text-white mb-2"
      >
        🔨 The Forge — EC2 Instance Assembly
      </motion.h2>
      <p className="text-sm text-cosmic-muted mb-8">
        Configure your cloud server blueprint and forge an SSH key pair.
      </p>

      {/* Forge Machine */}
      <div className="w-full max-w-lg">
        {/* Dropdown: OS Selection */}
        <div className="mb-4">
          <label className="text-xs font-mono text-cosmic-accent mb-2 block">OPERATING SYSTEM (AMI)</label>
          <motion.select
            value={selectedOS}
            onChange={(e) => { setSelectedOS(e.target.value); setShakeField(null); }}
            className={`w-full bg-cosmic-bg border text-sm p-3 rounded-lg font-mono transition-all
              ${shakeField === 'os' ? 'border-cosmic-danger animate-shake' : 'border-cosmic-border focus:border-cosmic-accent'}
              ${selectedOS === correctOS ? 'border-cosmic-success bg-cosmic-success/5' : ''}
              text-cosmic-text outline-none`}
            animate={shakeField === 'os' ? { x: [0, -4, 4, -4, 0] } : {}}
          >
            <option value="">— Select AMI —</option>
            <option value="ubuntu">Ubuntu Server 24.04 LTS (HVM)</option>
            <option value="amazon-linux">Amazon Linux 2023</option>
            <option value="rhel">Red Hat Enterprise Linux 9</option>
            <option value="windows">Windows Server 2022</option>
          </motion.select>
        </div>

        {/* Dropdown: Instance Type */}
        <div className="mb-6">
          <label className="text-xs font-mono text-cosmic-accent mb-2 block">INSTANCE TYPE</label>
          <motion.select
            value={selectedInstance}
            onChange={(e) => { setSelectedInstance(e.target.value); setShakeField(null); }}
            className={`w-full bg-cosmic-bg border text-sm p-3 rounded-lg font-mono transition-all
              ${shakeField === 'instance' ? 'border-cosmic-danger animate-shake' : 'border-cosmic-border focus:border-cosmic-accent'}
              ${selectedInstance === correctInstance ? 'border-cosmic-success bg-cosmic-success/5' : ''}
              text-cosmic-text outline-none`}
            animate={shakeField === 'instance' ? { x: [0, -4, 4, -4, 0] } : {}}
          >
            <option value="">— Select Instance Type —</option>
            <option value="t2.micro">t2.micro (1 vCPU, 1 GB RAM) ⭐ Free Tier</option>
            <option value="t3.medium">t3.medium (2 vCPU, 4 GB RAM)</option>
            <option value="c5.large">c5.large (2 vCPU, 4 GB RAM, Compute Optimized)</option>
            <option value="m5.xlarge">m5.xlarge (4 vCPU, 16 GB RAM)</option>
          </motion.select>
        </div>

        {/* Forge Button */}
        <motion.button
          onClick={handleForge}
          disabled={forging || phaseCompleted}
          className={`
            w-full py-4 rounded-xl font-bold text-sm tracking-wider font-mono
            transition-all duration-300
            ${forging
              ? 'bg-cosmic-warning/30 text-cosmic-warning cursor-wait'
              : 'bg-cosmic-glow/20 border-2 border-cosmic-glow text-cosmic-glow hover:bg-cosmic-glow/30'
            }
          `}
          whileHover={!forging ? { scale: 1.02, boxShadow: '0 0 30px rgba(123,47,255,0.5)' } : {}}
          whileTap={!forging ? { scale: 0.98 } : {}}
        >
          {forging ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="text-lg"
              >
                ⚙️
              </motion.span>
              FORGING INSTANCE...
            </span>
          ) : (
            '⚡ FORGE INSTANCE'
          )}
        </motion.button>

        {/* Forging Animation Progress */}
        <AnimatePresence>
          {forging && (
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2 }}
              className="h-1 bg-cosmic-warning rounded-full mt-4"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Key Drop Zone */}
      <AnimatePresence>
        {keyDropped && !keyCaught && (
          <motion.div
            ref={keyRef}
            initial={{ y: -300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 10 }}
            className="mt-8 cursor-pointer"
            onClick={handleCatchKey}
          >
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="bg-cosmic-panel border-2 border-cosmic-warning rounded-xl p-5 flex items-center gap-4 hover:border-cosmic-accent transition-colors"
            >
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-4xl"
              >
                🔑
              </motion.span>
              <div>
                <p className="text-sm font-mono text-cosmic-warning font-bold">orbital-key.pem</p>
                <p className="text-[10px] text-cosmic-muted">⬇️ Click to catch & download</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Key Caught - Permission Slider */}
      <AnimatePresence>
        {showChmod && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 w-full max-w-md"
          >
            <div className="bg-cosmic-panel border-2 border-cosmic-success/30 rounded-xl p-6">
              <h3 className="text-sm font-mono text-cosmic-accent mb-1">
                🔐 Set File Permissions: chmod
              </h3>
              <p className="text-xs text-cosmic-muted mb-4">
                SSH requires strict key permissions. Drag slider to <code className="text-cosmic-warning">400</code> (owner read-only).
              </p>

              {/* Slider */}
              <div className="mb-3">
                <input
                  type="range"
                  min="0"
                  max="777"
                  value={sliderValue}
                  onChange={handleSliderChange}
                  className="w-full h-2 bg-cosmic-bg rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-6
                    [&::-webkit-slider-thumb]:h-6
                    [&::-webkit-slider-thumb]:bg-cosmic-accent
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(0,240,255,0.5)]"
                />
              </div>

              {/* Permission Display */}
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-cosmic-muted">chmod</span>
                <motion.span
                  className={`text-3xl font-mono font-bold ${
                    sliderValue === 400 ? 'text-cosmic-success glow-text' :
                    sliderValue > 400 ? 'text-cosmic-danger' :
                    'text-cosmic-warning'
                  }`}
                  animate={sliderValue === 400 ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.5, repeat: sliderValue === 400 ? Infinity : 0 }}
                >
                  {sliderValue.toString().padStart(3, '0')}
                </motion.span>
              </div>

              {/* Permission feedback */}
              <div className="mt-3 h-2 bg-cosmic-bg rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-200 ${
                  sliderValue === 400 ? 'bg-cosmic-success w-full' :
                  sliderValue > 0 && sliderValue < 400 ? 'bg-cosmic-warning' :
                  sliderValue > 400 ? 'bg-cosmic-danger' : ''
                }`} style={{ width: `${Math.min(sliderValue / 4, 100)}%` }} />
              </div>

              <p className="text-[10px] text-cosmic-muted mt-2 text-center">
                {sliderValue === 400 ? '✅ Perfect! Owner read-only — SSH will accept this key.' :
                 sliderValue < 400 ? '⚠️ Too restrictive — key cannot be read at all.' :
                 '🚫 Too permissive! SSH will REJECT this key for security.'}
              </p>
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
            className="absolute inset-0 bg-cosmic-bg/80 flex items-center justify-center rounded-xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <span className="text-7xl">🔑</span>
              <h2 className="text-2xl font-bold text-cosmic-success mt-4 glow-text">
                Key Forged!
              </h2>
              <p className="text-sm text-cosmic-text mt-2">
                orbital-key.pem secured with chmod 400. +200 points
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
