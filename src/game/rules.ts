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
  FighterAppearance,
  FighterPose,
  FighterProfile,
  FighterStats,
  Gender,
  GymId,
  Hairstyle,
  MatchMode,
  OpponentProfile,
  TurnExchangeStep,
  TurnResolutionSummary,
} from '../types/game';

export const MAX_ROUNDS = 5;
export const TURNS_PER_ROUND = 8;
export const TURN_TIMER_SECONDS = 15;
export const DECK_SIZE = 10;
export const CREATION_STAT_POINTS = 15;
export const BASE_STAT_VALUE = 3;
export const CRITICAL_HP_THRESHOLD = 0.35;
export const CHAMPIONSHIP_UNLOCK_WINS = 3;

export interface CombatantState {
  hp: number;
  maxHp: number;
  sta: number;
  maxSta: number;
  bleedTurns: number;
  slowPenalty: number;
  maniUsed: boolean;
  totalDamageDealt: number;
  strikesLanded: number;
  headbuttsLanded: number;
}

export function calculateEffectivePower(
  card: CombatCard,
  stats: FighterStats,
  gymId?: GymId
): number {
  if (card.category === 'Defense' || card.specialEffect === 'mani_heal' || card.specialEffect === 'adrenaline_sta') {
    if (card.specialEffect === 'mani_heal') return card.power;
    return card.power + Math.floor(stats.durability * 0.35);
  }
  let bonus = Math.floor(stats.strength * 0.65);
  if (gymId) {
    const gym = GYMS[gymId];
    if (card.artType === 'headbutt' || card.artType === 'elbow' || card.artType === 'desperation') {
      bonus += gym.headbuttElbowBonus;
    }
    if (
      card.artType === 'roundhouse' ||
      card.artType === 'sidekick' ||
      card.artType === 'lowkick' ||
      card.artType === 'knee'
    ) {
      bonus += gym.kickKneeBonus;
    }
  }
  return card.power + bonus;
}

export function calculateMaxHp(stats: FighterStats, gymId: GymId, bonusHp = 0): number {
  const gym = GYMS[gymId];
  return 45 + stats.durability * 5 + gym.bonusMaxHp + bonusHp;
}

export function calculateMaxSta(stats: FighterStats, gymId: GymId, bonusSta = 0): number {
  const gym = GYMS[gymId];
  return 8 + Math.floor(stats.stamina * 1.25) + gym.bonusMaxSta + bonusSta;
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
    return { valid: false, reason: `Deck must contain exactly ${DECK_SIZE} cards (currently ${deckIds.length}).` };
  }
  const counts: Record<string, number> = {};
  for (const id of deckIds) {
    const card = getCardById(id, customCards);
    if (!card) return { valid: false, reason: `Unknown card: ${id}` };
    if (!unlockedCardIds.includes(id)) {
      return { valid: false, reason: `${card.name} is not unlocked yet.` };
    }
    if (card.category === 'Critical') {
      return { valid: false, reason: `Critical cards trigger automatically below 35% HP and do not take deck slots.` };
    }
    counts[id] = (counts[id] || 0) + 1;
    if (counts[id] > 3) {
      return { valid: false, reason: `Maximum 3 copies allowed per card (${card.name}).` };
    }
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
  'Blood & Rope',
  'Crimson Shin',
  'The Shadow Boxer',
  'Hpa-An Hammer',
  'Midnight Blitz',
];
const HAIRSTYLES: Hairstyle[] = ['Buzz', 'Topknot', 'Mohawk', 'Undercut', 'LongTied', 'Shaved'];
const BUILDS: BodyBuild[] = ['Lean', 'Athletic', 'Heavy'];

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

  // Distribute stats around balanced archetypes
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

  const strikingPool = CARD_DATABASE.filter((c) => c.category === 'Striking');
  const defensePool = CARD_DATABASE.filter((c) => c.category === 'Defense');

  const deckIds: string[] = [];
  for (let i = 0; i < 7; i++) {
    deckIds.push(pick(strikingPool).id);
  }
  for (let i = 0; i < 3; i++) {
    deckIds.push(pick(defensePool).id);
  }

  const styleLabels = [
    'Traditional Lethwei Brawler',
    'Muay Thai Clinch Specialist',
    'Dutch Kickboxing Pressure',
    'Counter-Punching Boxer',
    'Karate Blitz Striker',
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
    nickname: mode === 'championship' ? 'Lethwei King' : pick(OPPONENT_NICKNAMES),
    gender,
    age: 20 + Math.floor(rng() * 14),
    birthplace: pick(BIRTHPLACES),
    styleLabel: mode === 'championship' ? 'World Champion · Nine-Limbs Master' : pick(styleLabels),
    appearance,
    stats,
    maxHp,
    maxSta,
    deckIds,
    difficultyTier: mode === 'sparring' ? 1 : mode === 'local' ? 2 : 3,
    isChampion: mode === 'championship',
  };
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

