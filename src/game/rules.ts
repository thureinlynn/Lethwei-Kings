import {
  CARD_DATABASE,
  DEFAULT_STARTER_DECK,
  DEFAULT_STARTER_UNLOCKED,
  getCardById,
} from '../data/cards';
import { BIRTHPLACES, GYMS, HAIR_COLORS, SHORTS_COLORS, SKIN_TONES } from '../data/gyms';
import {
  BodyBuild,
  CombatCard,
  CombatPosition,
  DefenseSkillKey,
  FighterAppearance,
  FighterPose,
  FighterProfile,
  FighterStats,
  FightSkillKey,
  FightSkills,
  Gender,
  GymId,
  Hairstyle,
  MatchMode,
  OffenseSkillKey,
  OpponentProfile,
  StanceRadar,
  StrikeZone,
  TurnExchangeStep,
  TurnResolutionSummary,
  TurnRole,
} from '../types/game';

export const MAX_ROUNDS = 5;
export const TURNS_PER_ROUND = 8;
export const TURN_TIMER_SECONDS = 15;
export const DECK_SIZE = 40;
export const MIN_STRIKE_CARDS = 16;
export const MIN_DEFENSE_CARDS = 16;
export const MAX_SKILL_CAP = 19000;
export const CREATION_STAT_POINTS = 15;
export const BASE_STAT_VALUE = 3;
export const CRITICAL_HP_THRESHOLD = 0.35;
export const CHAMPIONSHIP_UNLOCK_WINS = 3;

export const OFFENSE_SKILL_KEYS: OffenseSkillKey[] = [
  'Punches',
  'Elbows',
  'Knees',
  'High_Kicks',
  'Low_Kicks',
  'Clinchwork',
  'Takedowns',
  'Ground_Grappling',
  'Submission',
];

export const DEFENSE_SKILL_KEYS: DefenseSkillKey[] = [
  'Strike_Def',
  'Knees_Def',
  'Kick_Def',
  'Takedown_Def',
  'Submission_Def',
];

export const ALL_SKILL_KEYS: FightSkillKey[] = [
  ...OFFENSE_SKILL_KEYS,
  ...DEFENSE_SKILL_KEYS,
];

export const SKILL_LABELS: Record<FightSkillKey, { en: string; my: string; group: 'offense' | 'defense' }> = {
  Punches: { en: 'Punches', my: 'လက်သီး', group: 'offense' },
  Elbows: { en: 'Elbows', my: 'တံတောင်', group: 'offense' },
  Knees: { en: 'Knees', my: 'ဒူး', group: 'offense' },
  High_Kicks: { en: 'High Kicks', my: 'အမြင့်ကန်', group: 'offense' },
  Low_Kicks: { en: 'Low Kicks', my: 'အောက်ကန်', group: 'offense' },
  Clinchwork: { en: 'Clinchwork', my: 'လည်ဖက်', group: 'offense' },
  Takedowns: { en: 'Takedowns', my: 'ပေါက်ချ/လှဲ', group: 'offense' },
  Ground_Grappling: { en: 'Ground Grappling', my: 'မြေပြင်တိုက်', group: 'offense' },
  Submission: { en: 'Submission', my: 'ချုပ်ကွက်', group: 'offense' },
  Strike_Def: { en: 'Strike Def', my: 'လက်သီး/တံတောင်ကာ', group: 'defense' },
  Knees_Def: { en: 'Knees Def', my: 'ဒူးကာ', group: 'defense' },
  Kick_Def: { en: 'Kick Def', my: 'ကန်ချက်ကာ', group: 'defense' },
  Takedown_Def: { en: 'Takedown Def', my: 'ပေါက်ချကာ', group: 'defense' },
  Submission_Def: { en: 'Submission Def', my: 'ချုပ်ကွက်ဖြေ', group: 'defense' },
};

export interface CombatantState {
  hp: number;
  maxHp: number;
  sta: number;
  maxSta: number;
  bleedTurns: number;
  slowPenalty: number;
  agilityPenalty: number;
  submissionPct: number;
  maniUsed: boolean;
  totalDamageDealt: number;
  strikesLanded: number;
  headbuttsLanded: number;
}

export function createInitialSkills(gymId?: GymId, baseLevel = 25): FightSkills {
  const skills: FightSkills = {
    Punches: baseLevel,
    Elbows: baseLevel,
    Knees: baseLevel,
    High_Kicks: baseLevel,
    Low_Kicks: baseLevel,
    Clinchwork: baseLevel,
    Takedowns: Math.max(15, baseLevel - 5),
    Ground_Grappling: Math.max(15, baseLevel - 5),
    Submission: Math.max(15, baseLevel - 7),
    Strike_Def: baseLevel,
    Knees_Def: baseLevel,
    Kick_Def: baseLevel,
    Takedown_Def: baseLevel,
    Submission_Def: Math.max(15, baseLevel - 3),
  };

  if (gymId === 'thuwunna') {
    skills.Elbows += 12;
    skills.Clinchwork += 10;
    skills.Punches += 6;
    skills.Strike_Def += 6;
  } else if (gymId === 'golden_land') {
    skills.Strike_Def += 10;
    skills.Takedown_Def += 10;
    skills.Submission_Def += 8;
    skills.Ground_Grappling += 6;
  } else if (gymId === 'tiger_mt') {
    skills.High_Kicks += 10;
    skills.Low_Kicks += 10;
    skills.Knees += 10;
    skills.Kick_Def += 8;
  }

  return skills;
}

export function getTotalSkillPoints(skills?: FightSkills): number {
  if (!skills) return 0;
  return ALL_SKILL_KEYS.reduce((sum, key) => sum + (skills[key] ?? 0), 0);
}

export function upgradeFighterSkill(
  fighter: FighterProfile,
  skillKey: FightSkillKey,
  xpCost = 20,
  gain = 5
): { fighter: FighterProfile; upgraded: boolean; reason?: string } {
  const currentSkills = fighter.skills ?? createInitialSkills(fighter.gymId);
  const currentTotal = getTotalSkillPoints(currentSkills);
  if (currentTotal + gain > MAX_SKILL_CAP) {
    return {
      fighter,
      upgraded: false,
      reason: `Fighter Skill Cap (${MAX_SKILL_CAP.toLocaleString()}) reached.`,
    };
  }
  if (fighter.trainingXp < xpCost) {
    return {
      fighter,
      upgraded: false,
      reason: `Need ${xpCost} Training XP to drill ${SKILL_LABELS[skillKey].en}.`,
    };
  }
  const nextSkills: FightSkills = {
    ...currentSkills,
    [skillKey]: (currentSkills[skillKey] ?? 20) + gain,
  };
  return {
    upgraded: true,
    fighter: {
      ...fighter,
      trainingXp: fighter.trainingXp - xpCost,
      trainingDays: fighter.trainingDays + 1,
      skills: nextSkills,
    },
  };
}

