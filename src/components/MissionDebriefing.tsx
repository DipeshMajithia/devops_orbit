
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';

// ── SECTION TYPES ───────────────────────────────────────────────────────────
// Pattern A: phases 2-4 pass { title, items, icon }
interface LegacySection {
  title: string;
  items: string[];
  icon: string;
}

// Pattern C: internal format { label, colorClass, borderClass, content }
interface DebriefingSection {
  label: string;
  colorClass: string;
  borderClass: string;
  content: string;
}

// ── PROPS: union of both patterns ────────────────────────────────────────────
export interface MissionDebriefingProps {
  // Visibility (Pattern B uses isOpen, others pass via conditional render)
  isOpen?: boolean;
  visible?: boolean;

  // Phase identity
  phase?: number;
  phaseNumber?: number;
  phaseTitle?: string;
  title?: string;
  emoji?: string;

  // Badge + score (phases 2-4 use badge object, 5-8 skip)
  badge?: { id: string; name: string; icon: string };
  badgeName?: string;
  badgeIcon?: string;
  score?: number;

  // Next phase label
  nextPhaseName?: string;

  // Pattern A sections: phases 2-4
  sections?: (LegacySection | DebriefingSection)[];
  // Pattern B sections: phases 5-8
  completedSteps?: string[];
  realWorldImpact?: string;
  keyTakeaways?: string[];
  awsComparison?: string;

  // Callback
  onContinue?: () => void;
  onComplete?: () => void;
}

// ── COLOR PALETTE FOR AUTO-COLORED SECTIONS ──────────────────────────────────
const PALETTE = [
  { colorClass: 'bg-cosmic-accent/10', borderClass: 'border border-cosmic-accent/40' },
  { colorClass: 'bg-cosmic-success/10', borderClass: 'border border-cosmic-success/40' },
  { colorClass: 'bg-cosmic-warning/10', borderClass: 'border border-cosmic-warning/40' },
  { colorClass: 'bg-cosmic-info/10', borderClass: 'border border-cosmic-info/40' },
  { colorClass: 'bg-cosmic-purple/10', borderClass: 'border border-cosmic-purple/40' },
  { colorClass: 'bg-cosmic-danger/10', borderClass: 'border border-cosmic-danger/40' },
];

function isLegacySection(s: LegacySection | DebriefingSection): s is LegacySection {
  return 'items' in s && Array.isArray((s as LegacySection).items);
}

function normalizeSections(sections: (LegacySection | DebriefingSection)[]): DebriefingSection[] {
  return sections.map((s, i) => {
    if (isLegacySection(s)) {
      return {
        label: `${s.icon || ''} ${s.title}`.trim(),
        colorClass: PALETTE[i % PALETTE.length].colorClass,
        borderClass: PALETTE[i % PALETTE.length].borderClass,
        content: `<ul>${s.items.map((item) => `<li>• ${item}</li>`).join('')}</ul>`,
      };
    }
    return s;
  });
}

export default function MissionDebriefing(props: MissionDebriefingProps) {
  const {
    isOpen,
    visible: visibleProp,
    phase: phaseA,
    phaseNumber,
    phaseTitle: phaseTitleA,
    title,
    emoji = '🛰️',
    badge,
    badgeName: badgeNameA,
    badgeIcon: badgeIconA,
    score = 0,
    nextPhaseName,
    sections: rawSections = [],
    completedSteps = [],
    realWorldImpact,
    keyTakeaways = [],
    awsComparison,
    onContinue,
    onComplete,
  } = props;

  // ── NORMALIZE ──────────────────────────────────────────────────────────
  const visible = isOpen ?? visibleProp ?? true; // default true: phases 2-4 mount conditionally
  const phase = phaseA ?? phaseNumber ?? 0;
  const phaseTitle = phaseTitleA ?? title ?? '';
  const badgeName = badgeNameA ?? badge?.name ?? '';
  const badgeIcon = badgeIconA ?? badge?.icon ?? '';
  const nextLabel = nextPhaseName ?? `Phase ${phase + 1}`;
  const handleContinue = onContinue ?? onComplete ?? (() => {});

  // Build sections from either Pattern A or Pattern B
  const sections: DebriefingSection[] = (() => {
    if (rawSections.length > 0) return normalizeSections(rawSections);

    // Pattern B: auto-generate from completedSteps, impact, takeaways, comparison
    const result: DebriefingSection[] = [];
    if (completedSteps.length > 0) {
      result.push({
        label: '✅ Completed Steps',
        colorClass: 'bg-cosmic-success/10',
        borderClass: 'border border-cosmic-success/40',
        content: `<ul>${completedSteps.map((s) => `<li>• ${s}</li>`).join('')}</ul>`,
      });
    }
    if (realWorldImpact) {
      result.push({
        label: '🌍 Real-World Impact',
        colorClass: 'bg-cosmic-accent/10',
        borderClass: 'border border-cosmic-accent/40',
        content: realWorldImpact,
      });
    }
    if (keyTakeaways.length > 0) {
      result.push({
        label: '🧠 Key Takeaways',
        colorClass: 'bg-cosmic-warning/10',
        borderClass: 'border border-cosmic-warning/40',
        content: `<ul>${keyTakeaways.map((t) => `<li>• ${t}</li>`).join('')}</ul>`,
      });
    }
    if (awsComparison) {
      result.push({
        label: '⚡ AWS Service Comparison',
        colorClass: 'bg-cosmic-purple/10',
        borderClass: 'border border-cosmic-purple/40',
        content: awsComparison,
      });
    }
    return result;
  })();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-cosmic-bg/90 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.8, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 40 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="bg-cosmic-dark border-2 border-cosmic-success/40 rounded-2xl p-6 sm:p-8 max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-[0_0_40px_rgba(0,255,136,0.15)]"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-4xl"
              >
                {emoji}
              </motion.span>
              <div>
                <h2 className="text-lg font-bold text-cosmic-success glow-text">
                  Mission Debriefing — Phase {phase}
                </h2>
                <p className="text-xs text-cosmic-muted font-mono">{phaseTitle}</p>
              </div>
            </div>

            {/* Key learnings */}
            <div className="space-y-4 mb-5">
              {sections.map((section, i) => (
                <div key={i} className={`${section.colorClass} ${section.borderClass} rounded-lg p-3`}>
                  <p className="text-xs font-mono font-bold mb-1">{section.label}</p>
                  <p
                    className="text-xs text-cosmic-text leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </div>
              ))}
            </div>

            {/* Score & badge */}
            {badgeName && (
              <div className="flex items-center justify-between mb-5 bg-cosmic-panel/30 border border-cosmic-border rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{badgeIcon}</span>
                  <span className="text-xs font-mono text-cosmic-text">Badge earned:</span>
                  <span className="text-xs font-mono text-cosmic-accent font-bold">{badgeName}</span>
                </div>
                {score > 0 && (
                  <div className="text-right">
                    <span className="text-sm font-mono text-cosmic-warning font-bold">+{score} pts</span>
                  </div>
                )}
              </div>
            )}

            {/* Continue button */}
            <motion.button
              onClick={handleContinue}
              className="w-full py-4 rounded-xl font-bold text-sm tracking-wider font-mono
                bg-cosmic-success/20 border-2 border-cosmic-success text-cosmic-success
                hover:bg-cosmic-success/30 transition-all"
              whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(0,255,136,0.3)' }}
              whileTap={{ scale: 0.98 }}
            >
              🚀 PROCEED TO {nextLabel.toUpperCase()}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { MissionDebriefing };
