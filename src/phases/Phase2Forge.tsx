
import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { getRandomFailureGif, getRandomSuccessGif } from '../data/gifs';
import { MissionDebriefing } from '../components/MissionDebriefing';

// ─── CUSTOM ROASTS FOR PHASE 2 ──────────────────────────────────────────────
const OS_ROASTS = [
  { text: "Windows Server? Bhai, tu student hai ya Bill Gates ka beta? 💸" },
  { text: "You sure you can afford that? Free Tier yaad rakh! 🤑" },
  { text: "Paise hain toh sab mumkin hai... but you're broke, remember? 😂" },
  { text: "That OS costs money! Pick the FREE one, chatur! 🙏" },
  { text: "Budget check failed! Tumhare paas sirf ₹0 hain! 💸" },
  { text: "Luxury OS select kiya? Itna paisa hai toh mujhe bhi de do! 😆" },
  { text: "Free Tier master race! Jo free mein nahi milta, wo hum nahi lete! ✊" },
];

// ─── OS CARD DATA (funny descriptions + GIF hints) ──────────────────────────
const OS_OPTIONS = [
  {
    id: 'ubuntu',
    name: 'Ubuntu Server 24.04',
    tagline: 'The People\'s Champ',
    description: 'FREE. Open-source. Works with everything. Runs on potatoes. Perfect for students with zero budget.',
    emoji: '🐧',
    gifHint: 'https://i.gifer.com/4j.gif', // happy dancing
    isFree: true,
  },
  {
    id: 'amazon-linux',
    name: 'Amazon Linux 2023',
    tagline: 'Corporate Cookie',
    description: 'Also free... but optimized for AWS only. Feels like you\'re wearing a suit.',
    emoji: '📦',
    gifHint: 'https://i.gifer.com/Af6V.gif',
    isFree: true, // free but not the best choice, still correct-ish? Let's make Ubuntu only correct
  },
  {
    id: 'windows',
    name: 'Windows Server 2022',
    tagline: 'The GUI Overlord',
    description: 'Paid license. Uses 2GB RAM just to show you a desktop. A student\'s worst financial decision.',
    emoji: '🪟',
    gifHint: 'https://i.gifer.com/61F.gif', // loading forever
    isFree: false,
  },
  {
    id: 'rhel',
    name: 'Red Hat Enterprise Linux',
    tagline: 'Enterprise Bling',
    description: 'Starts at $349/year. Has "Enterprise" in the name. Your wallet just cried.',
    emoji: '🎩',
    gifHint: 'https://i.gifer.com/3Px1.gif',
    isFree: false,
  },
];

const INSTANCE_OPTIONS = [
  {
    id: 't2.micro',
    name: 't2.micro',
    specs: '1 vCPU · 1 GB RAM',
    tagline: 'FREE TIER HERO',
    emoji: '🆓',
    gifHint: 'https://i.gifer.com/ICU.gif',
    isFree: true,
  },
  {
    id: 't3.medium',
    name: 't3.medium',
    specs: '2 vCPU · 4 GB RAM',
    tagline: '~$30/month',
    emoji: '💰',
    gifHint: 'https://i.gifer.com/3Px1.gif',
    isFree: false,
  },
  {
    id: 'c5.large',
    name: 'c5.large',
    specs: '2 vCPU · 4 GB RAM',
    tagline: '~$61/month (Compute Optimized)',
    emoji: '⚡',
    gifHint: 'https://i.gifer.com/61F.gif',
    isFree: false,
  },
  {
    id: 'm5.xlarge',
    name: 'm5.xlarge',
    specs: '4 vCPU · 16 GB RAM',
    tagline: '~$192/month (Are you sure?)',
    emoji: '🚀',
    gifHint: 'https://i.gifer.com/3Px1.gif',
    isFree: false,
  },
];

