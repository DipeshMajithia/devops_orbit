import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import OrbitTimeline from './components/OrbitTimeline';
import MissionBriefing from './components/MissionBriefing';
import Phase1RegionSelect from './phases/Phase1RegionSelect';
import Phase2Forge from './phases/Phase2Forge';
import Phase3HyperTerminal from './phases/Phase3HyperTerminal';
import Phase4EngineRoom from './phases/Phase4EngineRoom';
import Phase5Nebula from './phases/Phase5Nebula';
import Phase6TractorBeam from './phases/Phase6TractorBeam';
import Phase7DeflectorShield from './phases/Phase7DeflectorShield';
import Phase8CosmicShowdown from './phases/Phase8CosmicShowdown';
import FinaleScreen from './components/FinaleScreen';
import { useGameStore } from './store/useGameStore';

const phaseComponents: Record<number, React.FC> = {
  1: Phase1RegionSelect,
  2: Phase2Forge,
  3: Phase3HyperTerminal,
  4: Phase4EngineRoom,
  5: Phase5Nebula,
  6: Phase6TractorBeam,
  7: Phase7DeflectorShield,
  8: Phase8CosmicShowdown,
};

const phaseNames: Record<number, string> = {
  1: 'Mission Control',
  2: 'The Forge',
  3: 'Hyper-Terminal',
  4: 'Engine Room',
  5: 'Nebula Artifact',
  6: 'Tractor Beam',
  7: 'Deflector Shield',
  8: 'Cosmic Showdown',
};

function App() {
  const { currentPhase, completedPhases, goToPhase, cardBattleRounds, cardBattleCorrect } = useGameStore();
  const [showFinale, setShowFinale] = useState(false);

  const handlePhaseComplete = useCallback(() => {
    // Phase 8 completion triggers finale
    if (currentPhase === 8 && cardBattleRounds >= 3 && cardBattleCorrect >= 3) {
      setTimeout(() => setShowFinale(true), 1500);
    }
  }, [currentPhase, cardBattleRounds, cardBattleCorrect]);

  // Listen for phase 8 completion
  if (currentPhase === 8 && cardBattleRounds >= 3 && cardBattleCorrect >= 3 && !showFinale) {
    // Don't auto-trigger here - Phase8 component will call completePhase
  }

  const ActivePhaseComponent = phaseComponents[currentPhase] || Phase1RegionSelect;

  return (
    <div className="min-h-screen bg-cosmic-bg stars-bg relative overflow-hidden">
      {/* Ambient background particles */}
      <div className="fixed inset-0 pointer-events-none cosmic-grid opacity-30" />
      
      {/* Top Orbit Timeline */}
      <OrbitTimeline
        currentPhase={currentPhase}
        completedPhases={completedPhases}
        phaseNames={phaseNames}
        onPhaseClick={goToPhase}
      />

      {/* Main Content Area - Split Layout */}
      <div className="flex flex-col lg:flex-row gap-0 px-3 pb-3 pt-2 h-[calc(100vh-140px)]">
        {/* LEFT: Game Canvas (60%) */}
        <div className="w-full lg:w-[60%] bg-cosmic-dark border border-cosmic-border rounded-xl neon-border overflow-hidden relative flex-shrink-0 mb-2 lg:mb-0">
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-cosmic-panel to-transparent flex items-center px-4 z-10">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <span className="text-xs text-cosmic-muted ml-4 font-mono">
              phase_{currentPhase}_canvas.log
            </span>
          </div>
          <div className="pt-10 h-full overflow-y-auto">
            <AnimatePresence mode="wait">
              <ActivePhaseComponent key={currentPhase} />
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT: Mission Briefing (40%) */}
        <div className="w-full lg:w-[40%] bg-cosmic-dark border border-cosmic-border rounded-xl neon-border overflow-hidden lg:ml-2 flex-shrink-0">
          <MissionBriefing phase={currentPhase} phaseName={phaseNames[currentPhase]} />
        </div>
      </div>

      {/* Finale Screen */}
      <AnimatePresence>
        {showFinale && (
          <FinaleScreen onClose={() => setShowFinale(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
