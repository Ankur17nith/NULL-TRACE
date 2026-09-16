// ============================================================
// NULL//TRACE — useTimer hook
// Formatted time display from game state
// ============================================================

import { useMemo } from 'react';
import { useGameStore } from '../state/gameStore';
import { formatTime } from '../utils/formatters';

export function useTimer() {
  const timeRemaining = useGameStore(s => s.mission.timeRemaining);
  const totalTime = useGameStore(s => s.mission.totalTime);

  const formatted = useMemo(() => formatTime(timeRemaining), [timeRemaining]);
  const percent = useMemo(() =>
    totalTime > 0 ? (timeRemaining / totalTime) * 100 : 100,
    [timeRemaining, totalTime]
  );
  const isWarning = timeRemaining <= 60 && timeRemaining > 0;
  const isCritical = timeRemaining <= 30 && timeRemaining > 0;

  return { timeRemaining, totalTime, formatted, percent, isWarning, isCritical };
}

export default useTimer;