export default function Phase2Forge() {
  const { completePhase, addScore, addBadge, keyPermission, setKeyPermission } = useGameStore();
  const [step, setStep] = useState<'os' | 'instance' | 'forge' | 'key_catch' | 'chmod' | 'completed'>('os');
  const [selectedOS, setSelectedOS] = useState<string>('');
  const [selectedInstance, setSelectedInstance] = useState<string>('');
  const [shakeCard, setShakeCard] = useState<string | null>(null);
  const [roast, setRoast] = useState<{ text: string; gifUrl: string } | null>(null);
  const [showRoast, setShowRoast] = useState(false);
  const [successGif, setSuccessGif] = useState<string>('');
  const [forging, setForging] = useState(false);
  const [keyDropped, setKeyDropped] = useState(false);
  const [keyCaught, setKeyCaught] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [showDebriefing, setShowDebriefing] = useState(false);
  const keyRef = useRef<HTMLDivElement>(null);

  const showRoastFor = (text: string) => {
    const gifUrl = getRandomFailureGif();
    setRoast({ text, gifUrl });
    setShowRoast(true);
    setTimeout(() => setShowRoast(false), 10000);
  };

  // ── OS Selection ───────────────────────────────────────────────────────
  const handleOSSelect = (osId: string, isFree: boolean) => {
    if (!isFree) {
      setShakeCard(osId);
      setTimeout(() => setShakeCard(null), 600);
      const randomRoast = OS_ROASTS[Math.floor(Math.random() * OS_ROASTS.length)];
      showRoastFor(randomRoast.text);
      return;
    }
    if (osId !== 'ubuntu') {
      // Amazon Linux is free but not the best choice for learning
      setShakeCard(osId);
      setTimeout(() => setShakeCard(null), 600);
      showRoastFor("Amazon Linux is free... but it's too cozy with AWS. Pick Ubuntu, the real hero! 🐧");
      return;
    }
    setSelectedOS(osId);
    setSuccessGif(getRandomSuccessGif());
    setTimeout(() => {
      setStep('instance');
    }, 1500);
  };

  const handleInstanceSelect = (instId: string, isFree: boolean) => {
    if (!isFree) {
      setShakeCard(instId);
      setTimeout(() => setShakeCard(null), 600);
      showRoastFor("Paid instance? Bhai, tu student hai! FREE TIER ka button daba! 🆓");
      return;
    }
    setSelectedInstance(instId);
    setSuccessGif(getRandomSuccessGif());
    setTimeout(() => {
      setStep('forge');
    }, 1000);
  };

  const handleForge = useCallback(() => {
    setForging(true);
    setTimeout(() => {
      setForging(false);
      setKeyDropped(true);
      setStep('key_catch');
    }, 2500);
  }, []);

  const handleCatchKey = useCallback(() => {
    if (keyCaught) return;
    setKeyCaught(true);
    setStep('chmod');
    addScore(50);
  }, [keyCaught, addScore]);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setSliderValue(val);
    setKeyPermission(val);

    if (val === 400) {
      setTimeout(() => {
        setStep('completed');
        setShowDebriefing(true);
      }, 800);
    }
  }, [setKeyPermission, completePhase, addScore, addBadge]);

  // ── Render steps ──────────────────────────────────────────────────────────
  return (
    <div className="p-6 flex flex-col items-center min-h-[500px] relative overflow-hidden">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-bold text-white mb-1"
      >
        🔨 The Forge — EC2 Instance Assembly
      </motion.h2>
      <p className="text-sm text-cosmic-muted mb-6 text-center max-w-xl">
        Pick the best OS & instance type for a student budget. Remember: <strong className="text-cosmic-accent">Free Tier = Best Tier</strong> when you have ₹0.
      </p>

      {/* ── STEP 1: OS Selection Cards ──────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {step === 'os' && (
          <motion.div
            key="os-step"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="w-full max-w-3xl"
          >
            <h3 className="text-sm font-mono text-cosmic-accent mb-4 text-center">
              🖥️ Which OS will power your cloud server?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {OS_OPTIONS.map((os) => {
                const isShaking = shakeCard === os.id;
                return (
                  <motion.button
                    key={os.id}
                    onClick={() => handleOSSelect(os.id, os.isFree)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    animate={isShaking ? { x: [0, -6, 6, -6, 6, 0] } : {}}
                    className={`
                      relative flex flex-col p-4 rounded-xl border-2 text-left transition-all
                      ${os.isFree && os.id === 'ubuntu'
                        ? 'border-cosmic-success bg-cosmic-success/10 hover:shadow-[0_0_20px_rgba(0,255,136,0.2)]'
                        : os.isFree
                          ? 'border-cosmic-warning/50 bg-cosmic-warning/5'
                          : 'border-cosmic-danger/40 bg-cosmic-danger/5 hover:border-cosmic-danger/60'
                      }
                      ${isShaking ? 'animate-shake' : ''}
                    `}
                  >
                    {/* GIF preview */}
                    <div className="w-full h-36 rounded-lg overflow-hidden mb-3 border border-cosmic-border bg-black/30">
                      <img src={os.gifHint} alt={os.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{os.emoji}</span>
                      <span className="text-sm font-bold text-white">{os.name}</span>
                      {os.isFree && (
                        <span className="text-[9px] bg-cosmic-success/20 text-cosmic-success px-1.5 py-0.5 rounded font-mono">
                          FREE
                        </span>
                      )}
                      {!os.isFree && (
                        <span className="text-[9px] bg-cosmic-danger/20 text-cosmic-danger px-1.5 py-0.5 rounded font-mono">
                          ¥¥¥
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-cosmic-muted italic mb-1">"{os.tagline}"</p>
                    <p className="text-[10px] text-cosmic-text leading-relaxed">{os.description}</p>
                  </motion.button>
                );
              })}
            </div>
            <p className="text-center text-[10px] font-mono text-cosmic-muted">
              💡 Hint: Look for the <span className="text-cosmic-success">FREE</span> tag — you're a student, not a startup CEO!
            </p>
          </motion.div>
        )}

        {/* ── STEP 2: Instance Type Cards ──────────────────────────────── */}
        {step === 'instance' && (
          <motion.div
            key="instance-step"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="w-full max-w-3xl"
          >
            <h3 className="text-sm font-mono text-cosmic-accent mb-4 text-center">
              ⚡ Now pick the instance type (hint: find the <span className="text-cosmic-success">FREE TIER</span>)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {INSTANCE_OPTIONS.map((inst) => {
                const isShaking = shakeCard === inst.id;
                return (
                  <motion.button
                    key={inst.id}
                    onClick={() => handleInstanceSelect(inst.id, inst.isFree)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    animate={isShaking ? { x: [0, -5, 5, -5, 5, 0] } : {}}
                    className={`
                      flex flex-col items-center p-3 rounded-xl border-2 text-center transition-all
                      ${inst.isFree
                        ? 'border-cosmic-success bg-cosmic-success/10 hover:shadow-[0_0_20px_rgba(0,255,136,0.2)]'
                        : 'border-cosmic-danger/40 bg-cosmic-danger/5 hover:border-cosmic-danger/60'
                      }
                      ${isShaking ? 'animate-shake' : ''}
                    `}
                  >
                    <img src={inst.gifHint} alt={inst.name} className="w-full h-28 rounded-lg object-contain mb-2 border border-cosmic-border bg-black/30" />
                    <span className="text-2xl">{inst.emoji}</span>
                    <span className="text-xs font-bold text-white mt-1">{inst.name}</span>
                    <span className="text-[9px] text-cosmic-muted">{inst.specs}</span>
                    <span className={`text-[9px] font-mono mt-1 ${inst.isFree ? 'text-cosmic-success' : 'text-cosmic-danger'}`}>
                      {inst.tagline}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Forge Button ─────────────────────────────────────── */}
        {step === 'forge' && (
          <motion.div
            key="forge-step"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md text-center"
          >
            <motion.div className="mb-4">
              <span className="text-5xl">🔨</span>
              <p className="text-sm font-mono text-cosmic-accent mt-2">Ready to forge!</p>
              <p className="text-[10px] text-cosmic-muted">
                {selectedOS.toUpperCase()} on {selectedInstance}
              </p>
            </motion.div>
            <motion.button
              onClick={handleForge}
              disabled={forging}
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
          </motion.div>
        )}

        {/* ── STEP 4: Key Catch ────────────────────────────────────────── */}
        {step === 'key_catch' && (
          <motion.div
            key="key-catch"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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

        {/* ── STEP 5: chmod Slider ─────────────────────────────────────── */}
        {step === 'chmod' && (
          <motion.div
            key="chmod-step"
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
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-cosmic-muted">chmod</span>
                <motion.span
                  className={`text-3xl font-mono font-bold ${sliderValue === 400 ? 'text-cosmic-success glow-text' :
                      sliderValue > 400 ? 'text-cosmic-danger' :
                        'text-cosmic-warning'
                    }`}
                  animate={sliderValue === 400 ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.5, repeat: sliderValue === 400 ? Infinity : 0 }}
                >
                  {sliderValue.toString().padStart(3, '0')}
                </motion.span>
              </div>
              <div className="mt-3 h-2 bg-cosmic-bg rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-200 ${sliderValue === 400 ? 'bg-cosmic-success w-full' :
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

        {/* ── STEP 6: Completed ────────────────────────────────────────── */}
        {step === 'completed' && (
          <motion.div
            key="completed-step"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 text-center"
          >
            <img
              src={getRandomSuccessGif()}
              alt="Success"
              className="w-56 h-56 object-contain rounded-2xl mx-auto mb-3 border-2 border-cosmic-success/50 shadow-[0_0_30px_rgba(0,255,136,0.3)] bg-black/20"
            />
            <span className="text-7xl">🔑</span>
            <h2 className="text-2xl font-bold text-cosmic-success mt-4 glow-text">
              Key Forged!
            </h2>
            <p className="text-sm text-cosmic-text mt-2">
              orbital-key.pem secured with chmod 400. +200 points
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ROAST OVERLAY ──────────────────────────────────────────────── */}
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
              phase={2}
              title="The Forge — EC2 Instance Assembly"
              emoji="🔨"
              badge={{ id: 'forge-master', name: 'Forge Master', icon: '🔨' }}
              score={200}
              sections={[
                {
                  title: '✅ EC2 Instantiation',
                  items: ['AMI: Ubuntu 24.04 LTS (Free Tier eligible)', 'Instance Type: t2.micro (1 vCPU, 1 GB RAM)', 'Root Volume: 8 GB gp3 (30 GB free tier limit)'],
                  icon: '🖥️',
                },
                {
                  title: '🔑 SSH Authentication',
                  items: ['AWS generates an RSA 2048-bit key pair', 'The .pem private key is your only access credential', 'You only get ONE chance to download it from AWS console'],
                  icon: '🔐',
                },
                {
                  title: '⚙️ File Permissions (chmod 400)',
                  items: ['Linux enforces strict file permission checks on SSH keys', 'chmod 400 = Owner read-only (no group/others access)', 'Without this, SSH will reject the key with "permissions are too open"'],
                  icon: '🛡️',
                },
                {
                  title: '📋 Next Steps',
                  items: ['Your EC2 instance is now running in the cloud', 'The public IPv4 address (13.233.4.100) is your gateway', 'Phase 3 will teach you to connect via SSH from your local machine'],
                  icon: '➡️',
                },
              ]}
              onContinue={() => {
                setShowDebriefing(false);
                completePhase(2);
                addScore(150);
                addBadge({
                  id: 'forge-master',
                  name: 'Forge Master',
                  icon: '🔨',
                  earnedAt: Date.now(),
                });
              }}
            />
          )}
        </AnimatePresence>
    </div>
  );
}