/**
 * Computes the Positional Triangle & Stance Radar across all 40 deck cards.
 * Standing Radar covers Head / Body / Legs in Standing & Clinch exchanges.
 * Ground Radar covers Head / Body / Legs in Ground & Submission exchanges.
 */
export function computeStanceRadar(
  deckIds: string[],
  customCards?: CombatCard[]
): StanceRadar {
  const radar: StanceRadar = {
    Standing: { Head: 0, Body: 0, Legs: 0 },
    Ground: { Head: 0, Body: 0, Legs: 0 },
  };

  for (const id of deckIds) {
    const card = getCardById(id, customCards);
    if (!card) continue;
    const tierWeight = card.tier === 'III' ? 3 : card.tier === 'II' ? 2 : 1.25;
    const pos = card.position ?? 'Standing';

    const addZoneWeight = (stance: 'Standing' | 'Ground', factor: number) => {
      const w = tierWeight * factor;
      if (card.strikeZone === 'Head') radar[stance].Head += w;
      else if (card.strikeZone === 'Body') radar[stance].Body += w;
      else if (card.strikeZone === 'Legs') radar[stance].Legs += w;
      else if (card.strikeZone === 'Clinch') {
        radar[stance].Body += w * 0.6;
        radar[stance].Head += w * 0.4;
      } else {
        // 'All'
        radar[stance].Head += w * 0.34;
        radar[stance].Body += w * 0.33;
        radar[stance].Legs += w * 0.33;
      }
    };

    if (pos === 'Ground') {
      addZoneWeight('Ground', 1.0);
    } else if (pos === 'Any') {
      addZoneWeight('Standing', 0.65);
      addZoneWeight('Ground', 0.35);
    } else {
      addZoneWeight('Standing', 1.0);
    }
  }

  return {
    Standing: {
      Head: Math.round(radar.Standing.Head),
      Body: Math.round(radar.Standing.Body),
      Legs: Math.round(radar.Standing.Legs),
    },
    Ground: {
      Head: Math.round(radar.Ground.Head),
      Body: Math.round(radar.Ground.Body),
      Legs: Math.round(radar.Ground.Legs),
    },
  };
}

/**
 * Returns +0.15 to +0.30 effectiveness multiplier when actor has higher
 * Stance Triangle dominance in the active position & target zone.
 */
export function getTriangleDominanceBonus(
  actorRadar: StanceRadar,
  opponentRadar: StanceRadar,
  position: CombatPosition,
  zone: StrikeZone
): number {
  const stanceKey: 'Standing' | 'Ground' = position === 'Ground' ? 'Ground' : 'Standing';
  const mappedZone: 'Head' | 'Body' | 'Legs' =
    zone === 'Head' ? 'Head' : zone === 'Legs' ? 'Legs' : 'Body';

  const mine = actorRadar[stanceKey][mappedZone];
  const theirs = opponentRadar[stanceKey][mappedZone];
  if (mine <= theirs) return 0;

  const diff = mine - theirs;
  const ratio = diff / Math.max(4, theirs + 4);
  // Smoothly scales from +15% to +30%
  return Math.min(0.3, Number((0.15 + ratio * 0.15).toFixed(2)));
}

function getTierMultiplier(card: CombatCard): number {
  if (card.tier === 'III') return 1.28;
  if (card.tier === 'II') return 1.14;
  return 1.0;
}

export function inferSkillKey(card: CombatCard): FightSkillKey {
  if (card.skillKey) return card.skillKey;
  switch (card.artType) {
    case 'jab':
    case 'cross':
    case 'hook':
    case 'uppercut':
    case 'superman':
      return 'Punches';
    case 'elbow':
    case 'upwardelbow':
      return 'Elbows';
    case 'knee':
      return 'Knees';
    case 'roundhouse':
    case 'axekick':
      return 'High_Kicks';
    case 'lowkick':
    case 'sidekick':
    case 'teep':
      return 'Low_Kicks';
    case 'headbutt':
    case 'desperation':
      return 'Clinchwork';
    case 'slam':
    case 'takedown':
      return 'Takedowns';
    case 'groundpound':
      return 'Ground_Grappling';
    case 'submission':
      return 'Submission';
    case 'catchkick':
    case 'shincheck':
      return 'Kick_Def';
    case 'sprawl':
      return 'Takedown_Def';
    case 'escape':
      return 'Submission_Def';
    case 'longguard':
      return 'Knees_Def';
    default:
      return 'Strike_Def';
  }
}

export function calculateEffectivePower(
  card: CombatCard,
  stats: FighterStats,
  gymId?: GymId,
  skills?: FightSkills,
  triangleBonusRatio = 0
): number {
  if (card.specialEffect === 'mani_heal') return card.power;

  const skillKey = inferSkillKey(card);
  const skillVal = skills?.[skillKey] ?? 25;
  // +0.5% per skill point above 20, bounded safely
  const skillMult = 1 + Math.max(0, Math.min(1.2, (skillVal - 20) * 0.005));
  const tierMult = getTierMultiplier(card);
  const triangleMult = 1 + Math.max(0, Math.min(0.3, triangleBonusRatio));

  if (
    card.category === 'Defense' ||
    card.specialEffect === 'adrenaline_sta' ||
    card.specialEffect === 'prevent_ko'
  ) {
    const baseDef = card.power * tierMult + Math.floor(stats.durability * 0.35);
    return Math.max(1, Math.round(baseDef * skillMult * triangleMult));
  }

  let bonus = Math.floor(stats.strength * 0.65);
  if (gymId) {
    const gym = GYMS[gymId];
    if (
      card.artType === 'headbutt' ||
      card.artType === 'elbow' ||
      card.artType === 'upwardelbow' ||
      card.artType === 'desperation'
    ) {
      bonus += gym.headbuttElbowBonus;
    }
    if (
      card.artType === 'roundhouse' ||
      card.artType === 'sidekick' ||
      card.artType === 'teep' ||
      card.artType === 'lowkick' ||
      card.artType === 'axekick' ||
      card.artType === 'knee'
    ) {
      bonus += gym.kickKneeBonus;
    }
  }
  const baseOffense = card.power * tierMult + bonus;
  return Math.max(1, Math.round(baseOffense * skillMult * triangleMult));
}

export function calculateMaxHp(stats: FighterStats, gymId: GymId, bonusHp = 0): number {
  const gym = GYMS[gymId];
  return 45 + stats.durability * 5 + gym.bonusMaxHp + bonusHp;
}

export function calculateMaxSta(stats: FighterStats, gymId: GymId, bonusSta = 0): number {
  const gym = GYMS[gymId];
  return 8 + Math.floor(stats.stamina * 1.25) + gym.bonusMaxSta + bonusSta;
}

export function applyRoundRecovery(
  state: CombatantState,
  stats: FighterStats
): CombatantState {
  // Condition (stats.stamina) drives between-round stamina recovery
  const staGain = Math.max(3, 2 + Math.floor(stats.stamina * 0.45));
  return {
    ...state,
    sta: Math.min(state.maxSta, state.sta + staGain),
    hp: Math.min(state.maxHp, state.hp + 2),
  };
}

