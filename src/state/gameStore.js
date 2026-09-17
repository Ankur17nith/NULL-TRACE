// ============================================================
// NULL//TRACE — Game Store (Zustand)
// Centralized game state with localStorage persistence
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const initialPlayerState = {
  callsign: '',
  score: 0,
  totalScore: 0,
  rank: 'ROOKIE',
  hintsUsed: 0,
  mistakes: 0,
  cluesFound: 0,
};

const initialMissionState = {
  currentMissionId: null,
  currentMissionNumber: 0,
  status: 'IDLE', // IDLE | BRIEFING | IN_PROGRESS | COMPLETED | FAILED
  objectives: [],
  timeRemaining: 0,
  totalTime: 0,
};

const initialProgressState = {
  completedMissions: [],
  unlockedMissions: ['mission-01', 'mission-02', 'mission-03', 'mission-04', 'mission-05'],
  missionScores: {},
  bestScores: {},
  totalPlayTime: 0,
};

const initialSettingsState = {
  difficulty: 'NORMAL',
  soundEnabled: true,
  musicEnabled: true,
  sfxVolume: 0.7,
  musicVolume: 0.3,
  showScanlines: true,
};

export const useGameStore = create(
  persist(
    (set, get) => ({
      // ── State Slices ──────────────────────────────────────
      player: { ...initialPlayerState },
      mission: { ...initialMissionState },
      progress: { ...initialProgressState },
      settings: { ...initialSettingsState },
      inventory: { clues: [], tools: [], keys: [] },
      ui: {
        activePanel: 'terminal', // terminal | network | logs | inventory | hint
        showIntro: true,
        showBriefing: false,
        showResults: false,
        showEducational: false,
        showAchievement: null,
        currentView: 'menu', // menu | game | results
        isPaused: false,
      },
      achievements: [],
      leaderboard: [],
      gameInitialized: false,

      // ── Player Actions ────────────────────────────────────
      setCallsign: (callsign) => set(s => ({
        player: { ...s.player, callsign },
      })),

      addScore: (points) => set(s => ({
        player: { ...s.player, score: s.player.score + points },
      })),

      setScore: (score) => set(s => ({
        player: { ...s.player, score },
      })),

      setTotalScore: (totalScore) => set(s => ({
        player: { ...s.player, totalScore },
      })),

      setRank: (rank) => set(s => ({
        player: { ...s.player, rank },
      })),

      incrementHints: () => set(s => ({
        player: { ...s.player, hintsUsed: s.player.hintsUsed + 1 },
      })),

      incrementMistakes: () => set(s => ({
        player: { ...s.player, mistakes: s.player.mistakes + 1 },
      })),

      incrementCluesFound: () => set(s => ({
        player: { ...s.player, cluesFound: s.player.cluesFound + 1 },
      })),

      resetPlayerMissionStats: () => set(s => ({
        player: { ...s.player, score: 0, hintsUsed: 0, mistakes: 0, cluesFound: 0 },
      })),

      // ── Mission Actions ───────────────────────────────────
      setMission: (missionData) => set({ mission: { ...missionData } }),

      setMissionStatus: (status) => set(s => ({
        mission: { ...s.mission, status },
      })),

      setTimeRemaining: (timeRemaining) => set(s => ({
        mission: { ...s.mission, timeRemaining },
      })),

      setObjectives: (objectives) => set(s => ({
        mission: { ...s.mission, objectives },
      })),

      completeObjective: (objectiveId) => set(s => ({
        mission: {
          ...s.mission,
          objectives: s.mission.objectives.map(o =>
            o.id === objectiveId ? { ...o, completed: true } : o
          ),
        },
      })),

      // ── Progress Actions ──────────────────────────────────
      completeMission: (missionId, score) => set(s => {
        const completed = s.progress.completedMissions.includes(missionId)
          ? s.progress.completedMissions
          : [...s.progress.completedMissions, missionId];

        // Unlock next mission
        const missionNum = parseInt(missionId.split('-')[1]);
        const nextId = `mission-${String(missionNum + 1).padStart(2, '0')}`;
        const unlocked = s.progress.unlockedMissions.includes(nextId)
          ? s.progress.unlockedMissions
          : [...s.progress.unlockedMissions, nextId];

        const bestScores = { ...s.progress.bestScores };
        if (!bestScores[missionId] || score > bestScores[missionId]) {
          bestScores[missionId] = score;
        }

        return {
          progress: {
            ...s.progress,
            completedMissions: completed,
            unlockedMissions: unlocked,
            missionScores: { ...s.progress.missionScores, [missionId]: score },
            bestScores,
          },
        };
      }),

      // ── Inventory Actions ─────────────────────────────────
      addClue: (clue) => set(s => ({
        inventory: {
          ...s.inventory,
          clues: s.inventory.clues.find(c => c.id === clue.id)
            ? s.inventory.clues
            : [...s.inventory.clues, clue],
        },
      })),

      clearInventory: () => set({
        inventory: { clues: [], tools: [], keys: [] },
      }),

      // ── UI Actions ────────────────────────────────────────
      setActivePanel: (panel) => set(s => ({
        ui: { ...s.ui, activePanel: panel },
      })),

      setShowIntro: (show) => set(s => ({
        ui: { ...s.ui, showIntro: show },
      })),

      setShowBriefing: (show) => set(s => ({
        ui: { ...s.ui, showBriefing: show },
      })),

      setShowResults: (show) => set(s => ({
        ui: { ...s.ui, showResults: show },
      })),

      setShowEducational: (show) => set(s => ({
        ui: { ...s.ui, showEducational: show },
      })),

      setShowAchievement: (achievement) => set(s => ({
        ui: { ...s.ui, showAchievement: achievement },
      })),

      setCurrentView: (view) => set(s => ({
        ui: { ...s.ui, currentView: view },
      })),

      setPaused: (isPaused) => set(s => ({
        ui: { ...s.ui, isPaused },
      })),

      // ── Settings Actions ──────────────────────────────────
      setDifficulty: (difficulty) => set(s => ({
        settings: { ...s.settings, difficulty },
      })),

      setSoundEnabled: (enabled) => set(s => ({
        settings: { ...s.settings, soundEnabled: enabled },
      })),

      setMusicEnabled: (enabled) => set(s => ({
        settings: { ...s.settings, musicEnabled: enabled },
      })),

      setSfxVolume: (volume) => set(s => ({
        settings: { ...s.settings, sfxVolume: volume },
      })),

      setMusicVolume: (volume) => set(s => ({
        settings: { ...s.settings, musicVolume: volume },
      })),

      setShowScanlines: (show) => set(s => ({
        settings: { ...s.settings, showScanlines: show },
      })),

      // ── Achievements ──────────────────────────────────────
      unlockAchievement: (achievement) => set(s => ({
        achievements: s.achievements.find(a => a.id === achievement.id)
          ? s.achievements
          : [...s.achievements, { ...achievement, unlockedAt: Date.now() }],
      })),

      // ── Leaderboard ───────────────────────────────────────
      addLeaderboardEntry: (entry) => set(s => {
        const entries = [...s.leaderboard, entry]
          .sort((a, b) => b.score - a.score)
          .slice(0, 20);
        return { leaderboard: entries };
      }),

      // ── Game lifecycle ────────────────────────────────────
      setGameInitialized: (initialized) => set({ gameInitialized: initialized }),

      resetGame: () => set({
        player: { ...initialPlayerState },
        mission: { ...initialMissionState },
        inventory: { clues: [], tools: [], keys: [] },
        ui: {
          activePanel: 'terminal',
          showIntro: true,
          showBriefing: false,
          showResults: false,
          showEducational: false,
          showAchievement: null,
          currentView: 'menu',
          isPaused: false,
        },
      }),

      resetAllProgress: () => set({
        player: { ...initialPlayerState },
        mission: { ...initialMissionState },
        progress: { ...initialProgressState },
        inventory: { clues: [], tools: [], keys: [] },
        achievements: [],
        leaderboard: [],
        ui: {
          activePanel: 'terminal',
          showIntro: true,
          showBriefing: false,
          showResults: false,
          showEducational: false,
          showAchievement: null,
          currentView: 'menu',
          isPaused: false,
        },
      }),
    }),
    {
      name: 'null-trace-save',
      partialize: (state) => ({
        player: { callsign: state.player.callsign, totalScore: state.player.totalScore, rank: state.player.rank },
        progress: state.progress,
        settings: state.settings,
        achievements: state.achievements,
        leaderboard: state.leaderboard,
      }),
    }
  )
);

if (typeof window !== 'undefined') window.useGameStore = useGameStore;

export default useGameStore;
