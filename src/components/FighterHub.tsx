import React, { useState } from 'react';
import {
  Activity,
  Award,
  CheckCircle2,
  Dumbbell,
  Flame,
  Globe,
  Heart,
  Home,
  Layers,
  Loader2,
  Lock,
  Plus,
  RotateCcw,
  Sparkles,
  Swords,
  Trash2,
  Trophy,
  Zap,
} from 'lucide-react';
import { CARD_DATABASE, DEFAULT_STARTER_DECK, getCardById } from '../data/cards';
import { DISCIPLINES, GYMS } from '../data/gyms';
import {
  CATEGORY_MY,
  DISCIPLINE_MY,
  GYM_MY,
  localizeCard,
  UI_TEXT,
} from '../i18n/translations';
import {
  CHAMPIONSHIP_UNLOCK_WINS,
  DECK_SIZE,
  isChampionshipUnlocked,
  validateDeck,
} from '../game/rules';
import {
  CardCategory,
  CombatCard as CombatCardType,
  Discipline,
  FighterProfile,
  Language,
  MatchMode,
  OpponentProfile,
} from '../types/game';
import {
  buildAiOpponentFromGenerated,
  generateAiFighterProfile,
  generateAiSkillCard,
} from '../utils/aiClient';
import { soundEngine } from '../utils/sound';
import { CombatCard } from './CombatCard';
import { FighterAvatar } from './FighterAvatar';

interface FighterHubProps {
  fighter: FighterProfile;
  lang: Language;
  onToggleLang: () => void;
  onUpdateFighter: (updated: FighterProfile) => void;
  onStartMatch: (mode: MatchMode, customOpponent?: OpponentProfile) => void;
  onBackToTitle: () => void;
}

type HubTab = 'arena' | 'training' | 'deck';

