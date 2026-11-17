import React, { useMemo } from 'react';
import { CheckCircle2, Layers, Plus, Shield, Swords, Trash2, Triangle, X } from 'lucide-react';
import { CARD_DATABASE, DEFAULT_STARTER_DECK, getCardById } from '../data/cards';
import {
  computeStanceRadar,
  DECK_SIZE,
  MIN_DEFENSE_CARDS,
  MIN_STRIKE_CARDS,
  validateDeck,
} from '../game/rules';
import { localizeCard, UI_TEXT } from '../i18n/translations';
import {
  CombatCard as CombatCardType,
  CombatPosition,
  FighterProfile,
  Language,
  MatchMode,
  OpponentProfile,
} from '../types/game';
import { soundEngine } from '../utils/sound';
import { CombatCard } from './CombatCard';
import { FighterAvatar } from './FighterAvatar';

interface PreFightPlannerModalProps {
  fighter: FighterProfile;
  opponent: OpponentProfile;
  mode: MatchMode;
  lang: Language;
  onUpdateFighter: (updated: FighterProfile) => void;
  onConfirmEnterRing: () => void;
  onClose: () => void;
}

export const PreFightPlannerModal: React.FC<PreFightPlannerModalProps> = ({
  fighter,
  opponent,
  mode,
  lang,
  onUpdateFighter,
  onConfirmEnterRing,
  onClose,
}) => {
  const [deckFilter, setDeckFilter] = React.useState<'all' | 'Striking' | 'Defense'>('all');
  const [posFilter, setPosFilter] = React.useState<'all' | CombatPosition>('all');
  const t = UI_TEXT[lang];
  const customCards = fighter.customCards ?? [];
  const deckCheck = validateDeck(fighter.activeDeckIds, fighter.unlockedCardIds, customCards);

  const deckCards = useMemo(
    () =>
      fighter.activeDeckIds
        .map((id) => getCardById(id, customCards))
        .filter((c): c is CombatCardType => Boolean(c)),
    [fighter.activeDeckIds, customCards]
  );

  const atkCount = deckCards.filter((c) => c.category === 'Striking').length;
  const defCount = deckCards.filter((c) => c.category === 'Defense').length;

  const playerRadar = useMemo(
    () => computeStanceRadar(fighter.activeDeckIds, customCards),
    [fighter.activeDeckIds, customCards]
  );
  const opponentRadar = useMemo(
    () => computeStanceRadar(opponent.deckIds, []),
    [opponent.deckIds]
  );

  const unlockedPool = useMemo(
    () =>
      fighter.unlockedCardIds
        .map((id) => getCardById(id, customCards))
        .filter((c): c is CombatCardType => Boolean(c))
        .filter((c) => c.category !== 'Critical'),
    [fighter.unlockedCardIds, customCards]
  );

  const applyPreset = (targetAtk: number, targetDef: number) => {
    soundEngine.playClick();
    const strikes = unlockedPool.filter((c) => c.category === 'Striking');
    const defenses = unlockedPool.filter((c) => c.category === 'Defense');
    const sortByPower = (a: CombatCardType, b: CombatCardType) =>
      b.power - a.power || a.speed - b.speed;
    const sortedAtk = [...strikes].sort(sortByPower);
    const sortedDef = [...defenses].sort(sortByPower);

    const nextDeck: string[] = [];
    const fillFrom = (list: CombatCardType[], quota: number) => {
      let guard = 0;
      let added = 0;
      while (added < quota && guard < 300 && list.length > 0) {
        const candidate = list[guard % list.length];
        const count = nextDeck.filter((id) => id === candidate.id).length;
        if (count < 3) {
          nextDeck.push(candidate.id);
          added += 1;
        }
        guard += 1;
      }
    };

    fillFrom(sortedAtk, targetAtk);
    fillFrom(sortedDef, targetDef);

    const finalDeck = nextDeck.length === DECK_SIZE ? nextDeck : [...DEFAULT_STARTER_DECK];
    onUpdateFighter({ ...fighter, activeDeckIds: finalDeck });
  };

  const handleRemoveIndex = (idx: number) => {
    soundEngine.playClick();
    const next = [...fighter.activeDeckIds];
    next.splice(idx, 1);
    onUpdateFighter({ ...fighter, activeDeckIds: next });
  };

  const handleAddCard = (cardId: string) => {
    if (fighter.activeDeckIds.length >= DECK_SIZE) return;
    if (fighter.activeDeckIds.filter((id) => id === cardId).length >= 3) return;
    soundEngine.playClick();
    onUpdateFighter({ ...fighter, activeDeckIds: [...fighter.activeDeckIds, cardId] });
  };

  const oppAtkCount = opponent.deckIds.filter(
    (id) => CARD_DATABASE.find((c) => c.id === id)?.category === 'Striking'
  ).length;
  const oppDefCount = opponent.deckIds.length - oppAtkCount;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="prefight-planner-title"
    >
      <div className="bg-[#151820] rounded-xl comic-panel max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="shrink-0 px-5 py-3 bg-[#101218] border-b border-zinc-800 flex items-center justify-between gap-3">
          <div>
            <h2
              id="prefight-planner-title"
              className="font-display font-extrabold text-2xl text-amber-400 tracking-wide"
            >
              {t.preFightTitle}
            </h2>
            <p className="text-xs text-zinc-400">{t.preFightSubtitle}</p>
          </div>
          <button
            type="button"
            aria-label="Close Pre-Fight Planner"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 grid grid-cols-12 gap-3.5">
          {/* Left Column: Opponent Scouting, Stance Radar Triangle & 40-Card Presets */}
          <div className="col-span-4 space-y-2">
            <div className="p-2.5 rounded-xl bg-[#101218] border border-zinc-800 space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                {lang === 'my'
                  ? mode === 'sparring'
                    ? 'လေ့ကျင့်ဖက် ပြိုင်ဘက်'
                    : mode === 'local'
                    ? 'တရားဝင်ပွဲစဉ် ပြိုင်ဘက်'
                    : 'ချန်ပီယံ စိန်ခေါ်သူ'
                  : mode === 'sparring'
                  ? 'SPARRING OPPONENT'
                  : mode === 'local'
                  ? 'LOCAL BOUT RIVAL'
                  : 'TITLE CHALLENGER'}
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-14 h-12 rounded-lg border-2 border-[#090a0c] overflow-hidden shrink-0">
                  <FighterAvatar
                    mode="portrait"
                    gender={opponent.gender}
                    appearance={opponent.appearance}
                    facing="left"
                    isChampion={opponent.isChampion}
                    className="w-full h-full"
                  />
                </div>
                <div className="min-w-0">
                  <div className="font-display font-extrabold text-base text-white truncate leading-tight">
                    {opponent.name}
                  </div>
                  <div className="text-[11px] text-amber-400 truncate">&ldquo;{opponent.nickname}&rdquo;</div>
                  <div className="text-[10px] text-zinc-400 truncate">{opponent.styleLabel}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[11px] pt-0.5">
                <div className="px-2 py-0.5 rounded bg-[#161922] border border-zinc-800 flex justify-between">
                  <span className="text-zinc-400">HP</span>
                  <span className="font-mono-num font-bold text-red-400">{opponent.maxHp}</span>
                </div>
                <div className="px-2 py-0.5 rounded bg-[#161922] border border-zinc-800 flex justify-between">
                  <span className="text-zinc-400">STA</span>
                  <span className="font-mono-num font-bold text-sky-400">{opponent.maxSta}</span>
                </div>
                <div className="px-2 py-0.5 rounded bg-[#161922] border border-zinc-800 flex justify-between">
                  <span className="text-zinc-400">ATK Deck</span>
                  <span className="font-mono-num font-bold text-red-300">{oppAtkCount}</span>
                </div>
                <div className="px-2 py-0.5 rounded bg-[#161922] border border-zinc-800 flex justify-between">
                  <span className="text-zinc-400">DEF Deck</span>
                  <span className="font-mono-num font-bold text-sky-300">{oppDefCount}</span>
                </div>
              </div>
            </div>

            {/* Positional Stance Radar Triangle Matchup */}
            <div className="p-2.5 rounded-xl bg-[#101218] border border-zinc-800 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                <span className="flex items-center gap-1">
                  <Triangle className="w-3 h-3" aria-hidden="true" />
                  <span>{t.stanceRadarTitle}</span>
                </span>
                <span className="text-[10px] text-zinc-400">+15%–30%</span>
              </div>
              {(['Standing', 'Ground'] as const).map((stance) => (
                <div key={stance} className="space-y-0.5">
                  <div className="text-[9px] font-bold uppercase text-zinc-400">{stance} Triangle</div>
                  <div className="grid grid-cols-3 gap-1 text-[10px] font-mono-num">
                    {(['Head', 'Body', 'Legs'] as const).map((zone) => {
                      const mine = playerRadar[stance][zone];
                      const theirs = opponentRadar[stance][zone];
                      const dom = mine > theirs;
                      return (
                        <div
                          key={zone}
                          className={`px-1.5 py-0.5 rounded border text-center ${
                            dom
                              ? 'bg-emerald-950/50 border-emerald-600/70 text-emerald-300'
                              : 'bg-[#161922] border-zinc-800 text-zinc-300'
                          }`}
                        >
                          <div className="text-[9px] uppercase opacity-80">{zone}</div>
                          <div className="font-bold leading-tight">
                            {mine} <span className="text-zinc-500">v</span> {theirs}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Tactical 40-Card Presets */}
            <div className="p-2.5 rounded-xl bg-[#101218] border border-zinc-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-300">
                <Layers className="w-3 h-3" aria-hidden="true" />
                <span>{t.editDeckShortcut}</span>
              </div>
              <button
                type="button"
                onClick={() => applyPreset(20, 20)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg bg-[#181c26] hover:bg-zinc-800 border border-zinc-700 text-xs cursor-pointer"
              >
                <div className="font-bold text-white leading-tight">Balanced MMA &amp; Lethwei (20 ATK / 20 DEF)</div>
                <div className="text-[10px] text-zinc-400">Standing strikes + takedowns + escapes</div>
              </button>
              <button
                type="button"
                onClick={() => applyPreset(24, 16)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg bg-[#181c26] hover:bg-red-950/50 border border-red-800/50 text-xs cursor-pointer"
              >
                <div className="font-bold text-red-300 leading-tight">Aggressive Finish Blitz (24 ATK / 16 DEF)</div>
                <div className="text-[10px] text-zinc-400">Heavy Tier II/III strikes &amp; submission locks</div>
              </button>
              <button
                type="button"
                onClick={() => applyPreset(16, 24)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg bg-[#181c26] hover:bg-sky-950/50 border border-sky-800/50 text-xs cursor-pointer"
              >
                <div className="font-bold text-sky-300 leading-tight">Iron Sprawl &amp; Counter (16 ATK / 24 DEF)</div>
                <div className="text-[10px] text-zinc-400">Heavy sprawls, parries &amp; hip escapes</div>
              </button>
            </div>

            {/* Deck Status Pill */}
            <div
              className={`p-2.5 rounded-xl border text-xs ${
                deckCheck.valid
                  ? 'bg-emerald-950/40 border-emerald-700 text-emerald-200'
                  : 'bg-red-950/60 border-red-600 text-red-200'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>
                  {fighter.activeDeckIds.length}/{DECK_SIZE} Cards · {atkCount} ATK / {defCount} DEF
                </span>
              </div>
              {!deckCheck.valid && <p className="mt-0.5 text-[11px]">{deckCheck.reason}</p>}
              <p className="mt-0.5 text-[10px] opacity-80">
                Min {MIN_STRIKE_CARDS} ATK &amp; {MIN_DEFENSE_CARDS} DEF required for alternating turns.
              </p>
            </div>
          </div>

          {/* Right Column: Active 40-Card Deck + Quick Swap Pool */}
          <div className="col-span-8 space-y-3">
            <div className="p-3 rounded-xl bg-[#101218] border border-zinc-800">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="font-display font-bold text-base text-white flex items-center gap-2">
                  <Swords className="w-4 h-4 text-red-400" aria-hidden="true" />
                  <span>
                    {lang === 'my'
                      ? `လက်ရှိ ${DECK_SIZE} ကဒ် စာရင်း (ဖယ်ရှားပြီး ပြောင်းလဲနိုင်သည်)`
                      : `ACTIVE ${DECK_SIZE}-CARD DECK (Click Remove to Swap)`}
                  </span>
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-md p-0.5">
                    {(
                      [
                        { id: 'all', label: `All (${fighter.activeDeckIds.length})` },
                        { id: 'Striking', label: `ATK (${atkCount})` },
                        { id: 'Defense', label: `DEF (${defCount})` },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setDeckFilter(tab.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                          deckFilter === tab.id ? 'bg-amber-500 text-black' : 'text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-md p-0.5">
                    {(['all', 'Standing', 'Clinch', 'Ground'] as const).map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setPosFilter(pos)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                          posFilter === pos ? 'bg-sky-500 text-black' : 'text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        {pos === 'all' ? 'All Pos' : pos}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 max-h-[420px] overflow-y-auto pr-1">
                {fighter.activeDeckIds.map((cardId, idx) => {
                  const card = getCardById(cardId, customCards);
                  if (!card) return null;
                  if (deckFilter !== 'all' && card.category !== deckFilter) return null;
                  if (posFilter !== 'all' && (card.position ?? 'Standing') !== posFilter && card.position !== 'Any') {
                    return null;
                  }
                  return (
                    <div key={`${cardId}_${idx}`} className="flex flex-col">
                      <CombatCard card={card} compact lang={lang} />
                      <button
                        type="button"
                        onClick={() => handleRemoveIndex(idx)}
                        className="mt-1 py-0.5 rounded bg-zinc-900 hover:bg-red-900 text-[10px] text-zinc-300 hover:text-white flex items-center justify-center gap-1 border border-zinc-800 cursor-pointer"
                      >
                        <Trash2 className="w-2.5 h-2.5" aria-hidden="true" />
                        <span>{t.remove}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {fighter.activeDeckIds.length < DECK_SIZE && (
              <div className="p-3 rounded-xl bg-[#101218] border border-amber-500/50">
                <div className="font-display font-bold text-sm text-amber-300 mb-2 flex items-center gap-1.5">
                  <Shield className="w-4 h-4" aria-hidden="true" />
                  <span>ADD CARD TO EMPTY SLOT ({DECK_SIZE - fighter.activeDeckIds.length} needed)</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {unlockedPool.map((card) => {
                    const copies = fighter.activeDeckIds.filter((id) => id === card.id).length;
                    return (
                      <button
                        key={card.id}
                        type="button"
                        disabled={copies >= 3}
                        onClick={() => handleAddCard(card.id)}
                        className="p-1.5 rounded bg-[#181c26] hover:bg-zinc-800 disabled:opacity-40 border border-zinc-700 text-left cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11px] font-bold text-white truncate">
                            {card.tier ?? 'I'} · {localizeCard(card, lang).name}
                          </span>
                          <Plus className="w-3 h-3 text-amber-400 shrink-0" />
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          {card.category === 'Striking' ? 'ATK' : 'DEF'} · {card.position ?? 'Standing'} · {card.staCost}S · ({copies}/3)
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-3 bg-[#101218] border-t border-zinc-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 cursor-pointer"
          >
            {lang === 'my' ? 'လေ့ကျင့်ခန်းမသို့ ပြန်ရန်' : 'Back to Gym'}
          </button>
          <button
            type="button"
            disabled={!deckCheck.valid}
            onClick={() => {
              soundEngine.playBell(1);
              onConfirmEnterRing();
            }}
            className="px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-45 text-white font-display font-extrabold text-xl tracking-wide comic-panel-sm cursor-pointer"
          >
            {t.stepIntoRing}
          </button>
        </div>
      </div>
    </div>
  );
};
