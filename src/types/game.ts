export type Gender = 'Male' | 'Female';

export type BodyBuild = 'Lean' | 'Athletic' | 'Heavy';

export type Hairstyle =
  | 'Buzz'
  | 'Topknot'
  | 'Mohawk'
  | 'Undercut'
  | 'LongTied'
  | 'Shaved';

export type Discipline =
  | 'Lethwei'
  | 'Muay Thai'
  | 'Kickboxing'
  | 'Boxing'
  | 'Karate';

export type CardCategory = 'Striking' | 'Defense' | 'Critical';

export type StrikeZone = 'Head' | 'Body' | 'Legs' | 'Clinch' | 'All';

export type CardArtType =
  | 'jab'
  | 'hook'
  | 'uppercut'
  | 'roundhouse'
  | 'sidekick'
  | 'lowkick'
  | 'elbow'
  | 'knee'
  | 'headbutt'
  | 'slam'
  | 'block'
  | 'evade'
  | 'sprawl'
  | 'catchkick'
  | 'parry'
  | 'mani'
  | 'desperation'
  | 'surge'
  | 'groggy';

export interface CombatCard {
  id: string;
  name: string;
  discipline: Discipline;
  category: CardCategory;
  staCost: number;
  power: number; // DMG for Striking, DEF for Defense, heal/effect magnitude for Critical
  speed: number; // Lower = strikes first! (1 = fastest, 5 = heaviest/slowest)
  strikeZone: StrikeZone;
  artType: CardArtType;
  description: string;
  unlockCostXp: number;
  tags?: string[];
  isCustomAi?: boolean;
  specialEffect?:
    | 'bleed_cut'
    | 'drain_sta'
    | 'reset_distance'
    | 'slow_opponent'
    | 'full_evade'
    | 'anti_clinch'
    | 'catch_kick'
    | 'parry_counter'
    | 'mani_heal'
    | 'adrenaline_sta'
    | 'prevent_ko';
}

export interface FighterAppearance {
  skinTone: string;
  heightCm: number;
  weightKg: number;
  build: BodyBuild;
  hairstyle: Hairstyle;
  hairColor: string;
  shortsColor: string;
  wrapColor: string;
}

export interface FighterStats {
  strength: number;   // Boosts Striking DMG
  speed: number;      // Ties / priority & evade edge
  stamina: number;    // Boosts Max STA
  durability: number; // Boosts Max HP
}

export type GymId = 'thuwunna' | 'golden_land' | 'tiger_mt';

export interface GymInfo {
  id: GymId;
  name: string;
  location: string;
  specialty: string;
  bonusSummary: string;
  headbuttElbowBonus: number;
  kickKneeBonus: number;
  bonusMaxSta: number;
  bonusMaxHp: number;
  starterCards: string[];
}

export interface FighterRecord {
  wins: number;
  losses: number;
  kos: number;
  sparringWins: number;
  localWins: number;
  championshipWins: number;
}

export interface FighterProfile {
  id: string;
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
  currentHp: number;
  maxHp: number;
  currentSta: number;
  maxSta: number;
  trainingXp: number;
  trainingDays: number;
  unlockedCardIds: string[];
  activeDeckIds: string[]; // Exactly 10 cards when ready
  customCards?: CombatCard[];
  record: FighterRecord;
}

export type MatchMode = 'sparring' | 'local' | 'championship';

export interface OpponentProfile {
  id: string;
  name: string;
  nickname: string;
  gender: Gender;
  age: number;
  birthplace: string;
  styleLabel: string;
  background?: string;
  appearance: FighterAppearance;
  stats: FighterStats;
  maxHp: number;
  maxSta: number;
  deckIds: string[];
  difficultyTier: number;
  isChampion?: boolean;
  isAiGenerated?: boolean;
}

export type Language = 'en' | 'my';

export type FighterPose =
  | 'idle'
  | 'jab'
  | 'hook'
  | 'kick'
  | 'elbow'
  | 'knee'
  | 'headbutt'
  | 'slam'
  | 'block'
  | 'evade'
  | 'parry'
  | 'catchkick'
  | 'hit'
  | 'ko'
  | 'victory';

export interface FloatingPopup {
  id: string;
  target: 'player' | 'opponent';
  text: string;
  tone: 'damage' | 'heavy' | 'block' | 'evade' | 'cut' | 'heal' | 'counter';
}

export interface TurnExchangeStep {
  actor: 'player' | 'ai';
  defender: 'player' | 'ai';
  actorPose: FighterPose;
  defenderPose: FighterPose;
  damageDealt: number;
  counterDamage: number;
  blocked: number;
  evaded: boolean;
  cutApplied: boolean;
  isHeavy: boolean;
}

export interface TurnResolutionSummary {
  turnNumber: number;
  roundNumber: number;
  playerActionLabel: string;
  aiActionLabel: string;
  firstMover: 'player' | 'ai' | 'simultaneous';
  playerDamageDealt: number;
  aiDamageDealt: number;
  playerBlocked: number;
  aiBlocked: number;
  playerEvaded: boolean;
  aiEvaded: boolean;
  playerCutApplied: boolean;
  aiCutApplied: boolean;
  playerHealed: number;
  aiHealed: number;
  steps: TurnExchangeStep[];
  logs: string[];
}

export type GameScreen = 'title' | 'creation' | 'hub' | 'battle';
