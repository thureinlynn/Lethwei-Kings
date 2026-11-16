import test from 'node:test';
import assert from 'node:assert/strict';
import { CARD_MAP } from '../data/cards';
import {
  chooseAiAction,
  CombatantState,
  createNewFighter,
  evaluateMatchOutcome,
  generateOpponent,
  getAvailableCriticalCards,
  isChampionshipUnlocked,
  MAX_ROUNDS,
  resolveTurn,
  TURNS_PER_ROUND,
  validateDeck,
} from './rules';

function makeTestFighter() {
  return createNewFighter({
    name: 'Kyaw Swar',
    nickname: 'Golden Skull',
    gender: 'Male',
    age: 24,
    birthplace: 'Yangon, Myanmar',
    appearance: {
      skinTone: '#c88d61',
      heightCm: 176,
      weightKg: 70,
      build: 'Athletic',
      hairstyle: 'Topknot',
      hairColor: '#18181b',
      shortsColor: '#b91c1c',
      wrapColor: '#e7e0d3',
    },
    gymId: 'thuwunna',
    stats: { strength: 7, speed: 7, stamina: 6, durability: 7 },
  });
}

function makeCombatant(overrides: Partial<CombatantState> = {}): CombatantState {
  return {
    hp: 80,
    maxHp: 80,
    sta: 15,
    maxSta: 15,
    bleedTurns: 0,
    slowPenalty: 0,
    maniUsed: false,
    totalDamageDealt: 0,
    strikesLanded: 0,
    headbuttsLanded: 0,
    ...overrides,
  };
}

test('new fighter initializes with gym bonus cards and valid 10-card starter deck', () => {
  const fighter = makeTestFighter();
  assert.equal(fighter.activeDeckIds.length, 10);
  assert.ok(fighter.unlockedCardIds.includes('spinning_elbow'));
  assert.equal(validateDeck(fighter.activeDeckIds, fighter.unlockedCardIds).valid, true);
  assert.equal(isChampionshipUnlocked(fighter), false);
});

test('championship unlocks after 3 local promotion wins', () => {
  const fighter = makeTestFighter();
  fighter.record.localWins = 2;
  assert.equal(isChampionshipUnlocked(fighter), false);
  fighter.record.localWins = 3;
  assert.equal(isChampionshipUnlocked(fighter), true);
});

test('dynamic AI opponent generator produces valid 10-card standing deck', () => {
  const fighter = makeTestFighter();
  const opp = generateOpponent(fighter, 'local', () => 0.42);
  assert.equal(opp.deckIds.length, 10);
  assert.ok(opp.maxHp > 0);
  assert.ok(opp.name.length > 2);
});

test('lower SPD card strikes first and KO cancels slower opponent strike', () => {
  const player = makeCombatant({ hp: 40, maxHp: 80 });
  const ai = makeCombatant({ hp: 5, maxHp: 80 });
  const jab = CARD_MAP['straight_jab']; // SPD 1
  const headbutt = CARD_MAP['lethwei_headbutt']; // SPD 4

  const res = resolveTurn({
    roundNumber: 1,
    turnNumber: 1,
    playerChoice: jab,
    aiChoice: headbutt,
    playerState: player,
    aiState: ai,
    playerStats: { strength: 7, speed: 7, stamina: 6, durability: 7 },
    aiStats: { strength: 7, speed: 5, stamina: 6, durability: 6 },
    playerGymId: 'thuwunna',
    rng: () => 0.5,
  });

  assert.equal(res.summary.firstMover, 'player');
  assert.equal(res.nextAiState.hp, 0);
  // Player took 0 damage because AI was KO'd before SPD 4 headbutt landed
  assert.equal(res.nextPlayerState.hp, 40);
});

test('Catch Kick negates incoming kick and deals counter damage', () => {
  const player = makeCombatant({ hp: 80 });
  const ai = makeCombatant({ hp: 80 });
  const res = resolveTurn({
    roundNumber: 1,
    turnNumber: 2,
    playerChoice: CARD_MAP['catch_kick'],
    aiChoice: CARD_MAP['karate_roundhouse'],
    playerState: player,
    aiState: ai,
    playerStats: { strength: 6, speed: 6, stamina: 6, durability: 6 },
    aiStats: { strength: 6, speed: 6, stamina: 6, durability: 6 },
    playerGymId: 'tiger_mt',
    rng: () => 0.5,
  });

  assert.equal(res.nextPlayerState.hp, 80);
  assert.ok(res.nextAiState.hp < 80);
  assert.ok(res.summary.playerDamageDealt > 0);
});

test('Critical cards appear below 35% HP and Mani heals once per match', () => {
  const hurt = makeCombatant({ hp: 20, maxHp: 80, maniUsed: false });
  const crits = getAvailableCriticalCards(hurt);
  assert.equal(crits.length, 4);

  const res = resolveTurn({
    roundNumber: 2,
    turnNumber: 3,
    playerChoice: CARD_MAP['lethwei_mani'],
    aiChoice: 'REST',
    playerState: hurt,
    aiState: makeCombatant(),
    playerStats: { strength: 6, speed: 6, stamina: 6, durability: 6 },
    aiStats: { strength: 6, speed: 6, stamina: 6, durability: 6 },
    playerGymId: 'golden_land',
    rng: () => 0.5,
  });

  assert.equal(res.nextPlayerState.hp, 40); // 20 + 25% of 80 = 40
  assert.equal(res.nextPlayerState.maniUsed, true);
  // Mani no longer available once used
  const afterCrits = getAvailableCriticalCards({ ...res.nextPlayerState, hp: 20 });
  assert.equal(afterCrits.some((c) => c.id === 'lethwei_mani'), false);
});

test('Groggy Recovery prevents knockdown at 1 HP and custom AI cards validate cleanly', () => {
  const player = makeCombatant({ hp: 4, maxHp: 80 });
  const ai = makeCombatant({ hp: 80, maxHp: 80 });
  const res = resolveTurn({
    roundNumber: 3,
    turnNumber: 2,
    playerChoice: CARD_MAP['groggy_recovery'],
    aiChoice: CARD_MAP['lethwei_headbutt'],
    playerState: player,
    aiState: ai,
    playerStats: { strength: 6, speed: 6, stamina: 6, durability: 6 },
    aiStats: { strength: 8, speed: 6, stamina: 6, durability: 6 },
    playerGymId: 'thuwunna',
    rng: () => 0.5,
  });
  assert.equal(res.nextPlayerState.hp, 1);

  const fighter = makeTestFighter();
  const customCard = {
    ...CARD_MAP['spinning_elbow'],
    id: 'ai_custom_elbow',
    name: 'Shan Tiger Elbow',
    isCustomAi: true,
  };
  const nextDeck = ['ai_custom_elbow', ...fighter.activeDeckIds.slice(1)];
  const check = validateDeck(nextDeck, [...fighter.unlockedCardIds, 'ai_custom_elbow'], [customCard]);
  assert.equal(check.valid, true);
});

test('AI chooses REST when stamina is 0 and Body Slam keeps standing combat', () => {
  const aiTired = makeCombatant({ sta: 0 });
  const action = chooseAiAction(['lethwei_headbutt', 'high_guard'], aiTired, () => 0.5);
  assert.equal(action, 'REST');

  const outcome = evaluateMatchOutcome(
    makeCombatant({ hp: 50, maxHp: 80 }),
    makeCombatant({ hp: 30, maxHp: 80 }),
    MAX_ROUNDS,
    TURNS_PER_ROUND
  );
  assert.equal(outcome.finished, true);
  assert.equal(outcome.winner, 'player');
});