export function createNewFighter(params: {
  name: string;
  nickname: string;
  gender: Gender;
  age: number;
  birthplace: string;
  styleLabel?: string;
  background?: string;
  appearance: FighterAppearance;
  gymId: GymId;
  stats: FighterStats;
  skills?: FightSkills;
}): FighterProfile {
  const gym = GYMS[params.gymId];
  const unlocked = Array.from(new Set([...DEFAULT_STARTER_UNLOCKED, ...gym.starterCards]));
  const maxHp = calculateMaxHp(params.stats, params.gymId);
  const maxSta = calculateMaxSta(params.stats, params.gymId);

  return {
    id: `fighter_${Date.now()}`,
    name: params.name.trim(),
    nickname: params.nickname.trim() || 'The Iron Skull',
    gender: params.gender,
    age: params.age,
    birthplace: params.birthplace,
    styleLabel: params.styleLabel,
    background: params.background,
    appearance: params.appearance,
    gymId: params.gymId,
    stats: params.stats,
    skills: params.skills ?? createInitialSkills(params.gymId, 25),
    currentHp: maxHp,
    maxHp,
    currentSta: maxSta,
    maxSta,
    trainingXp: 50,
    trainingDays: 0,
    unlockedCardIds: unlocked,
    activeDeckIds: [...DEFAULT_STARTER_DECK],
    customCards: [],
    record: {
      wins: 0,
      losses: 0,
      kos: 0,
      sparringWins: 0,
      localWins: 0,
      championshipWins: 0,
    },
  };
}

export function validateDeck(
  deckIds: string[],
  unlockedCardIds: string[],
  customCards?: CombatCard[]
): {
  valid: boolean;
  reason?: string;
} {
  if (deckIds.length !== DECK_SIZE) {
    return {
      valid: false,
      reason: `Deck must contain exactly ${DECK_SIZE} cards (currently ${deckIds.length}).`,
    };
  }
  const counts: Record<string, number> = {};
  let strikeCount = 0;
  let defenseCount = 0;
  for (const id of deckIds) {
    const card = getCardById(id, customCards);
    if (!card) return { valid: false, reason: `Unknown card: ${id}` };
    if (!unlockedCardIds.includes(id)) {
      return { valid: false, reason: `${card.name} is not unlocked yet.` };
    }
    if (card.category === 'Critical') {
      return {
        valid: false,
        reason: `Critical cards trigger automatically below 35% HP and do not take deck slots.`,
      };
    }
    if (card.category === 'Striking') strikeCount += 1;
    else if (card.category === 'Defense') defenseCount += 1;
    counts[id] = (counts[id] || 0) + 1;
    if (counts[id] > 3) {
      return { valid: false, reason: `Maximum 3 copies allowed per card (${card.name}).` };
    }
  }
  if (strikeCount < MIN_STRIKE_CARDS) {
    return {
      valid: false,
      reason: `Deck needs at least ${MIN_STRIKE_CARDS} Attack/Transition cards (currently ${strikeCount}).`,
    };
  }
  if (defenseCount < MIN_DEFENSE_CARDS) {
    return {
      valid: false,
      reason: `Deck needs at least ${MIN_DEFENSE_CARDS} Defense/Escape cards (currently ${defenseCount}).`,
    };
  }
  return { valid: true };
}

export function isChampionshipUnlocked(fighter: FighterProfile): boolean {
  return fighter.record.localWins >= CHAMPIONSHIP_UNLOCK_WINS;
}

const OPPONENT_FIRST_NAMES_MALE = [
  'Tun', 'Kyaw', 'Aung', 'Saw', 'Ye', 'Thura', 'Min', 'Htet', 'Somchai', 'Buakaw', 'Kenji', 'Ryu', 'Marco', 'Viktor',
];
const OPPONENT_FIRST_NAMES_FEMALE = [
  'Su', 'Hnin', 'Thandar', 'May', 'Phyu', 'Nang', 'Lom', 'Yuki', 'Aoi', 'Elena', 'Nadia', 'Mina',
];
const OPPONENT_LAST_NAMES = [
  'Lin', 'Hlaing', 'Oo', 'Naing', 'Zaw', 'Htwe', 'Paing', 'Chai', 'Sato', 'Kovacs', 'Silva', 'Van Dijk',
];
const OPPONENT_NICKNAMES = [
  'The Iron Forehead',
  'Yangon Viper',
  'Golden Elbow',
  'The Bamboo Crusher',
  'Thunder Knee',
  'The Shadow Boxer',
  'Crimson Shin',
  'Hpa-An Hammer',
  'Pit Viper BJJ',
  'Midnight Blitz',
];
const HAIRSTYLES: Hairstyle[] = ['Buzz', 'Topknot', 'Mohawk', 'Undercut', 'LongTied', 'Shaved'];
const BUILDS: BodyBuild[] = ['Lean', 'Athletic', 'Heavy'];

export function buildValid40CardPool(
  strikingTarget: number,
  defenseTarget: number,
  rng: () => number = Math.random
): string[] {
  const strikingPool = CARD_DATABASE.filter((c) => c.category === 'Striking');
  const defensePool = CARD_DATABASE.filter((c) => c.category === 'Defense');
  const counts: Record<string, number> = {};
  const deck: string[] = [];

  const fill = (pool: CombatCard[], quota: number) => {
    let safety = 0;
    let added = 0;
    while (added < quota && safety < 400 && pool.length > 0) {
      const idx = Math.floor(rng() * pool.length);
      const card = pool[idx];
      if ((counts[card.id] ?? 0) < 3) {
        counts[card.id] = (counts[card.id] ?? 0) + 1;
        deck.push(card.id);
        added += 1;
      }
      safety += 1;
    }
    // Deterministic fallback sweep if random hit caps
    for (const card of pool) {
      while (added < quota && (counts[card.id] ?? 0) < 3) {
        counts[card.id] = (counts[card.id] ?? 0) + 1;
        deck.push(card.id);
        added += 1;
      }
    }
  };

  fill(strikingPool, strikingTarget);
  fill(defensePool, defenseTarget);
  return deck;
}

