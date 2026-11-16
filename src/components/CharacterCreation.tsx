import React, { useState } from 'react';
import {
  ArrowLeft,
  Check,
  Loader2,
  Minus,
  Plus,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import {
  BIRTHPLACES,
  GYMS,
  HAIR_COLORS,
  SHORTS_COLORS,
  SKIN_TONES,
} from '../data/gyms';
import {
  BASE_STAT_VALUE,
  calculateMaxHp,
  calculateMaxSta,
  CREATION_STAT_POINTS,
  createNewFighter,
} from '../game/rules';
import {
  BodyBuild,
  FighterProfile,
  FighterStats,
  Gender,
  GymId,
  Hairstyle,
} from '../types/game';
import { generateAiFighterProfile } from '../utils/aiClient';
import { soundEngine } from '../utils/sound';
import { FighterAvatar } from './FighterAvatar';

interface CharacterCreationProps {
  onBack: () => void;
  onConfirm: (fighter: FighterProfile) => void;
}

const HAIRSTYLES: { id: Hairstyle; label: string }[] = [
  { id: 'Topknot', label: 'Warrior Topknot' },
  { id: 'Buzz', label: 'Military Buzz' },
  { id: 'Mohawk', label: 'Ring Mohawk' },
  { id: 'Undercut', label: 'Swept Undercut' },
  { id: 'LongTied', label: 'Long Tied' },
  { id: 'Shaved', label: 'Clean Shaved' },
];

const BUILDS: BodyBuild[] = ['Lean', 'Athletic', 'Heavy'];
type CreationSectionTab = 'identity' | 'appearance' | 'gym_stats';

export const CharacterCreation: React.FC<CharacterCreationProps> = ({
  onBack,
  onConfirm,
}) => {
  const [sectionTab, setSectionTab] = useState<CreationSectionTab>('identity');

  const [name, setName] = useState('Kyaw Min');
  const [nickname, setNickname] = useState('The Iron Forehead');
  const [gender, setGender] = useState<Gender>('Male');
  const [age, setAge] = useState(23);
  const [birthplace, setBirthplace] = useState(BIRTHPLACES[0]);
  const [background, setBackground] = useState('');
  const [styleLabel, setStyleLabel] = useState('');

  const [skinTone, setSkinTone] = useState(SKIN_TONES[1].hex);
  const [heightCm, setHeightCm] = useState(176);
  const [weightKg, setWeightKg] = useState(70);
  const [build, setBuild] = useState<BodyBuild>('Athletic');
  const [hairstyle, setHairstyle] = useState<Hairstyle>('Topknot');
  const [hairColor, setHairColor] = useState(HAIR_COLORS[0].hex);
  const [shortsColor, setShortsColor] = useState(SHORTS_COLORS[0].hex);

  const [gymId, setGymId] = useState<GymId>('thuwunna');
  const [stats, setStats] = useState<FighterStats>({
    strength: BASE_STAT_VALUE + 4,
    speed: BASE_STAT_VALUE + 4,
    stamina: BASE_STAT_VALUE + 3,
    durability: BASE_STAT_VALUE + 4,
  });

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const spentPoints =
    stats.strength -
    BASE_STAT_VALUE +
    (stats.speed - BASE_STAT_VALUE) +
    (stats.stamina - BASE_STAT_VALUE) +
    (stats.durability - BASE_STAT_VALUE);
  const remainingPoints = CREATION_STAT_POINTS - spentPoints;

  const adjustStat = (key: keyof FighterStats, delta: number) => {
    soundEngine.playClick();
    setStats((prev) => {
      const nextVal = prev[key] + delta;
      if (nextVal < BASE_STAT_VALUE || nextVal > 12) return prev;
      if (delta > 0 && remainingPoints <= 0) return prev;
      return { ...prev, [key]: nextVal };
    });
  };

  const handleAiGenerateFighter = async () => {
    setErrorMsg('');
    setAiLoading(true);
    soundEngine.playClick();
    try {
      const generated = await generateAiFighterProfile(
        aiPrompt || 'Traditional Burmese Lethwei warrior with razor elbows and iron chin',
        'player'
      );
      setName(generated.name);
      setNickname(generated.nickname);
      setGender(generated.gender);
      setAge(Math.max(18, Math.min(38, generated.age)));
      setBirthplace(generated.birthplace);
      setStyleLabel(generated.styleLabel);
      setBackground(generated.background);
      setGymId(generated.gymId);
      setSkinTone(generated.appearance.skinTone || SKIN_TONES[1].hex);
      setHeightCm(Math.max(160, Math.min(196, generated.appearance.heightCm || 176)));
      setWeightKg(Math.max(54, Math.min(105, generated.appearance.weightKg || 70)));
      setBuild(generated.appearance.build);
      setHairstyle(generated.appearance.hairstyle);
      setHairColor(generated.appearance.hairColor || HAIR_COLORS[0].hex);
      setShortsColor(generated.appearance.shortsColor || SHORTS_COLORS[0].hex);

      // Normalize AI stats to fit the 27-point pool cleanly (4 * BASE_STAT_VALUE + 15)
      const raw = generated.stats;
      const clamped: FighterStats = {
        strength: Math.max(3, Math.min(11, raw.strength)),
        speed: Math.max(3, Math.min(11, raw.speed)),
        stamina: Math.max(3, Math.min(11, raw.stamina)),
        durability: Math.max(3, Math.min(11, raw.durability)),
      };
      let total = clamped.strength + clamped.speed + clamped.stamina + clamped.durability;
      const target = BASE_STAT_VALUE * 4 + CREATION_STAT_POINTS;
      const keys: (keyof FighterStats)[] = ['strength', 'speed', 'stamina', 'durability'];
      let idx = 0;
      while (total !== target && idx < 40) {
        const k = keys[idx % 4];
        if (total > target && clamped[k] > BASE_STAT_VALUE) {
          clamped[k] -= 1;
          total -= 1;
        } else if (total < target && clamped[k] < 11) {
          clamped[k] += 1;
          total += 1;
        }
        idx++;
      }
      setStats(clamped);
      soundEngine.playBell(1);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to scout AI fighter.');
    } finally {
      setAiLoading(false);
    }
  };

  const previewHp = calculateMaxHp(stats, gymId);
  const previewSta = calculateMaxSta(stats, gymId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter a Fighter Name before entering the gym.');
      return;
    }
    if (remainingPoints > 0) {
      setErrorMsg(`Please allocate all ${remainingPoints} remaining attribute points.`);
      return;
    }
    soundEngine.playBell(1);
    const fighter = createNewFighter({
      name,
      nickname,
      gender,
      age,
      birthplace,
      styleLabel,
      background,
      appearance: {
        skinTone,
        heightCm,
        weightKg,
        build,
        hairstyle,
        hairColor,
        shortsColor,
        wrapColor: '#e7e0d3',
      },
      gymId,
      stats,
    });
    onConfirm(fighter);
  };

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#0e0f12] text-[#f5f2eb] flex flex-col">
      {/* Compact Landscape Top Header */}
      <header className="shrink-0 border-b border-zinc-800 px-6 py-3 flex items-center justify-between gap-4 bg-[#12141a]">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onBack();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1d24] hover:bg-[#242832] text-zinc-200 text-xs font-semibold border border-zinc-700 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Title</span>
          </button>
          <div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-wide text-white leading-none">
              FIGHTER REGISTRATION
            </h1>
            <p className="text-[11px] text-zinc-400">
              Standing Combat Only · Customize manually or scout a structured fighter with Gemini AI
            </p>
          </div>
        </div>

        {/* AI Scout Fighter Bar (Gemini Structured Outputs) */}
        <div className="hidden md:flex items-center gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="AI Scout theme (e.g. Kayin State elbow striker)"
            aria-label="AI Scout Fighter Theme"
            className="w-64 px-3 py-1.5 rounded-lg bg-[#0c0d11] border border-zinc-700 text-xs text-white focus:border-amber-400 focus:outline-none"
          />
          <button
            type="button"
            disabled={aiLoading}
            onClick={handleAiGenerateFighter}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-display font-bold text-sm tracking-wide comic-panel-sm cursor-pointer whitespace-nowrap"
          >
            {aiLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="w-4 h-4" aria-hidden="true" />
            )}
            <span>{aiLoading ? 'SCOUTING...' : 'AI SCOUT FIGHTER'}</span>
          </button>
        </div>
      </header>

      {/* Main Landscape 2-Column Body (Fits 100% height without scrolling page) */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 min-h-0 max-w-7xl w-full mx-auto px-6 py-4 grid grid-cols-12 gap-5 items-stretch"
      >
        {/* LEFT COLUMN: Live 2D Comic Preview + Stats */}
        <section className="col-span-4 bg-[#161920] rounded-xl comic-panel p-4 flex flex-col justify-between min-h-0">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-display font-bold text-lg tracking-wide text-amber-400">
                FIGHTER PREVIEW
              </span>
              <span className="font-mono-num text-xs text-zinc-400">
                {heightCm} cm · {weightKg} kg
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-3">
              <div className="rounded-lg border-2 border-[#090a0c] overflow-hidden bg-[#101217] aspect-[10/9]">
                <FighterAvatar
                  mode="portrait"
                  gender={gender}
                  appearance={{
                    skinTone,
                    heightCm,
                    weightKg,
                    build,
                    hairstyle,
                    hairColor,
                    shortsColor,
                    wrapColor: '#e7e0d3',
                  }}
                  className="w-full h-full"
                />
              </div>
              <div className="rounded-lg border-2 border-[#090a0c] overflow-hidden bg-[#12141a] aspect-[10/9] flex items-center justify-center p-1">
                <FighterAvatar
                  mode="fullbody"
                  gender={gender}
                  pose="idle"
                  appearance={{
                    skinTone,
                    heightCm,
                    weightKg,
                    build,
                    hairstyle,
                    hairColor,
                    shortsColor,
                    wrapColor: '#e7e0d3',
                  }}
                  className="w-full h-full"
                />
              </div>
            </div>

            <div className="mb-2.5">
              <div className="font-display font-extrabold text-2xl text-white leading-tight truncate">
                {name.trim() || 'Unnamed Striker'}
              </div>
              <div className="text-xs text-amber-400 font-semibold truncate">
                &ldquo;{nickname.trim() || 'The Iron Skull'}&rdquo; · {age} yrs · {birthplace}
              </div>
              {background && (
                <p className="text-[11px] text-zinc-300 mt-1.5 line-clamp-2 leading-snug">
                  {background}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-2.5">
              <div className="p-2.5 rounded-lg bg-[#101217] border border-red-900/60">
                <div className="text-[10px] uppercase text-red-400 font-bold">Starting Max HP</div>
                <div className="font-mono-num font-bold text-xl text-white">{previewHp}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#101217] border border-sky-900/60">
                <div className="text-[10px] uppercase text-sky-400 font-bold">Starting Max STA</div>
                <div className="font-mono-num font-bold text-xl text-white">{previewSta}</div>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#101217] border border-zinc-800 text-xs text-zinc-300">
            <div className="font-bold text-white">{GYMS[gymId].name}</div>
            <div className="text-amber-300 text-[11px]">{GYMS[gymId].bonusSummary}</div>
          </div>
        </section>

        {/* RIGHT COLUMN: Tabbed Landscape Configurator + Confirm CTA */}
        <section className="col-span-8 flex flex-col justify-between min-h-0 gap-3">
          {/* Sub-Tabs for Zero-Scroll Landscape Ergonomics */}
          <div className="shrink-0 grid grid-cols-3 gap-2 p-1 bg-[#161920] rounded-xl comic-panel-sm">
            {(
              [
                { id: 'identity', label: '1. IDENTITY & GYM' },
                { id: 'appearance', label: '2. APPEARANCE' },
                { id: 'gym_stats', label: `3. ATTRIBUTES (${remainingPoints} LEFT)` },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setSectionTab(t.id);
                }}
                className={`py-2 px-3 rounded-lg font-display font-bold text-base tracking-wide cursor-pointer transition-colors ${
                  sectionTab === t.id
                    ? 'bg-red-600 text-white'
                    : 'text-zinc-300 hover:bg-[#20242e]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Active Tab Content Panel */}
          <div className="flex-1 min-h-0 bg-[#161920] rounded-xl comic-panel p-5 overflow-y-auto">
            {sectionTab === 'identity' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label htmlFor="fighter-name" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                      Fighter Name *
                    </label>
                    <input
                      id="fighter-name"
                      type="text"
                      maxLength={26}
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errorMsg) setErrorMsg('');
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-[#0f1116] border border-zinc-700 focus:border-amber-400 focus:outline-none text-white text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="fighter-nickname" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                      Ring Nickname
                    </label>
                    <input
                      id="fighter-nickname"
                      type="text"
                      maxLength={28}
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0f1116] border border-zinc-700 focus:border-amber-400 focus:outline-none text-white text-sm"
                    />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                      Gender
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {(['Male', 'Female'] as Gender[]).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGender(g)}
                          className={`py-2 px-3 rounded-lg text-sm font-semibold border cursor-pointer ${
                            gender === g
                              ? 'bg-red-600 border-red-400 text-white'
                              : 'bg-[#0f1116] border-zinc-700 text-zinc-300'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="fighter-age" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                        Age ({age})
                      </label>
                      <input
                        id="fighter-age"
                        type="range"
                        min={18}
                        max={38}
                        value={age}
                        onChange={(e) => setAge(Number(e.target.value))}
                        className="w-full accent-red-600 mt-2 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label htmlFor="fighter-birthplace" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                        Birthplace
                      </label>
                      <select
                        id="fighter-birthplace"
                        value={birthplace}
                        onChange={(e) => setBirthplace(e.target.value)}
                        className="w-full px-2 py-2 rounded-lg bg-[#0f1116] border border-zinc-700 text-white text-xs"
                      >
                        {BIRTHPLACES.map((bp) => (
                          <option key={bp} value={bp}>
                            {bp}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="font-display font-bold text-lg text-white mb-2">
                    STARTING GYM SELECTION
                  </h2>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.values(GYMS).map((g) => {
                      const active = gymId === g.id;
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => {
                            soundEngine.playClick();
                            setGymId(g.id);
                          }}
                          className={`text-left p-3 rounded-lg border-2 cursor-pointer flex flex-col justify-between ${
                            active
                              ? 'bg-red-950/50 border-amber-400'
                              : 'bg-[#101217] border-zinc-800 hover:border-zinc-600'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-1">
                              <div className="font-display font-extrabold text-base text-white leading-tight">
                                {g.name}
                              </div>
                              {active && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                            </div>
                            <div className="text-[11px] text-zinc-400 mt-0.5">{g.location}</div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-zinc-800 text-[11px] text-amber-300">
                            {g.bonusSummary}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {sectionTab === 'appearance' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                    Skin Tone
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {SKIN_TONES.map((t) => (
                      <button
                        key={t.hex}
                        type="button"
                        aria-label={`Skin tone ${t.label}`}
                        onClick={() => setSkinTone(t.hex)}
                        className={`w-8 h-8 rounded-lg border-2 cursor-pointer ${
                          skinTone === t.hex ? 'border-amber-400 scale-110' : 'border-[#090a0c]'
                        }`}
                        style={{ backgroundColor: t.hex }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                    Body Build
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {BUILDS.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBuild(b)}
                        className={`py-2 px-2 rounded-lg text-xs font-bold border cursor-pointer ${
                          build === b
                            ? 'bg-amber-500 text-black border-amber-300'
                            : 'bg-[#0f1116] border-zinc-700 text-zinc-300'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="fighter-height" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                    Height: <span className="font-mono-num text-white">{heightCm} cm</span>
                  </label>
                  <input
                    id="fighter-height"
                    type="range"
                    min={160}
                    max={196}
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                </div>

                <div>
                  <label htmlFor="fighter-weight" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                    Weight: <span className="font-mono-num text-white">{weightKg} kg</span>
                  </label>
                  <input
                    id="fighter-weight"
                    type="range"
                    min={54}
                    max={105}
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                </div>

                <div>
                  <label htmlFor="fighter-hair" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                    Hairstyle
                  </label>
                  <select
                    id="fighter-hair"
                    value={hairstyle}
                    onChange={(e) => setHairstyle(e.target.value as Hairstyle)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0f1116] border border-zinc-700 text-white text-sm"
                  >
                    {HAIRSTYLES.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                      Hair Color
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {HAIR_COLORS.map((hc) => (
                        <button
                          key={hc.hex}
                          type="button"
                          aria-label={`Hair color ${hc.label}`}
                          onClick={() => setHairColor(hc.hex)}
                          className={`w-7 h-7 rounded border-2 cursor-pointer ${
                            hairColor === hc.hex ? 'border-amber-400 scale-110' : 'border-zinc-950'
                          }`}
                          style={{ backgroundColor: hc.hex }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                      Shorts Color
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {SHORTS_COLORS.map((sc) => (
                        <button
                          key={sc.hex}
                          type="button"
                          aria-label={`Shorts color ${sc.label}`}
                          onClick={() => setShortsColor(sc.hex)}
                          className={`w-7 h-7 rounded border-2 cursor-pointer ${
                            shortsColor === sc.hex ? 'border-amber-400 scale-110' : 'border-zinc-950'
                          }`}
                          style={{ backgroundColor: sc.hex }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {sectionTab === 'gym_stats' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-300">
                    Allocate 15 attribute points across your core fighting traits:
                  </span>
                  <div className="font-mono-num text-sm font-bold px-3 py-1 rounded bg-[#0f1116] border border-zinc-700">
                    Points Left:{' '}
                    <span className={remainingPoints > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                      {remainingPoints}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  {(
                    [
                      { key: 'strength', label: 'Strength', desc: 'Boosts Striking DMG', color: 'text-red-400' },
                      { key: 'speed', label: 'Speed', desc: 'SPD ties & Slip/Evade', color: 'text-emerald-400' },
                      { key: 'stamina', label: 'Stamina', desc: 'Boosts Max STA', color: 'text-sky-400' },
                      { key: 'durability', label: 'Durability / Chin', desc: 'Boosts Max HP & Block', color: 'text-amber-400' },
                    ] as const
                  ).map((item) => {
                    const val = stats[item.key];
                    return (
                      <div
                        key={item.key}
                        className="flex items-center justify-between gap-2 p-3 rounded-lg bg-[#101217] border border-zinc-800"
                      >
                        <div>
                          <div className={`font-display font-bold text-lg ${item.color}`}>
                            {item.label}
                          </div>
                          <div className="text-[11px] text-zinc-400">{item.desc}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            aria-label={`Decrease ${item.label}`}
                            disabled={val <= BASE_STAT_VALUE}
                            onClick={() => adjustStat(item.key, -1)}
                            className="w-8 h-8 flex items-center justify-center rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-35 text-white cursor-pointer"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-mono-num font-bold text-lg w-7 text-center text-white">
                            {val}
                          </span>
                          <button
                            type="button"
                            aria-label={`Increase ${item.label}`}
                            disabled={remainingPoints <= 0 || val >= 12}
                            onClick={() => adjustStat(item.key, 1)}
                            className="w-8 h-8 flex items-center justify-center rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-35 text-white cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Bar */}
          <div className="shrink-0 flex items-center justify-between gap-4">
            {errorMsg ? (
              <div
                role="alert"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-950/70 border border-red-500 text-red-200 text-xs flex-1"
              >
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            ) : (
              <span className="text-xs text-zinc-400">
                10-card starter deck equipped automatically · Fully customizable in Game Plan
              </span>
            )}

            <button
              type="submit"
              className="px-7 py-3 bg-red-600 hover:bg-red-500 text-white font-display font-extrabold text-xl tracking-wide rounded-lg comic-panel-sm cursor-pointer whitespace-nowrap"
            >
              CONFIRM FIGHTER &amp; ENTER GYM
            </button>
          </div>
        </section>
      </form>
    </main>
  );
};
