import {
  CardCategory,
  CombatCard,
  Discipline,
  GymId,
  Language,
  StrikeZone,
} from '../types/game';

interface CardTranslation {
  name: string;
  description: string;
  tags?: string[];
}

export const CARD_TRANSLATIONS_MY: Record<string, CardTranslation> = {
  straight_jab: {
    name: 'တည့်တည့် ဘယ်လက်သီး',
    description: 'မေးရိုးသို့ မြန်ဆန်တိကျစွာ ထိုးသည့် အခြေခံလက်သီး။ အားကုန်သက်သာပြီး အမြန်ဆုံး ဦးစားပေး။',
    tags: ['မြန်', 'လက်'],
  },
  body_hook: {
    name: 'ဝမ်းဗိုက် ဝိုက်လက်သီး',
    description: 'အသည်းနှင့် နံရိုးကို ထိုးနှက်သည့် ဝိုက်လက်သီး။ ထိမှန်ပါက ပြိုင်ဘက် STA ၁ မှတ် လျော့ကျသည်။',
    tags: ['လက်', 'အားလျော့'],
  },
  uppercut: {
    name: 'ပင့်ထိုး လက်သီးပြင်း',
    description: 'အကာအကွယ်ကြားမှ မေးရိုးသို့ အောက်မှ ပင့်ထိုးသည့် အားပြင်းလက်သီး။',
    tags: ['ပြင်း', 'လက်'],
  },
  karate_roundhouse: {
    name: 'ကရာတေး အမြင့်ဝိုက်ကန်ချက်',
    description: 'တင်ပါးမှ အရှိန်ယူ၍ ဦးခေါင်းသို့ ကြာပွတ်လို ဝိုက်ကန်သည့် ကန်ချက်။',
    tags: ['ကန်', 'အမြင့်'],
  },
  karate_side_kick: {
    name: 'တွန်းထုတ် ဘေးကန်ချက်',
    description: 'ရှေ့ခြေဖြင့် ရင်ဘတ်သို့ တွန်းကန်ပြီး မတ်တပ်ရပ် အကွာအဝေးကို ပြန်ညှိပေးသည်။',
    tags: ['ကန်', 'အကွာအဝေး'],
  },
  low_kick: {
    name: 'ပေါင်ခြေသလုံး အောက်ကန်ချက်',
    description: 'ခြေသလုံးနှင့် ပေါင်ကို ပြင်းပြင်းခုတ်ကန်သည်။ နောက်တစ်လှည့် ပြိုင်ဘက် SPD +1 နှေးစေသည်။',
    tags: ['ကန်', 'နှေးစေ'],
  },
  spinning_elbow: {
    name: 'လှည့်ထိုး တံတောင်ချက်',
    description: 'လှည့်၍ ခုတ်ချသည့် တံတောင်ချက်။ မျက်နှာ ကွဲပြဲသွေးထွက် (CUT) ဖြစ်နိုင်ခြေ မြင့်သည်။',
    tags: ['တံတောင်', 'ကွဲပြဲ'],
  },
  clinch_knee: {
    name: 'လည်ဖက် ဒူးတိုက်ချက်',
    description: 'လည်ပင်းချိတ်ဖက်၍ နံရိုးအတွင်းသို့ ပြင်းပြင်းထန်ထန် ဒူးဖြင့် တိုက်သည့် နည်းစနစ်။',
    tags: ['ဒူး', 'လည်ဖက်'],
  },
  lethwei_headbutt: {
    name: 'မြန်မာ့လက်ဝှေ့ ခေါင်းတိုက်ချက်',
    description: 'လက်နက် ၉ ပါး၏ ဘုရင်။ ဦးခေါင်းချင်း ပြင်းပြင်းတိုက်ပြီး ကွဲပြဲဒဏ်ရာ (CUT) ရစေနိုင်သည်။',
    tags: ['အထူး', 'ကွဲပြဲ'],
  },
  body_slam: {
    name: 'မတ်တပ် ကိုယ်လုံးပေါက်ချ',
    description: 'လည်ဖက်အနေအထားမှ ကြမ်းပြင်ပေါ် ပေါက်ချပြီး မတ်တပ်တိုက်ပွဲ အကွာအဝေး ပြန်စသည်။',
    tags: ['လည်ဖက်', 'ပြန်စ'],
  },
  high_guard: {
    name: 'ဦးခေါင်း မြင့်အကာအကွယ်',
    description: 'လက်ဖျံနှစ်ဖက်ဖြင့် ဦးခေါင်းကို တင်းကျပ်စွာ ကာကွယ်ပြီး ထိခိုက်မှု ၉ မှတ်အထိ လျှော့ချသည်။',
    tags: ['ကာကွယ်', 'ဒိုင်း'],
  },
  slip_evade: {
    name: 'ခေါင်းတိမ်း ရှောင်တိမ်း',
    description: 'ဦးခေါင်းလှုပ်ရှားမှုဖြင့် နှေးကွေးသော တိုက်ခိုက်မှုများကို လုံးဝ ရှောင်တိမ်းနိုင်သည်။',
    tags: ['ရှောင်', 'မြန်'],
  },
  clinch_defense: {
    name: 'လည်ဖက်ဖြေ & နောက်ဆုတ်ခံ',
    description: 'ဒူးတိုက်ခြင်းနှင့် ပေါက်ချခြင်းများကို ဖျက်ချပြီး ၄ မှတ် ပြန်တွန်းထိုးသည်။',
    tags: ['လည်ဖက်ကာ', 'တန်ပြန်'],
  },
  catch_kick: {
    name: 'ခြေထောက်ဖမ်း & ရိတ်လှဲ',
    description: 'ဝင်လာသည့် ကန်ချက်မှန်သမျှကို ဖမ်းချုပ်ပြီး ၇ မှတ် တန်ပြန် ရိတ်လှဲတိုက်ခိုက်သည်။',
    tags: ['ကန်ကာ', 'တန်ပြန်'],
  },
  parry_counter: {
    name: 'လက်ပုတ်ကာ & တန်ပြန်ထိုး',
    description: 'လက်သီးနှင့် တံတောင်ချက်များကို လမ်းကြောင်းလွှဲကာ ၆ မှတ် ပြန်လည်ထိုးနှက်သည်။',
    tags: ['လွှဲကာ', 'တန်ပြန်'],
  },
  lethwei_mani: {
    name: 'လက်ဝှေ့ အနားတောင်း (မဏိ)',
    description: 'ရိုးရာ ၂ မိနစ် အနားတောင်း။ တစ်ပွဲလျှင် ၁ ကြိမ် HP 25% ပြန်ဖြည့်ပြီး သွေးတိတ်စေသည်။',
    tags: ['တစ်ပွဲ/၁ကြိမ်', 'HP +25%'],
  },
  desperation_headbutt: {
    name: 'အသက်လု ခေါင်းတိုက်တံတောင်တွဲ',
    description: 'HP ၃၅% အောက်တွင် ပြင်းထန်သော ခေါင်းတိုက်နှင့် တံတောင်တွဲလုံးများဖြင့် တိုက်ခိုက်သည်။',
    tags: ['အရေးပေါ်', 'ပြင်းထန်ကွဲ'],
  },
  adrenaline_surge: {
    name: 'သွေးဆူ အားအင်တိုး',
    description: 'စိတ်ဓာတ်အားဖြင့် ၈ မှတ်အထိ ကာကွယ်ပြီး STA +4 ချက်ချင်း ပြန်လည်ရရှိသည်။',
    tags: ['အရေးပေါ်', '+4 STA'],
  },
  groggy_recovery: {
    name: 'မူးဝေ ပြန်လည်ထူမတ်',
    description: 'အလဲထိုးခံရမည့်အချိန်တွင် ၄ မှတ်ကာကွယ်ပြီး ဤအလှည့်၌ HP 1 အောက်မကျအောင် ထိန်းပေးသည်။',
    tags: ['ပြန်ထ', 'KO ကာ'],
  },
};