export function generateOpponent(
  player: FighterProfile,
  mode: MatchMode,
  rng: () => number = Math.random
): OpponentProfile {
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
  const playerTotalStats =
    player.stats.strength + player.stats.speed + player.stats.stamina + player.stats.durability;

  const tierOffset = mode === 'sparring' ? -1 : mode === 'local' ? 1 : 4;
  const targetStatsTotal = Math.max(20, playerTotalStats + tierOffset + Math.floor(rng() * 3));

  const gender: Gender = rng() < 0.72 ? 'Male' : 'Female';
  const firstName =
    mode === 'championship'
      ? gender === 'Male'
        ? 'Soe Lin'
        : 'May Thandar'
      : pick(gender === 'Male' ? OPPONENT_FIRST_NAMES_MALE : OPPONENT_FIRST_NAMES_FEMALE);
  const lastName = mode === 'championship' ? 'The Undisputed' : pick(OPPONENT_LAST_NAMES);

  const s1 = Math.max(3, Math.round(targetStatsTotal * (0.22 + rng() * 0.1)));
  const s2 = Math.max(3, Math.round(targetStatsTotal * (0.22 + rng() * 0.1)));
  const s3 = Math.max(3, Math.round(targetStatsTotal * (0.22 + rng() * 0.1)));
  const s4 = Math.max(3, targetStatsTotal - s1 - s2 - s3);

  const stats: FighterStats = {
    strength: s1,
    speed: s2,
    stamina: s3,
    durability: s4,
  };

  const hpScale = mode === 'sparring' ? 0.92 : mode === 'local' ? 1.0 : 1.15;
  const maxHp = Math.round((45 + stats.durability * 5) * hpScale);
  const maxSta = 8 + Math.floor(stats.stamina * 1.25);

  const deckIds = buildValid40CardPool(22, 18, rng);
  const baseSkillLevel = mode === 'sparring' ? 22 : mode === 'local' ? 32 : 48;
  const skills = createInitialSkills(
    mode === 'championship' ? 'thuwunna' : undefined,
    baseSkillLevel
  );

  const styleLabels = [
    'Traditional Lethwei Brawler',
    'Muay Thai Clinch Specialist',
    'Wrestling & Ground-and-Pound',
    'BJJ Submission Hunter',
    'Complete MMA Tactician',
  ];

  const appearance: FighterAppearance = {
    skinTone: pick(SKIN_TONES).hex,
    heightCm: 165 + Math.floor(rng() * 24),
    weightKg: 58 + Math.floor(rng() * 32),
    build: pick(BUILDS),
    hairstyle: pick(HAIRSTYLES),
    hairColor: pick(HAIR_COLORS).hex,
    shortsColor: pick(SHORTS_COLORS).hex,
    wrapColor: rng() > 0.5 ? '#e7e0d3' : '#dc2626',
  };

  return {
    id: `opp_${Math.floor(rng() * 100000)}`,
    name: mode === 'championship' ? 'Soe Lin Oo' : `${firstName} ${lastName}`,
    nickname: mode === 'championship' ? 'Undisputed King' : pick(OPPONENT_NICKNAMES),
    gender,
    age: 20 + Math.floor(rng() * 14),
    birthplace: pick(BIRTHPLACES),
    styleLabel: mode === 'championship' ? 'World Champion · Nine-Limbs & Ground Master' : pick(styleLabels),
    appearance,
    stats,
    skills,
    maxHp,
    maxSta,
    deckIds,
    difficultyTier: mode === 'sparring' ? 1 : mode === 'local' ? 2 : 3,
    isChampion: mode === 'championship',
  };
}

export function getTurnRole(_roundNumber: number, turnNumber: number): TurnRole {
  return turnNumber % 2 === 1 ? 'player_attack' : 'ai_attack';
}

export function drawBattleHand(
  deckIds: string[],
  handSize = 5,
  rng: () => number = Math.random
): string[] {
  const pool = [...deckIds];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(handSize, pool.length));
}

function cardFitsPosition(card: CombatCard | undefined, position: CombatPosition): boolean {
  if (!card) return false;
  const pos = card.position ?? 'Standing';
  if (pos === 'Any') return true;
  if (pos === position) return true;
  if (position === 'Clinch' && pos === 'Standing' && card.strikeZone !== 'Legs') return true;
  return false;
}

export function drawBattleHandForRole(
  deckIds: string[],
  role: TurnRole,
  side: 'player' | 'ai',
  handSize = 5,
  fallbackUnlockedIds: string[] = [],
  customCards: CombatCard[] = [],
  rng: () => number = Math.random,
  position: CombatPosition = 'Standing'
): string[] {
  const desiredCategory: 'Striking' | 'Defense' =
    (side === 'player' && role === 'player_attack') || (side === 'ai' && role === 'ai_attack')
      ? 'Striking'
      : 'Defense';

  const exactPosFromDeck = deckIds.filter((id) => {
    const card = getCardById(id, customCards);
    return card?.category === desiredCategory && cardFitsPosition(card, position);
  });

  const anyPosFromDeck = deckIds.filter((id) => {
    const card = getCardById(id, customCards);
    return card?.category === desiredCategory;
  });

  const drawn = drawBattleHand(exactPosFromDeck, handSize, rng);
  if (drawn.length >= handSize) return drawn;

  // Pad with position-matching unlocked/database cards first, then any role-matching cards
  const extraPos = [
    ...fallbackUnlockedIds,
    ...CARD_DATABASE.filter((c) => c.category === desiredCategory && cardFitsPosition(c, position)).map((c) => c.id),
  ].filter((id) => {
    const c = getCardById(id, customCards);
    return c?.category === desiredCategory && cardFitsPosition(c, position);
  });

  const extraPool = [...drawBattleHand(anyPosFromDeck, handSize, rng), ...extraPos];
  const padded = [...drawn];
  let idx = 0;
  while (padded.length < handSize && extraPool.length > 0) {
    padded.push(extraPool[idx % extraPool.length]);
    idx += 1;
  }
  return padded;
}

export function getAvailableCriticalCards(state: CombatantState): CombatCard[] {
  if (state.hp <= 0 || state.hp / state.maxHp >= CRITICAL_HP_THRESHOLD) {
    return [];
  }
  return CARD_DATABASE.filter((c) => {
    if (c.category !== 'Critical') return false;
    if (c.specialEffect === 'mani_heal' && state.maniUsed) return false;
    return true;
  });
}

export function getAvailableCriticalCardsForRole(
  state: CombatantState,
  role: TurnRole,
  side: 'player' | 'ai'
): CombatCard[] {
  const all = getAvailableCriticalCards(state);
  const isAttacking =
    (side === 'player' && role === 'player_attack') || (side === 'ai' && role === 'ai_attack');
  return all.filter((c) => (isAttacking ? c.artType === 'desperation' : c.artType !== 'desperation'));
}

