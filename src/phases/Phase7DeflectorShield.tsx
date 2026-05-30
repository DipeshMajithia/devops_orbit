
import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { getRandomSuccessGif } from '../data/gifs';
import { MissionDebriefing } from '../components/MissionDebriefing';

interface JsonToken {
  id: string;
  label: string;
  slot: string; // where it belongs: 'effect', 'principal', 'action'
}

const availableTokens: JsonToken[] = [
  { id: 'allow', label: '"Effect": "Allow"', slot: 'effect' },
  { id: 'principal', label: '"Principal": "*"', slot: 'principal' },
  { id: 'action', label: '"Action": "s3:GetObject"', slot: 'action' },
  { id: 'deny', label: '"Effect": "Deny"', slot: '' }, // incorrect - decoy
  { id: 'specific-principal', label: '"Principal": "user123"', slot: '' }, // incorrect - decoy
  { id: 'list-action', label: '"Action": "s3:ListBucket"', slot: '' }, // incorrect - decoy
];

export default function Phase7DeflectorShield() {
  const { completePhase, addScore, addBadge } = useGameStore();
  const [blockPublicAccess, setBlockPublicAccess] = useState(true);
  const [placedTokens, setPlacedTokens] = useState<Record<string, string>>({});
  const [draggingToken, setDraggingToken] = useState<string | null>(null);
  const [draggingOverSlot, setDraggingOverSlot] = useState<string | null>(null);
  const [phaseCompleted, setPhaseCompleted] = useState(false);
  const [showDebriefing, setShowDebriefing] = useState(false);
  const [vaultOpen, setVaultOpen] = useState(false);
  const [jsonComplete, setJsonComplete] = useState(false);

  // Unused tokens (not yet placed)
  const unusedTokens = availableTokens.filter(
    (t) => !Object.values(placedTokens).includes(t.id)
  );

  // Correct placements
  const correctPlacements: Record<string, string> = {
    effect: 'allow',
    principal: 'principal',
    action: 'action',
  };

  // Check if JSON is correct
  const checkJsonCorrect = useCallback((placements: Record<string, string>) => {
    return (
      placements.effect === 'allow' &&
      placements.principal === 'principal' &&
      placements.action === 'action'
    );
  }, []);

  // Handle toggling Block Public Access
  const handleTogglePublicAccess = useCallback(() => {
    if (phaseCompleted) return;
    setBlockPublicAccess(!blockPublicAccess);
    if (blockPublicAccess) {
      // Opening access
      addScore(50);
      setTimeout(() => setVaultOpen(true), 600);
    }
  }, [blockPublicAccess, phaseCompleted, addScore]);

  // Drag handlers for JSON tokens
  const handleTokenDragStart = (e: any, tokenId: string) => {
    const de = e as React.DragEvent;
    de.dataTransfer.setData('text/plain', tokenId);
    de.dataTransfer.effectAllowed = 'move';
    setDraggingToken(tokenId);
  };

  const handleTokenDragEnd = () => {
    setDraggingToken(null);
    setDraggingOverSlot(null);
  };

  const handleSlotDragOver = (e: React.DragEvent, slot: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggingOverSlot(slot);
  };

  const handleSlotDragLeave = () => {
    setDraggingOverSlot(null);
  };

  const handleSlotDrop = useCallback((e: React.DragEvent, slot: string) => {
    e.preventDefault();
    setDraggingOverSlot(null);
    const tokenId = e.dataTransfer.getData('text/plain');
    
    // Check if token is valid for this slot
    const token = availableTokens.find((t) => t.id === tokenId);
    if (!token || token.slot !== slot) {
      // Wrong placement - shake
      return; // Silently reject (could also shake the slot)
    }

    const newPlacements = { ...placedTokens, [slot]: tokenId };
    setPlacedTokens(newPlacements);
    addScore(25);

    if (checkJsonCorrect(newPlacements)) {
      setJsonComplete(true);
      addScore(100);
      
      // Trigger debriefing instead of completing directly
      setTimeout(() => {
        addBadge({
          id: 'shield-commander',
          name: 'Shield Commander',
          icon: '🛡️',
          earnedAt: Date.now(),
        });
        setShowDebriefing(true);
      }, 1500);
    }
  }, [placedTokens, addScore, checkJsonCorrect, addBadge]);

  // Allow removing placed tokens
  const handleRemoveToken = useCallback((slot: string) => {
    const newPlacements = { ...placedTokens };
    delete newPlacements[slot];
    setPlacedTokens(newPlacements);
    setJsonComplete(false);
  }, [placedTokens]);

  return (
    <div className="p-6 flex flex-col items-center min-h-[500px] relative">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-bold text-white mb-2"
      >
        🛡️ Deflector Shield — S3 Public Access & Policy
      </motion.h2>
      <p className="text-sm text-cosmic-muted mb-6 text-center max-w-lg">
        Disable the security vault lock and craft a public-read bucket policy JSON.
      </p>

      <div className="w-full max-w-2xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Vault / Public Access Toggle */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-cosmic-panel/50 border border-cosmic-border rounded-xl p-5 flex flex-col items-center"
        >
          <h3 className="text-xs font-mono text-cosmic-warning mb-4">
            🔒 BLOCK PUBLIC ACCESS
          </h3>

          {/* Vault Door visualization */}
          <motion.div
            className="w-32 h-32 rounded-full border-4 flex items-center justify-center text-5xl relative mb-6"
            animate={!blockPublicAccess ? {
              borderColor: '#00ff88',
              boxShadow: ['0 0 15px rgba(0,255,136,0.3)', '0 0 40px rgba(0,255,136,0.7)', '0 0 15px rgba(0,255,136,0.3)'],
            } : {
              borderColor: '#ff3366',
              boxShadow: ['0 0 10px rgba(255,51,102,0.3)', '0 0 25px rgba(255,51,102,0.5)', '0 0 10px rgba(255,51,102,0.3)'],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {blockPublicAccess ? '🔒' : '🔓'}
            
            {/* Vault door crack opening animation */}
            {vaultOpen && (
              <motion.div
                className="absolute inset-0 rounded-full"
                initial={{ clipPath: 'inset(0 50% 0 0)' }}
                animate={{ clipPath: 'inset(0 0% 0 50%)' }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
              >
                <div className="w-full h-full rounded-full bg-cosmic-success/10" />
              </motion.div>
            )}
          </motion.div>

          {/* Toggle Switch */}
          <motion.button
            onClick={handleTogglePublicAccess}
            disabled={phaseCompleted}
            className={`
              relative w-20 h-10 rounded-full transition-all duration-500 border-2
              ${blockPublicAccess 
                ? 'bg-cosmic-danger/20 border-cosmic-danger' 
                : 'bg-cosmic-success/20 border-cosmic-success'
              }
            `}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className={`
                absolute top-1 w-7 h-7 rounded-full shadow-lg
                ${blockPublicAccess 
                  ? 'left-1 bg-cosmic-danger' 
                  : 'left-[calc(100%-2rem)] bg-cosmic-success'
                }
              `}
              animate={{ 
                left: blockPublicAccess ? '0.25rem' : 'calc(100% - 2rem)',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            />
          </motion.button>

          <p className={`text-xs font-mono mt-3 font-bold ${
            blockPublicAccess ? 'text-cosmic-danger' : 'text-cosmic-success'
          }`}>
            {blockPublicAccess ? 'Blocked (Default)' : 'Public Access OFF'}
          </p>
          <p className="text-[10px] text-cosmic-muted mt-1 text-center">
            {blockPublicAccess 
              ? 'S3 is secure by default. Toggle to allow public website access.' 
              : 'Bucket is now accessible! Now configure the policy.'
            }
          </p>
        </motion.div>

        {/* RIGHT: JSON Policy Builder */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-cosmic-panel/50 border border-cosmic-border rounded-xl p-5"
        >
          <h3 className="text-xs font-mono text-cosmic-accent mb-4">
            📜 BUCKET POLICY JSON
          </h3>

          {/* JSON Template */}
          <div className="bg-[#0a0a14] rounded-lg p-4 font-mono text-[11px] leading-relaxed terminal-scan">
            <span className="text-cosmic-muted">{'{'}</span><br />
            <span className="text-cosmic-muted">  "Version": "2012-10-17",</span><br />
            <span className="text-cosmic-muted">  "Statement": [{'{'}</span><br />
            <span className="text-cosmic-muted">      "Sid": "PublicReadGetObject",</span><br />
            
            {/* Effect Slot */}
            <span className="text-cosmic-muted">      </span>
            <motion.span
              className={`
                inline-block min-w-[120px] px-2 py-0.5 rounded border text-center
                transition-all duration-200
                ${draggingOverSlot === 'effect' 
                  ? 'border-cosmic-accent bg-cosmic-accent/10 text-cosmic-accent' 
                  : placedTokens.effect 
                    ? 'border-cosmic-success/30 bg-cosmic-success/10 text-cosmic-success' 
                    : 'border-dashed border-cosmic-border text-cosmic-muted/40'
                }
              `}
              onDragOver={(e) => handleSlotDragOver(e, 'effect')}
              onDragLeave={handleSlotDragLeave}
              onDrop={(e) => handleSlotDrop(e, 'effect')}
              onClick={() => placedTokens.effect && handleRemoveToken('effect')}
            >
              {placedTokens.effect 
                ? availableTokens.find((t) => t.id === placedTokens.effect)?.label 
                : '___ EFFECT ___'}
            </motion.span>
            <span className="text-cosmic-muted">,</span><br />
            
            {/* Principal Slot */}
            <span className="text-cosmic-muted">      </span>
            <motion.span
              className={`
                inline-block min-w-[140px] px-2 py-0.5 rounded border text-center
                transition-all duration-200
                ${draggingOverSlot === 'principal' 
                  ? 'border-cosmic-accent bg-cosmic-accent/10 text-cosmic-accent' 
                  : placedTokens.principal 
                    ? 'border-cosmic-success/30 bg-cosmic-success/10 text-cosmic-success' 
                    : 'border-dashed border-cosmic-border text-cosmic-muted/40'
                }
              `}
              onDragOver={(e) => handleSlotDragOver(e, 'principal')}
              onDragLeave={handleSlotDragLeave}
              onDrop={(e) => handleSlotDrop(e, 'principal')}
              onClick={() => placedTokens.principal && handleRemoveToken('principal')}
            >
              {placedTokens.principal 
                ? availableTokens.find((t) => t.id === placedTokens.principal)?.label 
                : '___ PRINCIPAL ___'}
            </motion.span>
            <span className="text-cosmic-muted">,</span><br />
            
            {/* Action Slot */}
            <span className="text-cosmic-muted">      </span>
            <motion.span
              className={`
                inline-block min-w-[140px] px-2 py-0.5 rounded border text-center
                transition-all duration-200
                ${draggingOverSlot === 'action' 
                  ? 'border-cosmic-accent bg-cosmic-accent/10 text-cosmic-accent' 
                  : placedTokens.action 
                    ? 'border-cosmic-success/30 bg-cosmic-success/10 text-cosmic-success' 
                    : 'border-dashed border-cosmic-border text-cosmic-muted/40'
                }
              `}
              onDragOver={(e) => handleSlotDragOver(e, 'action')}
              onDragLeave={handleSlotDragLeave}
              onDrop={(e) => handleSlotDrop(e, 'action')}
              onClick={() => placedTokens.action && handleRemoveToken('action')}
            >
              {placedTokens.action 
                ? availableTokens.find((t) => t.id === placedTokens.action)?.label 
                : '___ ACTION ___'}
            </motion.span>
            <span className="text-cosmic-muted">,</span><br />
            
            <span className="text-cosmic-muted">      "Resource": "arn:aws:s3:::my-bucket/*"</span><br />
            <span className="text-cosmic-muted">  {'}'}]</span><br />
            <span className="text-cosmic-muted">{'}'}</span>
          </div>

          {/* JSON completeness indicator */}
          {jsonComplete && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 bg-cosmic-success/10 border border-cosmic-success/30 rounded-lg p-2 text-center"
            >
              <span className="text-xs font-mono text-cosmic-success">
                ✅ JSON Policy Valid — Forcefield Active!
              </span>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Draggable Token Bank */}
      {vaultOpen && !phaseCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 w-full max-w-2xl"
        >
          <h3 className="text-xs font-mono text-cosmic-warning mb-3 text-center">
            🧩 DRAG JSON TOKENS INTO THE CORRECT SLOTS
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {unusedTokens.map((token) => (
              <motion.div
                key={token.id}
                draggable
                onDragStart={(e) => handleTokenDragStart(e, token.id)}
                onDragEnd={handleTokenDragEnd}
                className={`
                  bg-cosmic-panel/70 border px-4 py-2.5 rounded-lg cursor-grab 
                  active:cursor-grabbing hover:border-cosmic-accent transition-all
                  text-xs font-mono text-cosmic-text
                  ${draggingToken === token.id ? 'opacity-40 border-cosmic-accent' : 'border-cosmic-border'}
                `}
                whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(0,240,255,0.2)' }}
                whileTap={{ scale: 0.97 }}
              >
                {token.label}
              </motion.div>
            ))}
          </div>
          <p className="text-[10px] text-cosmic-muted text-center mt-2">
            Click a filled slot to remove and retry. Decoy tokens are invalid.
          </p>
        </motion.div>
      )}

      {/* Forcefield effect when complete */}
      {jsonComplete && !phaseCompleted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 pointer-events-none"
        >
          <motion.div
            className="absolute inset-0 rounded-xl"
            animate={{
              boxShadow: [
                'inset 0 0 30px rgba(0,255,136,0.2)',
                'inset 0 0 60px rgba(0,255,136,0.4)',
                'inset 0 0 30px rgba(0,255,136,0.2)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      )}

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
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="text-7xl inline-block"
              >
                🛡️
              </motion.span>
              <h2 className="text-2xl font-bold text-cosmic-success mt-4 glow-text">
                Shield Activated!
              </h2>
              <p className="text-sm text-cosmic-text mt-2">
                Public access configured with least-privilege policy. +175 points
              </p>
              <p className="text-[10px] text-cosmic-accent mt-1">
                🌐 Static site endpoint: http://my-bucket.s3-website-region.amazonaws.com
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MISSION DEBRIEFING ─────────────────────────────── */}
      <MissionDebriefing
        phaseNumber={7}
        phaseTitle="The Deflector Shield"
        completedSteps={[
          'Disabled Block Public Access on S3 bucket',
          'Constructed IAM bucket policy with correct principals and actions',
        ]}
        realWorldImpact="S3 is locked down by default. To host a public website, you must explicitly disable the public access block AND attach a bucket policy granting s3:GetObject to all principals. This is a two-step security measure."
        keyTakeaways={[
          'Block Public Access is ON by default for security',
          'Bucket policies use JSON with Effect, Principal, and Action',
          'Least privilege: only grant s3:GetObject, nothing else',
        ]}
        awsComparison="EC2 instances require Security Group rules (firewall), while S3 requires bucket policies (IAM-level). Both are defense-in-depth layers, but operate at different levels of the AWS stack."
        onComplete={() => {
          setShowDebriefing(false);
          completePhase(7);
        }}
        isOpen={showDebriefing}
      />
    </div>
  );
}