export const DISCIPLINE_MY: Record<Discipline, string> = {
  Lethwei: 'မြန်မာ့လက်ဝှေ့',
  'Muay Thai': 'မွေထိုင်း',
  Kickboxing: 'ကစ်ဘောက်ဆင်',
  Boxing: 'လက်သီးထိုး',
  Karate: 'ကရာတေး',
};

export const STRIKE_ZONE_MY: Record<StrikeZone, string> = {
  Head: 'ဦးခေါင်း',
  Body: 'ကိုယ်လုံး',
  Legs: 'ခြေထောက်',
  Clinch: 'လည်ဖက်',
  All: 'အားလုံး',
};

export const CATEGORY_MY: Record<CardCategory, string> = {
  Striking: 'တိုက်ခိုက်ရေး',
  Defense: 'ခုခံကာကွယ်',
  Critical: 'အရေးပေါ်အထူး',
};

export const GYM_MY: Record<GymId, { name: string; location: string; bonusSummary: string }> = {
  thuwunna: {
    name: 'သုဝဏ္ဏ လက်ဝှေ့ကလပ်',
    location: 'ရန်ကုန်၊ မြန်မာ',
    bonusSummary: 'ခေါင်းတိုက် & တံတောင် +2 DMG · လှည့်တံတောင် ကတ် ပါဝင်ပြီး',
  },
  golden_land: {
    name: 'ရွှေပြည် တိုက်ခိုက်ရေးရုံ',
    location: 'ဘားအံ၊ မြန်မာ',
    bonusSummary: '+3 Max STA & +6 Max HP · လက်ပုတ်ကာတန်ပြန် ကတ် ပါဝင်ပြီး',
  },
  tiger_mt: {
    name: 'Tiger မွေထိုင်း & ကစ်ဘောက်ဆင်',
    location: 'ဘန်ကောက် / ဖူးခက်',
    bonusSummary: 'ကန်ချက် & ဒူး +2 DMG · လည်ဖက်ဒူး & ခြေဖမ်း ကတ် ပါဝင်ပြီး',
  },
};

