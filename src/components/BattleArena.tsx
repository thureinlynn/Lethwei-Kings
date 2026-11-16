import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  Coffee,
  Flame,
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
  calculateEffectivePower,
  chooseAiAction,
  CombatantState,
  CRITICAL_HP_THRESHOLD,
  drawBattleHand,
  evaluateMatchOutcome,
  getAvailableCriticalCards,
  MAX_ROUNDS,
  resolveTurn,
  TURNS_PER_ROUND,
} from '../game/rules';
import {
  CombatCard as CombatCardType,
  FighterPose,
  FighterProfile,
  FloatingPopup,
  MatchMode,
  OpponentProfile,
  TurnResolutionSummary,
} from '../types/game';
import { soundEngine } from '../utils/sound';
import { CombatCard } from './CombatCard';
import { FighterAvatar } from './FighterAvatar';

interface BattleArenaProps {
  fighter: FighterProfile;
  opponent: OpponentProfile;
  mode: MatchMode;
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
  onMatchFinish,
  onExitToHub,
  onRematch,
}) => {
  const [round, setRound] = useState(1);
  const [turn, setTurn] = useState(1);
  const [phase, setPhase] = useState<TurnPhase>('selecting');
  const [muted, setMuted] = useState(soundEngine.muted);

  const customCards = fighter.customCards ?? [];

  const [playerState, setPlayerState] = useState<CombatantState>({
    hp: fighter.maxHp,
    maxHp: fighter.maxHp,
    sta: fighter.maxSta,
    maxSta: fighter.maxSta,
    bleedTurns: 0,
    slowPenalty: 0,
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
    maniUsed: false,
    totalDamageDealt: 0,
    strikesLanded: 0,
    headbuttsLanded: 0,
  });

  const [playerHandIds, setPlayerHandIds] = useState<string[]>(() =>
    drawBattleHand(fighter.activeDeckIds, 5)
  );
  const [aiHandIds, setAiHandIds] = useState<string[]>(() =>
    drawBattleHand(opponent.deckIds, 5)
  );

  const [selectedPlayerChoice, setSelectedPlayerChoice] = useState<
    CombatCardType | 'REST' | null
  >(null);
  const [selectedAiChoice, setSelectedAiChoice] = useState<
    CombatCardType | 'REST' | null
  >(null);

  const [playerPose, setPlayerPose] = useState<FighterPose>('idle');
  const [aiPose, setAiPose] = useState<FighterPose>('idle');
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
    () => getAvailableCriticalCards(playerState),
    [playerState]
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

  const mapCardToPose = (choice: CombatCardType | 'REST'): FighterPose => {
    if (choice === 'REST') return 'idle';
    switch (choice.artType) {
      case 'jab':
      case 'uppercut':
        return 'jab';
      case 'hook':
        return 'hook';
      case 'roundhouse':
      case 'sidekick':
      case 'lowkick':
        return 'kick';
      case 'elbow':
        return 'elbow';
      case 'knee':
        return 'knee';
      case 'headbutt':
      case 'desperation':
        return 'headbutt';
      case 'slam':
        return 'slam';
      case 'evade':
        return 'evade';
      case 'block':
      case 'sprawl':
      case 'catchkick':
      case 'parry':
      case 'surge':
      case 'mani':
      case 'groggy':
        return 'block';
      default:
        return 'idle';
    }
  };

  const spawnPopups = (summary: TurnResolutionSummary) => {
    const next: FloatingPopup[] = [];
    const ts = Date.now();
    if (summary.playerDamageDealt > 0) {
      next.push({
        id: `p_dmg_${ts}`,
        target: 'opponent',
        text: `-${summary.playerDamageDealt}`,
        tone: summary.playerDamageDealt >= 12 ? 'heavy' : 'damage',
      });
    }
    if (summary.aiBlocked > 0) {
      next.push({ id: `a_blk_${ts}`, target: 'opponent', text: `BLOCKED!`, tone: 'block' });
    }
    if (summary.aiEvaded) {
      next.push({ id: `a_ev_${ts}`, target: 'opponent', text: `EVADED!`, tone: 'evade' });
    }
    if (summary.aiCutApplied) {
      next.push({ id: `a_cut_${ts}`, target: 'opponent', text: `CUT!`, tone: 'cut' });
    }
    if (summary.playerHealed > 0) {
      next.push({
        id: `p_heal_${ts}`,
        target: 'player',
        text: `MANI +${summary.playerHealed} HP`,
        tone: 'heal',
      });
    }

    if (summary.aiDamageDealt > 0) {
      next.push({
        id: `a_dmg_${ts}`,
        target: 'player',
        text: `-${summary.aiDamageDealt}`,
        tone: summary.aiDamageDealt >= 12 ? 'heavy' : 'damage',
      });
    }
    if (summary.playerBlocked > 0) {
      next.push({ id: `p_blk_${ts}`, target: 'player', text: `BLOCKED!`, tone: 'block' });
    }
    if (summary.playerEvaded) {
      next.push({ id: `p_ev_${ts}`, target: 'player', text: `EVADED!`, tone: 'evade' });
    }
    if (summary.playerCutApplied) {
      next.push({ id: `p_cut_${ts}`, target: 'player', text: `CUT!`, tone: 'cut' });
    }
    if (summary.aiHealed > 0) {
      next.push({
        id: `a_heal_${ts}`,
        target: 'opponent',
        text: `MANI +${summary.aiHealed} HP`,
        tone: 'heal',
      });
    }

    setPopups(next);
  };

  const handleSelectAction = (choice: CombatCardType | 'REST') => {
    if (phase !== 'selecting') return;
    if (choice !== 'REST' && choice.staCost > playerState.sta) return;

    clearAllTimers();
    soundEngine.playClick();

    const aiPick = chooseAiAction(aiHandIds, aiState);
    setSelectedPlayerChoice(choice);
    setSelectedAiChoice(aiPick);
    setPhase('clashing');
    setBannerText('CLASH!');

    const t1 = window.setTimeout(() => {
      const resolution = resolveTurn({
        roundNumber: round,
        turnNumber: turn,
        playerChoice: choice,
        aiChoice: aiPick,
        playerState,
        aiState,
        playerStats: fighter.stats,
        aiStats: opponent.stats,
        playerGymId: fighter.gymId,
      });

      const pNext = { ...resolution.nextPlayerState };
      const aNext = { ...resolution.nextAiState };

      setPlayerState(pNext);
      setAiState(aNext);
      setLastSummary(resolution.summary);
      spawnPopups(resolution.summary);
      setPhase('resolving');

      const pPose = mapCardToPose(choice);
      const aPose = mapCardToPose(aiPick);
      setPlayerPose(
        aNext.hp <= 0
          ? 'victory'
          : resolution.summary.aiDamageDealt >= 10 && choice === 'REST'
          ? 'hit'
          : pPose
      );
      setAiPose(
        aNext.hp <= 0
          ? 'ko'
          : pNext.hp <= 0
          ? 'victory'
          : resolution.summary.playerDamageDealt >= 10 && aiPick === 'REST'
          ? 'hit'
          : aPose
      );

      const maxDmg = Math.max(
        resolution.summary.playerDamageDealt,
        resolution.summary.aiDamageDealt
      );
      if (maxDmg >= 11) {
        soundEngine.playHeavyHit();
        setShakeLevel('heavy');
        setImpactFlash(
          resolution.summary.playerDamageDealt >= resolution.summary.aiDamageDealt
            ? 'opponent'
            : 'player'
        );
      } else if (maxDmg > 0) {
        soundEngine.playLightHit();
        setShakeLevel('light');
        setImpactFlash(
          resolution.summary.playerDamageDealt >= resolution.summary.aiDamageDealt
            ? 'opponent'
            : 'player'
        );
      } else if (resolution.summary.playerEvaded || resolution.summary.aiEvaded) {
        soundEngine.playEvade();
      } else if (resolution.summary.playerBlocked > 0 || resolution.summary.aiBlocked > 0) {
        soundEngine.playBlock();
      }

      const outcome = evaluateMatchOutcome(pNext, aNext, round, turn);

      const t2 = window.setTimeout(() => {
        setShakeLevel('none');
        setImpactFlash('none');
        setPopups([]);

        if (outcome.finished && outcome.winner && outcome.winner !== 'draw') {
          const isKo = aNext.hp <= 0 || pNext.hp <= 0;
          soundEngine.playBell(3);
          const xpBase = mode === 'sparring' ? 35 : mode === 'local' ? 55 : 100;
          const xpEarned =
            outcome.winner === 'player'
              ? xpBase + (isKo ? 15 : 0)
              : Math.round(xpBase * 0.4);

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

        if (turn >= TURNS_PER_ROUND) {
          const nextRound = round + 1;
          soundEngine.playBell(1);
          setPlayerState((prev) => ({
            ...prev,
            sta: Math.min(prev.maxSta, prev.sta + 3),
            hp: Math.min(prev.maxHp, prev.hp + 2),
          }));
          setAiState((prev) => ({
            ...prev,
            sta: Math.min(prev.maxSta, prev.sta + 3),
            hp: Math.min(prev.maxHp, prev.hp + 2),
          }));
          setRound(nextRound);
          setTurn(1);
          setBannerText(`ROUND ${nextRound} · CORNER RECOVERY (+3 STA)`);
        } else {
          setTurn((t) => t + 1);
          setBannerText(`TURN ${turn + 1} · CHOOSE YOUR MOVE`);
        }

        setPlayerHandIds(drawBattleHand(fighter.activeDeckIds, 5));
        setAiHandIds(drawBattleHand(opponent.deckIds, 5));
        setPhase('selecting');
      }, 600);

      timersRef.current.push(t2);
    }, 420);

    timersRef.current.push(t1);
  };

  const pHpPct = Math.max(0, Math.round((playerState.hp / playerState.maxHp) * 100));
  const pStaPct = Math.max(0, Math.round((playerState.sta / playerState.maxSta) * 100));
  const aHpPct = Math.max(0, Math.round((aiState.hp / aiState.maxHp) * 100));
  const aStaPct = Math.max(0, Math.round((aiState.sta / aiState.maxSta) * 100));

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
    if (pSpd < aSpd) return `SPD ${pSpd} vs ${aSpd} · YOU STRIKE FIRST`;
    if (aSpd < pSpd) return `SPD ${pSpd} vs ${aSpd} · OPPONENT STRIKES FIRST`;
    return `SPD ${pSpd} TIE · STAT SPEED DECIDES`;
  };

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
      <header className="shrink-0 bg-[#14161d] border-b-2 border-[#090a0c] px-4 sm:px-6 py-2">
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
                  {playerState.sta} STA
                </span>
              </div>
            </div>
          </div>

          {/* CENTER: Round, Turn, Mani Status, Mute/Pause */}
          <div className="col-span-2 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-xl text-amber-400 leading-none">
                RND {round}/{MAX_ROUNDS}
              </span>
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
            <div className="font-mono-num text-[11px] text-zinc-300">
              Turn {turn}/{TURNS_PER_ROUND}
            </div>
            <div
              className={`flex items-center gap-1 text-[10px] font-bold uppercase ${
                playerState.maniUsed
                  ? 'text-zinc-500'
                  : isPlayerCritical
                  ? 'text-emerald-400'
                  : 'text-amber-300'
              }`}
            >
              <Timer className="w-3 h-3" aria-hidden="true" />
              <span>{playerState.maniUsed ? 'MANI USED' : isPlayerCritical ? 'MANI READY!' : 'MANI 1/1'}</span>
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
                  {aiState.sta} STA
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

      {/* ================= CENTER RING STAGE (Flex-1, Matches Image 2 Style) ================= */}
      <section className="flex-1 min-h-0 max-w-7xl w-full mx-auto px-4 sm:px-6 py-2 flex flex-col gap-1.5">
        <div className="shrink-0 flex items-center justify-between text-xs text-zinc-400">
          <span>
            {mode === 'sparring'
              ? 'Gym Sparring · Standing Rules Only'
              : mode === 'local'
              ? 'Local Promotion · Official Bout'
              : 'World Championship · Golden Belt'}
            {opponent.isAiGenerated ? ` · AI Challenger (${opponent.styleLabel})` : ''}
          </span>
          <span className="font-display font-bold text-sm tracking-wider text-amber-400">
            {bannerText}
          </span>
        </div>

        {/* Image 2 Style Fighting Stage (Overhead Trusses, Referee, Nine Limbs Mat, Red/White/Blue Ropes) */}
        <div
          data-testid="battle-ring"
          className="relative flex-1 min-h-0 w-full rounded-xl comic-panel overflow-hidden bg-[#0c0e13]"
        >
          <svg
            viewBox="0 0 1200 400"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <radialGradient id="stageSpotlight" cx="50%" cy="40%" r="55%">
                <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.22" />
                <stop offset="55%" stopColor="#1e2430" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#090a0c" stopOpacity="0.98" />
              </radialGradient>
            </defs>
            <rect width="1200" height="400" fill="#090b10" />
            <rect width="1200" height="400" fill="url(#stageSpotlight)" />

            {/* Overhead Steel Lighting Truss & Spotlights (Image 2 Style) */}
            <g stroke="#2a2f3a" strokeWidth="3">
              <line x1="220" y1="0" x2="220" y2="210" />
              <line x1="980" y1="0" x2="980" y2="210" />
              <line x1="160" y1="28" x2="1040" y2="28" strokeWidth="6" />
              <line x1="160" y1="44" x2="1040" y2="44" strokeWidth="4" />
            </g>
            {[290, 440, 600, 760, 910].map((lx) => (
              <g key={lx}>
                <polygon
                  points={`${lx - 14},44 ${lx + 14},44 ${lx + 110},340 ${lx - 110},340`}
                  fill="#fef3c7"
                  opacity="0.04"
                />
                <rect x={lx - 14} y="36" width="28" height="14" rx="3" fill="#fef3c7" stroke="#090a0c" strokeWidth="2" />
              </g>
            ))}

            {/* Crowd & Photographers Silhouettes */}
            <path
              d="M 0 210 Q 80 185 160 205 T 320 200 T 480 205 T 640 198 T 800 205 T 960 198 T 1120 205 L 1200 200 L 1200 400 L 0 400 Z"
              fill="#0c0e13"
            />

            {/* Ring Canvas Perspective Mat */}
            <polygon
              points="70,240 1130,240 1200,400 0,400"
              fill="#262b36"
              stroke="#090a0c"
              strokeWidth="4"
            />
            {/* Mat "NINE LIMBS LETHWEI" Emblem (Image 2 Inspired) */}
            <ellipse cx="600" cy="322" rx="220" ry="48" fill="#1b1f28" stroke="#eab308" strokeWidth="3" strokeOpacity="0.65" />
            <text
              x="600"
              y="328"
              textAnchor="middle"
              fill="#eab308"
              opacity="0.45"
              fontFamily="Barlow Condensed, sans-serif"
              fontWeight="800"
              fontSize="30"
              letterSpacing="4"
            >
              NINE LIMBS · LETHWEI
            </text>

            {/* Center Referee Watching Action (Image 2 Style) */}
            <g transform="translate(572, 118)" opacity="0.9">
              <circle cx="28" cy="14" r="9.5" fill="#c88d61" stroke="#090a0c" strokeWidth="2.2" />
              <path d="M 16 26 L 40 26 L 38 78 L 18 78 Z" fill="#18181b" stroke="#090a0c" strokeWidth="2.2" />
              <path d="M 20 78 L 18 128 M 36 78 L 38 128" stroke="#090a0c" strokeWidth="7" strokeLinecap="round" />
            </g>

            {/* Corner Turnbuckle Pads & Red/White/Blue Ropes */}
            <rect x="64" y="88" width="22" height="164" rx="4" fill="#dc2626" stroke="#090a0c" strokeWidth="3.5" />
            <rect x="1114" y="88" width="22" height="164" rx="4" fill="#1d4ed8" stroke="#090a0c" strokeWidth="3.5" />
            <line x1="86" y1="112" x2="1114" y2="112" stroke="#dc2626" strokeWidth="7" />
            <line x1="86" y1="154" x2="1114" y2="154" stroke="#f5f2eb" strokeWidth="7" />
            <line x1="86" y1="196" x2="1114" y2="196" stroke="#1d4ed8" strokeWidth="7" />
          </svg>

          {/* Fighters Inside Ring */}
          <div className="relative z-10 h-full flex items-end justify-center gap-8 sm:gap-16 pb-2 px-4">
            {/* Player Sprite */}
            <div className="relative h-[82%] aspect-[22/26] transition-transform duration-150">
              {impactFlash === 'player' && (
                <div className="absolute inset-0 rounded-full bg-red-500/35 animate-ping pointer-events-none" />
              )}
              <FighterAvatar
                mode="fullbody"
                gender={fighter.gender}
                appearance={fighter.appearance}
                pose={playerPose}
                facing="right"
                hasCut={playerState.bleedTurns > 0}
                isChampion={fighter.record.championshipWins > 0}
                className="w-full h-full drop-shadow-[0_10px_8px_rgba(0,0,0,0.85)]"
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
                        : p.tone === 'block'
                        ? 'text-amber-300'
                        : 'text-red-500'
                    }`}
                  >
                    {p.text}
                  </div>
                ))}
            </div>

            {/* Opponent Sprite */}
            <div className="relative h-[82%] aspect-[22/26] transition-transform duration-150">
              {impactFlash === 'opponent' && (
                <div className="absolute inset-0 rounded-full bg-amber-400/35 animate-ping pointer-events-none" />
              )}
              <FighterAvatar
                mode="fullbody"
                gender={opponent.gender}
                appearance={opponent.appearance}
                pose={aiPose}
                facing="left"
                hasCut={aiState.bleedTurns > 0}
                isChampion={opponent.isChampion}
                className="w-full h-full drop-shadow-[0_10px_8px_rgba(0,0,0,0.85)]"
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
                        : p.tone === 'block'
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

          {/* Middle Clash Zone Overlay */}
          {(selectedPlayerChoice || selectedAiChoice) && (
            <div className="absolute inset-0 z-20 bg-black/60 flex flex-col items-center justify-center p-2">
              {renderSpeedAdvantage() && (
                <div className="mb-1.5 px-3 py-0.5 rounded bg-amber-500 text-black font-display font-extrabold text-xs tracking-wider comic-panel-sm">
                  {renderSpeedAdvantage()}
                </div>
              )}
              <div className="flex items-center justify-center gap-6">
                <div className="w-36">
                  <div className="text-[10px] font-bold uppercase text-center text-sky-300 mb-0.5">
                    YOUR MOVE
                  </div>
                  {selectedPlayerChoice === 'REST' ? (
                    <div className="p-3 rounded-lg bg-[#20232b] comic-panel text-center">
                      <Coffee className="w-6 h-6 text-sky-400 mx-auto mb-1" />
                      <div className="font-display font-bold text-base text-white">REST</div>
                      <div className="text-[11px] text-sky-300">+4 STA</div>
                    </div>
                  ) : selectedPlayerChoice ? (
                    <CombatCard
                      card={selectedPlayerChoice}
                      effectivePower={calculateEffectivePower(
                        selectedPlayerChoice,
                        fighter.stats,
                        fighter.gymId
                      )}
                      compact
                    />
                  ) : null}
                </div>

                <div className="font-display font-extrabold italic text-2xl text-red-500 comic-text-stroke">
                  VS
                </div>

                <div className="w-36">
                  <div className="text-[10px] font-bold uppercase text-center text-red-300 mb-0.5">
                    OPPONENT MOVE
                  </div>
                  {selectedAiChoice === 'REST' ? (
                    <div className="p-3 rounded-lg bg-[#20232b] comic-panel text-center">
                      <Coffee className="w-6 h-6 text-sky-400 mx-auto mb-1" />
                      <div className="font-display font-bold text-base text-white">REST</div>
                      <div className="text-[11px] text-sky-300">+4 STA</div>
                    </div>
                  ) : selectedAiChoice ? (
                    <CombatCard
                      card={selectedAiChoice}
                      effectivePower={calculateEffectivePower(selectedAiChoice, opponent.stats)}
                      compact
                    />
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Last Turn Combat Feed Strip */}
        <div className="shrink-0 bg-[#151820] rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-200 truncate">
          {lastSummary ? (
            <>
              <span className="font-bold text-amber-400 mr-2">
                Last Clash ({lastSummary.playerActionLabel} vs {lastSummary.aiActionLabel}):
              </span>
              <span>{lastSummary.logs.join(' ')}</span>
            </>
          ) : (
            <span className="text-zinc-400">
              Select 1 of your 5 drawn cards below to clash. Lower SPD strikes first!
            </span>
          )}
        </div>
      </section>

      {/* ================= BOTTOM CARD HAND & REST / CRITICAL TRAY ================= */}
      <footer className="shrink-0 bg-[#12141a] border-t-2 border-[#090a0c] px-4 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto space-y-1.5">
          {isPlayerCritical && criticalCards.length > 0 && (
            <div className="px-2.5 py-1.5 rounded-lg bg-red-950/60 border border-amber-500 flex items-center gap-3">
              <div className="flex items-center gap-1.5 shrink-0">
                <Flame className="w-4 h-4 text-amber-400" aria-hidden="true" />
                <span className="font-display font-extrabold text-sm text-amber-300">
                  CRITICAL (&lt;35% HP):
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
                      {card.name}
                    </span>
                    <span className="font-mono-num text-[10px] font-bold bg-black/40 px-1.5 py-0.5 rounded text-amber-200 shrink-0">
                      {card.staCost}S
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 5 Drawn Cards + REST / RECOVER STA Button */}
          <div className="grid grid-cols-6 gap-2.5 items-stretch">
            {playerHandIds.map((cardId, idx) => {
              const card = getCardById(cardId, customCards);
              if (!card) return null;
              const disabled = phase !== 'selecting' || card.staCost > playerState.sta;
              const effPower = calculateEffectivePower(card, fighter.stats, fighter.gymId);
              return (
                <CombatCard
                  key={`${cardId}_${idx}`}
                  card={card}
                  effectivePower={effPower}
                  disabled={disabled}
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
              <div className="font-display font-extrabold text-base leading-tight text-center">
                REST / RECOVER STA
              </div>
              <div className="text-[11px] font-mono-num font-bold text-sky-200 bg-black/30 px-2 py-0.5 rounded">
                +4 STA · 0 COST
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
              BOUT PAUSED
            </h2>
            <p className="text-sm text-zinc-300">
              Round {round} of {MAX_ROUNDS} · {fighter.name} vs {opponent.name}
            </p>
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setPhase('selecting')}
                className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-display font-bold text-xl comic-panel-sm cursor-pointer"
              >
                RESUME FIGHT
              </button>
              <button
                type="button"
                onClick={onExitToHub}
                className="w-full py-2.5 rounded-lg bg-[#101217] hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm font-semibold cursor-pointer"
              >
                Return to Gym (Forfeit Bout)
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
                {matchResult.winner === 'player' ? 'VICTORY!' : 'DEFEATED'}
              </h2>
              <div className="text-sm font-semibold text-zinc-200 mt-1">
                {matchResult.method} · Round {round}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-2.5 rounded-lg bg-[#101217] border border-zinc-800">
                <div className="text-[10px] uppercase text-zinc-400 font-bold">Damage</div>
                <div className="font-mono-num font-bold text-xl text-red-400">
                  {playerState.totalDamageDealt}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#101217] border border-zinc-800">
                <div className="text-[10px] uppercase text-zinc-400 font-bold">Strikes</div>
                <div className="font-mono-num font-bold text-xl text-white">
                  {playerState.strikesLanded}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#101217] border border-zinc-800">
                <div className="text-[10px] uppercase text-zinc-400 font-bold">XP Earned</div>
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
                <span>NEW BOUT</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onExitToHub();
                }}
                className="py-3 px-4 rounded-lg bg-red-600 hover:bg-red-500 text-white font-display font-bold text-lg comic-panel-sm cursor-pointer"
              >
                RETURN TO GYM
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