export const FighterHub: React.FC<FighterHubProps> = ({
  fighter,
  lang,
  onToggleLang,
  onUpdateFighter,
  onStartMatch,
  onBackToTitle,
}) => {
  const t = UI_TEXT[lang];
  const [activeTab, setActiveTab] = useState<HubTab>('arena');
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline>('Lethwei');
  const [deckFilter, setDeckFilter] = useState<'All' | CardCategory>('All');
  const [feedback, setFeedback] = useState<string>('');
  const [errorBanner, setErrorBanner] = useState<string>('');

  // Gemini AI Generators State
  const [aiCardPrompt, setAiCardPrompt] = useState('');
  const [aiCardLoading, setAiCardLoading] = useState(false);
  const [previewAiCard, setPreviewAiCard] = useState<CombatCardType | null>(null);

  const [aiRivalPrompt, setAiRivalPrompt] = useState('');
  const [aiRivalLoading, setAiRivalLoading] = useState(false);

  const gym = GYMS[fighter.gymId];
  const gymDisplay = lang === 'my' ? GYM_MY[fighter.gymId] : gym;
  const champUnlocked = isChampionshipUnlocked(fighter);
  const customCards = fighter.customCards ?? [];
  const deckCheck = validateDeck(fighter.activeDeckIds, fighter.unlockedCardIds, customCards);

  const showToast = (msg: string) => {
    setErrorBanner('');
    setFeedback(msg);
  };

  const handleUnlockCard = (cardId: string, costXp: number) => {
    const card = getCardById(cardId, customCards);
    if (!card || fighter.unlockedCardIds.includes(cardId)) return;
    if (fighter.trainingXp < costXp) {
      showToast(`Need ${costXp} Training XP to learn ${card.name}.`);
      return;
    }
    soundEngine.playBell(1);
    onUpdateFighter({
      ...fighter,
      trainingXp: fighter.trainingXp - costXp,
      trainingDays: fighter.trainingDays + 1,
      unlockedCardIds: [...fighter.unlockedCardIds, cardId],
    });
    showToast(`Learned ${card.name}! Equip it in Game Plan.`);
  };

  const handleConditioning = (type: 'hp' | 'sta' | 'heal') => {
    if (type === 'heal') {
      soundEngine.playEvade();
      onUpdateFighter({
        ...fighter,
        currentHp: fighter.maxHp,
        currentSta: fighter.maxSta,
        trainingDays: fighter.trainingDays + 1,
      });
      showToast('Recovered to 100% HP and Stamina.');
      return;
    }

    const cost = 35;
    if (fighter.trainingXp < cost) {
      showToast(`Conditioning drill requires ${cost} Training XP.`);
      return;
    }

    soundEngine.playHeavyHit();
    if (type === 'hp') {
      onUpdateFighter({
        ...fighter,
        trainingXp: fighter.trainingXp - cost,
        trainingDays: fighter.trainingDays + 1,
        maxHp: fighter.maxHp + 4,
        currentHp: fighter.maxHp + 4,
        stats: { ...fighter.stats, durability: fighter.stats.durability + 1 },
      });
      showToast('Iron Chin Drill complete: +4 Max HP & +1 Durability!');
    } else {
      onUpdateFighter({
        ...fighter,
        trainingXp: fighter.trainingXp - cost,
        trainingDays: fighter.trainingDays + 1,
        maxSta: fighter.maxSta + 1,
        currentSta: fighter.maxSta + 1,
        stats: { ...fighter.stats, stamina: fighter.stats.stamina + 1 },
      });
      showToast('Heavy Bag Roadwork complete: +1 Max STA & +1 Stamina!');
    }
  };

  const handleForgeAiCard = async () => {
    setErrorBanner('');
    setFeedback('');
    setAiCardLoading(true);
    soundEngine.playClick();
    try {
      const card = await generateAiSkillCard(
        aiCardPrompt || 'Devastating Myanmar Lethwei leaping elbow smash',
        lang
      );
      setPreviewAiCard(card);
      soundEngine.playBell(1);
    } catch (err: unknown) {
      setErrorBanner(err instanceof Error ? err.message : 'Failed to generate AI Skill Card.');
    } finally {
      setAiCardLoading(false);
    }
  };

  const handleSaveAiCardToLibrary = () => {
    if (!previewAiCard) return;
    soundEngine.playBell(1);
    onUpdateFighter({
      ...fighter,
      customCards: [...customCards, previewAiCard],
      unlockedCardIds: [...fighter.unlockedCardIds, previewAiCard.id],
    });
    showToast(`Added "${previewAiCard.name}" to your library! Equip it in Game Plan.`);
    setPreviewAiCard(null);
    setAiCardPrompt('');
  };

  const handleChallengeAiRival = async () => {
    if (!deckCheck.valid) return;
    setErrorBanner('');
    setAiRivalLoading(true);
    soundEngine.playClick();
    try {
      const gen = await generateAiFighterProfile(
        aiRivalPrompt || 'Undefeated Mandalay bare-knuckle Lethwei contender',
        'opponent'
      );
      const customOpponent = buildAiOpponentFromGenerated(gen, fighter);
      soundEngine.playBell(1);
      onStartMatch('sparring', customOpponent);
    } catch (err: unknown) {
      setErrorBanner(err instanceof Error ? err.message : 'Failed to generate AI challenger.');
    } finally {
      setAiRivalLoading(false);
    }
  };

  const handleAddCardToDeck = (cardId: string) => {
    const card = getCardById(cardId, customCards);
    if (!card || card.category === 'Critical') return;
    if (fighter.activeDeckIds.length >= DECK_SIZE) {
      showToast(`Fight Deck is full (${DECK_SIZE}/${DECK_SIZE}). Remove a card first.`);
      return;
    }
    const existingCount = fighter.activeDeckIds.filter((id) => id === cardId).length;
    if (existingCount >= 3) {
      showToast(`Max 3 copies of ${card.name} allowed.`);
      return;
    }
    soundEngine.playClick();
    onUpdateFighter({
      ...fighter,
      activeDeckIds: [...fighter.activeDeckIds, cardId],
    });
    setFeedback('');
  };

  const handleRemoveCardFromDeck = (index: number) => {
    soundEngine.playClick();
    const next = [...fighter.activeDeckIds];
    next.splice(index, 1);
    onUpdateFighter({
      ...fighter,
      activeDeckIds: next,
    });
    setFeedback('');
  };

  const handleResetDeck = () => {
    soundEngine.playClick();
    onUpdateFighter({
      ...fighter,
      activeDeckIds: [...DEFAULT_STARTER_DECK],
    });
    showToast('Restored balanced 10-card starter Fight Deck.');
  };

  const disciplineCards = CARD_DATABASE.filter(
    (c) => c.discipline === selectedDiscipline && c.category !== 'Critical'
  );

  const unlockedCardsForBuilder = fighter.unlockedCardIds
    .map((id) => getCardById(id, customCards))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .filter((c) => deckFilter === 'All' || c.category === deckFilter);

  const deckAvgSta =
    fighter.activeDeckIds.length > 0
      ? (
          fighter.activeDeckIds.reduce(
            (sum, id) => sum + (getCardById(id, customCards)?.staCost ?? 0),
            0
          ) / fighter.activeDeckIds.length
        ).toFixed(1)
      : '0.0';
  const deckAvgSpd =
    fighter.activeDeckIds.length > 0
      ? (
          fighter.activeDeckIds.reduce(
            (sum, id) => sum + (getCardById(id, customCards)?.speed ?? 0),
            0
          ) / fighter.activeDeckIds.length
        ).toFixed(1)
      : '0.0';

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#0e0f12] text-[#f5f2eb] flex flex-col">
      {/* Top Navigation Shell */}
      <header className="shrink-0 border-b border-zinc-800 bg-[#12141a] px-6 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-display font-extrabold italic text-2xl tracking-wide text-white">
            LETHWEI <span className="text-amber-400">KINGS</span>
          </span>
          <span className="text-zinc-600">/</span>
          <span className="text-xs font-medium text-zinc-400">
            {gymDisplay.name} · {gymDisplay.location}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="px-3 py-1 rounded-lg bg-[#161920] border border-amber-500/40 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" aria-hidden="true" />
            <span className="text-xs text-zinc-300">{t.trainingXp}</span>
            <span className="font-mono-num font-bold text-sm text-amber-300">
              {fighter.trainingXp}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onToggleLang();
            }}
            aria-label="Switch Language"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#161920] hover:bg-[#222630] border border-amber-500/40 text-xs font-bold text-amber-300 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t.langToggle}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onBackToTitle();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161920] hover:bg-[#222630] border border-zinc-700 text-xs font-semibold text-zinc-200 cursor-pointer"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>{t.titleBtn}</span>
          </button>
        </div>
      </header>

      {/* Main Landscape Workspace (Locked height, zero outer page scroll) */}
      <div className="flex-1 min-h-0 max-w-7xl w-full mx-auto px-6 py-4 grid grid-cols-12 gap-5 items-stretch">
        {/* LEFT PANEL: Fighter Profile */}
        <aside className="col-span-4 bg-[#161920] rounded-xl comic-panel p-4 flex flex-col justify-between min-h-0 overflow-y-auto">
          <div className="space-y-3.5">
            <div className="flex items-start gap-3">
              <div className="w-24 h-20 rounded-lg border-2 border-[#090a0c] overflow-hidden shrink-0 bg-[#101217]">
                <FighterAvatar
                  mode="portrait"
                  gender={fighter.gender}
                  appearance={fighter.appearance}
                  isChampion={fighter.record.championshipWins > 0}
                  className="w-full h-full"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-display font-extrabold text-2xl text-white leading-none truncate">
                  {fighter.name}
                </h1>
                <div className="text-xs font-semibold text-amber-400 mt-1 truncate">
                  &ldquo;{fighter.nickname}&rdquo;
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  {t.ageLabel} {fighter.age} · {fighter.birthplace}
                </div>
                <div className="text-[11px] text-zinc-300 font-medium truncate">
                  {gymDisplay.name}
                </div>
              </div>
            </div>

            {fighter.background && (
              <p className="text-[11px] text-zinc-300 bg-[#101217] p-2.5 rounded border border-zinc-800 leading-snug">
                {fighter.background}
              </p>
            )}

            {/* Record Strip */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-[#101217] border border-zinc-800">
                <div className="text-[10px] uppercase text-zinc-400 font-semibold">{t.wins}</div>
                <div className="font-mono-num font-bold text-lg text-emerald-400">
                  {fighter.record.wins}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[#101217] border border-zinc-800">
                <div className="text-[10px] uppercase text-zinc-400 font-semibold">{t.losses}</div>
                <div className="font-mono-num font-bold text-lg text-rose-400">
                  {fighter.record.losses}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[#101217] border border-zinc-800">
                <div className="text-[10px] uppercase text-zinc-400 font-semibold">{t.kos}</div>
                <div className="font-mono-num font-bold text-lg text-amber-400">
                  {fighter.record.kos}
                </div>
              </div>
            </div>

            {/* HP & Stamina Bars */}
            <div className="space-y-2">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1 text-red-400">
                    <Heart className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                    <span>{t.healthHp}</span>
                  </span>
                  <span className="font-mono-num text-white">
                    {fighter.currentHp} / {fighter.maxHp}
                  </span>
                </div>
                <div className="h-3 w-full rounded bg-[#0c0e12] border border-[#090a0c] overflow-hidden">
                  <div
                    className="h-full bg-red-600 transition-all duration-300"
                    style={{ width: `${Math.round((fighter.currentHp / fighter.maxHp) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1 text-sky-400">
                    <Activity className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{t.staminaSta}</span>
                  </span>
                  <span className="font-mono-num text-white">
                    {fighter.currentSta} / {fighter.maxSta}
                  </span>
                </div>
                <div className="h-3 w-full rounded bg-[#0c0e12] border border-[#090a0c] overflow-hidden">
                  <div
                    className="h-full bg-sky-500 transition-all duration-300"
                    style={{ width: `${Math.round((fighter.currentSta / fighter.maxSta) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Base Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[#101217] border border-zinc-800">
                <span className="text-zinc-300">{t.strength}</span>
                <span className="font-mono-num font-bold text-red-400">{fighter.stats.strength}</span>
              </div>
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[#101217] border border-zinc-800">
                <span className="text-zinc-300">{t.speed}</span>
                <span className="font-mono-num font-bold text-emerald-400">{fighter.stats.speed}</span>
              </div>
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[#101217] border border-zinc-800">
                <span className="text-zinc-300">{t.stamina}</span>
                <span className="font-mono-num font-bold text-sky-400">{fighter.stats.stamina}</span>
              </div>
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[#101217] border border-zinc-800">
                <span className="text-zinc-300">{t.durability}</span>
                <span className="font-mono-num font-bold text-amber-400">{fighter.stats.durability}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 p-2.5 rounded-lg bg-[#101217] border border-zinc-800 text-[11px] text-zinc-300">
            <div className="font-semibold text-amber-300">{t.gymPerk}</div>
            <div>{gymDisplay.bonusSummary}</div>
          </div>
        </aside>

        {/* CENTER/RIGHT: 3 Navigation Tabs + Internal Scroll Workspace */}
        <section className="col-span-8 flex flex-col gap-3 min-h-0">
          <nav
            aria-label="Gym sections"
            className="shrink-0 grid grid-cols-3 gap-2 p-1.5 bg-[#161920] rounded-xl comic-panel"
          >
            {(
              [
                { id: 'arena', label: t.tabArena, icon: Swords },
                { id: 'training', label: t.tabTraining, icon: Dumbbell },
                { id: 'deck', label: t.tabDeck, icon: Layers },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveTab(tab.id);
                    setFeedback('');
                    setErrorBanner('');
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-display font-bold text-base sm:text-lg tracking-wide transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-red-600 text-white comic-panel-sm'
                      : 'text-zinc-300 hover:bg-[#20242e]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {feedback && (
            <div
              role="status"
              className="shrink-0 px-4 py-2 rounded-lg bg-amber-950/60 border border-amber-500/60 text-amber-200 text-xs font-medium flex items-center justify-between"
            >
              <span>{feedback}</span>
              <button
                type="button"
                onClick={() => setFeedback('')}
                className="underline text-amber-300 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {errorBanner && (
            <div
              role="alert"
              className="shrink-0 px-4 py-2 rounded-lg bg-red-950/75 border border-red-500 text-red-200 text-xs font-medium flex items-center justify-between"
            >
              <span>{errorBanner}</span>
              <button
                type="button"
                onClick={() => setErrorBanner('')}
                className="underline text-red-300 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Scrollable Tab Body (never scrolls outer viewport) */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3.5">
            {/* TAB 1: FIGHT ARENA */}
            {activeTab === 'arena' && (
              <>
                {!deckCheck.valid && (
                  <div className="p-3 rounded-lg bg-red-950/70 border border-red-500 text-red-200 text-xs">
                    {deckCheck.reason} Open <strong>GAME PLAN</strong> to complete your 10-card Fight Deck.
                  </div>
                )}

                {/* Mode 1: Gym / Outdoor Sparring */}
                <div className="bg-[#161920] rounded-xl comic-panel p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                      Mode 1 · Casual Exhibition · No Record Impact
                    </div>
                    <h2 className="font-display font-extrabold text-xl text-white">
                      GYM / OUTDOOR SPARRING
                    </h2>
                    <p className="text-xs text-zinc-300 mt-0.5">
                      Face dynamically generated sparring partners near your level (+35 XP win / +15 XP loss).
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={!deckCheck.valid}
                    onClick={() => {
                      soundEngine.playBell(1);
                      onStartMatch('sparring');
                    }}
                    className="px-5 py-3 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-45 text-white font-display font-extrabold text-lg comic-panel-sm shrink-0 cursor-pointer whitespace-nowrap"
                  >
                    {t.startSparring}
                  </button>
                </div>

                {/* Mode 2: Local Promotion */}
                <div className="bg-[#161920] rounded-xl comic-panel p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                      Mode 2 · Official Career Bout · Updates Record
                    </div>
                    <h2 className="font-display font-extrabold text-xl text-white">
                      LOCAL PROMOTION
                    </h2>
                    <p className="text-xs text-zinc-300 mt-0.5">
                      Sanctioned 5-round Lethwei bouts (+55 XP win). Championship Qualifier:{' '}
                      <span className="font-mono-num font-bold text-amber-300">
                        {Math.min(fighter.record.localWins, CHAMPIONSHIP_UNLOCK_WINS)} / {CHAMPIONSHIP_UNLOCK_WINS} {t.wins}
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={!deckCheck.valid}
                    onClick={() => {
                      soundEngine.playBell(1);
                      onStartMatch('local');
                    }}
                    className="px-5 py-3 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-45 text-white font-display font-extrabold text-lg comic-panel-sm shrink-0 cursor-pointer whitespace-nowrap"
                  >
                    {t.enterOfficialBout}
                  </button>
                </div>

                {/* Mode 3: Championship / PVP Arena */}
                <div
                  className={`rounded-xl comic-panel p-4 flex items-center justify-between gap-4 ${
                    champUnlocked
                      ? 'bg-gradient-to-r from-[#241b12] to-[#161920] border-amber-500'
                      : 'bg-[#12141a] opacity-85'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-300">
                      {champUnlocked ? (
                        <Trophy className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
                      )}
                      <span>Mode 3 · Golden Belt Title Stage</span>
                    </div>
                    <h2 className="font-display font-extrabold text-xl text-white">
                      CHAMPIONSHIP / PVP ARENA
                    </h2>
                    <p className="text-xs text-zinc-300 mt-0.5">
                      {champUnlocked
                        ? 'Unlocked! Challenge reigning World Lethwei King "Soe Lin Oo" (+100 XP).'
                        : `Requires 3 Wins in Local Promotion to Unlock (${fighter.record.localWins} / ${CHAMPIONSHIP_UNLOCK_WINS} completed).`}
                    </p>
                  </div>
                  {champUnlocked ? (
                    <button
                      type="button"
                      disabled={!deckCheck.valid}
                      onClick={() => {
                        soundEngine.playBell(2);
                        onStartMatch('championship');
                      }}
                      className="px-5 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-display font-extrabold text-lg comic-panel-sm shrink-0 cursor-pointer whitespace-nowrap"
                    >
                      {t.challengeBelt}
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-400 font-display font-bold text-base shrink-0">
                      <Lock className="w-4 h-4" aria-hidden="true" />
                      <span>{t.locked}</span>
                    </div>
                  )}
                </div>

                {/* Gemini AI Challenger Scout */}
                <div className="bg-[#161920] rounded-xl comic-panel p-4 space-y-2.5 border-amber-500/40">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-display font-bold text-lg text-amber-300">
                      <Sparkles className="w-4 h-4" aria-hidden="true" />
                      <span>GEMINI AI RIVAL GENERATOR (STRUCTURED JSON)</span>
                    </div>
                    <span className="text-[11px] text-zinc-400">Custom standing challenger</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={aiRivalPrompt}
                      onChange={(e) => setAiRivalPrompt(e.target.value)}
                      placeholder="Describe rival (e.g. Heavyweight Yangon brawler with lethal headbutts)"
                      aria-label="Describe Gemini AI Rival"
                      className="flex-1 px-3 py-2 rounded-lg bg-[#0f1116] border border-zinc-700 text-xs text-white focus:border-amber-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={!deckCheck.valid || aiRivalLoading}
                      onClick={handleChallengeAiRival}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-45 text-black font-display font-bold text-base comic-panel-sm cursor-pointer whitespace-nowrap"
                    >
                      {aiRivalLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Swords className="w-4 h-4" aria-hidden="true" />
                      )}
                      <span>{aiRivalLoading ? '...' : t.fightAiRival}</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: TRAINING CAMP & GEMINI AI TECHNIQUE FORGE */}
            {activeTab === 'training' && (
              <>
                {/* Gemini AI Skill Card Forge */}
                <div className="bg-[#161920] rounded-xl comic-panel p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display font-extrabold text-xl text-amber-400 flex items-center gap-2">
                        <Sparkles className="w-5 h-5" aria-hidden="true" />
                        <span>GEMINI AI TECHNIQUE FORGE (STRUCTURED CARD GENERATOR)</span>
                      </h2>
                      <p className="text-xs text-zinc-400">
                        Forge custom standing-combat Skill Cards via Gemini JSON Schema (strictly no ground fighting)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={aiCardPrompt}
                      onChange={(e) => setAiCardPrompt(e.target.value)}
                      placeholder="e.g. Jumping downward Lethwei elbow or rapid double jab counter"
                      aria-label="Describe custom AI skill card"
                      className="flex-1 px-3 py-2 rounded-lg bg-[#0f1116] border border-zinc-700 text-xs text-white focus:border-amber-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={aiCardLoading}
                      onClick={handleForgeAiCard}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-display font-bold text-base comic-panel-sm cursor-pointer whitespace-nowrap"
                    >
                      {aiCardLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Sparkles className="w-4 h-4" aria-hidden="true" />
                      )}
                      <span>{aiCardLoading ? '...' : t.forgeAiCard}</span>
                    </button>
                  </div>

                  {previewAiCard && (
                    <div className="p-3 rounded-lg bg-[#101217] border border-amber-500/60 flex items-center gap-4">
                      <div className="w-48 shrink-0">
                        <CombatCard card={previewAiCard} lang={lang} />
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="font-display font-bold text-lg text-white">
                          {localizeCard(previewAiCard, lang).name}
                        </div>
                        <p className="text-xs text-zinc-300">
                          {localizeCard(previewAiCard, lang).zoneLabel} ({localizeCard(previewAiCard, lang).disciplineLabel}) · {t.badgeSta} {previewAiCard.staCost} · {previewAiCard.power} · {t.badgeSpd} {previewAiCard.speed}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleSaveAiCardToLibrary}
                            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-sm cursor-pointer"
                          >
                            {t.addToLibrary}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewAiCard(null)}
                            className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs cursor-pointer"
                          >
                            Discard
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cardio & Conditioning */}
                <div className="bg-[#161920] rounded-xl comic-panel p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-display font-extrabold text-xl text-white">
                      CARDIO &amp; CONDITIONING
                    </h2>
                    <span className="font-mono-num text-xs text-zinc-400">
                      Camp Days: {fighter.trainingDays}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => handleConditioning('hp')}
                      className="text-left p-3 rounded-lg bg-[#101217] hover:bg-[#1b1f29] border border-zinc-800 cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Heart className="w-4 h-4 text-red-400" aria-hidden="true" />
                        <span className="font-mono-num text-xs font-bold text-amber-300">35 XP</span>
                      </div>
                      <div className="font-display font-bold text-base text-white">IRON CHIN DRILL</div>
                      <div className="text-[11px] text-zinc-400">+4 Max HP &amp; +1 Durability</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleConditioning('sta')}
                      className="text-left p-3 rounded-lg bg-[#101217] hover:bg-[#1b1f29] border border-zinc-800 cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Activity className="w-4 h-4 text-sky-400" aria-hidden="true" />
                        <span className="font-mono-num text-xs font-bold text-amber-300">35 XP</span>
                      </div>
                      <div className="font-display font-bold text-base text-white">HEAVY BAG WORK</div>
                      <div className="text-[11px] text-zinc-400">+1 Max STA &amp; +1 Stamina</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleConditioning('heal')}
                      className="text-left p-3 rounded-lg bg-[#101217] hover:bg-[#1b1f29] border border-zinc-800 cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Flame className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                        <span className="font-mono-num text-xs font-bold text-emerald-400">FREE</span>
                      </div>
                      <div className="font-display font-bold text-base text-white">CORNER RECOVERY</div>
                      <div className="text-[11px] text-zinc-400">Restore 100% HP &amp; STA</div>
                    </button>
                  </div>
                </div>

                {/* Multi-Discipline Skill Training */}
                <div className="bg-[#161920] rounded-xl comic-panel p-4">
                  <h2 className="font-display font-extrabold text-xl text-white mb-2.5">
                    MULTI-DISCIPLINE SKILL TRAINING
                  </h2>
                  <div className="flex flex-wrap gap-2 mb-3.5">
                    {DISCIPLINES.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => {
                          soundEngine.playClick();
                          setSelectedDiscipline(d.id);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border cursor-pointer ${
                          selectedDiscipline === d.id
                            ? 'bg-amber-500 text-black border-amber-300'
                            : 'bg-[#101217] text-zinc-300 border-zinc-700'
                        }`}
                      >
                        {lang === 'my' ? DISCIPLINE_MY[d.id] : d.id}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {disciplineCards.map((card) => {
                      const unlocked = fighter.unlockedCardIds.includes(card.id);
                      const canAfford = fighter.trainingXp >= card.unlockCostXp;
                      return (
                        <div key={card.id} className="flex flex-col gap-1.5">
                          <CombatCard card={card} lang={lang} />
                          {unlocked ? (
                            <div className="flex items-center justify-center gap-1 py-1.5 rounded bg-emerald-950/60 border border-emerald-700 text-emerald-300 text-[11px] font-bold uppercase">
                              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>{t.learnedUnlocked}</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              disabled={!canAfford}
                              onClick={() => handleUnlockCard(card.id, card.unlockCostXp)}
                              className="py-1.5 px-2 rounded bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-bold text-[11px] uppercase cursor-pointer"
                            >
                              {t.learnXp} · {card.unlockCostXp} XP
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* TAB 3: GAME PLAN */}
            {activeTab === 'deck' && (
              <>
                <div className="bg-[#161920] rounded-xl comic-panel p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <h2 className="font-display font-extrabold text-xl text-white flex items-center gap-2">
                        <span>{t.activeFightDeck}</span>
                        <span
                          className={`font-mono-num text-base ${
                            fighter.activeDeckIds.length === DECK_SIZE
                              ? 'text-emerald-400'
                              : 'text-amber-400'
                          }`}
                        >
                          ({fighter.activeDeckIds.length}/{DECK_SIZE})
                        </span>
                      </h2>
                      <p className="text-[11px] text-zinc-400">
                        Avg {t.badgeSta}: <span className="font-mono-num text-sky-300">{deckAvgSta}</span> · Avg {t.badgeSpd}:{' '}
                        <span className="font-mono-num text-emerald-300">{deckAvgSpd}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetDeck}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#101217] hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-200 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{t.autoFillBalanced}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {fighter.activeDeckIds.map((cardId, idx) => {
                      const card = getCardById(cardId, customCards);
                      if (!card) return null;
                      return (
                        <div key={`${cardId}_${idx}`}>
                          <CombatCard card={card} compact lang={lang} />
                          <button
                            type="button"
                            onClick={() => handleRemoveCardFromDeck(idx)}
                            aria-label={`Remove ${card.name} from slot ${idx + 1}`}
                            className="mt-1 w-full flex items-center justify-center gap-1 py-1 rounded bg-zinc-900 hover:bg-red-900/80 border border-zinc-700 text-[10px] font-semibold text-zinc-300 hover:text-white cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" aria-hidden="true" />
                            <span>{t.remove}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-[#161920] rounded-xl comic-panel p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h3 className="font-display font-bold text-xl text-white">
                      {t.unlockedLibrary}
                    </h3>
                    <div className="flex items-center gap-1 p-1 bg-[#101217] rounded-lg border border-zinc-800">
                      {(['All', 'Striking', 'Defense', 'Critical'] as const).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setDeckFilter(cat)}
                          className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer ${
                            deckFilter === cat
                              ? 'bg-red-600 text-white'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          {cat === 'All' ? t.allFilter : lang === 'my' ? CATEGORY_MY[cat] : cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {unlockedCardsForBuilder.map((card) => {
                      const copiesInDeck = fighter.activeDeckIds.filter((id) => id === card.id).length;
                      const isCritical = card.category === 'Critical';
                      return (
                        <div key={card.id} className="flex flex-col gap-1.5">
                          <CombatCard card={card} lang={lang} />
                          {isCritical ? (
                            <div className="py-1.5 px-2 rounded bg-amber-950/40 border border-amber-700/60 text-amber-300 text-[11px] font-bold text-center flex items-center justify-center gap-1">
                              <Award className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Auto-Active &lt;35% HP</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              disabled={
                                fighter.activeDeckIds.length >= DECK_SIZE || copiesInDeck >= 3
                              }
                              onClick={() => handleAddCardToDeck(card.id)}
                              className="flex items-center justify-center gap-1 py-1.5 px-2 rounded bg-zinc-800 hover:bg-red-600 disabled:opacity-40 text-white text-[11px] font-bold uppercase cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>+ ({copiesInDeck}/3)</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};