export function chooseAiAction(
  aiHandIds: string[],
  aiState: CombatantState,
  rng: () => number = Math.random,
  role?: TurnRole,
  customCards?: CombatCard[],
  position: CombatPosition = 'Standing'
): CombatCard | 'REST' {
  const crits = role
    ? getAvailableCriticalCardsForRole(aiState, role, 'ai')
    : getAvailableCriticalCards(aiState);

  if (role === 'ai_attack') {
    const desperation = crits.find((c) => c.artType === 'desperation');
    if (desperation && desperation.staCost <= aiState.sta && rng() < 0.5) {
      return desperation;
    }
  } else {
    const mani = crits.find((c) => c.specialEffect === 'mani_heal');
    if (mani && rng() < 0.75) {
      return mani;
    }
    const surge = crits.find((c) => c.specialEffect === 'adrenaline_sta');
    if (surge && aiState.sta <= 2 && rng() < 0.65) {
      return surge;
    }
    const groggy = crits.find((c) => c.specialEffect === 'prevent_ko');
    if (groggy && groggy.staCost <= aiState.sta && aiState.hp <= 12 && rng() < 0.55) {
      return groggy;
    }
  }

  const desiredCategory = role ? (role === 'ai_attack' ? 'Striking' : 'Defense') : null;
  const playable = aiHandIds
    .map((id) => getCardById(id, customCards))
    .filter((c): c is CombatCard => c !== undefined)
    .filter((c) => (!desiredCategory || c.category === desiredCategory) && c.staCost <= aiState.sta);

  if (playable.length === 0) {
    return 'REST';
  }

  const posPlayable = playable.filter((c) => cardFitsPosition(c, position));
  const pool = posPlayable.length > 0 ? posPlayable : playable;

  if (!role) {
    const defenses = pool.filter((c) => c.category === 'Defense');
    const strikes = pool.filter((c) => c.category === 'Striking');
    if (aiState.hp < aiState.maxHp * 0.45 && defenses.length > 0 && rng() < 0.45) {
      return defenses[Math.floor(rng() * defenses.length)];
    }
    if (strikes.length > 0) {
      return strikes[Math.floor(rng() * strikes.length)];
    }
  }
  return pool[Math.floor(rng() * pool.length)];
}

export function chooseAutoTimeoutAction(
  handIds: string[],
  state: CombatantState,
  customCards?: CombatCard[],
  desiredCategory?: 'Striking' | 'Defense'
): CombatCard | 'REST' {
  const playable = handIds
    .map((id) => getCardById(id, customCards))
    .filter((c): c is CombatCard => c !== undefined)
    .filter((c) => (!desiredCategory || c.category === desiredCategory) && c.staCost <= state.sta);

  if (playable.length === 0) {
    return 'REST';
  }
  playable.sort((a, b) => a.speed - b.speed || a.staCost - b.staCost);
  return playable[0];
}

export function mapCardToFighterPose(choice: CombatCard | 'REST'): FighterPose {
  if (choice === 'REST') return 'idle';
  switch (choice.artType) {
    case 'jab':
    case 'cross':
    case 'uppercut':
      return 'jab';
    case 'hook':
    case 'superman':
      return 'hook';
    case 'roundhouse':
    case 'sidekick':
    case 'teep':
    case 'lowkick':
    case 'axekick':
      return 'kick';
    case 'elbow':
    case 'upwardelbow':
      return 'elbow';
    case 'knee':
      return 'knee';
    case 'headbutt':
    case 'desperation':
      return 'headbutt';
    case 'slam':
      return 'slam';
    case 'takedown':
      return 'takedown';
    case 'groundpound':
      return 'groundpound';
    case 'submission':
      return 'submission';
    case 'escape':
      return 'escape';
    case 'evade':
    case 'shoulderroll':
      return 'evade';
    case 'parry':
      return 'parry';
    case 'catchkick':
    case 'shincheck':
      return 'catchkick';
    case 'block':
    case 'sprawl':
    case 'longguard':
    case 'surge':
    case 'mani':
    case 'groggy':
      return 'block';
    default:
      return 'idle';
  }
}

function isKickCard(card: CombatCard): boolean {
  return (
    card.artType === 'roundhouse' ||
    card.artType === 'sidekick' ||
    card.artType === 'teep' ||
    card.artType === 'lowkick' ||
    card.artType === 'axekick'
  );
}

function isClinchOrTakedownCard(card: CombatCard): boolean {
  return (
    card.strikeZone === 'Clinch' ||
    card.artType === 'knee' ||
    card.artType === 'slam' ||
    card.artType === 'takedown' ||
    card.specialEffect === 'takedown' ||
    card.specialEffect === 'enter_clinch'
  );
}

function isHandOrElbowCard(card: CombatCard): boolean {
  return (
    card.artType === 'jab' ||
    card.artType === 'cross' ||
    card.artType === 'hook' ||
    card.artType === 'uppercut' ||
    card.artType === 'superman' ||
    card.artType === 'elbow' ||
    card.artType === 'upwardelbow'
  );
}

