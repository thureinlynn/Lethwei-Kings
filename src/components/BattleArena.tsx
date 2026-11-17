import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Camera,
  Coffee,
  Flame,
  Globe,
  Heart,
  Pause,
  RotateCcw,
  Shield,
  Swords,
  Timer,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { getCardById } from '../data/cards';
import {
  applyRoundRecovery,
  calculateEffectivePower,
  chooseAiAction,
  chooseAutoTimeoutAction,
  CombatantState,
  computeStanceRadar,
  createInitialSkills,
  CRITICAL_HP_THRESHOLD,
  drawBattleHandForRole,
  evaluateMatchOutcome,
  getAvailableCriticalCardsForRole,
  getTriangleDominanceBonus,
  getTurnRole,
  mapCardToFighterPose,
  MAX_ROUNDS,
  resolveTurn,
  TURN_TIMER_SECONDS,
  TURNS_PER_ROUND,
} from '../game/rules';
import { localizeCard, UI_TEXT } from '../i18n/translations';
import {
  CameraAngle,
  CombatCard as CombatCardType,
  CombatPosition,
  FighterPose,
  FighterProfile,
  FloatingPopup,
  Language,
  MatchMode,
  OpponentProfile,
  TurnExchangeStep,
  TurnResolutionSummary,
} from '../types/game';
import { soundEngine } from '../utils/sound';
import { CombatCard } from './CombatCard';
import { FighterAvatar } from './FighterAvatar';

interface BattleArenaProps {
  fighter: FighterProfile;
  opponent: OpponentProfile;
  mode: MatchMode;
  lang?: Language;
  onToggleLang?: () => void;
  onMatchFinish: (result: {
    winner: 'player' | 'ai';
    method: string;
    isKo: boolean;
    xpEarned: number;
    remainingHp: number;
    remainingSta: number;
    damageDealt: number;
  }) => void;
  onExitToHub: () => void;
  onRematch: () => void;
}

type TurnPhase = 'selecting' | 'clashing' | 'resolving' | 'paused' | 'finished';

