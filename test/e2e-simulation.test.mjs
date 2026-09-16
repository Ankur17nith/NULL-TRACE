// ============================================================
// NULL//TRACE — Comprehensive E2E Simulation Test Suite
// Verifies all 5 missions, scoring, objectives, duplicate guards,
// isolation, reset, and safety.
// ============================================================

import assert from 'node:assert';
import AuthenticationPuzzle from '../src/game/puzzles/AuthenticationPuzzle.js';
import RoutingPuzzle from '../src/game/puzzles/RoutingPuzzle.js';
import BinaryPuzzle from '../src/game/puzzles/BinaryPuzzle.js';
import LogAnalysisPuzzle from '../src/game/puzzles/LogAnalysisPuzzle.js';
import InvestigationPuzzle from '../src/game/puzzles/InvestigationPuzzle.js';
import GameEngine from '../src/game/engine/GameEngine.js';
import MissionEngine from '../src/game/engine/MissionEngine.js';
import TerminalEngine from '../src/game/terminal/TerminalEngine.js';

console.log('--- STARTING E2E SIMULATION TESTS ---');

// TEST 1: MISSION 01 — AUTHENTICATION PUZZLE & DUPLICATE PROTECTION
console.log('\n[TEST 1] Mission 01: Authentication Puzzle...');
{
  const auth = new AuthenticationPuzzle();
  assert.strictEqual(auth.type, 'AUTHENTICATION');

  // Wrong attempt
  const wrongRes = auth.attempt({ username: 'admin', password: 'wrongpassword' });
  assert.strictEqual(wrongRes.success, false);
  assert.strictEqual(auth.solved, false);
  assert.strictEqual(auth.mistakes, 1);

  // Correct attempt
  const correctRes = auth.attempt({ username: 'admin', password: 'admin123' });
  assert.strictEqual(correctRes.success, true);
  assert.strictEqual(correctRes.message, 'ACCESS GRANTED');
  assert.strictEqual(auth.solved, true);

  // Duplicate attempt guard
  const dupRes = auth.attempt({ username: 'admin', password: 'admin123' });
  assert.strictEqual(dupRes.success, false);
  assert.strictEqual(dupRes.message, 'Puzzle already completed.');
  // Mistakes should not increment on duplicate attempt
  assert.strictEqual(auth.mistakes, 1);

  console.log('✓ Mission 01 Authentication Passed');
}

// TEST 2: MISSION 02 — ROUTING PUZZLE & RESET
console.log('\n[TEST 2] Mission 02: Routing Puzzle...');
{
  const routing = new RoutingPuzzle();
  assert.strictEqual(routing.type, 'ROUTING');
  assert.strictEqual(routing.source, 'PLAYER');
  assert.strictEqual(routing.destination, 'ANALYSIS');

  // Test building route: PLAYER -> RTR-A -> RTR-B (wrong)
  const path1 = ['PLAYER', 'RTR-A', 'RTR-B'];
  const wrongRouteRes = routing.attempt(path1);
  assert.strictEqual(wrongRouteRes.success, false);
  assert.strictEqual(routing.solved, false);
  assert.strictEqual(routing.mistakes, 1);

  // Correct route: PLAYER -> RTR-A -> RTR-C -> RTR-E -> ANALYSIS
  const correctPath = ['PLAYER', 'RTR-A', 'RTR-C', 'RTR-E', 'ANALYSIS'];
  const correctRouteRes = routing.attempt(correctPath);
  assert.strictEqual(correctRouteRes.success, true);
  assert.strictEqual(routing.solved, true);

  // Duplicate attempt guard
  const dupRouteRes = routing.attempt(correctPath);
  assert.strictEqual(dupRouteRes.success, false);
  assert.strictEqual(dupRouteRes.message, 'Route already established.');
  assert.strictEqual(routing.mistakes, 1);

  console.log('✓ Mission 02 Routing Passed');
}

// TEST 3: MISSION 03 — BINARY LOCK & FRESH STATE
console.log('\n[TEST 3] Mission 03: Binary Puzzle...');
{
  const binary = new BinaryPuzzle();
  assert.strictEqual(binary.type, 'BINARY');

  // Verify ASCII answer
  assert.strictEqual(binary.answer, 'ACCESS');

  // Wrong answer
  const wrongBin = binary.attempt('INCORRECT');
  assert.strictEqual(wrongBin.success, false);
  assert.strictEqual(binary.solved, false);
  assert.strictEqual(binary.mistakes, 1);

  // Correct answer
  const correctBin = binary.attempt('ACCESS');
  assert.strictEqual(correctBin.success, true);
  assert.strictEqual(binary.solved, true);

  // Duplicate guard
  const dupBin = binary.attempt('ACCESS');
  assert.strictEqual(dupBin.success, false);
  assert.strictEqual(dupBin.message, 'Puzzle already completed.');
  assert.strictEqual(binary.mistakes, 1);

  // Fresh retry
  const retryBinary = new BinaryPuzzle();
  assert.strictEqual(retryBinary.solved, false);
  assert.strictEqual(retryBinary.mistakes, 0);

  console.log('✓ Mission 03 Binary Passed');
}