export function resolveTurn(params: {
  roundNumber: number;
  turnNumber: number;
  position?: CombatPosition;
  playerChoice: CombatCard | 'REST';
  aiChoice: CombatCard | 'REST';
  playerState: CombatantState;
  aiState: CombatantState;
  playerStats: FighterStats;
  aiStats: FighterStats;
  playerSkills?: FightSkills;
  aiSkills?: FightSkills;
  playerRadar?: StanceRadar;
  aiRadar?: StanceRadar;
  playerGymId: GymId;
  rng?: () => number;
}): {
  nextPlayerState: CombatantState;
  nextAiState: CombatantState;
  summary: TurnResolutionSummary;
} {
  const rng = params.rng ?? Math.random;
  const p: CombatantState = { ...params.playerState };
  const a: CombatantState = { ...params.aiState };
  let activePosition: CombatPosition = params.position ?? 'Standing';
  const logs: string[] = [];

  const pSkills = params.playerSkills ?? createInitialSkills(params.playerGymId);
  const aSkills = params.aiSkills ?? createInitialSkills();
  const pRadar = params.playerRadar ?? computeStanceRadar(DEFAULT_STARTER_DECK);
  const aRadar = params.aiRadar ?? computeStanceRadar(DEFAULT_STARTER_DECK);

  const pActionLabel = params.playerChoice === 'REST' ? 'Rest & Recover' : params.playerChoice.name;
  const aActionLabel = params.aiChoice === 'REST' ? 'Rest & Recover' : params.aiChoice.name;

  if (params.playerChoice === 'REST') {
    const gained = Math.min(p.maxSta - p.sta, 4);
    p.sta += gained;
    logs.push(`You catch your breath (+${gained} STA).`);
  } else {
    p.sta = Math.max(0, p.sta - params.playerChoice.staCost);
  }

  if (params.aiChoice === 'REST') {
    const gained = Math.min(a.maxSta - a.sta, 4);
    a.sta += gained;
    logs.push(`Opponent recovers stamina (+${gained} STA).`);
  } else {
    a.sta = Math.max(0, a.sta - params.aiChoice.staCost);
  }

  // Compute effective speed (Lower SPD = faster; Agility ties)
  const pSpd =
    params.playerChoice === 'REST'
      ? 9
      : params.playerChoice.speed + p.slowPenalty;
  const aSpd =
    params.aiChoice === 'REST'
      ? 9
      : params.aiChoice.speed + a.slowPenalty;

  const pEffectiveAgility = Math.max(1, params.playerStats.speed - p.agilityPenalty);
  const aEffectiveAgility = Math.max(1, params.aiStats.speed - a.agilityPenalty);

  p.slowPenalty = 0;
  a.slowPenalty = 0;
  p.agilityPenalty = 0;
  a.agilityPenalty = 0;

  let firstMover: 'player' | 'ai' | 'simultaneous' = 'simultaneous';
  if (pSpd < aSpd) firstMover = 'player';
  else if (aSpd < pSpd) firstMover = 'ai';
  else if (pEffectiveAgility > aEffectiveAgility) firstMover = 'player';
  else if (aEffectiveAgility > pEffectiveAgility) firstMover = 'ai';

  let playerDamageDealt = 0;
  let aiDamageDealt = 0;
  let playerBlocked = 0;
  let aiBlocked = 0;
  let playerEvaded = false;
  let aiEvaded = false;
  let playerCutApplied = false;
  let aiCutApplied = false;
  let playerHealed = 0;
  let aiHealed = 0;
  let maxTriangleBonusAppliedPct = 0;
  const steps: TurnExchangeStep[] = [];

  const applySupportEffects = (
    actor: CombatantState,
    choice: CombatCard | 'REST',
    isPlayer: boolean
  ) => {
    if (choice === 'REST') return;
    if (choice.specialEffect === 'mani_heal') {
      const heal = Math.max(6, Math.round(actor.maxHp * 0.25));
      const actual = Math.min(actor.maxHp - actor.hp, heal);
      actor.hp += actual;
      actor.maniUsed = true;
      actor.bleedTurns = 0;
      if (isPlayer) playerHealed += actual;
      else aiHealed += actual;
      logs.push(
        `${isPlayer ? 'You invoke' : 'Opponent invokes'} Lethwei Time-Out (Mani)! +${actual} HP & cuts sealed.`
      );
    } else if (choice.specialEffect === 'adrenaline_sta') {
      const staGain = Math.min(actor.maxSta - actor.sta, 4);
      actor.sta += staGain;
      logs.push(
        `${isPlayer ? 'Your' : "Opponent's"} Adrenaline Surge restores +${staGain} STA!`
      );
    } else if (choice.specialEffect === 'stand_up') {
      actor.submissionPct = Math.max(0, actor.submissionPct - 40);
      activePosition = 'Standing';
      logs.push(`${isPlayer ? 'You' : 'Opponent'} hip-escaped back to Standing!`);
    } else if (choice.specialEffect === 'submission_escape') {
      actor.submissionPct = Math.max(0, actor.submissionPct - 55);
      logs.push(`${isPlayer ? 'You' : 'Opponent'} fought hands to reduce submission lock!`);
    }
  };

  applySupportEffects(p, params.playerChoice, true);
  applySupportEffects(a, params.aiChoice, false);

  const executeStrike = (
    attackerSide: 'player' | 'ai',
    attackCard: CombatCard,
    defenderChoice: CombatCard | 'REST'
  ) => {
    const atkState = attackerSide === 'player' ? p : a;
    const defState = attackerSide === 'player' ? a : p;
    const atkStats = attackerSide === 'player' ? params.playerStats : params.aiStats;
    const defStats = attackerSide === 'player' ? params.aiStats : params.playerStats;
    const atkSkills = attackerSide === 'player' ? pSkills : aSkills;
    const defSkills = attackerSide === 'player' ? aSkills : pSkills;
    const atkRadar = attackerSide === 'player' ? pRadar : aRadar;
    const defRadar = attackerSide === 'player' ? aRadar : pRadar;
    const atkGym = attackerSide === 'player' ? params.playerGymId : undefined;
    const defGym = attackerSide === 'ai' ? params.playerGymId : undefined;
    const atkName = attackerSide === 'player' ? 'Your' : "Opponent's";
    const defName = attackerSide === 'player' ? 'Opponent' : 'You';

    if (atkState.hp <= 0) return;

    const atkTriangleRatio = getTriangleDominanceBonus(
      atkRadar,
      defRadar,
      activePosition,
      attackCard.strikeZone
    );
    const atkTrianglePct = Math.round(atkTriangleRatio * 100);
    if (atkTrianglePct > maxTriangleBonusAppliedPct) {
      maxTriangleBonusAppliedPct = atkTrianglePct;
    }

    let rawDamage = calculateEffectivePower(
      attackCard,
      atkStats,
      atkGym,
      atkSkills,
      atkTriangleRatio
    );

    // Agility-based Critical Hit (+25% dmg on Head or high Agility)
    const critChance = Math.min(
      0.32,
      0.04 + atkStats.speed * 0.015 + (attackCard.strikeZone === 'Head' ? 0.06 : 0)
    );
    const isCrit = rng() < critChance;
    if (isCrit) {
      rawDamage = Math.round(rawDamage * 1.25);
    }

    const attackerPose = mapCardToFighterPose(attackCard);
    const defenderSide: 'player' | 'ai' = attackerSide === 'player' ? 'ai' : 'player';

    // Check defensive response
    if (
      defenderChoice !== 'REST' &&
      (defenderChoice.category === 'Defense' ||
        defenderChoice.specialEffect === 'adrenaline_sta' ||
        defenderChoice.specialEffect === 'prevent_ko')
    ) {
      const defTriangleRatio = getTriangleDominanceBonus(
        defRadar,
        atkRadar,
        activePosition,
        defenderChoice.strikeZone
      );
      const defVal = calculateEffectivePower(
        defenderChoice,
        defStats,
        defGym,
        defSkills,
        defTriangleRatio
      );

      // 1. Catch Kick / Shin Check
      if (defenderChoice.specialEffect === 'catch_kick' && isKickCard(attackCard)) {
        const counterDmg = 7 + Math.floor(defStats.strength * 0.45);
        atkState.hp = Math.max(0, atkState.hp - counterDmg);
        defState.totalDamageDealt += counterDmg;
        if (attackerSide === 'player') {
          aiDamageDealt += counterDmg;
          playerBlocked += rawDamage;
        } else {
          playerDamageDealt += counterDmg;
          aiBlocked += rawDamage;
        }
        steps.push({
          actor: attackerSide,
          defender: defenderSide,
          actorPose: atkState.hp <= 0 ? 'ko' : attackerPose,
          defenderPose: 'catchkick',
          damageDealt: 0,
          counterDamage: counterDmg,
          blocked: rawDamage,
          evaded: false,
          cutApplied: false,
          isHeavy: counterDmg >= 11,
          positionAfter: activePosition,
          triangleBonusPct: atkTrianglePct,
        });
        logs.push(`${defName} caught the ${attackCard.name} and swept for ${counterDmg} DMG!`);
        return;
      }

      // 2. Sprawl / Takedown_Def vs Clinch or Takedown
      if (defenderChoice.specialEffect === 'anti_clinch' && isClinchOrTakedownCard(attackCard)) {
        const tdAtk = atkSkills.Takedowns ?? 25;
        const tdDef = Math.max(10, (defSkills.Takedown_Def ?? 25) - defState.agilityPenalty * 4);
        const sprawlBonus = tdDef >= tdAtk ? 2 : 0;
        const counterDmg = 4 + sprawlBonus + Math.floor(defStats.strength * 0.35);
        atkState.hp = Math.max(0, atkState.hp - counterDmg);
        defState.totalDamageDealt += counterDmg;
        activePosition = 'Standing';
        if (attackerSide === 'player') {
          aiDamageDealt += counterDmg;
          playerBlocked += rawDamage;
        } else {
          playerDamageDealt += counterDmg;
          aiBlocked += rawDamage;
        }
        steps.push({
          actor: attackerSide,
          defender: defenderSide,
          actorPose: atkState.hp <= 0 ? 'ko' : attackerPose,
          defenderPose: 'block',
          damageDealt: 0,
          counterDamage: counterDmg,
          blocked: rawDamage,
          evaded: false,
          cutApplied: false,
          isHeavy: false,
          positionAfter: activePosition,
          triangleBonusPct: atkTrianglePct,
        });
        logs.push(
          `${defName} sprawled the ${attackCard.name}, defending position back to Standing (+${counterDmg} counter DMG)!`
        );
        return;
      }

      // 3. Parry & Counter
      if (defenderChoice.specialEffect === 'parry_counter' && isHandOrElbowCard(attackCard)) {
        const counterDmg = 6 + Math.floor(defStats.strength * 0.4);
        const bleedThrough = Math.max(0, rawDamage - defVal);
        defState.hp = Math.max(0, defState.hp - bleedThrough);
        atkState.hp = Math.max(0, atkState.hp - counterDmg);
        defState.totalDamageDealt += counterDmg;
        if (attackerSide === 'player') {
          playerDamageDealt += bleedThrough;
          aiDamageDealt += counterDmg;
          aiBlocked += Math.min(rawDamage, defVal);
        } else {
          aiDamageDealt += bleedThrough;
          playerDamageDealt += counterDmg;
          playerBlocked += Math.min(rawDamage, defVal);
        }
        steps.push({
          actor: attackerSide,
          defender: defenderSide,
          actorPose: atkState.hp <= 0 ? 'ko' : attackerPose,
          defenderPose: defState.hp <= 0 ? 'ko' : 'parry',
          damageDealt: bleedThrough,
          counterDamage: counterDmg,
          blocked: Math.min(rawDamage, defVal),
          evaded: false,
          cutApplied: false,
          isHeavy: counterDmg >= 11,
          positionAfter: activePosition,
          triangleBonusPct: atkTrianglePct,
        });
        logs.push(`${defName} parried ${attackCard.name} and countered for ${counterDmg} DMG!`);
        return;
      }

      // 4. Slip & Evade (Agility-driven)
      if (defenderChoice.specialEffect === 'full_evade') {
        const defAgil = Math.max(1, defStats.speed - defState.agilityPenalty);
        const evadeSuccess =
          attackCard.speed >= defenderChoice.speed + 1 ||
          defAgil > atkStats.speed ||
          rng() < 0.55 + Math.max(0, defAgil - atkStats.speed) * 0.06;
        if (evadeSuccess) {
          if (attackerSide === 'player') aiEvaded = true;
          else playerEvaded = true;
          steps.push({
            actor: attackerSide,
            defender: defenderSide,
            actorPose: attackerPose,
            defenderPose: 'evade',
            damageDealt: 0,
            counterDamage: 0,
            blocked: 0,
            evaded: true,
            cutApplied: false,
            isHeavy: false,
            positionAfter: activePosition,
            triangleBonusPct: atkTrianglePct,
          });
          logs.push(`${defName} slipped clean past ${atkName} ${attackCard.name}! EVADED!`);
          return;
        }
      }

      // 5. Standard Block / Guard / Ground Escape / Groggy Recovery mitigation
      const extraHeadGuard =
        defenderChoice.artType === 'block' && attackCard.strikeZone === 'Head' ? 2 : 0;
      const mitigated = Math.min(rawDamage, defVal + extraHeadGuard);
      const finalDamage = Math.max(1, rawDamage - mitigated);
      const minHpFloor = defenderChoice.specialEffect === 'prevent_ko' ? 1 : 0;
      defState.hp = Math.max(minHpFloor, defState.hp - finalDamage);
      atkState.totalDamageDealt += finalDamage;
      atkState.strikesLanded += 1;

      if (attackerSide === 'player') {
        playerDamageDealt += finalDamage;
        aiBlocked += mitigated;
      } else {
        aiDamageDealt += finalDamage;
        playerBlocked += mitigated;
      }

      // Submission vs Submission_Def partial progress if blocked
      if (attackCard.specialEffect === 'submission_lock') {
        const subOff = atkSkills.Submission ?? 25;
        const subDef = defSkills.Submission_Def ?? 25;
        const defMod =
          defenderChoice.specialEffect === 'submission_escape' ||
          defenderChoice.specialEffect === 'stand_up'
            ? 0.25
            : 0.65;
        const rawGain = 26 + Math.max(0, Math.round((subOff - subDef) * 0.35));
        const subGain = Math.max(8, Math.round(rawGain * defMod));
        defState.submissionPct = Math.min(100, defState.submissionPct + subGain);
        logs.push(`Tight ${attackCard.name} lock (+${subGain}% Sub Lock -> ${defState.submissionPct}%).`);
      }

      steps.push({
        actor: attackerSide,
        defender: defenderSide,
        actorPose: attackerPose,
        defenderPose:
          defState.hp <= 0
            ? 'ko'
            : defenderChoice.artType === 'escape'
            ? 'escape'
            : 'block',
        damageDealt: finalDamage,
        counterDamage: 0,
        blocked: mitigated,
        evaded: false,
        cutApplied: false,
        isHeavy: finalDamage >= 11,
        positionAfter: activePosition,
        triangleBonusPct: atkTrianglePct,
      });
      if (defenderChoice.specialEffect === 'prevent_ko' && defState.hp === 1) {
        logs.push(`${defName} survived on sheer grit (Groggy Recovery prevented knockdown)!`);
      } else {
        logs.push(`${atkName} ${attackCard.name} partially blocked (-${mitigated}), dealing ${finalDamage} DMG.`);
      }
      return;
    }

    // Unblocked strike / transition / submission (vs Attack or Rest)
    const passiveRestMitigation = defenderChoice === 'REST' ? 1 : 0;
    const finalDamage = Math.max(1, rawDamage - passiveRestMitigation);
    defState.hp = Math.max(0, defState.hp - finalDamage);
    atkState.totalDamageDealt += finalDamage;
    atkState.strikesLanded += 1;
    if (attackCard.artType === 'headbutt' || attackCard.artType === 'desperation') {
      atkState.headbuttsLanded += 1;
    }

    if (attackerSide === 'player') playerDamageDealt += finalDamage;
    else aiDamageDealt += finalDamage;

    const critNote = isCrit ? ' CRIT!' : '';
    const triNote = atkTrianglePct > 0 ? ` (+${atkTrianglePct}% Triangle)` : '';
    logs.push(`${atkName} ${attackCard.name} lands clean for ${finalDamage} DMG!${critNote}${triNote}`);

    let stepCutApplied = false;
    if (attackCard.specialEffect === 'bleed_cut' && rng() < 0.65) {
      defState.bleedTurns = Math.max(defState.bleedTurns, 2);
      if (attackerSide === 'player') aiCutApplied = true;
      else playerCutApplied = true;
      stepCutApplied = true;
      logs.push(`CUT! ${defName} is bleeding heavily!`);
    } else if (attackCard.specialEffect === 'drain_sta') {
      defState.sta = Math.max(0, defState.sta - 1);
      logs.push(`Body impact saps 1 STA from ${defName.toLowerCase()}.`);
    } else if (attackCard.specialEffect === 'slow_opponent') {
      defState.slowPenalty += 1;
      defState.agilityPenalty += 1;
      logs.push(`Low kick damages legs (-1 Agility & +1 SPD penalty next turn).`);
    } else if (attackCard.specialEffect === 'reset_distance') {
      activePosition = 'Standing';
      defState.submissionPct = 0;
      logs.push(`Impact resets both fighters cleanly to Standing range.`);
    } else if (attackCard.specialEffect === 'enter_clinch') {
      activePosition = 'Clinch';
      defState.sta = Math.max(0, defState.sta - 1);
      logs.push(`Position shifts to CLINCH (-1 opponent STA)!`);
    } else if (attackCard.specialEffect === 'takedown') {
      const tdAtk = atkSkills.Takedowns ?? 25;
      const tdDef = Math.max(10, (defSkills.Takedown_Def ?? 25) - defState.agilityPenalty * 4);
      const tdChance = Math.min(0.92, Math.max(0.45, 0.72 + (tdAtk - tdDef) * 0.01));
      if (rng() < tdChance) {
        activePosition = 'Ground';
        logs.push(`TAKEDOWN LANDED! Combat moves to GROUND!`);
      } else {
        logs.push(`${defName} stayed upright despite the takedown attempt.`);
      }
    } else if (attackCard.specialEffect === 'submission_lock') {
      activePosition = 'Ground';
      const subOff = atkSkills.Submission ?? 25;
      const subDef = defSkills.Submission_Def ?? 25;
      const baseProgress = attackCard.id === 'rear_naked_choke' ? 45 : 35;
      const bonusProgress = Math.max(-10, Math.round((subOff - subDef) * 0.45));
      const gain = Math.max(20, baseProgress + bonusProgress);
      defState.submissionPct = Math.min(100, defState.submissionPct + gain);
      logs.push(`SUBMISSION LOCK +${gain}% (Total: ${defState.submissionPct}%)!`);
    }

    steps.push({
      actor: attackerSide,
      defender: defenderSide,
      actorPose: attackerPose,
      defenderPose: defState.hp <= 0 ? 'ko' : 'hit',
      damageDealt: finalDamage,
      counterDamage: 0,
      blocked: 0,
      evaded: false,
      cutApplied: stepCutApplied,
      isHeavy: finalDamage >= 11 || isCrit,
      positionAfter: activePosition,
      triangleBonusPct: atkTrianglePct,
    });
  };

  const playerIsStrike =
    params.playerChoice !== 'REST' &&
    (params.playerChoice.category === 'Striking' || params.playerChoice.artType === 'desperation');
  const aiIsStrike =
    params.aiChoice !== 'REST' &&
    (params.aiChoice.category === 'Striking' || params.aiChoice.artType === 'desperation');

  if (firstMover === 'ai') {
    if (aiIsStrike) executeStrike('ai', params.aiChoice as CombatCard, params.playerChoice);
    if (playerIsStrike && p.hp > 0 && p.submissionPct < 100) {
      executeStrike('player', params.playerChoice as CombatCard, params.aiChoice);
    }
  } else {
    if (playerIsStrike) executeStrike('player', params.playerChoice as CombatCard, params.aiChoice);
    if (aiIsStrike && a.hp > 0 && a.submissionPct < 100) {
      executeStrike('ai', params.aiChoice as CombatCard, params.playerChoice);
    }
  }

  // End-of-turn bleed ticks
  if (p.hp > 0 && p.bleedTurns > 0) {
    p.hp = Math.max(0, p.hp - 2);
    p.bleedTurns -= 1;
    logs.push('Your facial cut bleeds (-2 HP).');
  }
  if (a.hp > 0 && a.bleedTurns > 0) {
    a.hp = Math.max(0, a.hp - 2);
    a.bleedTurns -= 1;
    logs.push("Opponent's facial cut bleeds (-2 HP).");
  }

  return {
    nextPlayerState: p,
    nextAiState: a,
    summary: {
      turnNumber: params.turnNumber,
      roundNumber: params.roundNumber,
      playerActionLabel: pActionLabel,
      aiActionLabel: aActionLabel,
      firstMover,
      playerDamageDealt,
      aiDamageDealt,
      playerBlocked,
      aiBlocked,
      playerEvaded,
      aiEvaded,
      playerCutApplied,
      aiCutApplied,
      playerHealed,
      aiHealed,
      positionAfter: activePosition,
      triangleBonusAppliedPct: maxTriangleBonusAppliedPct,
      steps,
      logs,
    },
  };
}

