
import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { getRandomFailureGif, getRandomSuccessGif } from '../data/gifs';
import { MissionDebriefing } from '../components/MissionDebriefing';

// Common words that are "already taken" globally
const TAKEN_NAMES = new Set([
  'test', 'website', 'data', 'bucket', 'mybucket', 'demo', 'app',
  'static', 'images', 'files', 'admin', 'storage', 'docs', 'assets',
  'public', 'backup', 'content', 'media', 'logs', 'tmp', 'dev', 'prod',
  'staging', 'main', 'hello', 'www', 'web', 'site', 'root',
]);

// Validation regex: 3-63 chars, lowercase letters, numbers, hyphens. No uppercase, spaces, underscores, or special chars.
const VALID_BUCKET_REGEX = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/;
const IP_FORMAT_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;
const CONSECUTIVE_HYPHENS = /--/;
const HAS_UPPERCASE = /[A-Z]/;
const HAS_SPACE = /\s/;
const HAS_SPECIAL = /[^a-z0-9-]/;

const BUCKET_ROASTS = [
  { text: "UPPERCASE? S3 thinks you're SHOUTING! Lowercase only bhai! 😤" },
  { text: "Spaces in bucket name? It's not a novel, it's a bucket! 📖" },
  { text: "Special characters? S3 bucket names are like passwords — keep it simple! 🔑" },
  { text: "That name is taken globally! You're not special enough! 🌍" },
  { text: "Bro, S3 buckets are global. Someone already stole your name! 😱" },
  { text: "Arre, think unique! Even our interstellar buckets are running out of names! 🛸" },
];