// TEST 4: MISSION 04 — LOG ANALYSIS & DATABASE SECURITY
console.log('\n[TEST 4] Mission 04: Log Analysis / Database...');
{
  const logPuzzle = new LogAnalysisPuzzle();
  assert.strictEqual(logPuzzle.type, 'LOG_ANALYSIS');

  // Wrong answer to Q1
  const wrongQ = logPuzzle.answerQuestion(0, 'XSS');
  assert.strictEqual(wrongQ.success, false);
  assert.strictEqual(logPuzzle.solved, false);
  assert.strictEqual(logPuzzle.mistakes, 1);

  // Q1: SQL Injection
  const q1 = logPuzzle.answerQuestion(0, 'SQL Injection');
  assert.strictEqual(q1.success, true);
  assert.strictEqual(logPuzzle.solved, false); // Not solved yet, only 1 question

  // Q2: ' OR 1=1 --
  const q2 = logPuzzle.answerQuestion(1, "' OR 1=1 --");
  assert.strictEqual(q2.success, true);
  assert.strictEqual(logPuzzle.solved, false);

  // Q3: Parameterized queries
  const q3 = logPuzzle.answerQuestion(2, 'Parameterized queries');
  assert.strictEqual(q3.success, true);
  assert.strictEqual(logPuzzle.solved, true);
  assert.ok(q3.message.includes('ALL QUESTIONS SOLVED'));

  console.log('✓ Mission 04 Database Passed');
}

// TEST 5: MISSION 05 — INVESTIGATION & ISOLATION
console.log('\n[TEST 5] Mission 05: Investigation & DB-02 Isolation...');
{
  const inv = new InvestigationPuzzle();
  assert.strictEqual(inv.type, 'INVESTIGATION');

  // Submit wrong conclusion for one question
  const wrongConcl = inv.submitConclusion('compromised_machine', 'WS-01');
  assert.strictEqual(wrongConcl.success, false);
  assert.strictEqual(inv.mistakes, 1);

  // Submit correct conclusions
  const correctConcl = inv.submitConclusion({
    initialCompromised: 'WS-07',
    entryMethod: 'Default credentials',
    attackRoute: 'WS-07 → DB-02 → CORE',
    currentTarget: 'CORE-SRV'
  });
  assert.strictEqual(correctConcl.success, true);
  assert.strictEqual(inv.phase, 'ISOLATE');

  // Attempt wrong isolation node
  const wrongIso = inv.isolateNode('WS-07');
  assert.strictEqual(wrongIso.success, false);
  assert.strictEqual(inv.mistakes, 2);
  assert.strictEqual(inv.solved, false);

  // Attempt correct isolation target: DB-02
  const correctIso = inv.isolateNode('DB-02');
  assert.strictEqual(correctIso.success, true);
  assert.ok(correctIso.message.includes('CONNECTION TERMINATED'));
  assert.ok(correctIso.message.includes('CORE SYSTEM RESTORED'));
  assert.ok(correctIso.message.includes('TRACE COMPLETE'));
  assert.strictEqual(inv.solved, true);

  // Duplicate isolation attempt
  const dupIso = inv.isolateNode('DB-02');
  assert.strictEqual(dupIso.success, false);
  assert.strictEqual(dupIso.message, 'Target already isolated.');
  // Mistakes should not increment on duplicate isolation
  assert.strictEqual(inv.mistakes, 2);

  console.log('✓ Mission 05 Investigation & Isolation Passed');
}

import useGameStore from '../src/state/gameStore.js';

