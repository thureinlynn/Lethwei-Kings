import test from 'node:test';
import assert from 'node:assert/strict';
import { CARD_MAP } from '../data/cards';
import {
  applyRoundRecovery,
  calculateEffectivePower,
  chooseAiAction,
  chooseAutoTimeoutAction,
  CombatantState,
  computeStanceRadar,
  createInitialSkills,
  createNewFighter,
  DECK_SIZE,
  drawBattleHandForRole,
  evaluateMatchOutcome,
  generateOpponent,
  getAvailableCriticalCards,
  getTotalSkillPoints,
  getTriangleDominanceBonus,
  getTurnRole,
  isChampionshipUnlocked,
  MAX_ROUNDS,
  MAX_SKILL_CAP,
  MIN_DEFENSE_CARDS,
  MIN_STRIKE_CARDS,
  resolveTurn,
  TURNS_PER_ROUND,
  upgradeFighterSkill,
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
    agilityPenalty: 0,
    submissionPct: 0,
    maniUsed: false,
    totalDamageDealt: 0,
    strikesLanded: 0,
    headbuttsLanded: 0,
    ...overrides,
  };
}

test('new fighter initializes with gym bonus cards, 14 fight skills, and valid 40-card starter deck', () => {
  const fighter = makeTestFighter();
  assert.equal(fighter.activeDeckIds.length, DECK_SIZE);
  assert.equal(DECK_SIZE, 40);
  assert.equal(MIN_STRIKE_CARDS, 16);
  assert.equal(MIN_DEFENSE_CARDS, 16);
  assert.ok(fighter.unlockedCardIds.includes('spinning_elbow'));
  assert.ok(fighter.skills);
  assert.ok(getTotalSkillPoints(fighter.skills) > 0);
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

test('dynamic AI opponent generator produces valid 40-card deck and fight skills', () => {
  const fighter = makeTestFighter();
  const opp = generateOpponent(fighter, 'local', () => 0.42);
  assert.equal(opp.deckIds.length, DECK_SIZE);
  assert.ok(opp.skills);
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
  assert.equal(res.summary.steps.length, 1);
  assert.equal(res.summary.steps[0].actorPose, 'jab');
  assert.equal(res.summary.steps[0].defenderPose, 'ko');
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
  assert.equal(res.summary.steps[0].defenderPose, 'catchkick');
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

test('Timeout auto-pick selects fastest affordable card and sequential steps record both strikes', () => {
  const fresh = makeCombatant({ sta: 5 });
  const autoPick = chooseAutoTimeoutAction(['lethwei_headbutt', 'straight_jab', 'low_kick'], fresh);
  assert.notEqual(autoPick, 'REST');
  if (autoPick !== 'REST') {
    assert.equal(autoPick.id, 'straight_jab');
  }

  const res = resolveTurn({
    roundNumber: 1,
    turnNumber: 1,
    playerChoice: CARD_MAP['spinning_elbow'], // SPD 4
    aiChoice: CARD_MAP['low_kick'], // SPD 2
    playerState: makeCombatant({ hp: 80 }),
    aiState: makeCombatant({ hp: 80 }),
    playerStats: { strength: 7, speed: 7, stamina: 6, durability: 7 },
    aiStats: { strength: 6, speed: 6, stamina: 6, durability: 6 },
    playerGymId: 'thuwunna',
    rng: () => 0.5,
  });

  assert.equal(res.summary.firstMover, 'ai');
  assert.equal(res.summary.steps.length, 2);
  assert.equal(res.summary.steps[0].actor, 'ai');
  assert.equal(res.summary.steps[0].actorPose, 'kick');
  assert.equal(res.summary.steps[0].defenderPose, 'hit');
  assert.equal(res.summary.steps[1].actor, 'player');
  assert.equal(res.summary.steps[1].actorPose, 'elbow');
});

test('alternating turn role switches cleanly between Attack and Defense hands for Red & Blue', () => {
  const fighter = makeTestFighter();
  assert.equal(getTurnRole(1, 1), 'player_attack');
  assert.equal(getTurnRole(1, 2), 'ai_attack');
  assert.equal(getTurnRole(2, 3), 'player_attack');

  const pAtkHand = drawBattleHandForRole(fighter.activeDeckIds, 'player_attack', 'player', 5);
  assert.equal(pAtkHand.length, 5);
  assert.ok(pAtkHand.every((id) => CARD_MAP[id].category === 'Striking'));

  const pDefHand = drawBattleHandForRole(fighter.activeDeckIds, 'ai_attack', 'player', 5);
  assert.equal(pDefHand.length, 5);
  assert.ok(pDefHand.every((id) => CARD_MAP[id].category === 'Defense'));

  const aiDefChoice = chooseAiAction(
    ['straight_jab', 'high_guard', 'slip_evade'],
    makeCombatant({ sta: 10 }),
    () => 0.5,
    'player_attack'
  );
  assert.notEqual(aiDefChoice, 'REST');
  if (aiDefChoice !== 'REST') {
    assert.equal(aiDefChoice.category, 'Defense');
  }

  const aiAtkChoice = chooseAiAction(
    ['straight_jab', 'high_guard', 'slip_evade'],
    makeCombatant({ sta: 10 }),
    () => 0.5,
    'ai_attack'
  );
  assert.notEqual(aiAtkChoice, 'REST');
  if (aiAtkChoice !== 'REST') {
    assert.equal(aiAtkChoice.category, 'Striking');
  }
});

test('Stance Radar Triangle dominance grants +15% to +30% bonus and scales effective power', () => {
  const headHeavyDeck = Array.from({ length: 40 }, (_, i) =>
    i < 20 ? 'cross_counter_ii' : 'high_guard_ii'
  );
  const legHeavyDeck = Array.from({ length: 40 }, (_, i) =>
    i < 20 ? 'low_kick' : 'check_leg_kick'
  );

  const headRadar = computeStanceRadar(headHeavyDeck);
  const legRadar = computeStanceRadar(legHeavyDeck);

  assert.ok(headRadar.Standing.Head > legRadar.Standing.Head);
  const bonus = getTriangleDominanceBonus(headRadar, legRadar, 'Standing', 'Head');
  assert.ok(bonus >= 0.15 && bonus <= 0.3);

  const skills = createInitialSkills('thuwunna', 40);
  const basePower = calculateEffectivePower(
    CARD_MAP['cross_counter_ii'],
    { strength: 7, speed: 7, stamina: 6, durability: 7 },
    'thuwunna',
    skills,
    0
  );
  const boostedPower = calculateEffectivePower(
    CARD_MAP['cross_counter_ii'],
    { strength: 7, speed: 7, stamina: 6, durability: 7 },
    'thuwunna',
    skills,
    bonus
  );
  assert.ok(boostedPower > basePower);
});

test('Fight Skills upgrade via XP and respect 19,000 Fighter Skill Cap', () => {
  const fighter = makeTestFighter();
  fighter.trainingXp = 100;
  const ok = upgradeFighterSkill(fighter, 'Takedowns', 20, 5);
  assert.equal(ok.upgraded, true);
  assert.equal(ok.fighter.trainingXp, 80);
  assert.equal(
    ok.fighter.skills!.Takedowns,
    fighter.skills!.Takedowns + 5
  );

  // Near cap
  const capped = {
    ...fighter,
    skills: {
      ...fighter.skills!,
      Punches: MAX_SKILL_CAP - getTotalSkillPoints(fighter.skills) + fighter.skills!.Punches,
    },
  };
  const blocked = upgradeFighterSkill(capped, 'Elbows', 20, 5);
  assert.equal(blocked.upgraded, false);
});

test('Positional combat handles Takedown -> Ground -> Rear Naked Choke Tapout and Hip Escape', () => {
  const tdRes = resolveTurn({
    roundNumber: 1,
    turnNumber: 1,
    position: 'Standing',
    playerChoice: CARD_MAP['double_leg_takedown'],
    aiChoice: 'REST',
    playerState: makeCombatant({ hp: 80 }),
    aiState: makeCombatant({ hp: 80 }),
    playerStats: { strength: 7, speed: 7, stamina: 6, durability: 7 },
    aiStats: { strength: 6, speed: 6, stamina: 6, durability: 6 },
    playerGymId: 'thuwunna',
    rng: () => 0.1,
  });
  assert.equal(tdRes.summary.positionAfter, 'Ground');

  // Repeated Rear Naked Choke hits 100% submission lock -> Tapout
  const rnc1 = resolveTurn({
    roundNumber: 1,
    turnNumber: 3,
    position: 'Ground',
    playerChoice: CARD_MAP['rear_naked_choke'],
    aiChoice: 'REST',
    playerState: tdRes.nextPlayerState,
    aiState: makeCombatant({ hp: 80, submissionPct: 65 }),
    playerStats: { strength: 7, speed: 7, stamina: 6, durability: 7 },
    aiStats: { strength: 6, speed: 6, stamina: 6, durability: 6 },
    playerGymId: 'thuwunna',
    rng: () => 0.5,
  });
  assert.equal(rnc1.nextAiState.submissionPct, 100);
  const subOutcome = evaluateMatchOutcome(rnc1.nextPlayerState, rnc1.nextAiState, 1, 3);
  assert.equal(subOutcome.finished, true);
  assert.equal(subOutcome.winner, 'player');
  assert.equal(subOutcome.method, 'Submission Victory (Tapout)');

  // Hip Escape returns Ground -> Standing and drops submission progress
  const escRes = resolveTurn({
    roundNumber: 1,
    turnNumber: 4,
    position: 'Ground',
    playerChoice: CARD_MAP['hip_escape_stand'],
    aiChoice: 'REST',
    playerState: makeCombatant({ hp: 70, submissionPct: 50 }),
    aiState: makeCombatant({ hp: 70 }),
    playerStats: { strength: 7, speed: 7, stamina: 6, durability: 7 },
    aiStats: { strength: 6, speed: 6, stamina: 6, durability: 6 },
    playerGymId: 'thuwunna',
    rng: () => 0.5,
  });
  assert.equal(escRes.summary.positionAfter, 'Standing');
  assert.equal(escRes.nextPlayerState.submissionPct, 10);
});

test('Condition drives between-round stamina recovery and Low Kick penalizes Agility', () => {
  const lowCondition = applyRoundRecovery(makeCombatant({ sta: 2, maxSta: 20 }), {
    strength: 6,
    speed: 6,
    stamina: 3,
    durability: 6,
  });
  const highCondition = applyRoundRecovery(makeCombatant({ sta: 2, maxSta: 20 }), {
    strength: 6,
    speed: 6,
    stamina: 12,
    durability: 6,
  });
  assert.ok(highCondition.sta > lowCondition.sta);

  const lkRes = resolveTurn({
    roundNumber: 1,
    turnNumber: 1,
    position: 'Standing',
    playerChoice: CARD_MAP['low_kick'],
    aiChoice: 'REST',
    playerState: makeCombatant(),
    aiState: makeCombatant(),
    playerStats: { strength: 6, speed: 6, stamina: 6, durability: 6 },
    aiStats: { strength: 6, speed: 6, stamina: 6, durability: 6 },
    playerGymId: 'tiger_mt',
    rng: () => 0.5,
  });
  assert.equal(lkRes.nextAiState.agilityPenalty, 1);
  assert.equal(lkRes.nextAiState.slowPenalty, 1);
});