export function chooseAiAction(
  aiHandIds: string[],
  aiState: CombatantState,
  rng: () => number = Math.random
): CombatCard | 'REST' {
  // Check Critical Situation first if AI is below 35% HP
  const crits = getAvailableCriticalCards(aiState);
  const mani = crits.find((c) => c.specialEffect === 'mani_heal');
  if (mani && rng() < 0.75) {
    return mani;
  }

  const playable = aiHandIds
    .map((id) => getCardById(id))
    .filter((c): c is CombatCard => c !== undefined)
    .filter((c) => c.staCost <= aiState.sta);

  if (playable.length === 0) {
    return 'REST';
  }

  // If low on stamina and has adrenaline surge
  const surge = crits.find((c) => c.specialEffect === 'adrenaline_sta');
  if (surge && aiState.sta <= 2 && rng() < 0.65) {
    return surge;
  }

  // Prefer defense occasionally when hurt
  const defenses = playable.filter((c) => c.category === 'Defense');
  const strikes = playable.filter((c) => c.category === 'Striking');

  if (aiState.hp < aiState.maxHp * 0.45 && defenses.length > 0 && rng() < 0.45) {
    return defenses[Math.floor(rng() * defenses.length)];
  }
  if (strikes.length > 0) {
    return strikes[Math.floor(rng() * strikes.length)];
  }
  return playable[Math.floor(rng() * playable.length)];
}

export function chooseAutoTimeoutAction(
  handIds: string[],
  state: CombatantState,
  customCards?: CombatCard[]
): CombatCard | 'REST' {
  const playable = handIds
    .map((id) => getCardById(id, customCards))
    .filter((c): c is CombatCard => c !== undefined)
    .filter((c) => c.staCost <= state.sta);

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
    case 'parry':
      return 'parry';
    case 'catchkick':
      return 'catchkick';
    case 'block':
    case 'sprawl':
    case 'surge':
    case 'mani':
    case 'groggy':
      return 'block';
    default:
      return 'idle';
  }
}

function isKickCard(card: CombatCard): boolean {
  return card.artType === 'roundhouse' || card.artType === 'sidekick' || card.artType === 'lowkick';
}

function isClinchCard(card: CombatCard): boolean {
  return card.strikeZone === 'Clinch' || card.artType === 'knee' || card.artType === 'slam';
}

function isHandOrElbowCard(card: CombatCard): boolean {
  return (
    card.artType === 'jab' ||
    card.artType === 'hook' ||
    card.artType === 'uppercut' ||
    card.artType === 'elbow'
  );
}