export function localizeCard(card: CombatCard, lang: Language): {
  name: string;
  disciplineLabel: string;
  zoneLabel: string;
  categoryLabel: string;
  description: string;
  tags: string[];
} {
  if (lang === 'my') {
    const tr = CARD_TRANSLATIONS_MY[card.id];
    return {
      name: tr?.name ?? card.name,
      disciplineLabel: DISCIPLINE_MY[card.discipline] ?? card.discipline,
      zoneLabel: STRIKE_ZONE_MY[card.strikeZone] ?? card.strikeZone,
      categoryLabel: CATEGORY_MY[card.category] ?? card.category,
      description: tr?.description ?? card.description,
      tags: tr?.tags ?? card.tags ?? [],
    };
  }
  return {
    name: card.name,
    disciplineLabel: card.discipline,
    zoneLabel: card.strikeZone,
    categoryLabel: card.category,
    description: card.description,
    tags: card.tags ?? [],
  };
}

export const UI_TEXT = {
  en: {
    langToggle: 'မြန်မာ',
    titleBanner: 'MYANMAR LETHWEI · STAND-UP FEDERATION',
    titleDesc:
      'Master bare-knuckle Lethwei, Muay Thai, Boxing, Kickboxing, and Karate in strict standing combat. No ground game—generate AI rivals & custom techniques with Gemini.',
    continueCareer: 'CONTINUE CAREER',
    noSavedCareer: 'No saved career yet',
    resume: 'RESUME',
    newCareer: 'NEW CAREER',
    createFighter: 'Create Fighter',
    howToPlay: 'HOW TO PLAY',
    rulesAndBadges: 'Rules & Badges',
    footerHint: 'Enter / Space Start · Landscape Ring View · Click Cards to Clash',
    footerSave: 'Progress auto-saved locally',
    howToPlayTitle: 'LETHWEI RULES & COMBAT GUIDE',
    staBadgeTitle: 'BLUE BADGE · STA',
    staBadgeDesc: 'Stamina cost to play the card. Click REST / RECOVER STA (+4 STA) when fatigued.',
    dmgBadgeTitle: 'RED BADGE · DMG / DEF',
    dmgBadgeDesc: 'Base damage dealt on Strikes, or damage blocked/evaded on Defense cards.',
    spdBadgeTitle: 'GREEN BADGE · SPD',
    spdBadgeDesc: 'Lower SPD strikes first! A KO strike cancels the slower opponent’s move.',
    standingRuleTitle: 'STRICTLY STANDING COMBAT (NO GROUND GAME)',
    standingRuleDesc:
      'Only standing strikes (fists, kicks, elbows, knees, Lethwei Headbutt), Clinch, and Body Slams (which deal impact damage and reset distance) are permitted.',
    criticalRuleTitle: 'CRITICAL CARDS (<35% HP) & TURN TIMER',
    criticalRuleDesc:
      'Hold rhythm guard while the turn countdown ticks! Below 35% HP, Mani (25% heal once/match), Desperation Combo, Adrenaline Surge, and Groggy Recovery unlock.',
    gotIt: "GOT IT, LET'S FIGHT",

    // Card Badges
    badgeSta: 'STA',
    badgeDmg: 'DMG',
    badgeDef: 'DEF',
    badgeHeal: 'HEAL',
    badgeSpd: 'SPD',

    // Creation
    titleBtn: 'Title',
    fighterRegistration: 'FIGHTER REGISTRATION',
    creationSubtitle: 'Standing Combat Only · Customize manually or scout with Gemini AI',
    aiScoutPlaceholder: 'AI Scout theme (e.g. Kayin State elbow striker)',
    aiScoutBtn: 'AI SCOUT FIGHTER',
    aiScouting: 'SCOUTING...',
    fighterPreview: 'FIGHTER PREVIEW',
    startingMaxHp: 'Starting Max HP',
    startingMaxSta: 'Starting Max STA',
    tabIdentityGym: '1. IDENTITY & GYM',
    tabAppearance: '2. APPEARANCE',
    tabAttributes: '3. ATTRIBUTES',
    leftLabel: 'LEFT',
    fighterNameLabel: 'Fighter Name *',
    nicknameLabel: 'Ring Nickname',
    genderLabel: 'Gender',
    male: 'Male',
    female: 'Female',
    ageLabel: 'Age',
    birthplaceLabel: 'Birthplace',
    startingGymTitle: 'STARTING GYM SELECTION',
    confirmFighterBtn: 'CONFIRM FIGHTER & ENTER GYM',
    starterDeckHint: '10-card starter deck equipped automatically · Fully customizable in Game Plan',

    // Hub
    trainingXp: 'Training XP',
    tabArena: 'FIGHT ARENA',
    tabTraining: 'TRAINING CAMP',
    tabDeck: 'GAME PLAN',
    wins: 'Wins',
    losses: 'Losses',
    kos: 'KOs',
    healthHp: 'HEALTH (HP)',
    staminaSta: 'STAMINA (STA)',
    strength: 'Strength',
    speed: 'Speed',
    stamina: 'Stamina',
    durability: 'Durability',
    gymPerk: 'Gym Perk',
    startSparring: 'START SPARRING',
    enterOfficialBout: 'ENTER OFFICIAL BOUT',
    challengeBelt: 'CHALLENGE FOR BELT',
    locked: 'LOCKED',
    fightAiRival: 'FIGHT AI RIVAL',
    forgeAiCard: 'FORGE AI CARD',
    addToLibrary: 'ADD TO MY LIBRARY',
    activeFightDeck: 'ACTIVE FIGHT DECK',
    unlockedLibrary: 'UNLOCKED TECHNIQUE LIBRARY',
    autoFillBalanced: 'Auto-Fill Balanced',
    remove: 'Remove',
    learnedUnlocked: 'Unlocked',
    learnXp: 'Learn',
    allFilter: 'All',

    // Battle Arena
    turnTimerLabel: 'TURN CLOCK',
    waitingStanceHint: 'Hold rhythm guard & pick a card before timer expires!',
    restBtn: 'REST / RECOVER STA',
    restCost: '+4 STA · 0 COST',
    criticalTitle: 'CRITICAL (<35% HP):',
    yourMove: 'YOUR MOVE',
    opponentMove: 'OPPONENT MOVE',
    turnWord: 'Turn',
    roundWord: 'RND',
    maniReady: 'MANI READY!',
    maniUsed: 'MANI USED',
    pausedTitle: 'BOUT PAUSED',
    resumeFight: 'RESUME FIGHT',
    forfeitBout: 'Return to Gym (Forfeit Bout)',
    victoryTitle: 'VICTORY!',
    defeatTitle: 'DEFEATED',
    newBout: 'NEW BOUT',
    returnToGym: 'RETURN TO GYM',
    damageLabel: 'Damage',
    strikesLabel: 'Strikes',
    xpEarnedLabel: 'XP Earned',
  },
  my: {
    langToggle: 'EN',
    titleBanner: 'မြန်မာ့လက်ဝှေ့ · မတ်တပ်တိုက်ပွဲအဖွဲ့ချုပ်',
    titleDesc:
      'မြန်မာ့ရိုးရာလက်ဝှေ့၊ မွေထိုင်း၊ လက်သီးထိုး၊ ကစ်ဘောက်ဆင်နှင့် ကရာတေးတို့ကို မတ်တပ်တိုက်ပွဲစစ်စစ်ဖြင့် ယှဉ်ပြိုင်ပါ။ ကြမ်းပြင်လုံးထွေးမှု မရှိပါ — Gemini AI ဖြင့် ပြိုင်ဘက်နှင့် ကတ်အသစ်များ ဖန်တီးနိုင်သည်။',
    continueCareer: 'ကစားလက်စ ဆက်မည်',
    noSavedCareer: 'သိမ်းဆည်းထားသော ဖိုက်တာမရှိသေးပါ',
    resume: 'ဆက်ကစား',
    newCareer: 'ကစားသမားအသစ် စတင်မည်',
    createFighter: 'ဖိုက်တာ ဖန်တီးရန်',
    howToPlay: 'ကစားနည်း & စည်းကမ်းများ',
    rulesAndBadges: 'စည်းမျဉ်း & အမှတ်တံဆိပ်များ',
    footerHint: 'Enter / Space ဖြင့် စတင်ပါ · ဘေးတိုက်မြင်ကွင်း · ကတ်နှိပ်၍ ယှဉ်ပြိုင်ပါ',
    footerSave: 'တိုးတက်မှုများကို အလိုအလျောက် သိမ်းဆည်းသည်',
    howToPlayTitle: 'မြန်မာ့လက်ဝှေ့ စည်းမျဉ်းနှင့် ကစားနည်းလမ်းညွှန်',
    staBadgeTitle: 'အပြာရောင် · STA (သက်လုံ)',
    staBadgeDesc: 'ကတ်အသုံးပြုရန် ကုန်ကျမည့် အား။ ပင်ပန်းလျှင် REST / RECOVER STA (+4 STA) ကိုနှိပ်ပါ။',
    dmgBadgeTitle: 'အနီရောင် · DMG / DEF (အင်အား)',
    dmgBadgeDesc: 'တိုက်ခိုက်ကတ်တွင် ထိခိုက်အား (DMG)၊ ခုခံကတ်တွင် ကာကွယ်အား (DEF) ဖြစ်သည်။',
    spdBadgeTitle: 'အစိမ်းရောင် · SPD (အမြန်နှုန်း)',
    spdBadgeDesc: 'SPD နံပါတ်နည်းသူက အရင်တိုက်ခိုက်ခွင့်ရသည်။ KO ထိပါက ပြိုင်ဘက်အလှည့် ပျက်ပြယ်သည်။',
    standingRuleTitle: 'မတ်တပ်တိုက်ပွဲသီးသန့် (မြေပြင်လုံးထွေးမှု မရှိ)',
    standingRuleDesc:
      'လက်သီး၊ ခြေကန်၊ တံတောင်၊ ဒူး၊ လက်ဝှေ့ခေါင်းတိုက်၊ လည်ဖက်နှင့် မတ်တပ်ပေါက်ချခြင်းများသာ ခွင့်ပြုသည်။ ကြမ်းပြင်ချုပ်ကွက် လုံးဝမရှိပါ။',
    criticalRuleTitle: 'အရေးပေါ်ကတ် (<35% HP) & အလှည့်အချိန်မှတ်နာရီ',
    criticalRuleDesc:
      'အချိန်မှတ်နာရီ မကုန်မီ ကတ်ရွေးချယ်ပါ။ HP 35% အောက်ရောက်လျှင် မဏိ (25% HP ပြန်ဖြည့်)၊ အသက်လုခေါင်းတိုက်၊ သွေးဆူအားတိုးနှင့် မူးဝေပြန်ထ ကတ်များ ပွင့်လာမည်။',
    gotIt: 'နားလည်ပြီ · တိုက်ပွဲဝင်မည်',

    // Card Badges
    badgeSta: 'အား',
    badgeDmg: 'ထိ',
    badgeDef: 'ကာ',
    badgeHeal: 'ဖြည့်',
    badgeSpd: 'မြန်',

    // Creation
    titleBtn: 'ပင်မ',
    fighterRegistration: 'ဖိုက်တာ မှတ်ပုံတင်ခြင်း',
    creationSubtitle: 'မတ်တပ်တိုက်ပွဲသီးသန့် · ကိုယ်တိုင်စိတ်ကြိုက်ပြင်ဆင်ပါ သို့မဟုတ် Gemini AI ဖြင့် ရှာဖွေပါ',
    aiScoutPlaceholder: 'AI ဖိုက်တာ ပုံစံ (ဥပမာ - ကရင်ပြည်နယ် တံတောင်သမား)',
    aiScoutBtn: 'AI ဖိုက်တာ ရှာဖွေ',
    aiScouting: 'ရှာဖွေနေသည်...',
    fighterPreview: 'ဖိုက်တာ ပုံကြမ်း',
    startingMaxHp: 'အခြေခံ Max HP',
    startingMaxSta: 'အခြေခံ Max STA',
    tabIdentityGym: '၁။ ကိုယ်ရေး & ကလပ်',
    tabAppearance: '၂။ ရုပ်သွင်ပြင်',
    tabAttributes: '၃။ စွမ်းရည်အမှတ်',
    leftLabel: 'ကျန်',
    fighterNameLabel: 'ဖိုက်တာအမည် *',
    nicknameLabel: 'လက်ဝှေ့အမည်ပြောင်',
    genderLabel: 'ကျား / မ',
    male: 'ကျား',
    female: 'မ',
    ageLabel: 'အသက်',
    birthplaceLabel: 'မွေးရပ်ဇာတိ',
    startingGymTitle: 'ကလပ်ရွေးချယ်ခြင်း',
    confirmFighterBtn: 'အတည်ပြု၍ လေ့ကျင့်ရေးရုံ ဝင်မည်',
    starterDeckHint: 'အခြေခံ ၁၀ ကတ်တွဲ အလိုအလျောက် တပ်ဆင်ပြီး · Game Plan တွင် ပြင်နိုင်သည်',

    // Hub
    trainingXp: 'လေ့ကျင့် XP',
    tabArena: 'တိုက်ပွဲစင်မြင့်',
    tabTraining: 'လေ့ကျင့်ရေးစခန်း',
    tabDeck: 'ကတ်တွဲ စီမံခန်း',
    wins: 'နိုင်ပွဲ',
    losses: 'ရှုံးပွဲ',
    kos: 'အလဲထိုး',
    healthHp: 'သွေးအား (HP)',
    staminaSta: 'သက်လုံ (STA)',
    strength: 'ခွန်အား',
    speed: 'အမြန်နှုန်း',
    stamina: 'သက်လုံ',
    durability: 'ခံနိုင်ရည်',
    gymPerk: 'ကလပ် အထူးစွမ်းရည်',
    startSparring: 'လေ့ကျင့်ပွဲ စတင်',
    enterOfficialBout: 'တရားဝင်ပွဲ ဝင်ပြိုင်',
    challengeBelt: 'ခါးပတ်လုပွဲ ယှဉ်ပြိုင်',
    locked: 'ပိတ်ထားသည်',
    fightAiRival: 'AI ပြိုင်ဘက်နှင့် ထိုးမည်',
    forgeAiCard: 'AI ကတ် ဖန်တီး',
    addToLibrary: 'ကတ်စာရင်းသို့ ထည့်မည်',
    activeFightDeck: 'တိုက်ပွဲသုံး ကတ်တွဲ',
    unlockedLibrary: 'ရရှိထားသော နည်းစနစ်ကတ်များ',
    autoFillBalanced: 'အလိုအလျောက် မျှတဖြည့်',
    remove: 'ဖယ်ရှား',
    learnedUnlocked: 'ရရှိပြီး',
    learnXp: 'သင်ယူ',
    allFilter: 'အားလုံး',

    // Battle Arena
    turnTimerLabel: 'အချိန်မှတ်',
    waitingStanceHint: 'အချိန်မကုန်မီ စည်းချက်အနေအထားမှ ကတ် ၁ ခု ရွေးချယ်ပါ!',
    restBtn: 'အနားယူ / STA ဖြည့်',
    restCost: '+4 STA · 0 ကုန်',
    criticalTitle: 'အရေးပေါ် (<35% HP):',
    yourMove: 'သင်၏ လှုပ်ရှားမှု',
    opponentMove: 'ပြိုင်ဘက် လှုပ်ရှားမှု',
    turnWord: 'အလှည့်',
    roundWord: 'အချီ',
    maniReady: 'မဏိ အသင့်!',
    maniUsed: 'မဏိ သုံးပြီး',
    pausedTitle: 'ပွဲ ခေတ္တရပ်ထားသည်',
    resumeFight: 'ပွဲ ဆက်လက်ယှဉ်ပြိုင်မည်',
    forfeitBout: 'ရုံသို့ ပြန်မည် (အရှုံးပေး)',
    victoryTitle: 'အနိုင်ရရှိပြီ!',
    defeatTitle: 'ရှုံးနိမ့်သည်',
    newBout: 'ပွဲသစ် ထပ်ထိုးမည်',
    returnToGym: 'လေ့ကျင့်ရေးရုံသို့ ပြန်မည်',
    damageLabel: 'ထိခိုက်အား',
    strikesLabel: 'ထိချက်',
    xpEarnedLabel: 'ရရှိ XP',
  },
} as const;
