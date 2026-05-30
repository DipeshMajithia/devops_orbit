import { create } from 'zustand';

export interface Badge {
  id: string;
  name: string;
  icon: string;
  earnedAt: number;
}

interface GameState {
  currentPhase: number;
  completedPhases: Set<number>;
  score: number;
  badges: Badge[];
  // Phase-specific state
  selectedRegion: string | null;
  keyPermission: number;
  sshCommand: string;
  bucketName: string;
  uploadedFiles: string[];
  policyTokens: string[];
  cardBattleRounds: number;
  cardBattleCorrect: number;
  
  // Actions
  completePhase: (phase: number) => void;
  goToPhase: (phase: number) => void;
  addScore: (points: number) => void;
  addBadge: (badge: Badge) => void;
  setSelectedRegion: (region: string) => void;
  setKeyPermission: (perm: number) => void;
  setSshCommand: (cmd: string) => void;
  setBucketName: (name: string) => void;
  addUploadedFile: (file: string) => void;
  removeUploadedFile: (file: string) => void;
  setPolicyTokens: (tokens: string[]) => void;
  incrementCardBattleRound: () => void;
  incrementCardBattleCorrect: () => void;
  resetGame: () => void;
}

const initialState = {
  currentPhase: 1,
  completedPhases: new Set<number>(),
  score: 0,
  badges: [],
  selectedRegion: null,
  keyPermission: 0,
  sshCommand: '',
  bucketName: '',
  uploadedFiles: [],
  policyTokens: [],
  cardBattleRounds: 0,
  cardBattleCorrect: 0,
};

export const useGameStore = create<GameState>((set) => ({
  ...initialState,

  completePhase: (phase: number) =>
    set((state) => {
      const newCompleted = new Set(state.completedPhases);
      newCompleted.add(phase);
      const nextPhase = phase < 8 ? phase + 1 : phase;
      return {
        completedPhases: newCompleted,
        currentPhase: nextPhase,
      };
    }),

  goToPhase: (phase: number) =>
    set(() => {
      // Allow free navigation to any phase
      return { currentPhase: phase };
    }),

  addScore: (points: number) =>
    set((state) => ({ score: state.score + points })),

  addBadge: (badge: Badge) =>
    set((state) => ({ badges: [...state.badges, badge] })),

  setSelectedRegion: (region: string) => set({ selectedRegion: region }),

  setKeyPermission: (perm: number) => set({ keyPermission: perm }),

  setSshCommand: (cmd: string) => set({ sshCommand: cmd }),

  setBucketName: (name: string) => set({ bucketName: name }),

  addUploadedFile: (file: string) =>
    set((state) => ({ uploadedFiles: [...state.uploadedFiles, file] })),

  removeUploadedFile: (file: string) =>
    set((state) => ({
      uploadedFiles: state.uploadedFiles.filter((f) => f !== file),
    })),

  setPolicyTokens: (tokens: string[]) => set({ policyTokens: tokens }),

  incrementCardBattleRound: () =>
    set((state) => ({ cardBattleRounds: state.cardBattleRounds + 1 })),

  incrementCardBattleCorrect: () =>
    set((state) => ({ cardBattleCorrect: state.cardBattleCorrect + 1 })),

  resetGame: () => set({ ...initialState, completedPhases: new Set<number>() }),
}));
