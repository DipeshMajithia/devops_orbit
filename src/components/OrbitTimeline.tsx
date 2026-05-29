import { motion } from 'framer-motion';

interface OrbitTimelineProps {
  currentPhase: number;
  completedPhases: Set<number>;
  phaseNames: Record<number, string>;
  onPhaseClick: (phase: number) => void;
}

const phaseIcons: Record<number, string> = {
  1: '🌍',
  2: '🔨',
  3: '💻',
  4: '⚙️',
  5: '🌟',
  6: '📦',
  7: '🛡️',
  8: '⚔️',
};

export default function OrbitTimeline({ currentPhase, completedPhases, phaseNames, onPhaseClick }: OrbitTimelineProps) {
  return (
    <div className="w-full bg-cosmic-dark border-b border-cosmic-border px-4 py-3 relative overflow-hidden">
      {/* Orbital track line */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cosmic-accent/30 to-transparent" />
      
      <div className="flex justify-between items-center max-w-6xl mx-auto relative">
        {Array.from({ length: 8 }, (_, i) => i + 1).map((phase) => {
          const isCompleted = completedPhases.has(phase);
          const isCurrent = currentPhase === phase;
          const isAccessible = phase === 1 || completedPhases.has(phase - 1);
          
          return (
            <motion.div
              key={phase}
              className="flex flex-col items-center cursor-pointer relative z-10"
              whileHover={isAccessible ? { scale: 1.1 } : {}}
              onClick={() => isAccessible && onPhaseClick(phase)}
            >
              {/* Phase node */}
              <motion.div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold font-mono
                  border-2 transition-all duration-300
                  ${isCompleted ? 'bg-cosmic-success/20 border-cosmic-success text-cosmic-success' : ''}
                  ${isCurrent && !isCompleted ? 'bg-cosmic-accent/20 border-cosmic-accent text-cosmic-accent animate-pulse-glow' : ''}
                  ${!isCompleted && !isCurrent && isAccessible ? 'bg-cosmic-panel border-cosmic-border text-cosmic-muted hover:border-cosmic-accent/50' : ''}
                  ${!isAccessible ? 'bg-cosmic-bg border-cosmic-border/50 text-cosmic-muted/40 cursor-not-allowed' : ''}
                `}
                animate={isCurrent ? {
                  boxShadow: [
                    '0 0 10px rgba(0,240,255,0.4)',
                    '0 0 25px rgba(0,240,255,0.8)',
                    '0 0 10px rgba(0,240,255,0.4)',
                  ],
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-lg">{phaseIcons[phase]}</span>
              </motion.div>

              {/* Phase number */}
              <span className={`
                text-[10px] font-mono mt-1.5 tracking-wider
                ${isCompleted ? 'text-cosmic-success' : ''}
                ${isCurrent ? 'text-cosmic-accent glow-text' : ''}
                ${!isCompleted && !isCurrent ? 'text-cosmic-muted' : ''}
              `}>
                P{phase}
              </span>

              {/* Phase name tooltip */}
              <span className={`
                text-[9px] font-sans mt-0.5 hidden lg:block max-w-[70px] text-center leading-tight
                ${isCompleted ? 'text-cosmic-success/70' : ''}
                ${isCurrent ? 'text-cosmic-accent/80' : ''}
                ${!isCompleted && !isCurrent ? 'text-cosmic-muted/50' : ''}
              `}>
                {phaseNames[phase]}
              </span>

              {/* Completion checkmark */}
              {isCompleted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-cosmic-success rounded-full flex items-center justify-center text-[10px]"
                >
                  ✓
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