// TEST 6: GAME ENGINE SCORING & SINGLE-AWARD GUARANTEE
console.log('\n[TEST 6] GameEngine Scoring & Single Evaluation...');
{
  const engine = new GameEngine(useGameStore);
  engine.startMission('mission-01');

  const initialScore = useGameStore.getState().player.totalScore;
  const missionScore1 = useGameStore.getState().mission.score;

  // First puzzle solve
  const solveResult1 = engine.handlePuzzleSolved({ score: 500 });
  assert.strictEqual(solveResult1.awardedScore, 500);
  assert.strictEqual(engine.scoreEngine.breakdown.puzzleBase, 500);

  // Second duplicate puzzle solve in same mission run
  const solveResult2 = engine.handlePuzzleSolved({ score: 500 });
  assert.strictEqual(solveResult2.awardedScore, 0);
  assert.strictEqual(solveResult2.alreadySolved, true);
  // Score MUST NOT increase again!
  assert.strictEqual(engine.scoreEngine.breakdown.puzzleBase, 500);

  // Mission Complete
  const completeRes1 = engine.completeMission();
  assert.strictEqual(completeRes1.alreadyCompleted, undefined);
  const scoreAfterComplete = useGameStore.getState().player.totalScore;

  // Duplicate complete call
  const completeRes2 = engine.completeMission();
  assert.strictEqual(completeRes2.alreadyCompleted, true);
  assert.strictEqual(useGameStore.getState().player.totalScore, scoreAfterComplete);

  console.log('✓ GameEngine Scoring Protection Passed');
}

// TEST 7: TERMINAL SAFETY (NO ARBITRARY SHELL / SQL EXECUTION)
console.log('\n[TEST 7] Simulated Terminal Safety...');
{
  const missionEngine = new MissionEngine();
  const m5 = missionEngine.getMission('mission-05');
  const term = new TerminalEngine({
    missionEngine,
    gameStore: { getState: () => ({ inventory: { clues: [] } }) },
  });
  
  // Safe simulated help
  const helpOut = term.execute('help');
  assert.ok(helpOut.lines.some(line => line.includes('AVAILABLE COMMANDS')));

  // Arbitrary command should be handled safely as unknown command, never executed in shell
  const badOut = term.execute('rm -rf /; DROP TABLE users; eval("alert(1)")');
  assert.ok(badOut.lines.some(line => line.includes('Unknown command')));

  // Check simulated isolate on mission 05
  const inv = new InvestigationPuzzle();
  inv.currentPhase = 2; // ISOLATE phase
  term.registry.ctx.puzzleEngine = {
    getCurrentPuzzle: () => inv,
  };
  const isolateRes = term.execute('isolate DB-02');
  assert.ok(isolateRes.lines.some(line => line.includes('CONNECTION TERMINATED') || line.includes('DB-02')));

  console.log('✓ Terminal Safety Passed');
}

// TEST 8: RETRY & TEMPORARY STATE RESET
console.log('\n[TEST 8] Mission Retry & Temporary State Reset...');
{
  const engine = new GameEngine(useGameStore);
  
  for (let m = 1; m <= 5; m++) {
    const mId = `mission-0${m}`;
    engine.startMission(mId);

    // Initial state after start
    assert.strictEqual(engine.puzzleSolvedThisMission, false);
    assert.strictEqual(engine.missionCompletedThisRun, false);
    assert.strictEqual(useGameStore.getState().mission.status, 'BRIEFING');

    // Simulate solving puzzle
    engine.handlePuzzleSolved({ success: true });
    assert.strictEqual(engine.puzzleSolvedThisMission, true);

    // Now restart/retry the mission
    engine.startMission(mId);
    // Verified: puzzleSolvedThisMission reset, status back to BRIEFING
    assert.strictEqual(engine.puzzleSolvedThisMission, false);
    assert.strictEqual(engine.missionCompletedThisRun, false);
    assert.strictEqual(useGameStore.getState().mission.status, 'BRIEFING');
    assert.strictEqual(useGameStore.getState().inventory.clues.length, 0);

    const puzzle = engine.puzzleEngine.getCurrentPuzzle();
    if (puzzle) {
      assert.strictEqual(puzzle.solved, false);
      assert.strictEqual(puzzle.attempts, 0);
      assert.strictEqual(puzzle.mistakes, 0);
    }
  }

  console.log('✓ Mission Retry & Reset across all 5 missions Passed');
}

// TEST 9: PROGRESSION & PERMANENCE AUDIT
console.log('\n[TEST 9] Progression & Global Data Preservation...');
{
  useGameStore.getState().completeMission('mission-01', 1200);

  assert.ok(useGameStore.getState().progress.unlockedMissions.includes('mission-02'));
  assert.ok(useGameStore.getState().progress.completedMissions.includes('mission-01'));

  // Starting mission 01 again (retry) must NOT wipe unlockedMissions or completedMissions
  const engine = new GameEngine(useGameStore);
  engine.startMission('mission-01');

  assert.ok(useGameStore.getState().progress.unlockedMissions.includes('mission-02'));
  assert.ok(useGameStore.getState().progress.completedMissions.includes('mission-01'));

  console.log('✓ Progression & Global Data Preservation Passed');
}

console.log('\n=============================================');
console.log('ALL E2E SIMULATION AUDIT CHECKS PASSED (9/9)!');
console.log('=============================================');