export const BattleArena: React.FC<BattleArenaProps> = ({
  fighter,
  opponent,
  mode,
  lang = 'en',
  onToggleLang,
  onMatchFinish,
  onExitToHub,
  onRematch,
}) => {
  const t = UI_TEXT[lang];
  const [round, setRound] = useState(1);
  const [turn, setTurn] = useState(1);
  const [phase, setPhase] = useState<TurnPhase>('selecting');
  const [turnSecondsLeft, setTurnSecondsLeft] = useState<number>(TURN_TIMER_SECONDS);
  const [muted, setMuted] = useState(soundEngine.muted);

  const customCards = useMemo(() => fighter.customCards ?? [], [fighter.customCards]);
  const playerSkills = useMemo(
    () => fighter.skills ?? createInitialSkills(fighter.gymId),
    [fighter.skills, fighter.gymId]
  );
  const aiSkills = useMemo(
    () => opponent.skills ?? createInitialSkills(),
    [opponent.skills]
  );
  const playerRadar = useMemo(
    () => computeStanceRadar(fighter.activeDeckIds, customCards),
    [fighter.activeDeckIds, customCards]
  );
  const aiRadar = useMemo(
    () => computeStanceRadar(opponent.deckIds, []),
    [opponent.deckIds]
  );

  const [position, setPosition] = useState<CombatPosition>('Standing');

  const [playerState, setPlayerState] = useState<CombatantState>({
    hp: fighter.maxHp,
    maxHp: fighter.maxHp,
    sta: fighter.maxSta,
    maxSta: fighter.maxSta,
    bleedTurns: 0,
    slowPenalty: 0,
    agilityPenalty: 0,
    submissionPct: 0,
    maniUsed: false,
    totalDamageDealt: 0,
    strikesLanded: 0,
    headbuttsLanded: 0,
  });

  const [aiState, setAiState] = useState<CombatantState>({
    hp: opponent.maxHp,
    maxHp: opponent.maxHp,
    sta: opponent.maxSta,
    maxSta: opponent.maxSta,
    bleedTurns: 0,
    slowPenalty: 0,
    agilityPenalty: 0,
    submissionPct: 0,
    maniUsed: false,
    totalDamageDealt: 0,
    strikesLanded: 0,
    headbuttsLanded: 0,
  });

  const [cameraAngle, setCameraAngle] = useState<CameraAngle>('auto');
  const [clashCameraCue, setClashCameraCue] = useState<'side' | 'corner' | 'high' | 'cover'>('side');

  const turnRole = getTurnRole(round, turn);

  const [playerHandIds, setPlayerHandIds] = useState<string[]>(() =>
    drawBattleHandForRole(
      fighter.activeDeckIds,
      getTurnRole(1, 1),
      'player',
      5,
      fighter.unlockedCardIds,
      customCards,
      Math.random,
      'Standing'
    )
  );
  const [aiHandIds, setAiHandIds] = useState<string[]>(() =>
    drawBattleHandForRole(opponent.deckIds, getTurnRole(1, 1), 'ai', 5, [], [], Math.random, 'Standing')
  );

  const [selectedPlayerChoice, setSelectedPlayerChoice] = useState<
    CombatCardType | 'REST' | null
  >(null);
  const [selectedAiChoice, setSelectedAiChoice] = useState<
    CombatCardType | 'REST' | null
  >(null);

  const [playerPose, setPlayerPose] = useState<FighterPose>('idle');
  const [aiPose, setAiPose] = useState<FighterPose>('idle');
  const [animStepKey, setAnimStepKey] = useState<number>(0);
  const [shakeLevel, setShakeLevel] = useState<'none' | 'light' | 'heavy'>('none');
  const [impactFlash, setImpactFlash] = useState<'none' | 'player' | 'opponent'>('none');
  const [popups, setPopups] = useState<FloatingPopup[]>([]);
  const [lastSummary, setLastSummary] = useState<TurnResolutionSummary | null>(null);
  const [bannerText, setBannerText] = useState<string>('ROUND 1 · FIGHT!');

  const [matchResult, setMatchResult] = useState<{
    winner: 'player' | 'ai';
    method: string;
    xpEarned: number;
  } | null>(null);

  const timersRef = useRef<number[]>([]);
  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  useEffect(() => {
    if (phase === 'paused') {
      document.body.dataset.state = 'paused';
    } else if (phase === 'finished') {
      document.body.dataset.state = 'gameover';
    } else {
      document.body.dataset.state = 'playing';
    }
  }, [phase]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
        setPhase((prev) => {
          if (prev === 'selecting') return 'paused';
          if (prev === 'paused') return 'selecting';
          return prev;
        });
      } else if (e.key.toLowerCase() === 'm') {
        soundEngine.muted = !soundEngine.muted;
        setMuted(soundEngine.muted);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const criticalCards = useMemo(
    () => getAvailableCriticalCardsForRole(playerState, turnRole, 'player'),
    [playerState, turnRole]
  );

  const isPlayerCritical =
    playerState.hp > 0 && playerState.hp / playerState.maxHp < CRITICAL_HP_THRESHOLD;

  const hasPlayableCardInHand = useMemo(() => {
    const deckPlayable = playerHandIds.some((id) => {
      const card = getCardById(id, customCards);
      return card && card.staCost <= playerState.sta;
    });
    const critPlayable = criticalCards.some((c) => c.staCost <= playerState.sta);
    return deckPlayable || critPlayable;
  }, [playerHandIds, criticalCards, playerState.sta, customCards]);

  const spawnStepPopups = (step: TurnExchangeStep, tag: string) => {
    const next: FloatingPopup[] = [];
    const defenderTarget = step.defender === 'player' ? 'player' : 'opponent';
    const actorTarget = step.actor === 'player' ? 'player' : 'opponent';

    if (step.damageDealt > 0) {
      next.push({
        id: `dmg_${tag}`,
        target: defenderTarget,
        text: `-${step.damageDealt}`,
        tone: step.isHeavy ? 'heavy' : 'damage',
      });
    }
    if (step.counterDamage > 0) {
      next.push({
        id: `ctr_${tag}`,
        target: actorTarget,
        text: `COUNTER -${step.counterDamage}`,
        tone: 'counter',
      });
    }
    if (step.blocked > 0 && step.damageDealt <= 3) {
      next.push({ id: `blk_${tag}`, target: defenderTarget, text: `BLOCKED!`, tone: 'block' });
    }
    if (step.evaded) {
      next.push({ id: `ev_${tag}`, target: defenderTarget, text: `EVADED!`, tone: 'evade' });
    }
    if (step.cutApplied) {
      next.push({ id: `cut_${tag}`, target: defenderTarget, text: `CUT!`, tone: 'cut' });
    }
    setPopups(next);
  };

  const spawnSupportPopups = (summary: TurnResolutionSummary) => {
    const next: FloatingPopup[] = [];
    const ts = Date.now();
    if (summary.playerHealed > 0) {
      next.push({ id: `ph_${ts}`, target: 'player', text: `MANI +${summary.playerHealed} HP`, tone: 'heal' });
    }
    if (summary.aiHealed > 0) {
      next.push({ id: `ah_${ts}`, target: 'opponent', text: `MANI +${summary.aiHealed} HP`, tone: 'heal' });
    }
    setPopups(next);
  };

  const handleSelectAction = (choice: CombatCardType | 'REST') => {
    if (phase !== 'selecting') return;
    if (choice !== 'REST' && choice.staCost > playerState.sta) return;

    clearAllTimers();
    soundEngine.playClick();

    const aiPick = chooseAiAction(
      aiHandIds,
      aiState,
      Math.random,
      turnRole,
      customCards,
      position
    );
    setSelectedPlayerChoice(choice);
    setSelectedAiChoice(aiPick);
    setPhase('clashing');
    setBannerText(turnRole === 'player_attack' ? 'RED ATTACKS!' : 'BLUE ATTACKS!');

    const resolution = resolveTurn({
      roundNumber: round,
      turnNumber: turn,
      position,
      playerChoice: choice,
      aiChoice: aiPick,
      playerState,
      aiState,
      playerStats: fighter.stats,
      aiStats: opponent.stats,
      playerSkills,
      aiSkills,
      playerRadar,
      aiRadar,
      playerGymId: fighter.gymId,
    });

    const pNext = { ...resolution.nextPlayerState };
    const aNext = { ...resolution.nextAiState };
    const nextPos = resolution.summary.positionAfter;
    const steps = resolution.summary.steps;

    const applyStepVisuals = (step: TurnExchangeStep, idx: number) => {
      const attackerIsPlayer = step.actor === 'player';
      setAnimStepKey((k) => k + 1);

      // Auto-cinematic camera cue shifts to Cover close-up on heavy strikes/ground/submissions
      if (
        step.isHeavy ||
        step.actorPose === 'headbutt' ||
        step.actorPose === 'elbow' ||
        step.actorPose === 'takedown' ||
        step.actorPose === 'groundpound' ||
        step.actorPose === 'submission' ||
        step.defenderPose === 'ko'
      ) {
        setClashCameraCue('cover');
      } else if (step.actorPose === 'kick' || step.actorPose === 'knee') {
        setClashCameraCue('high');
      } else {
        setClashCameraCue('corner');
      }

      if (attackerIsPlayer) {
        setPlayerPose(step.actorPose);
        setAiPose(step.defenderPose);
      } else {
        setAiPose(step.actorPose);
        setPlayerPose(step.defenderPose);
      }

      spawnStepPopups(step, `${Date.now()}_${idx}`);

      if (step.damageDealt >= 11 || step.counterDamage >= 11) {
        soundEngine.playHeavyHit();
        setShakeLevel('heavy');
        setImpactFlash(step.defender === 'ai' ? 'opponent' : 'player');
      } else if (step.damageDealt > 0 || step.counterDamage > 0) {
        soundEngine.playLightHit();
        setShakeLevel('light');
        setImpactFlash(step.defender === 'ai' ? 'opponent' : 'player');
      } else if (step.evaded) {
        soundEngine.playEvade();
        setShakeLevel('none');
        setImpactFlash('none');
      } else {
        soundEngine.playBlock();
        setShakeLevel('none');
        setImpactFlash('none');
      }
    };

    const finalizeTurn = () => {
      setShakeLevel('none');
      setImpactFlash('none');
      setPopups([]);
      setPosition(nextPos);

      const outcome = evaluateMatchOutcome(pNext, aNext, round, turn);
      if (outcome.finished && outcome.winner && outcome.winner !== 'draw') {
        const isKo = aNext.hp <= 0 || pNext.hp <= 0;
        const isSub = aNext.submissionPct >= 100 || pNext.submissionPct >= 100;
        soundEngine.playBell(3);
        const xpBase = mode === 'sparring' ? 35 : mode === 'local' ? 55 : 100;
        const xpEarned =
          outcome.winner === 'player'
            ? xpBase + (isKo || isSub ? 15 : 0)
            : Math.round(xpBase * 0.4);

        setClashCameraCue('cover');
        setPlayerPose(outcome.winner === 'player' ? 'victory' : 'ko');
        setAiPose(outcome.winner === 'ai' ? 'victory' : 'ko');
        setBannerText(outcome.method.toUpperCase());
        setMatchResult({
          winner: outcome.winner,
          method: outcome.method,
          xpEarned,
        });
        setPhase('finished');
        onMatchFinish({
          winner: outcome.winner,
          method: outcome.method,
          isKo,
          xpEarned,
          remainingHp: pNext.hp,
          remainingSta: pNext.sta,
          damageDealt: pNext.totalDamageDealt,
        });
        return;
      }

      setPlayerPose('idle');
      setAiPose('idle');
      setSelectedPlayerChoice(null);
      setSelectedAiChoice(null);

      let nextRoundNum = round;
      let nextTurnNum = turn + 1;

      if (turn >= TURNS_PER_ROUND) {
        nextRoundNum = round + 1;
        nextTurnNum = 1;
        soundEngine.playBell(1);
        const pRecovered = applyRoundRecovery(pNext, fighter.stats);
        const aRecovered = applyRoundRecovery(aNext, opponent.stats);
        setPlayerState(pRecovered);
        setAiState(aRecovered);
        setRound(nextRoundNum);
        setTurn(nextTurnNum);
        setClashCameraCue('high');
        setBannerText(
          `ROUND ${nextRoundNum} · CORNER RECOVERY (+${Math.max(0, pRecovered.sta - pNext.sta)} STA)`
        );
      } else {
        setTurn(nextTurnNum);
        const nextRole = getTurnRole(nextRoundNum, nextTurnNum);
        setClashCameraCue(nextRole === 'ai_attack' ? 'corner' : 'side');
        setBannerText(
          nextRole === 'player_attack'
            ? `TURN ${nextTurnNum} · YOUR ATTACK`
            : `TURN ${nextTurnNum} · DEFEND`
        );
      }

      const nextRole = getTurnRole(nextRoundNum, nextTurnNum);
      setPlayerHandIds(
        drawBattleHandForRole(
          fighter.activeDeckIds,
          nextRole,
          'player',
          5,
          fighter.unlockedCardIds,
          customCards,
          Math.random,
          nextPos
        )
      );
      setAiHandIds(
        drawBattleHandForRole(
          opponent.deckIds,
          nextRole,
          'ai',
          5,
          [],
          [],
          Math.random,
          nextPos
        )
      );
      setTurnSecondsLeft(TURN_TIMER_SECONDS);
      setPhase('selecting');
    };

    // Step 2 -> Step 3 (brief 260ms top-strip lock-in without blocking fighters -> full slow 1160ms attack animation)
    const tClash = window.setTimeout(() => {
      setPhase('resolving');
      setLastSummary(resolution.summary);

      if (steps.length === 0) {
        setPlayerPose(mapCardToFighterPose(choice));
        setAiPose(mapCardToFighterPose(aiPick));
        setPlayerState(pNext);
        setAiState(aNext);
        spawnSupportPopups(resolution.summary);
        soundEngine.playEvade();
        const tDone = window.setTimeout(finalizeTurn, 980);
        timersRef.current.push(tDone);
        return;
      }

      // Step 3A: Attack + Defender Reaction (1160ms full visibility window)
      applyStepVisuals(steps[0], 0);
      if (steps.length === 1) {
        setPlayerState(pNext);
        setAiState(aNext);
        const tDone = window.setTimeout(finalizeTurn, 1160);
        timersRef.current.push(tDone);
        return;
      }

      // Step 3B: Second Mover Attack + Defender Reaction
      const tSecond = window.setTimeout(() => {
        setShakeLevel('none');
        setImpactFlash('none');
        applyStepVisuals(steps[1], 1);
        setPlayerState(pNext);
        setAiState(aNext);
        const tDone = window.setTimeout(finalizeTurn, 1160);
        timersRef.current.push(tDone);
      }, 1160);

      timersRef.current.push(tSecond);
    }, 260);

    timersRef.current.push(tClash);
  };

  // Auto-timeout handler ref so the countdown interval never holds stale closures
  const autoTimeoutActionRef = useRef<() => void>(() => {});
  useEffect(() => {
    autoTimeoutActionRef.current = () => {
      if (phase !== 'selecting') return;
      const desiredCategory = turnRole === 'player_attack' ? 'Striking' : 'Defense';
      const autoPick = chooseAutoTimeoutAction(
        playerHandIds,
        playerState,
        customCards,
        desiredCategory
      );
      handleSelectAction(autoPick);
    };
  });

  // Step 1: Turn Countdown Timer while fighters hold rhythm stance
  useEffect(() => {
    if (phase !== 'selecting') return;
    const intervalId = window.setInterval(() => {
      setTurnSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(intervalId);
          window.setTimeout(() => autoTimeoutActionRef.current(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [phase]);

  const pHpPct = Math.max(0, Math.round((playerState.hp / playerState.maxHp) * 100));
  const pStaPct = Math.max(0, Math.round((playerState.sta / playerState.maxSta) * 100));
  const aHpPct = Math.max(0, Math.round((aiState.hp / aiState.maxHp) * 100));
  const aStaPct = Math.max(0, Math.round((aiState.sta / aiState.maxSta) * 100));
  const timerPct = Math.max(0, Math.round((turnSecondsLeft / TURN_TIMER_SECONDS) * 100));

  const renderSpeedAdvantage = () => {
    if (!selectedPlayerChoice || !selectedAiChoice) return null;
    const pSpd =
      selectedPlayerChoice === 'REST'
        ? 9
        : selectedPlayerChoice.speed + playerState.slowPenalty;
    const aSpd =
      selectedAiChoice === 'REST'
        ? 9
        : selectedAiChoice.speed + aiState.slowPenalty;
    if (pSpd < aSpd) {
      return lang === 'my'
        ? `မြန်နှုန်း ${pSpd} vs ${aSpd} · သင် အရင်တိုက်ခိုက်မည်`
        : `SPD ${pSpd} vs ${aSpd} · YOU STRIKE FIRST`;
    }
    if (aSpd < pSpd) {
      return lang === 'my'
        ? `မြန်နှုန်း ${pSpd} vs ${aSpd} · ပြိုင်ဘက် အရင်တိုက်ခိုက်မည်`
        : `SPD ${pSpd} vs ${aSpd} · OPPONENT STRIKES FIRST`;
    }
    return lang === 'my'
      ? `မြန်နှုန်း ${pSpd} တူ · ဖိုက်တာ SPD ဆုံးဖြတ်`
      : `SPD ${pSpd} TIE · STAT SPEED DECIDES`;
  };

  const activeCameraView = cameraAngle === 'auto' ? clashCameraCue : cameraAngle;
  const cameraTransform =
    activeCameraView === 'cover'
      ? 'perspective(820px) rotateY(5deg) scale(1.18) translate3d(0, -12px, 0)'
      : activeCameraView === 'corner'
      ? 'perspective(880px) rotateY(-8deg) rotateZ(-0.6deg) scale(1.11) translate3d(-18px, -4px, 0)'
      : activeCameraView === 'high'
      ? 'perspective(860px) rotateX(12deg) scale(1.08) translate3d(0, 14px, 0)'
      : 'scale(1) translate3d(0, 0, 0)';

  return (
    <main
      className={`h-screen w-screen overflow-hidden bg-[#0c0d11] text-[#f5f2eb] flex flex-col justify-between select-none ${
        shakeLevel === 'heavy'
          ? 'animate-heavy-shake'
          : shakeLevel === 'light'
          ? 'animate-hit-shake'
          : ''
      }`}
    >
      {/* ================= TOP HUD (Compact Landscape Header) ================= */}
      <header className="shrink-0 bg-[#14161d] border-b-2 border-[#090a0c] px-4 sm:px-6 py-1.5">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-3 items-center">
          {/* LEFT: Player Portrait + Red HP + Blue STA */}
          <div className="col-span-5 flex items-center gap-2.5">
            <div className="w-16 h-14 rounded-lg border-2 border-[#090a0c] overflow-hidden shrink-0 bg-[#101217]">
              <FighterAvatar
                mode="portrait"
                gender={fighter.gender}
                appearance={fighter.appearance}
                hasCut={playerState.bleedTurns > 0}
                isChampion={fighter.record.championshipWins > 0}
                className="w-full h-full"
              />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-display font-extrabold text-lg text-white truncate leading-none">
                  {fighter.name}
                </span>
                <span className="font-mono-num font-bold text-xs text-red-400 flex items-center gap-1 shrink-0">
                  <Heart className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                  <span>{playerState.hp}/{playerState.maxHp}</span>
                </span>
              </div>
              <div className="h-3 w-full rounded bg-[#090a0c] border border-zinc-800 overflow-hidden">
                <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${pHpPct}%` }} />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 flex-1 rounded bg-[#090a0c] border border-zinc-800 overflow-hidden">
                  <div className="h-full bg-sky-500 transition-all duration-300" style={{ width: `${pStaPct}%` }} />
                </div>
                <span className="font-mono-num font-bold text-[11px] text-sky-400 shrink-0">
                  {playerState.sta} {t.badgeSta}
                </span>
              </div>
            </div>
          </div>

          {/* CENTER: Round, Turn, Turn Clock, Mute/Lang/Pause */}
          <div className="col-span-2 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1">
              <span className="font-display font-extrabold text-lg sm:text-xl text-amber-400 leading-none">
                {t.roundWord} {round}/{MAX_ROUNDS}
              </span>
              {onToggleLang && (
                <button
                  type="button"
                  aria-label="Switch Language"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    soundEngine.playClick();
                    onToggleLang();
                  }}
                  className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                >
                  <Globe className="w-3 h-3" aria-hidden="true" />
                  <span>{t.langToggle}</span>
                </button>
              )}
              <button
                type="button"
                aria-label={muted ? 'Unmute Sound' : 'Mute Sound'}
                tabIndex={-1}
                onClick={(e) => {
                  e.currentTarget.blur();
                  soundEngine.muted = !soundEngine.muted;
                  setMuted(soundEngine.muted);
                }}
                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer"
              >
                {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                aria-label="Pause Match"
                tabIndex={-1}
                onClick={(e) => {
                  e.currentTarget.blur();
                  setPhase((p) => (p === 'paused' ? 'selecting' : p === 'selecting' ? 'paused' : p));
                }}
                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-2 font-mono-num text-[11px] text-zinc-300 mt-0.5">
              <span>{t.turnWord} {turn}/{TURNS_PER_ROUND}</span>
              <span className="text-zinc-600">·</span>
              <span
                data-testid="turn-timer"
                className={`font-bold flex items-center gap-0.5 ${
                  turnSecondsLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-amber-300'
                }`}
              >
                <Timer className="w-3 h-3" aria-hidden="true" />
                <span>{turnSecondsLeft}s</span>
              </span>
            </div>
            <div className="w-28 h-1.5 rounded bg-[#090a0c] overflow-hidden mt-0.5 border border-zinc-800">
              <div
                className={`h-full transition-all duration-300 ${
                  turnSecondsLeft <= 5 ? 'bg-red-500' : 'bg-amber-400'
                }`}
                style={{ width: `${timerPct}%` }}
              />
            </div>
          </div>

          {/* RIGHT: AI Opponent Red HP + Blue STA + Portrait */}
          <div className="col-span-5 flex items-center gap-2.5">
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono-num font-bold text-xs text-red-400 flex items-center gap-1 shrink-0">
                  <span>{aiState.hp}/{aiState.maxHp}</span>
                  <Heart className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                </span>
                <span className="font-display font-extrabold text-lg text-white truncate text-right leading-none">
                  {opponent.name}
                </span>
              </div>
              <div className="h-3 w-full rounded bg-[#090a0c] border border-zinc-800 overflow-hidden flex justify-end">
                <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${aHpPct}%` }} />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono-num font-bold text-[11px] text-sky-400 shrink-0">
                  {aiState.sta} {t.badgeSta}
                </span>
                <div className="h-2.5 flex-1 rounded bg-[#090a0c] border border-zinc-800 overflow-hidden flex justify-end">
                  <div className="h-full bg-sky-500 transition-all duration-300" style={{ width: `${aStaPct}%` }} />
                </div>
              </div>
            </div>
            <div className="w-16 h-14 rounded-lg border-2 border-[#090a0c] overflow-hidden shrink-0 bg-[#101217]">
              <FighterAvatar
                mode="portrait"
                gender={opponent.gender}
                appearance={opponent.appearance}
                facing="left"
                hasCut={aiState.bleedTurns > 0}
                isChampion={opponent.isChampion}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </header>

      {/* ================= CENTER RING STAGE (Flex-1, Dynamic Camera Angles & Ring Activities) ================= */}
      <section className="flex-1 min-h-0 max-w-7xl w-full mx-auto px-4 sm:px-6 py-1.5 flex flex-col gap-1">
        {/* Stage Status + Alternating Role Badge + Camera Angle Selector */}
        <div className="shrink-0 flex items-center justify-between text-xs text-zinc-400 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              data-testid="turn-role-badge"
              className={`px-2 py-0.5 rounded font-display font-extrabold text-xs tracking-wider border shrink-0 flex items-center gap-1 ${
                turnRole === 'player_attack'
                  ? 'bg-red-700/90 border-red-400 text-white'
                  : 'bg-sky-700/90 border-sky-400 text-white'
              }`}
            >
              {turnRole === 'player_attack' ? (
                <Swords className="w-3 h-3" aria-hidden="true" />
              ) : (
                <Shield className="w-3 h-3" aria-hidden="true" />
              )}
              <span>{turnRole === 'player_attack' ? t.attackRoleBadge : t.defenseRoleBadge}</span>
            </span>
            <span
              data-testid="combat-position-badge"
              className={`px-2 py-0.5 rounded font-display font-extrabold text-xs tracking-wider border shrink-0 uppercase ${
                position === 'Ground'
                  ? 'bg-purple-800/90 border-purple-400 text-purple-100'
                  : position === 'Clinch'
                  ? 'bg-amber-700/90 border-amber-400 text-amber-100'
                  : 'bg-zinc-800 border-zinc-600 text-zinc-200'
              }`}
            >
              POS: {position}
            </span>
            {(playerState.submissionPct > 0 || aiState.submissionPct > 0) && (
              <span
                data-testid="submission-lock-badge"
                className="px-2 py-0.5 rounded font-mono-num font-bold text-[11px] bg-rose-900/90 border border-rose-400 text-rose-100 shrink-0"
              >
                SUB LOCK {aiState.submissionPct > 0 ? `BLUE ${aiState.submissionPct}%` : `RED ${playerState.submissionPct}%`}
              </span>
            )}
            <span className="truncate text-[11px] hidden xl:inline">
              {mode === 'sparring'
                ? 'Gym Sparring · Tactical MMA'
                : mode === 'local'
                ? 'Local Promotion · Official'
                : 'World Championship'}
            </span>
          </div>

          {/* Camera Angle Switcher */}
          <div className="flex items-center gap-1 bg-[#141720] px-1.5 py-0.5 rounded-md border border-zinc-800 shrink-0">
            <Camera className="w-3 h-3 text-amber-400 mr-0.5" aria-hidden="true" />
            <span className="text-[10px] font-bold text-zinc-400 mr-0.5">{t.cameraLabel}:</span>
            {(
              [
                { id: 'auto', label: t.camAuto },
                { id: 'side', label: t.camSide },
                { id: 'corner', label: t.camCorner },
                { id: 'high', label: t.camHigh },
                { id: 'cover', label: t.camCover },
              ] as const
            ).map((cam) => (
              <button
                key={cam.id}
                type="button"
                aria-pressed={cameraAngle === cam.id}
                onClick={() => {
                  soundEngine.playClick();
                  setCameraAngle(cam.id);
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase cursor-pointer transition-colors ${
                  cameraAngle === cam.id
                    ? 'bg-amber-500 text-black'
                    : 'text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                {cam.label}
              </button>
            ))}
          </div>

          <span className="font-display font-bold text-xs sm:text-sm tracking-wider text-amber-400 shrink-0 flex items-center gap-1.5">
            <span
              className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 ${
                playerState.maniUsed
                  ? 'text-zinc-500'
                  : isPlayerCritical
                  ? 'text-emerald-400'
                  : 'text-amber-300'
              }`}
            >
              {playerState.maniUsed ? t.maniUsed : isPlayerCritical ? t.maniReady : 'MANI 1/1'}
            </span>
            <span>{bannerText}</span>
          </span>
        </div>

        {/* Stadium Fighting Stage (Camera Perspective Wrapper keeps fighters unobstructed!) */}
        <div
          data-testid="battle-ring"
          data-camera={activeCameraView}
          className="relative flex-1 min-h-0 w-full rounded-xl comic-panel overflow-hidden bg-[#07090d]"
        >
          <div
            className="relative w-full h-full transition-transform duration-700 ease-out origin-center will-change-transform"
            style={{ transform: cameraTransform }}
          >
          <svg
            viewBox="0 0 1200 400"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="arenaSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#05070b" />
                <stop offset="55%" stopColor="#0e141f" />
                <stop offset="100%" stopColor="#161b25" />
              </linearGradient>
              <radialGradient id="stageSpotlight" cx="50%" cy="32%" r="60%">
                <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.22" />
                <stop offset="50%" stopColor="#1e293b" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#05070b" stopOpacity="0.96" />
              </radialGradient>
              <linearGradient id="ringMatGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#323946" />
                <stop offset="35%" stopColor="#4c5563" />
                <stop offset="100%" stopColor="#262c37" />
              </linearGradient>
              <radialGradient id="matCenterPool" cx="50%" cy="54%" r="48%">
                <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.28" />
                <stop offset="65%" stopColor="#475569" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="lightCone" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fef9c3" stopOpacity="0.2" />
                <stop offset="55%" stopColor="#e2e8f0" stopOpacity="0.07" />
                <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Night Stadium Sky + Spotlight Glow */}
            <rect width="1200" height="400" fill="url(#arenaSky)" />
            <rect width="1200" height="400" fill="url(#stageSpotlight)" />

            {/* Far Right City Night Building & Arena Bokeh Lights */}
            <g opacity="0.5">
              <rect x="920" y="95" width="280" height="175" fill="#0d131d" />
              {[
                [945, 118], [972, 115], [1010, 122], [1048, 112], [1085, 124], [1130, 116],
                [958, 145], [998, 142], [1032, 150], [1072, 140], [1115, 148], [1162, 138],
                [940, 175], [985, 170], [1028, 178], [1095, 172], [1142, 176],
              ].map(([bx, by], i) => (
                <circle key={i} cx={bx} cy={by} r={i % 3 === 0 ? 3.2 : 2.1} fill={i % 4 === 0 ? '#fde68a' : '#f8fafc'} opacity="0.7" />
              ))}
              {/* Stadium flood tower flare */}
              <circle cx="888" cy="126" r="14" fill="#e2e8f0" opacity="0.22" />
              <circle cx="888" cy="126" r="5" fill="#ffffff" opacity="0.7" />
            </g>

            {/* Left Arena Vertical Banners */}
            <g opacity="0.48">
              <rect x="115" y="132" width="112" height="90" fill="#1e2430" stroke="#090a0c" strokeWidth="2" />
              <rect x="115" y="148" width="112" height="14" fill="#991b1b" />
              <rect x="115" y="176" width="112" height="10" fill="#7f1d1d" />
              <rect x="242" y="138" width="102" height="84" fill="#1b202b" stroke="#090a0c" strokeWidth="2" />
              <rect x="242" y="152" width="102" height="12" fill="#991b1b" />
              <rect x="358" y="142" width="90" height="80" fill="#171c26" stroke="#090a0c" strokeWidth="2" />
              <rect x="358" y="156" width="90" height="10" fill="#7f1d1d" />
            </g>

            {/* Vertical Support Columns & Back Steel Cross-Truss */}
            <g stroke="#2a3240" strokeWidth="2.5" fill="none">
              <rect x="305" y="40" width="22" height="190" stroke="#1c222d" />
              <rect x="708" y="40" width="22" height="190" stroke="#1c222d" />
              <line x1="255" y1="98" x2="945" y2="98" strokeWidth="4" />
              <line x1="255" y1="112" x2="945" y2="112" strokeWidth="3" />
              {[270, 315, 360, 405, 450, 495, 540, 585, 630, 675, 720, 765, 810, 855, 900].map((tx) => (
                <path key={tx} d={`M ${tx} 98 L ${tx + 22} 112 L ${tx + 45} 98`} strokeWidth="1.5" opacity="0.65" />
              ))}
            </g>

            {/* Perspective Angled Overhead Steel Lighting Trusses (Left & Right & Center Span) */}
            <g>
              {/* Left receding truss beam */}
              <polygon points="105,0 165,0 320,84 282,84" fill="#181f29" stroke="#364152" strokeWidth="2.5" />
              <path d="M 132 0 L 296 84 M 155 18 L 195 10 M 195 36 L 235 28 M 235 55 L 272 48" stroke="#475569" strokeWidth="2" />
              {/* Right receding truss beam */}
              <polygon points="1095,0 1035,0 880,84 918,84" fill="#181f29" stroke="#364152" strokeWidth="2.5" />
              <path d="M 1068 0 L 904 84 M 1045 18 L 1005 10 M 1005 36 L 965 28 M 965 55 L 928 48" stroke="#475569" strokeWidth="2" />
              {/* Main top horizontal stage truss */}
              <rect x="260" y="34" width="680" height="22" fill="#1a212c" stroke="#3c485a" strokeWidth="2.5" />
              {[270, 310, 350, 390, 430, 470, 510, 550, 590, 630, 670, 710, 750, 790, 830, 870, 910].map((bx) => (
                <path key={bx} d={`M ${bx} 34 L ${bx + 20} 56 L ${bx + 40} 34`} fill="none" stroke="#475569" strokeWidth="1.8" />
              ))}
            </g>

            {/* Glowing Arena Spotlights & Volumetric Mist Cones */}
            {[
              { x: 185, y: 12, w: 34, h: 16, spread: 140 },
              { x: 252, y: 42, w: 22, h: 14, spread: 110 },
              { x: 350, y: 54, w: 30, h: 14, spread: 150 },
              { x: 485, y: 56, w: 30, h: 14, spread: 160 },
              { x: 600, y: 56, w: 34, h: 15, spread: 180 },
              { x: 715, y: 56, w: 30, h: 14, spread: 160 },
              { x: 850, y: 54, w: 30, h: 14, spread: 150 },
              { x: 948, y: 42, w: 22, h: 14, spread: 110 },
              { x: 1015, y: 12, w: 34, h: 16, spread: 140 },
            ].map((l, idx) => (
              <g key={idx}>
                <polygon
                  points={`${l.x - l.w * 0.45},${l.y + l.h} ${l.x + l.w * 0.45},${l.y + l.h} ${l.x + l.spread},365 ${l.x - l.spread},365`}
                  fill="url(#lightCone)"
                />
                <rect
                  x={l.x - l.w / 2}
                  y={l.y}
                  width={l.w}
                  height={l.h}
                  rx="4"
                  fill={idx % 3 === 0 ? '#fef3c7' : '#f8fafc'}
                  stroke="#090a0c"
                  strokeWidth="2"
                />
              </g>
            ))}

            {/* Ringside Spectators & Photographer Silhouettes */}
            <path
              d="M 0 265 Q 50 232 110 248 Q 160 225 220 244 L 360 232 L 850 232 L 1000 238 Q 1080 220 1145 236 L 1200 228 L 1200 400 L 0 400 Z"
              fill="#0b0e14"
            />
            {[42, 92, 152, 212, 340, 415, 490, 560, 645, 725, 815, 895, 965, 1040, 1110, 1168].map((cx, i) => (
              <g key={cx} opacity="0.88">
                <circle cx={cx} cy={246 + (i % 3) * 5} r={8.5 + (i % 2)} fill="#1d232d" stroke="#07090d" strokeWidth="1.5" />
                <path
                  d={`M ${cx - 13} ${274 + (i % 3) * 4} C ${cx - 12} 256, ${cx + 12} 256, ${cx + 13} ${274 + (i % 3) * 4} Z`}
                  fill={i === 1 ? '#64748b' : '#13171f'}
                  stroke="#07090d"
                  strokeWidth="1.5"
                />
              </g>
            ))}

            {/* Animated Ringside Crowd Camera Flashes */}
            <circle cx="132" cy="242" r="14" fill="#ffffff" className="anim-crowd-flash-a" />
            <circle cx="998" cy="238" r="12" fill="#fef3c7" className="anim-crowd-flash-b" />

            {/* Ring Canvas Perspective Mat + Center "NINE LIMBS · LETHWEI" Graphic */}
            <polygon
              points="265,246 890,246 1200,320 1200,400 0,400 0,342"
              fill="url(#ringMatGrad)"
              stroke="#090a0c"
              strokeWidth="4"
            />
            <polygon
              points="265,246 890,246 1200,320 1200,400 0,400 0,342"
              fill="url(#matCenterPool)"
            />
            <polygon points="0,392 1200,392 1200,400 0,400" fill="#090a0c" />

            {/* Golden Angled Mat Branding ("NINE LIMBS · LETHWEI") */}
            <g transform="translate(600, 326) skewX(-12) scale(1, 0.42)" opacity="0.82">
              <ellipse cx="0" cy="0" rx="235" ry="118" fill="none" stroke="#eab308" strokeWidth="6" opacity="0.55" />
              <text
                x="0"
                y="-12"
                textAnchor="middle"
                fill="#eab308"
                fontFamily="Barlow Condensed, sans-serif"
                fontWeight="900"
                fontSize="66"
                letterSpacing="6"
              >
                NINE LIMBS
              </text>
              <text
                x="0"
                y="48"
                textAnchor="middle"
                fill="#facc15"
                fontFamily="Barlow Condensed, sans-serif"
                fontWeight="800"
                fontSize="42"
                letterSpacing="12"
              >
                LETHWEI
              </text>
            </g>

            {/* Animated Center Referee Watching & Reacting to Clashes */}
            <g
              className={phase === 'selecting' ? 'anim-referee-sway' : undefined}
              transform={
                phase === 'finished'
                  ? 'translate(566, 146) scale(1.05)'
                  : phase === 'resolving' || phase === 'clashing'
                  ? 'translate(566, 150) rotate(3 34 60)'
                  : 'translate(566, 152)'
              }
              opacity="0.96"
            >
              <ellipse cx="34" cy="126" rx="25" ry="5.5" fill="#06070a" opacity="0.58" />
              <path d="M 22 72 L 17 124 L 28 124 L 33 84 L 40 124 L 50 124 L 45 72 Z" fill="#181b22" stroke="#090a0c" strokeWidth="2.4" strokeLinejoin="round" />
              <path d="M 26 84 L 24 114 M 42 84 L 44 114" stroke="#334155" strokeWidth="1.2" opacity="0.6" />
              {/* Collared Referee Shirt & Belt */}
              <path d="M 17 28 L 51 28 L 46 73 L 22 73 Z" fill="#1f2530" stroke="#090a0c" strokeWidth="2.5" strokeLinejoin="round" />
              <rect x="21" y="68" width="26" height="5" fill="#090a0c" />
              <rect x="31" y="68" width="6" height="5" fill="#d97706" />
              <path d="M 26 28 L 34 39 L 42 28" fill="#0f172a" stroke="#fbbf24" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M 34 39 L 34 68" stroke="#090a0c" strokeWidth="1.4" opacity="0.6" />
              <path
                d={phase === 'finished' ? 'M 20 34 L 7 16 L 15 12 L 24 38' : 'M 20 34 L 10 54 L 17 58 L 24 42'}
                fill="#1f2530"
                stroke="#090a0c"
                strokeWidth="2.1"
              />
              <circle cx={phase === 'finished' ? 11 : 14} cy={phase === 'finished' ? 13 : 58} r="4.5" fill="#e5e7eb" stroke="#090a0c" strokeWidth="1.8" />
              <path
                d={phase === 'finished' ? 'M 48 34 L 61 16 L 53 12 L 44 38' : 'M 48 34 L 58 54 L 51 58 L 44 42'}
                fill="#1f2530"
                stroke="#090a0c"
                strokeWidth="2.1"
              />
              <circle cx={phase === 'finished' ? 57 : 54} cy={phase === 'finished' ? 13 : 58} r="4.5" fill="#e5e7eb" stroke="#090a0c" strokeWidth="1.8" />
              <rect x="29" y="18" width="10" height="10" fill="#a86d48" stroke="#090a0c" strokeWidth="2" />
              <path d="M 24 9 C 24 -1, 44 -1, 44 9 L 44 17 C 44 23, 39 26, 34 26 C 29 26, 24 23, 24 17 Z" fill="#c88d61" stroke="#090a0c" strokeWidth="2.4" />
              <path d="M 24 9 C 24 0, 44 0, 44 9 C 39 5.5, 29 5.5, 24 9 Z" fill="#18181b" stroke="#090a0c" strokeWidth="1.8" />
              <path d="M 28 13 L 32 13.5 M 36 13.5 L 40 13" stroke="#090a0c" strokeWidth="1.6" strokeLinecap="round" />
              <circle cx="30" cy="15.5" r="1.1" fill="#090a0c" />
              <circle cx="38" cy="15.5" r="1.1" fill="#090a0c" />
              <path d="M 31 21 L 37 21" stroke="#090a0c" strokeWidth="1.4" strokeLinecap="round" />
            </g>

            {/* Perspective Rear Ropes Behind Fighters */}
            {[166, 190, 214, 238].map((ry, i) => (
              <line
                key={ry}
                x1="305"
                y1={ry}
                x2="862"
                y2={ry + 6}
                stroke={i === 0 ? '#b91c1c' : i === 3 ? '#1e40af' : '#cbd5e1'}
                strokeWidth="4.5"
                opacity="0.72"
              />
            ))}

            {/* Left Perspective Turnbuckle Post (Red Corner) & 4 Side Ropes */}
            <rect x="290" y="152" width="26" height="106" rx="4" fill="#dc2626" stroke="#090a0c" strokeWidth="3.5" />
            <rect x="294" y="156" width="8" height="98" rx="2" fill="#ef4444" opacity="0.5" />
            {/* Left Side 4 Ropes (Top Red, Middle White, Bottom Blue) */}
            {[
              { y1: 186, y2: 162, color: '#dc2626' },
              { y1: 230, y2: 188, color: '#e2e8f0' },
              { y1: 274, y2: 214, color: '#e2e8f0' },
              { y1: 318, y2: 240, color: '#2563eb' },
            ].map((r, i) => (
              <g key={i}>
                <line x1="0" y1={r.y1} x2="292" y2={r.y2} stroke="#090a0c" strokeWidth="11" />
                <line x1="0" y1={r.y1} x2="292" y2={r.y2} stroke={r.color} strokeWidth="7" />
              </g>
            ))}

            {/* Right Perspective Turnbuckle Post (Blue Corner) & 4 Side Ropes */}
            <rect x="854" y="160" width="24" height="96" rx="4" fill="#1d4ed8" stroke="#090a0c" strokeWidth="3.5" />
            <rect x="858" y="164" width="7" height="88" rx="2" fill="#3b82f6" opacity="0.5" />
            {[
              { y1: 168, y2: 142, color: '#dc2626' },
              { y1: 192, y2: 174, color: '#e2e8f0' },
              { y1: 216, y2: 206, color: '#e2e8f0' },
              { y1: 240, y2: 238, color: '#2563eb' },
            ].map((r, i) => (
              <g key={i}>
                <line x1="876" y1={r.y1} x2="1200" y2={r.y2} stroke="#090a0c" strokeWidth="10" />
                <line x1="876" y1={r.y1} x2="1200" y2={r.y2} stroke={r.color} strokeWidth="6.5" />
              </g>
            ))}
          </svg>

          {/* Fighters Inside Ring (Articulated Hands, Legs, Body & Head Movement) */}
          <div className="relative z-10 h-full flex items-end justify-center gap-0 pb-3 px-4">
            {/* Player Sprite */}
            <div
              data-testid="player-sprite"
              className="relative h-[84%] aspect-[24/26] -mr-5 sm:-mr-7"
            >
              {impactFlash === 'player' && (
                <div className="absolute inset-0 rounded-full bg-red-500/35 animate-ping pointer-events-none" />
              )}
              <FighterAvatar
                mode="fullbody"
                gender={fighter.gender}
                appearance={fighter.appearance}
                pose={playerPose}
                position={position}
                animKey={animStepKey}
                isRhythm={phase === 'selecting'}
                facing="right"
                hasCut={playerState.bleedTurns > 0}
                isChampion={fighter.record.championshipWins > 0}
                className="w-full h-full drop-shadow-[0_12px_10px_rgba(0,0,0,0.88)]"
              />
              {popups
                .filter((p) => p.target === 'player')
                .map((p, idx) => (
                  <div
                    key={p.id}
                    style={{ top: `${8 + idx * 22}px` }}
                    className={`absolute left-1/2 pointer-events-none font-display font-extrabold text-2xl sm:text-3xl comic-text-stroke whitespace-nowrap animate-float-damage ${
                      p.tone === 'heal'
                        ? 'text-emerald-400'
                        : p.tone === 'evade'
                        ? 'text-sky-300'
                        : p.tone === 'block' || p.tone === 'counter'
                        ? 'text-amber-300'
                        : 'text-red-500'
                    }`}
                  >
                    {p.text}
                  </div>
                ))}
            </div>

            {/* Center Impact Starburst Flash on Hit */}
            {impactFlash !== 'none' && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-[34%] -translate-x-1/2 -translate-y-1/2 z-20"
              >
                <div className="w-16 h-16 rounded-full border-4 border-amber-300/80 animate-ping" />
              </div>
            )}

            {/* Opponent Sprite */}
            <div
              data-testid="opponent-sprite"
              className="relative h-[84%] aspect-[24/26] -ml-5 sm:-ml-7"
            >
              {impactFlash === 'opponent' && (
                <div className="absolute inset-0 rounded-full bg-amber-400/35 animate-ping pointer-events-none" />
              )}
              <FighterAvatar
                mode="fullbody"
                gender={opponent.gender}
                appearance={opponent.appearance}
                pose={aiPose}
                position={position}
                animKey={animStepKey}
                isRhythm={phase === 'selecting'}
                facing="left"
                hasCut={aiState.bleedTurns > 0}
                isChampion={opponent.isChampion}
                className="w-full h-full drop-shadow-[0_12px_10px_rgba(0,0,0,0.88)]"
              />
              {popups
                .filter((p) => p.target === 'opponent')
                .map((p, idx) => (
                  <div
                    key={p.id}
                    style={{ top: `${8 + idx * 22}px` }}
                    className={`absolute left-1/2 pointer-events-none font-display font-extrabold text-2xl sm:text-3xl comic-text-stroke whitespace-nowrap animate-float-damage ${
                      p.tone === 'heal'
                        ? 'text-emerald-400'
                        : p.tone === 'evade'
                        ? 'text-sky-300'
                        : p.tone === 'block' || p.tone === 'counter'
                        ? 'text-amber-300'
                        : p.tone === 'cut'
                        ? 'text-rose-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {p.text}
                  </div>
                ))}
            </div>
          </div>
          </div>

          {activeCameraView === 'cover' && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 shadow-[inset_0_0_90px_rgba(0,0,0,0.75)]"
            />
          )}

          {/* Non-Blocking Top-Center Clash Pill (NEVER obscures fighters during clash or attack animation!) */}
          {(phase === 'clashing' || phase === 'resolving') && (selectedPlayerChoice || selectedAiChoice) && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 pointer-events-none">
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#0d1016]/90 border border-amber-500/70 shadow-lg backdrop-blur-xs">
                <span className="text-[11px] font-bold text-red-300 truncate max-w-[160px]">
                  {selectedPlayerChoice === 'REST'
                    ? 'REST (+4 STA)'
                    : selectedPlayerChoice
                    ? localizeCard(selectedPlayerChoice, lang).name
                    : ''}
                </span>
                <span className="font-display font-extrabold italic text-xs text-amber-400">VS</span>
                <span className="text-[11px] font-bold text-sky-300 truncate max-w-[160px]">
                  {selectedAiChoice === 'REST'
                    ? 'REST (+4 STA)'
                    : selectedAiChoice
                    ? localizeCard(selectedAiChoice, lang).name
                    : ''}
                </span>
              </div>
              {renderSpeedAdvantage() && (
                <div className="px-2.5 py-0.5 rounded bg-amber-500/95 text-black font-display font-extrabold text-[11px] tracking-wider comic-panel-sm">
                  {renderSpeedAdvantage()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Last Turn Combat Feed Strip */}
        <div className="shrink-0 bg-[#151820] rounded-lg border border-zinc-800 px-3 py-1 text-xs text-zinc-200 truncate">
          {lastSummary ? (
            <>
              <span className="font-bold text-amber-400 mr-2">
                {selectedPlayerChoice && selectedPlayerChoice !== 'REST'
                  ? localizeCard(selectedPlayerChoice, lang).name
                  : lastSummary.playerActionLabel}{' '}
                vs{' '}
                {selectedAiChoice && selectedAiChoice !== 'REST'
                  ? localizeCard(selectedAiChoice, lang).name
                  : lastSummary.aiActionLabel}:
              </span>
              <span>{lastSummary.logs.join(' ')}</span>
            </>
          ) : (
            <span className="text-zinc-300 font-medium">
              {turnRole === 'player_attack' ? t.attackTurnBanner : t.defenseTurnBanner} · {t.waitingStanceHint}
            </span>
          )}
        </div>
      </section>

      {/* ================= BOTTOM CARD HAND & REST / CRITICAL TRAY ================= */}
      <footer className="shrink-0 bg-[#12141a] border-t-2 border-[#090a0c] px-4 sm:px-6 py-1.5">
        <div className="max-w-7xl mx-auto space-y-1">
          {isPlayerCritical && criticalCards.length > 0 && (
            <div className="px-2.5 py-1 rounded-lg bg-red-950/60 border border-amber-500 flex items-center gap-3">
              <div className="flex items-center gap-1.5 shrink-0">
                <Flame className="w-4 h-4 text-amber-400" aria-hidden="true" />
                <span className="font-display font-extrabold text-sm text-amber-300">
                  {t.criticalTitle}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 flex-1">
                {criticalCards.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    disabled={phase !== 'selecting' || card.staCost > playerState.sta}
                    onClick={() => handleSelectAction(card)}
                    className="flex items-center justify-between gap-1.5 px-2.5 py-1 rounded bg-[#6e1c1c] hover:bg-[#852222] border border-amber-400/80 disabled:opacity-45 text-left cursor-pointer"
                  >
                    <span className="font-display font-bold text-xs text-white truncate">
                      {localizeCard(card, lang).name}
                    </span>
                    <span className="font-mono-num text-[10px] font-bold bg-black/40 px-1.5 py-0.5 rounded text-amber-200 shrink-0">
                      {card.staCost}S
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 5 Role-Filtered Cards (Attack on Odd Turns, Defense on Even Turns) + REST */}
          <div className="grid grid-cols-6 gap-2.5 items-stretch">
            {playerHandIds.map((cardId, idx) => {
              const card = getCardById(cardId, customCards);
              if (!card) return null;
              const disabled = phase !== 'selecting' || card.staCost > playerState.sta;
              const triRatio = getTriangleDominanceBonus(
                playerRadar,
                aiRadar,
                position,
                card.strikeZone
              );
              const effPower = calculateEffectivePower(
                card,
                fighter.stats,
                fighter.gymId,
                playerSkills,
                triRatio
              );
              return (
                <CombatCard
                  key={`${cardId}_${idx}`}
                  card={card}
                  effectivePower={effPower}
                  triangleBonusPct={Math.round(triRatio * 100)}
                  disabled={disabled}
                  lang={lang}
                  onClick={() => handleSelectAction(card)}
                />
              );
            })}

            <button
              type="button"
              disabled={phase !== 'selecting'}
              onClick={() => handleSelectAction('REST')}
              className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg comic-panel transition-transform duration-150 cursor-pointer disabled:opacity-45 ${
                !hasPlayableCardInHand
                  ? 'bg-sky-600 hover:bg-sky-500 text-white ring-2 ring-amber-400'
                  : 'bg-[#1c2029] hover:bg-[#252a36] text-zinc-100'
              }`}
            >
              <Coffee className="w-6 h-6 text-sky-300" aria-hidden="true" />
              <div className="font-display font-extrabold text-sm sm:text-base leading-tight text-center">
                {t.restBtn}
              </div>
              <div className="text-[11px] font-mono-num font-bold text-sky-200 bg-black/30 px-2 py-0.5 rounded">
                {t.restCost}
              </div>
            </button>
          </div>
        </div>
      </footer>

      {/* ================= PAUSE MODAL ================= */}
      {phase === 'paused' && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pause-title"
        >
          <div className="bg-[#181b22] rounded-xl comic-panel max-w-sm w-full p-6 text-center space-y-4">
            <h2 id="pause-title" className="font-display font-extrabold text-3xl text-amber-400">
              {t.pausedTitle}
            </h2>
            <p className="text-sm text-zinc-300">
              {t.roundWord} {round}/{MAX_ROUNDS} · {fighter.name} vs {opponent.name}
            </p>
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setPhase('selecting')}
                className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-display font-bold text-xl comic-panel-sm cursor-pointer"
              >
                {t.resumeFight}
              </button>
              <button
                type="button"
                onClick={onExitToHub}
                className="w-full py-2.5 rounded-lg bg-[#101217] hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm font-semibold cursor-pointer"
              >
                {t.forfeitBout}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= VICTORY / DEFEAT MODAL ================= */}
      {phase === 'finished' && matchResult && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="result-title"
        >
          <div className="bg-[#181b22] rounded-xl comic-panel max-w-md w-full p-6 space-y-4">
            <div className="text-center">
              {matchResult.winner === 'player' ? (
                <Trophy className="w-11 h-11 text-amber-400 mx-auto mb-1" aria-hidden="true" />
              ) : (
                <Shield className="w-11 h-11 text-red-500 mx-auto mb-1" aria-hidden="true" />
              )}
              <h2
                id="result-title"
                className={`font-display font-extrabold text-4xl tracking-wide ${
                  matchResult.winner === 'player' ? 'text-amber-400' : 'text-red-500'
                }`}
              >
                {matchResult.winner === 'player' ? t.victoryTitle : t.defeatTitle}
              </h2>
              <div className="text-sm font-semibold text-zinc-200 mt-1">
                {matchResult.method} · {t.roundWord} {round}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-2.5 rounded-lg bg-[#101217] border border-zinc-800">
                <div className="text-[10px] uppercase text-zinc-400 font-bold">{t.damageLabel}</div>
                <div className="font-mono-num font-bold text-xl text-red-400">
                  {playerState.totalDamageDealt}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#101217] border border-zinc-800">
                <div className="text-[10px] uppercase text-zinc-400 font-bold">{t.strikesLabel}</div>
                <div className="font-mono-num font-bold text-xl text-white">
                  {playerState.strikesLanded}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#101217] border border-zinc-800">
                <div className="text-[10px] uppercase text-zinc-400 font-bold">{t.xpEarnedLabel}</div>
                <div className="font-mono-num font-bold text-xl text-amber-400">
                  +{matchResult.xpEarned}
                </div>
              </div>
            </div>

            <div className="text-xs text-zinc-300 bg-[#101217] p-2.5 rounded-lg border border-zinc-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Swords className="w-4 h-4 text-red-400" aria-hidden="true" />
                <span>Headbutts Landed: {playerState.headbuttsLanded}</span>
              </span>
              <span className="font-mono-num text-emerald-400">
                {mode === 'sparring' ? 'Sparring XP Added' : 'Official Record Updated'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                data-start="true"
                onClick={() => {
                  soundEngine.playClick();
                  onRematch();
                }}
                className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-lg bg-[#101217] hover:bg-zinc-800 border border-zinc-700 text-white font-display font-bold text-lg cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                <span>{t.newBout}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onExitToHub();
                }}
                className="py-3 px-4 rounded-lg bg-red-600 hover:bg-red-500 text-white font-display font-bold text-lg comic-panel-sm cursor-pointer"
              >
                {t.returnToGym}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