export default function Phase5Nebula() {
  const { completePhase, addScore, addBadge, bucketName, setBucketName } = useGameStore();
  const [inputValue, setInputValue] = useState('');
  const [validating, setValidating] = useState(false);
  const [shakeInput, setShakeInput] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successGlow, setSuccessGlow] = useState(false);
  const [phaseCompleted, setPhaseCompleted] = useState(false);
  const [showDebriefing, setShowDebriefing] = useState(false);
  const [nebulaParticles, setNebulaParticles] = useState<{ x: number; y: number; size: number; delay: number }[]>([]);
  const [errorCount, setErrorCount] = useState(0);
  const [showRoast, setShowRoast] = useState(false);
  const [roast, setRoast] = useState<{ text: string; gifUrl: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const showRoastFor = (text: string) => {
    setRoast({ text, gifUrl: getRandomFailureGif() });
    setShowRoast(true);
    setTimeout(() => setShowRoast(false), 10000);
  };

  // Generate nebula particles on mount
  useEffect(() => {
    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      delay: Math.random() * 3,
    }));
    setNebulaParticles(particles);
  }, []);

  // Live validation
  const validateName = useCallback((name: string) => {
    if (!name) {
      setErrorMessage(null);
      return false;
    }

    // Check uppercase
    if (HAS_UPPERCASE.test(name)) {
      setErrorMessage('❌ Bucket names must be LOWERCASE only. No capital letters allowed.');
      setShakeInput(true);
      setTimeout(() => setShakeInput(false), 500);
      return false;
    }

    // Check spaces
    if (HAS_SPACE.test(name)) {
      setErrorMessage('❌ No spaces allowed in bucket names.');
      setShakeInput(true);
      setTimeout(() => setShakeInput(false), 500);
      return false;
    }

    // Check special characters (only a-z, 0-9, - allowed)
    if (HAS_SPECIAL.test(name)) {
      setErrorMessage('❌ Only lowercase letters, numbers, and hyphens (-) are allowed.');
      setShakeInput(true);
      setTimeout(() => setShakeInput(false), 500);
      return false;
    }

    // Check IP format
    if (IP_FORMAT_REGEX.test(name)) {
      setErrorMessage('❌ Bucket names cannot be formatted as IP addresses.');
      setShakeInput(true);
      setTimeout(() => setShakeInput(false), 500);
      return false;
    }

    // Check consecutive hyphens
    if (CONSECUTIVE_HYPHENS.test(name)) {
      setErrorMessage('❌ No consecutive hyphens (--) allowed.');
      setShakeInput(true);
      setTimeout(() => setShakeInput(false), 500);
      return false;
    }

    // Check length
    if (name.length < 3) {
      setErrorMessage('⚠️ Bucket name must be at least 3 characters.');
      return false;
    }
    if (name.length > 63) {
      setErrorMessage('❌ Bucket name must be at most 63 characters.');
      setShakeInput(true);
      setTimeout(() => setShakeInput(false), 500);
      return false;
    }

    // Check regex
    if (!VALID_BUCKET_REGEX.test(name)) {
      setErrorMessage('❌ Must start and end with a letter or number.');
      setShakeInput(true);
      setTimeout(() => setShakeInput(false), 500);
      return false;
    }

    // Check if "taken"
    const baseWord = name.toLowerCase().replace(/-/g, '');
    if (TAKEN_NAMES.has(baseWord) || TAKEN_NAMES.has(name)) {
      setErrorMessage(`⚠️ "${name}" is already taken globally! Try appending a unique identifier.`);
      setShakeInput(true);
      setTimeout(() => setShakeInput(false), 500);
      return false;
    }

    setErrorMessage(null);
    return true;
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (phaseCompleted) return;
    const val = e.target.value;
    setInputValue(val);
    const isValid = validateName(val);
    if (!isValid && val.length > 0) {
      setErrorCount(prev => {
        const newCount = prev + 1;
        if (newCount >= 3) {
          const roastMsg = BUCKET_ROASTS[Math.floor(Math.random() * BUCKET_ROASTS.length)];
          showRoastFor(roastMsg.text);
          return 0; // reset counter after roast
        }
        return newCount;
      });
    } else if (isValid) {
      setErrorCount(0);
    }
  };

  const handleCreateBucket = useCallback(() => {
    if (phaseCompleted) return;

    if (!inputValue) {
      setErrorMessage('⚠️ Please enter a bucket name.');
      setShakeInput(true);
      setTimeout(() => setShakeInput(false), 500);
      return;
    }

    const isValid = validateName(inputValue);
    if (!isValid) return;

    // All validations pass!
    setValidating(true);
    setBucketName(inputValue);

    setTimeout(() => {
      setValidating(false);
      setSuccessGlow(true);
      addScore(150);

      setTimeout(() => {
        addBadge({
          id: 'nebula-weaver',
          name: 'Nebula Weaver',
          icon: '🌟',
          earnedAt: Date.now(),
        });
        setShowDebriefing(true);
      }, 1500);
    }, 1200);
  }, [inputValue, phaseCompleted, validateName, setBucketName, completePhase, addScore, addBadge]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !phaseCompleted) {
      handleCreateBucket();
    }
  };

  return (
    <div className="p-6 flex flex-col items-center min-h-[500px] relative overflow-hidden">
      {/* Nebula star-birth background */}
      <div className="absolute inset-0 pointer-events-none">
        {nebulaParticles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-cosmic-accent"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
            }}
            animate={{
              opacity: [0.1, 0.8, 0.1],
              scale: [1, 1.8, 1],
            }}
            transition={{
              duration: 2 + p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-bold text-white mb-2 relative z-10"
      >
        🌟 Nebula Artifact — S3 Bucket Creation
      </motion.h2>
      <p className="text-sm text-cosmic-muted mb-6 relative z-10">
        Engineer a globally unique, DNS-compliant bucket name to birth a stable storage star.
      </p>

      {/* Central Nebula orb */}
      <motion.div
        className="relative z-10 w-48 h-48 mb-8 flex items-center justify-center"
        animate={successGlow ? {
          boxShadow: ['0 0 40px rgba(123,47,255,0.4)', '0 0 80px rgba(123,47,255,0.8)', '0 0 40px rgba(123,47,255,0.4)'],
        } : {
          boxShadow: ['0 0 20px rgba(123,47,255,0.2)', '0 0 35px rgba(123,47,255,0.5)', '0 0 20px rgba(123,47,255,0.2)'],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        {/* Orbital rings */}
        <motion.div
          className="absolute w-44 h-44 rounded-full border border-cosmic-glow/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute w-36 h-36 rounded-full border border-cosmic-accent/15"
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />

        {/* Core */}
        <motion.div
          className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl border-2 transition-all duration-700 ${validating
              ? 'bg-cosmic-warning/20 border-cosmic-warning animate-forge-spin'
              : successGlow
                ? 'bg-cosmic-success/20 border-cosmic-success'
                : 'bg-cosmic-glow/10 border-cosmic-glow/50'
            }`}
        >
          {validating ? '⏳' : successGlow ? '🌟' : '💫'}
        </motion.div>
      </motion.div>

      {/* Input Section */}
      <div className="relative z-10 w-full max-w-md">
        <label className="text-xs font-mono text-cosmic-accent mb-2 block">
          BUCKET NAME (globally unique, lowercase, 3-63 chars)
        </label>

        <motion.div
          animate={shakeInput ? { x: [0, -5, 5, -5, 5, 0] } : {}}
          className="relative"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={phaseCompleted || validating}
            placeholder="my-unique-s3-bucket-2024"
            className={`
              w-full bg-cosmic-bg border px-4 py-3 rounded-lg font-mono text-sm outline-none
              transition-all duration-300 cosmic-input
              ${shakeInput ? 'border-cosmic-danger text-cosmic-danger' : ''}
              ${!errorMessage && inputValue.length >= 3
                ? 'border-cosmic-success text-cosmic-success'
                : 'border-cosmic-border text-cosmic-text'}
              ${successGlow ? 'border-cosmic-success bg-cosmic-success/5' : ''}
            `}
            spellCheck={false}
          />

          {/* Real-time character count & validation icon */}
          {inputValue && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <span className={`text-[10px] font-mono ${inputValue.length < 3 || inputValue.length > 63
                  ? 'text-cosmic-danger'
                  : 'text-cosmic-muted'
                }`}>
                {inputValue.length}/63
              </span>
              {!errorMessage && inputValue.length >= 3 && validating === false && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-cosmic-success text-sm"
                >
                  ✓
                </motion.span>
              )}
              {HAS_UPPERCASE.test(inputValue) && (
                <span className="text-cosmic-danger text-xs">🔤</span>
              )}
            </div>
          )}
        </motion.div>

        {/* Validation feedback */}
        <AnimatePresence>
          {errorMessage && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-[10px] mt-2 font-mono text-cosmic-danger"
            >
              {errorMessage}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Validation rules checklist */}
        <div className="mt-4 space-y-1.5">
          {[
            { label: 'All lowercase (a-z)', valid: !/[A-Z]/.test(inputValue) && inputValue.length > 0 },
            { label: 'No spaces', valid: !/\s/.test(inputValue) && inputValue.length > 0 },
            { label: 'Only letters, numbers, hyphens', valid: !/[^a-z0-9-]/.test(inputValue) && inputValue.length > 0 },
            { label: '3-63 characters', valid: inputValue.length >= 3 && inputValue.length <= 63 },
            { label: 'Starts & ends with letter/number', valid: /^[a-z0-9].*[a-z0-9]$/.test(inputValue) },
            { label: 'No consecutive hyphens (--)', valid: !/--/.test(inputValue) && inputValue.length > 0 },
            { label: 'Not a common reserved name', valid: inputValue.length >= 3 && !TAKEN_NAMES.has(inputValue.toLowerCase().replace(/-/g, '')) && !TAKEN_NAMES.has(inputValue) },
          ].map((rule, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px] font-mono">
              <span className={rule.valid ? 'text-cosmic-success' : 'text-cosmic-muted/40'}>
                {rule.valid ? '✅' : '⬜'}
              </span>
              <span className={rule.valid ? 'text-cosmic-text' : 'text-cosmic-muted/40'}>
                {rule.label}
              </span>
            </div>
          ))}
        </div>

        {/* Create Button */}
        <motion.button
          onClick={handleCreateBucket}
          disabled={phaseCompleted || validating || !inputValue || !!errorMessage}
          className={`
            w-full mt-6 py-4 rounded-xl font-bold text-sm tracking-wider font-mono
            transition-all duration-300
            ${validating
              ? 'bg-cosmic-warning/30 text-cosmic-warning cursor-wait'
              : phaseCompleted || !inputValue || errorMessage
                ? 'bg-cosmic-panel/50 text-cosmic-muted/50 cursor-not-allowed border border-cosmic-border'
                : 'bg-cosmic-glow/20 border-2 border-cosmic-glow text-cosmic-glow hover:bg-cosmic-glow/30'
            }
          `}
          whileHover={!phaseCompleted && !validating && inputValue && !errorMessage ? {
            scale: 1.02,
            boxShadow: '0 0 25px rgba(123,47,255,0.5)'
          } : {}}
          whileTap={!phaseCompleted && !validating ? { scale: 0.98 } : {}}
        >
          {validating ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              >
                💫
              </motion.span>
              CREATING BUCKET...
            </span>
          ) : (
            '✨ CREATE S3 BUCKET'
          )}
        </motion.button>
      </div>

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
              <motion.span
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 360],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-7xl inline-block"
              >
                🌟
              </motion.span>
              <h2 className="text-2xl font-bold text-cosmic-success mt-4 glow-text">
                S3 Star Born!
              </h2>
              <p className="text-sm text-cosmic-text mt-2">
                Bucket "{bucketName}" created successfully. +150 points
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
                Try a unique name...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MISSION DEBRIEFING ─────────────────────────────── */}
      <MissionDebriefing
        phaseNumber={5}
        phaseTitle="The Nebula Artifact"
        completedSteps={[
          'Validated S3 bucket naming conventions',
          'Created globally unique bucket name',
        ]}
        realWorldImpact="S3 bucket names must be DNS-compliant (lowercase, no spaces, no special chars) and globally unique across all AWS accounts. Proper naming prevents provisioning failures and is the first step to hosting a static site."
        keyTakeaways={[
          'Bucket names are a global namespace — you compete with every AWS user',
          'Only lowercase letters, numbers, hyphens, and dots (no underscores)',
          'S3 is fundamentally serverless — there is no OS to manage',
        ]}
        awsComparison="Unlike EC2 where you provision virtual servers, S3 requires you to 'claim' a globally unique identifier — similar to registering a domain name. The namespace is shared by all AWS users."
        onComplete={() => {
          setShowDebriefing(false);
          completePhase(5);
        }}
        isOpen={showDebriefing}
      />
    </div>
  );
}