export function evaluateMatchOutcome(
  player: CombatantState,
  ai: CombatantState,
  roundNumber: number,
  turnNumber: number
): { finished: boolean; winner: 'player' | 'ai' | 'draw' | null; method: string } {
  if (ai.submissionPct >= 100) {
    return { finished: true, winner: 'player', method: 'Submission Victory (Tapout)' };
  }
  if (player.submissionPct >= 100) {
    return { finished: true, winner: 'ai', method: 'Submission Defeat (Tapout)' };
  }
  if (ai.hp <= 0 && player.hp <= 0) {
    return { finished: true, winner: 'player', method: 'Double Knockdown (Tiebreak Win)' };
  }
  if (ai.hp <= 0) {
    return { finished: true, winner: 'player', method: 'KO Victory' };
  }
  if (player.hp <= 0) {
    return { finished: true, winner: 'ai', method: 'KO Defeat' };
  }
  if (roundNumber >= MAX_ROUNDS && turnNumber >= TURNS_PER_ROUND) {
    const pRatio = player.hp / player.maxHp;
    const aRatio = ai.hp / ai.maxHp;
    if (pRatio > aRatio || (pRatio === aRatio && player.totalDamageDealt >= ai.totalDamageDealt)) {
      return { finished: true, winner: 'player', method: 'Unanimous Decision' };
    }
    return { finished: true, winner: 'ai', method: 'Judges Decision' };
  }
  return { finished: false, winner: null, method: '' };
}
