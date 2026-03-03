import { useEffect, useState } from 'react';
import { useScreenState } from './hooks/useScreenState.js';
import { QuestionHeader } from './components/QuestionHeader.js';
import { TeamPanel } from './components/TeamPanel.js';
import { AnswerGrid } from './components/AnswerGrid.js';
import { StrikeOverlay } from './components/StrikeOverlay.js';
import { StealOverlay } from './components/StealOverlay.js';
import { ReverseBoard } from './components/ReverseBoard.js';
import { BigGameBoard } from './components/BigGameBoard.js';
import { MuteButton } from './components/MuteButton.js';
import { useSoundEffects } from './audio/useSoundEffects.js';
import { ensureResumed } from './audio/soundEngine.js';

export default function App() {
  const {
    connected,
    gameState,
    lastReveal,
    lastStrike,
    lastStealResult,
    timerRemaining,
    clearReveal,
    clearStrike,
    clearSteal,
  } = useScreenState();

  useSoundEffects({ gameState, lastReveal, lastStrike, timerRemaining });

  // Resume AudioContext on first user interaction (autoplay policy)
  useEffect(() => {
    function handleInteraction() {
      ensureResumed();
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    }
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  // Strike overlay auto-clear
  const [showStrike, setShowStrike] = useState(false);
  useEffect(() => {
    if (lastStrike) {
      setShowStrike(true);
      const t = setTimeout(() => {
        setShowStrike(false);
        clearStrike();
      }, 900);
      return () => clearTimeout(t);
    }
  }, [lastStrike, clearStrike]);

  // Steal overlay auto-clear
  const [showSteal, setShowSteal] = useState(false);
  useEffect(() => {
    if (lastStealResult) {
      setShowSteal(true);
      const t = setTimeout(() => {
        setShowSteal(false);
        clearSteal();
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [lastStealResult, clearSteal]);

  if (!connected || !gameState) {
    return (
      <>
        <div className="lobby-bg flex items-center justify-center text-white font-body">
          <div className="text-center">
            <div className="text-[clamp(2rem,5vw,5rem)] font-display font-bold text-yellow-400 title-glow mb-4">100 к 1</div>
            <div className="text-blue-300 animate-pulse text-[clamp(1rem,1.5vw,1.5rem)]">
              {!connected ? 'Подключение...' : 'Ожидание игры...'}
            </div>
          </div>
        </div>
        <MuteButton />
      </>
    );
  }

  if (gameState.phase === 'lobby') {
    return (
      <>
        <div className="lobby-bg flex items-center justify-center text-white font-body">
          <div className="text-center">
            <div className="text-[clamp(3rem,8vw,7rem)] font-display font-bold text-yellow-400 title-glow mb-6">100 к 1</div>
            <div className="text-[clamp(1.5rem,3.5vw,3.5rem)] font-display text-blue-200">
              {gameState.teams[0].name} <span className="text-yellow-400 mx-3">vs</span> {gameState.teams[1].name}
            </div>
            <div className="text-blue-400 mt-6 animate-pulse text-[clamp(1rem,1.5vw,1.5rem)]">Ожидание начала игры...</div>
          </div>
        </div>
        <MuteButton />
      </>
    );
  }

  if (gameState.phase === 'game-over') {
    const winner = gameState.teams[0].scoreTotal >= gameState.teams[1].scoreTotal
      ? gameState.teams[0]
      : gameState.teams[1];
    const isTie = gameState.teams[0].scoreTotal === gameState.teams[1].scoreTotal;

    return (
      <>
        <div className="game-bg flex items-center justify-center text-white font-body">
          <div className="text-center">
            <div className="text-[clamp(2.5rem,5vw,5rem)] font-display font-bold mb-6 text-yellow-400 title-glow">Игра окончена!</div>
            {isTie ? (
              <div className="text-[clamp(1.5rem,3.5vw,3.5rem)] text-yellow-300 font-display">Ничья! {gameState.teams[0].scoreTotal} очков</div>
            ) : (
              <>
                <div className="text-[clamp(2rem,4.5vw,4.5rem)] text-yellow-300 mb-3 font-display font-bold">{winner.name} — Победа!</div>
                <div className="text-[clamp(1rem,2vw,2rem)] text-blue-300 font-body">
                  {gameState.teams[0].name}: {gameState.teams[0].scoreTotal} &mdash; {gameState.teams[1].name}: {gameState.teams[1].scoreTotal}
                </div>
              </>
            )}
          </div>
        </div>
        <MuteButton />
      </>
    );
  }

  // Reverse phase
  if (gameState.phase === 'reverse' && gameState.reverseRound) {
    return (
      <>
        <div className="game-bg h-screen">
          <ReverseBoard reverseRound={gameState.reverseRound} teams={gameState.teams} />
        </div>
        <MuteButton />
      </>
    );
  }

  // Big game phase
  if (gameState.phase === 'big-game' && gameState.bigGame) {
    return (
      <>
        <div className="game-bg h-screen">
          <BigGameBoard bigGame={gameState.bigGame} timerRemaining={timerRemaining} />
        </div>
        <MuteButton />
      </>
    );
  }

  // Round phase (simple rounds)
  const round = gameState.round;
  if (!round) return null;

  const isFaceoff = round.stage === 'faceoff';

  return (
    <>
      <div className="game-bg font-body grid grid-cols-[clamp(180px,13vw,300px)_1fr_clamp(180px,13vw,300px)] grid-rows-[auto_1fr] h-screen">
        <QuestionHeader
          question={round.question}
          roundNumber={gameState.roundNumber}
          totalRounds={gameState.totalRounds}
          timerRemaining={timerRemaining}
          roundType={round.roundType}
          multiplier={round.multiplier}
          stage={round.stage}
        />

        <TeamPanel
          team={gameState.teams[0]}
          isActive={gameState.activeTeamId === 'team-a'}
        />

        {isFaceoff ? (
          <div className="flex items-center justify-center">
            <div className="board-frame w-full max-w-[clamp(600px,60vw,1200px)] flex items-center justify-center py-[clamp(40px,10vh,120px)]">
              <div className="font-display text-[clamp(3rem,6vw,6rem)] font-bold text-yellow-400 title-glow animate-pulse">
                ?
              </div>
            </div>
          </div>
        ) : (
          <AnswerGrid
            key={round.questionIndex}
            answers={round.answers}
            lastRevealRank={lastReveal?.rank ?? null}
            onRevealAnimDone={clearReveal}
          />
        )}

        <TeamPanel
          team={gameState.teams[1]}
          isActive={gameState.activeTeamId === 'team-b'}
        />

        {showStrike && <StrikeOverlay />}
        {showSteal && lastStealResult && <StealOverlay success={lastStealResult.success} />}
      </div>
      <MuteButton />
    </>
  );
}
