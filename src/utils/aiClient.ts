import {
  buildValid40CardPool,
  calculateMaxHp,
  calculateMaxSta,
  createInitialSkills,
} from '../game/rules';
import {
  CombatCard,
  FighterProfile,
  GymId,
  OpponentProfile,
} from '../types/game';

function normalizeHex(hex: unknown, fallback: string): string {
  if (typeof hex !== 'string') return fallback;
  const cleaned = hex.trim().replace(/^#+/, '');
  return /^[0-9a-fA-F]{6}$/.test(cleaned) ? `#${cleaned.toLowerCase()}` : fallback;
}

export async function generateAiFighterProfile(
  prompt: string,
  role: 'player' | 'opponent' = 'player'
): Promise<{
  name: string;
  nickname: string;
  gender: 'Male' | 'Female';
  age: number;
  birthplace: string;
  styleLabel: string;
  background: string;
  gymId: GymId;
  appearance: FighterProfile['appearance'];
  stats: FighterProfile['stats'];
}> {
  const res = await fetch('/api/ai/generate-fighter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, role }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Gemini fighter generation failed (${res.status})`);
  }
  const f = data.fighter;
  return {
    ...f,
    appearance: {
      ...f.appearance,
      skinTone: normalizeHex(f.appearance?.skinTone, '#c88d61'),
      hairColor: normalizeHex(f.appearance?.hairColor, '#18181b'),
      shortsColor: normalizeHex(f.appearance?.shortsColor, '#b91c1c'),
      wrapColor: normalizeHex(f.appearance?.wrapColor, '#e7e0d3'),
    },
  };
}

export async function generateAiSkillCard(
  prompt: string,
  lang: 'en' | 'my' = 'en'
): Promise<CombatCard> {
  const res = await fetch('/api/ai/generate-card', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, lang }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Gemini card generation failed (${res.status})`);
  }
  const raw = data.card;
  return {
    id: `ai_card_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name: raw.name,
    discipline: raw.discipline,
    category: raw.category,
    tier: raw.tier ?? 'II',
    position: raw.position ?? 'Standing',
    skillKey: raw.skillKey,
    staCost: Math.max(1, Math.min(4, Number(raw.staCost) || 2)),
    power: Math.max(4, Math.min(15, Number(raw.power) || 8)),
    speed: Math.max(1, Math.min(5, Number(raw.speed) || 2)),
    strikeZone: raw.strikeZone,
    artType: raw.artType,
    description: raw.description,
    unlockCostXp: 0,
    isCustomAi: true,
    specialEffect: raw.specialEffect && raw.specialEffect !== 'none' ? raw.specialEffect : undefined,
  };
}

export function buildAiOpponentFromGenerated(
  gen: Awaited<ReturnType<typeof generateAiFighterProfile>>,
  player: FighterProfile
): OpponentProfile {
  const maxHp = calculateMaxHp(gen.stats, gen.gymId);
  const maxSta = calculateMaxSta(gen.stats, gen.gymId);

  return {
    id: `ai_opp_${Date.now()}`,
    name: gen.name,
    nickname: gen.nickname,
    gender: gen.gender,
    age: gen.age,
    birthplace: gen.birthplace,
    styleLabel: gen.styleLabel,
    background: gen.background,
    appearance: gen.appearance,
    stats: gen.stats,
    skills: createInitialSkills(gen.gymId, 30),
    maxHp: Math.max(55, Math.round((maxHp + player.maxHp) * 0.5)),
    maxSta,
    deckIds: buildValid40CardPool(22, 18),
    difficultyTier: 2,
    isAiGenerated: true,
  };
}