export function resolveTurn(params: {
  roundNumber: number;
  turnNumber: number;
  playerChoice: CombatCard | 'REST';
  aiChoice: CombatCard | 'REST';
  playerState: CombatantState;
  aiState: CombatantState;
  playerStats: FighterStats;
  aiStats: FighterStats;
  playerGymId: GymId;
  rng?: () => number;
}): {
  nextPlayerState: CombatantState;
  nextAiState: CombatantState;
  summary: TurnResolutionSummary;
} {
  const rng = params.rng ?? Math.random;
  const p = { ...params.playerState };
  const a = { ...params.aiState };
  const logs: string[] = [];

  const pActionLabel = params.playerChoice === 'REST' ? 'Rest & Recover' : params.playerChoice.name;
  const aActionLabel = params.aiChoice === 'REST' ? 'Rest & Recover' : params.aiChoice.name;

  // Spend stamina or recover on Rest
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

  // Compute effective speed (Lower SPD = faster!)
  const pSpd =
    params.playerChoice === 'REST'
      ? 9
      : params.playerChoice.speed + p.slowPenalty;
  const aSpd =
    params.aiChoice === 'REST'
      ? 9
      : params.aiChoice.speed + a.slowPenalty;

  // Clear slow penalties after applying for this turn
  p.slowPenalty = 0;
  a.slowPenalty = 0;

  let firstMover: 'player' | 'ai' | 'simultaneous' = 'simultaneous';
  if (pSpd < aSpd) firstMover = 'player';
  else if (aSpd < pSpd) firstMover = 'ai';
  else if (params.playerStats.speed > params.aiStats.speed) firstMover = 'player';
  else if (params.aiStats.speed > params.playerStats.speed) firstMover = 'ai';

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
  const steps: TurnExchangeStep[] = [];

  // Handle immediate self-buffs (Mani / Adrenaline) before strike exchange
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
      actor.bleedTurns = 0; // Corner cutman stops bleeding during Mani
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
    const atkGym = attackerSide === 'player' ? params.playerGymId : undefined;
    const defGym = attackerSide === 'ai' ? params.playerGymId : undefined;
    const atkName = attackerSide === 'player' ? 'Your' : "Opponent's";
    const defName = attackerSide === 'player' ? 'Opponent' : 'You';

    if (atkState.hp <= 0) return;

    const rawDamage = calculateEffectivePower(attackCard, atkStats, atkGym);

    const attackerPose = mapCardToFighterPose(attackCard);
    const defenderSide: 'player' | 'ai' = attackerSide === 'player' ? 'ai' : 'player';

    // Check defensive response
    if (
      defenderChoice !== 'REST' &&
      (defenderChoice.category === 'Defense' ||
        defenderChoice.specialEffect === 'adrenaline_sta' ||
        defenderChoice.specialEffect === 'prevent_ko')
    ) {
      const defVal = calculateEffectivePower(defenderChoice, defStats, defGym);

      // 1. Catch Kick
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
        });
        logs.push(`${defName} caught the ${attackCard.name} and swept for ${counterDmg} DMG!`);
        return;
      }

      // 2. Clinch Defense / Sprawl
      if (defenderChoice.specialEffect === 'anti_clinch' && isClinchCard(attackCard)) {
        const counterDmg = 4 + Math.floor(defStats.strength * 0.35);
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
          defenderPose: 'block',
          damageDealt: 0,
          counterDamage: counterDmg,
          blocked: rawDamage,
          evaded: false,
          cutApplied: false,
          isHeavy: false,
        });
        logs.push(`${defName} sprawled the ${attackCard.name}, resetting range for ${counterDmg} counter DMG!`);
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
        });
        logs.push(`${defName} parried ${attackCard.name} and countered for ${counterDmg} DMG!`);
        return;
      }

      // 4. Slip & Evade
      if (defenderChoice.specialEffect === 'full_evade') {
        const evadeSuccess =
          attackCard.speed >= defenderChoice.speed + 1 ||
          defStats.speed >= atkStats.speed ||
          rng() < 0.6;
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
          });
          logs.push(`${defName} slipped clean past ${atkName} ${attackCard.name}! EVADED!`);
          return;
        }
      }

      // 5. Standard Block / Guard / Groggy Recovery mitigation
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
      steps.push({
        actor: attackerSide,
        defender: defenderSide,
        actorPose: attackerPose,
        defenderPose: defState.hp <= 0 ? 'ko' : 'block',
        damageDealt: finalDamage,
        counterDamage: 0,
        blocked: mitigated,
        evaded: false,
        cutApplied: false,
        isHeavy: finalDamage >= 11,
      });
      if (defenderChoice.specialEffect === 'prevent_ko' && defState.hp === 1) {
        logs.push(`${defName} survived on sheer grit (Groggy Recovery prevented knockdown)!`);
      } else {
        logs.push(`${atkName} ${attackCard.name} partially blocked (-${mitigated}), dealing ${finalDamage} DMG.`);
      }
      return;
    }

    // Unblocked strike (vs Attack or Rest)
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

    logs.push(`${atkName} ${attackCard.name} lands clean for ${finalDamage} DMG!`);

    let stepCutApplied = false;
    // Special strike effects on clean hit
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
      logs.push(`Low kick slows ${defName.toLowerCase()} (+1 SPD penalty next turn).`);
    } else if (attackCard.specialEffect === 'reset_distance') {
      logs.push(`Impact resets both fighters cleanly to standing range.`);
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
      isHeavy: finalDamage >= 11,
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
    if (playerIsStrike && p.hp > 0) executeStrike('player', params.playerChoice as CombatCard, params.aiChoice);
  } else {
    if (playerIsStrike) executeStrike('player', params.playerChoice as CombatCard, params.aiChoice);
    if (aiIsStrike && a.hp > 0) executeStrike('ai', params.aiChoice as CombatCard, params.playerChoice);
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
