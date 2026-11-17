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
  | 'Karate'
  | 'Wrestling'
  | 'BJJ'
  | 'MMA';

export type CardCategory = 'Striking' | 'Defense' | 'Critical';

export type CardTier = 'I' | 'II' | 'III';

export type CombatPosition = 'Standing' | 'Clinch' | 'Ground';

export type StrikeZone = 'Head' | 'Body' | 'Legs' | 'Clinch' | 'All';

export type OffenseSkillKey =
  | 'Punches'
  | 'Elbows'
  | 'Knees'
  | 'High_Kicks'
  | 'Low_Kicks'
  | 'Clinchwork'
  | 'Takedowns'
  | 'Ground_Grappling'
  | 'Submission';

export type DefenseSkillKey =
  | 'Strike_Def'
  | 'Knees_Def'
  | 'Kick_Def'
  | 'Takedown_Def'
  | 'Submission_Def';

export type FightSkillKey = OffenseSkillKey | DefenseSkillKey;

export type FightSkills = Record<FightSkillKey, number>;

export interface ZoneRadar {
  Head: number;
  Body: number;
  Legs: number;
}

export interface StanceRadar {
  Standing: ZoneRadar;
  Ground: ZoneRadar;
}

export type CardArtType =
  | 'jab'
  | 'cross'
  | 'hook'
  | 'uppercut'
  | 'superman'
  | 'roundhouse'
  | 'sidekick'
  | 'teep'
  | 'lowkick'
  | 'axekick'
  | 'elbow'
  | 'upwardelbow'
  | 'knee'
  | 'headbutt'
  | 'slam'
  | 'takedown'
  | 'groundpound'
  | 'submission'
  | 'escape'
  | 'block'
  | 'evade'
  | 'sprawl'
  | 'catchkick'
  | 'parry'
  | 'shincheck'
  | 'shoulderroll'
  | 'longguard'
  | 'mani'
  | 'desperation'
  | 'surge'
  | 'groggy';

export type TurnRole = 'player_attack' | 'ai_attack';

export type CameraAngle = 'auto' | 'side' | 'corner' | 'high' | 'cover';

export interface CombatCard {
  id: string;
  name: string;
  discipline: Discipline;
  category: CardCategory;
  tier?: CardTier;
  position?: CombatPosition | 'Any';
  targetPosition?: CombatPosition;
  skillKey?: FightSkillKey;
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
    | 'prevent_ko'
    | 'takedown'
    | 'enter_clinch'
    | 'stand_up'
    | 'submission_lock'
    | 'submission_escape';
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
  strength: number;   // Strength: flat physical damage on strikes & slams
  speed: number;      // Agility: evasion chance, crit chance, initiative ties
  stamina: number;    // Condition: max stamina pool & per-round stamina recovery
  durability: number; // Health: max HP & base block absorption
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
  skills?: FightSkills;
  currentHp: number;
  maxHp: number;
  currentSta: number;
  maxSta: number;
  trainingXp: number;
  trainingDays: number;
  unlockedCardIds: string[];
  activeDeckIds: string[]; // Exactly 40 cards when ready
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
  skills?: FightSkills;
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
  | 'takedown'
  | 'groundpound'
  | 'submission'
  | 'escape'
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
  positionAfter?: CombatPosition;
  triangleBonusPct?: number;
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
  positionAfter: CombatPosition;
  triangleBonusAppliedPct: number;
  steps: TurnExchangeStep[];
  logs: string[];
}

export type GameScreen = 'title' | 'creation' | 'hub' | 'battle';
