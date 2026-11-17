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
  cross_straight: {
    name: 'ညာလက်သီး တည့်တည့်ထိုး',
    description: 'နောက်လက်ဖြင့် မျက်နှာတည့်တည့်သို့ ပြင်းထန်မြန်ဆန်စွာ ထိုးသည့် လက်သီးချက်။',
    tags: ['လက်', 'မြန်'],
  },
  superman_punch: {
    name: 'ခုန်ထိုး စူပါမန်းလက်သီး',
    description: 'ကန်ဟန်ပြု၍ လေထဲခုန်ကာ အကာအကွယ်ပေါ်မှ ထိုးချသည့် အားပြင်းလက်သီး။',
    tags: ['ခုန်ထိုး', 'ပြင်း'],
  },
  teep_push_kick: {
    name: 'တည့်တွန်း တိပ်ကန်ချက်',
    description: 'ရှေ့ခြေဖြင့် ရင်ညွန့်သို့ မြန်မြန်တွန်းကန်ပြီး မတ်တပ်အကွာအဝေး ပြန်ချဲ့သည်။',
    tags: ['ကန်', 'အကွာအဝေး'],
  },
  upward_elbow: {
    name: 'အောက်မှ ပင့်ခုတ်တံတောင်',
    description: 'မျက်ခုံးနှင့် မေးရိုးကို အောက်မှ ပင့်တင်ခုတ်သည့် လက်ဝှေ့တံတောင်။ ကွဲပြဲစေနိုင်သည်။',
    tags: ['တံတောင်', 'ကွဲပြဲ'],
  },
  axe_kick: {
    name: 'ပုဆိန်ခုတ် ခြေဖနောင့်ကန်',
    description: 'ခြေထောက်ကို အမြင့်မြှောက်၍ ပုခုံးနှင့် ခေါင်းပေါ်သို့ ခုတ်ချသည့် ကန်ချက်ပြင်း။',
    tags: ['ကန်', 'ပြင်း'],
  },
  double_knee_clinch: {
    name: 'လည်ဖက် နှစ်ချက်တွဲဒူး',
    description: 'လည်ပင်းချိတ်ဖက်၍ နံရိုးသို့ ဆက်တိုက် ဒူးနှစ်ချက်တိုက်ကာ STA ၁ မှတ် လျော့စေသည်။',
    tags: ['လည်ဖက်', 'အားလျော့'],
  },
  check_leg_kick: {
    name: 'ညို့သကျည်းကာ & တန်ပြန်',
    description: 'ရှေ့ခြေသလုံးမြှောက်၍ ကန်ချက်ကို ကျောက်တိုင်လို ခံကာကွယ်ပြီး ပြန်လည်ရိတ်လှဲသည်။',
    tags: ['ခြေကာ', 'တန်ပြန်'],
  },
  shoulder_roll: {
    name: 'ပုခုံးလှည့် ကာ & ပြန်ထိုး',
    description: 'ရှေ့ပုခုံးဖြင့် လက်သီးကို လမ်းကြောင်းလွှဲပြီး ၆ မှတ် ပြန်လည်ထိုးနှက်သည်။',
    tags: ['ပုခုံးကာ', 'တန်ပြန်'],
  },
  long_guard: {
    name: 'လက်ဆန့် လက်ဝှေ့တားကာ',
    description: 'ရှေ့လက်ဖျံကို ဆန့်တန်းတားဆီး၍ တံတောင်နှင့် လည်ဖက်ဝင်မှုကို ဖျက်ချသည်။',
    tags: ['လက်တား', 'လည်ဖက်ကာ'],
  },
  footwork_step_back: {
    name: 'ခြေလှမ်းဘေးရှောင်',
    description: 'တိုက်ကွက်အပြင်သို့ ခြေလှမ်းမြန်မြန်ရွှေ့၍ ပြင်းထန်သော တိုက်ခိုက်မှုကို ရှောင်တိမ်းသည်။',
    tags: ['ခြေလှမ်း', 'ရှောင်'],
  },
  roundhouse_combo: {
    name: 'ဝိုက်ကန်ချက် အတွဲ II',
    description: 'Tier II ဝိုက်ကန်ချက်တွဲ — တိုက်ခိုက်အား +14% နှင့် အမြင့်ကန် ကျွမ်းကျင်မှုမှ အင်အားရယူသည်။',
    tags: ['Tier II', 'ကန်တွဲ'],
  },
  cross_counter_ii: {
    name: 'ညာတည့်တန်ပြန် ထိုးချက် II',
    description: 'Tier II မျက်နှာတည့်တည့် တန်ပြန်ညာလက်သီး — မြန်ဆန်တိကျပြီး အားပြင်းသည်။',
    tags: ['Tier II', 'လက်သီး'],
  },
  eagle_jump: {
    name: 'သိမ်းငှက် ခုန်တိုက်ချက်',
    description: 'Tier III ဝေဟင်မှ ခုန်ဝင်တိုက်သည့် ခေါင်းတိုက်/တံတောင်တွဲ — ခေါင်းကွဲပြဲနိုင်ခြေ မြင့်သည်။',
    tags: ['Tier III', 'ခုန်တိုက်'],
  },
  collar_tie_clinch: {
    name: 'လည်ပင်းချုပ် လည်ဖက်ဝင်',
    description: 'လည်ပင်းကို ချိတ်ဆွဲ၍ Clinch အနေအထားသို့ ကူးပြောင်းပြီး ပြိုင်ဘက် STA ၁ မှတ် လျော့စေသည်။',
    tags: ['Clinch', 'ကူးပြောင်း'],
  },
  double_leg_takedown: {
    name: 'ခြေနှစ်ဖက်ပွေ့ လှဲချ',
    description: 'တင်ပါးအောက်မှ ဝင်ပွေ့၍ မြေပြင် (Ground) အနေအထားသို့ ဆွဲချသည့် နပန်းနည်းစနစ်။',
    tags: ['နပန်း', 'Ground'],
  },
  single_leg_trip: {
    name: 'ခြေတစ်ဖက်ချိတ် ရိတ်လှဲ',
    description: 'Standing သို့မဟုတ် Clinch မှ ရှေ့ခြေကျင်းဝတ်ကို ချိတ်၍ ကြမ်းပြင်ပေါ်သို့ လှဲချသည်။',
    tags: ['နပန်း', 'ရိတ်လှဲ'],
  },
  ground_and_pound: {
    name: 'မြေပြင် အပေါ်စီး ထိုးနှက်',
    description: 'Ground ထိန်းချုပ်မှုမှနေ၍ လက်သီးများ ဆက်တိုက်မိုးရွာသလို ထိုးနှက်သည်။',
    tags: ['Ground', 'ပြင်းထန်'],
  },
  guard_pass_elbow: {
    name: 'ဂတ်ကျော် မြေပြင်တံတောင်',
    description: 'မြေပြင်အကာအကွယ်ကို ကျော်ဖြတ်၍ နံရိုးနှင့် မျက်နှာသို့ တံတောင်ခုတ်ချ (CUT) သည်။',
    tags: ['Ground', 'ကွဲပြဲ'],
  },
  rear_naked_choke: {
    name: 'နောက်ကျော လည်ပင်းချုပ်',
    description: 'Tier III နောက်ကျောချုပ်ကွက် (+45% Submission Lock တိုးပြီး 100% ပြည့်လျှင် Tapout နိုင်မည်)။',
    tags: ['BJJ', 'ချုပ်ကွက်'],
  },
  armbar_lock: {
    name: 'လက်မောင်းချိုး ချုပ်ကွက်',
    description: 'တံတောင်ဆစ်ကို ဆွဲချုပ်၍ +35% Submission Lock တိုးစေပြီး ပြိုင်ဘက် STA လျော့စေသည်။',
    tags: ['BJJ', 'ချုပ်ကွက်'],
  },
  high_guard_ii: {
    name: 'သံမဏိ မြင့်အကာအကွယ် II',
    description: 'Tier II ခိုင်မာသော လက်ဖျံအကာ — ခေါင်းထိုးချက်နှင့် မြေပြင်ထိုးနှက်မှုများကို ခံကာကွယ်သည်။',
    tags: ['Tier II', 'ကာကွယ်'],
  },
  sprawl_and_brawl: {
    name: 'အပြင်း နောက်ပစ်ခံ & ပြန်ထိုး',
    description: 'Tier II လှဲချမှုကာကွယ်ကတ် — Double Leg ကို ဖျက်ချပြီး Standing သို့ ပြန်ပို့ (+6 DMG) သည်။',
    tags: ['Tier II', 'Sprawl'],
  },
  hip_escape_stand: {
    name: 'တင်ပါးရွှေ့ ရုန်းထွက်မတ်တပ်',
    description: 'မြေပြင်မှ ရုန်းထွက်၍ Submission Lock -40% လျှော့ချကာ Standing အနေအထားသို့ ပြန်ရောက်သည်။',
    tags: ['BJJ', 'ရုန်းထွက်'],
  },
  submission_defense_scramble: {
    name: 'ချုပ်ကွက်ဖြေ & ခုခံလှုပ်ရှား',
    description: 'မေးစေ့ကပ်၍ လက်ချုပ်ဖြေကာ Submission Lock -55% လျှော့ချပြီး မြေပြင်ထိခိုက်မှု ခံကာကွယ်သည်။',
    tags: ['BJJ', 'ချုပ်ဖြေ'],
  },
};

export const DISCIPLINE_MY: Record<Discipline, string> = {
  Lethwei: 'မြန်မာ့လက်ဝှေ့',
  'Muay Thai': 'မွေထိုင်း',
  Kickboxing: 'ကစ်ဘောက်ဆင်',
  Boxing: 'လက်သီးထိုး',
  Karate: 'ကရာတေး',
  Wrestling: 'နပန်း',
  BJJ: 'ဘရာဇီးဂျူဂျစ်ဆု (BJJ)',
  MMA: 'ဘက်စုံ MMA',
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
    titleBanner: 'LETHWEI KINGS · TACTICAL MMA & STRIKING FEDERATION',
    titleDesc:
      'Build 40-card tiered tactical decks across Lethwei, Muay Thai, Boxing, Wrestling, and BJJ. Dominate the Stance Radar Triangle across Standing, Clinch, and Ground combat.',
    continueCareer: 'CONTINUE CAREER',
    noSavedCareer: 'No saved career yet',
    resume: 'RESUME',
    newCareer: 'NEW CAREER',
    createFighter: 'Create Fighter',
    howToPlay: 'HOW TO PLAY',
    rulesAndBadges: 'Rules & Badges',
    footerHint: 'Enter / Space Start · Landscape Ring View · Click Cards to Clash',
    footerSave: 'Progress auto-saved locally',
    howToPlayTitle: 'TACTICAL COMBAT RULES & STANCE TRIANGLE',
    staBadgeTitle: 'BLUE BADGE · STA',
    staBadgeDesc: 'Condition & Stamina cost to play the card. Click REST (+4 STA) when fatigued.',
    dmgBadgeTitle: 'RED BADGE · DMG / DEF',
    dmgBadgeDesc: 'Scaled by Tier (I/II/III), Strength/Health, Fight Skills, and Stance Triangle bonus.',
    spdBadgeTitle: 'GREEN BADGE · SPD',
    spdBadgeDesc: 'Lower SPD strikes first; Agility breaks ties, boosts Crit & Evasion.',
    standingRuleTitle: 'POSITIONAL COMBAT: STANDING · CLINCH · GROUND',
    standingRuleDesc:
      'Takedowns shift combat to Ground (vs Sprawls/Takedown_Def), opening Ground & Pound and Submissions (100% = Tapout). Hip Escapes reset back to Standing. Higher Stance Radar in a zone grants +15% to +30% bonus!',
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
    creationSubtitle: '40-Card Tactical MMA & Lethwei · Customize manually or scout with Gemini AI',
    aiScoutPlaceholder: 'AI Scout theme (e.g. Kayin State elbow striker or BJJ grappler)',
    aiScoutBtn: 'AI SCOUT FIGHTER',
    aiScouting: 'SCOUTING...',
    fighterPreview: 'FIGHTER PREVIEW',
    startingMaxHp: 'Starting Health (HP)',
    startingMaxSta: 'Starting Condition (STA)',
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
    starterDeckHint: '40-card starter deck (20 ATK / 20 DEF, Tiers I–III) equipped · Customizable in Game Plan',

    // Hub
    trainingXp: 'Training XP',
    tabArena: 'FIGHT ARENA',
    tabTraining: 'TRAINING CAMP',
    tabDeck: 'GAME PLAN',
    wins: 'Wins',
    losses: 'Losses',
    kos: 'KOs',
    healthHp: 'HEALTH (HP)',
    staminaSta: 'CONDITION (STA)',
    strength: 'Strength',
    speed: 'Agility',
    stamina: 'Condition',
    durability: 'Health',
    fightSkillsTitle: 'FIGHT SKILLS',
    stanceRadarTitle: 'STANCE RADAR TRIANGLE',
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

    // Battle Arena & Alternating Turns / Camera / Planner
    turnTimerLabel: 'TURN CLOCK',
    waitingStanceHint: 'Hold rhythm guard & pick a card before timer expires!',
    attackTurnBanner: 'YOUR ATTACK TURN · PICK STRIKE OR TAKEDOWN',
    defenseTurnBanner: 'OPPONENT ATTACKS · PICK DEFENSE OR ESCAPE',
    attackRoleBadge: 'RED ATTACKS · BLUE DEFENDS',
    defenseRoleBadge: 'BLUE ATTACKS · RED DEFENDS',
    cameraLabel: 'CAM',
    camAuto: 'Auto',
    camSide: 'Side',
    camCorner: 'Corner',
    camHigh: 'High',
    camCover: 'Cover',
    preFightTitle: 'PRE-FIGHT GAME PLAN',
    preFightSubtitle: 'Review your 40-card split & Stance Radar Triangle vs opponent before entering the ring',
    stepIntoRing: 'STEP INTO THE RING',
    editDeckShortcut: 'Quick Tactical Presets',
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
    titleBanner: 'မြန်မာ့လက်ဝှေ့ & MMA · ဗျူဟာကတ်တိုက်ပွဲအဖွဲ့ချုပ်',
    titleDesc:
      'လက်ဝှေ့၊ မွေထိုင်း၊ လက်သီး၊ နပန်းနှင့် BJJ ကတ် ၄၀ တွဲဖြင့် ယှဉ်ပြိုင်ပါ။ Standing, Clinch နှင့် Ground အနေအထားများတွင် Stance Radar တြိဂံဖြင့် အသာစီးရယူပါ။',
    continueCareer: 'ကစားလက်စ ဆက်မည်',
    noSavedCareer: 'သိမ်းဆည်းထားသော ဖိုက်တာမရှိသေးပါ',
    resume: 'ဆက်ကစား',
    newCareer: 'ကစားသမားအသစ် စတင်မည်',
    createFighter: 'ဖိုက်တာ ဖန်တီးရန်',
    howToPlay: 'ကစားနည်း & စည်းကမ်းများ',
    rulesAndBadges: 'စည်းမျဉ်း & အမှတ်တံဆိပ်များ',
    footerHint: 'Enter / Space ဖြင့် စတင်ပါ · ဘေးတိုက်မြင်ကွင်း · ကတ်နှိပ်၍ ယှဉ်ပြိုင်ပါ',
    footerSave: 'တိုးတက်မှုများကို အလိုအလျောက် သိမ်းဆည်းသည်',
    howToPlayTitle: 'ဗျူဟာတိုက်ပွဲ စည်းမျဉ်းနှင့် Stance Triangle လမ်းညွှန်',
    staBadgeTitle: 'အပြာရောင် · STA (သက်လုံ)',
    staBadgeDesc: 'Condition နှင့် ကတ်သုံးရန် ကုန်ကျအား။ ပင်ပန်းလျှင် REST (+4 STA) ကိုနှိပ်ပါ။',
    dmgBadgeTitle: 'အနီရောင် · DMG / DEF (အင်အား)',
    dmgBadgeDesc: 'Tier (I/II/III), Strength/Health, Fight Skills နှင့် Triangle အပိုဆု (+15-30%) တို့ဖြင့် တွက်ချက်သည်။',
    spdBadgeTitle: 'အစိမ်းရောင် · SPD (အမြန်နှုန်း)',
    spdBadgeDesc: 'SPD နံပါတ်နည်းသူက အရင်တိုက်ခိုက်ခွင့်ရပြီး Agility က Crit/ရှောင်တိမ်းမှု မြှင့်တင်ပေးသည်။',
    standingRuleTitle: 'အနေအထား ၃ မျိုး: STANDING · CLINCH · GROUND',
    standingRuleDesc:
      'Takedown ဖြင့် Ground သို့ ဆွဲချပြီး Ground & Pound နှင့် Submission (100% = Tapout) ချုပ်နိုင်သည်။ Hip Escape ဖြင့် Standing ပြန်တက်နိုင်ပြီး Stance Radar သာလျှင် +15-30% အပိုအင်အား ရမည်။',
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
    creationSubtitle: 'ကတ် ၄၀ ဗျူဟာ MMA & လက်ဝှေ့ · ကိုယ်တိုင်ပြင်ဆင်ပါ သို့မဟုတ် Gemini AI ဖြင့် ရှာဖွေပါ',
    aiScoutPlaceholder: 'AI ဖိုက်တာ ပုံစံ (ဥပမာ - ကရင် တံတောင်သမား သို့မဟုတ် BJJ)',
    aiScoutBtn: 'AI ဖိုက်တာ ရှာဖွေ',
    aiScouting: 'ရှာဖွေနေသည်...',
    fighterPreview: 'ဖိုက်တာ ပုံကြမ်း',
    startingMaxHp: 'အခြေခံ Health (HP)',
    startingMaxSta: 'အခြေခံ Condition (STA)',
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
    starterDeckHint: 'အခြေခံ ကတ် ၄၀ တွဲ (တိုက် ၂၀ / ကာ ၂၀) အလိုအလျောက် တပ်ဆင်ပြီး · Game Plan တွင် ပြင်နိုင်သည်',

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
    strength: 'ခွန်အား (Strength)',
    speed: 'သွက်လက် (Agility)',
    stamina: 'သက်လုံ (Condition)',
    durability: 'ကျန်းမာ (Health)',
    fightSkillsTitle: 'တိုက်ခိုက်ရေး ကျွမ်းကျင်မှုများ',
    stanceRadarTitle: 'အနေအထား တြိဂံစနစ်',
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

    // Battle Arena & Alternating Turns / Camera / Planner
    turnTimerLabel: 'အချိန်မှတ်',
    waitingStanceHint: 'အချိန်မကုန်မီ စည်းချက်အနေအထားမှ ကတ် ၁ ခု ရွေးချယ်ပါ!',
    attackTurnBanner: 'သင်၏ တိုက်ခိုက်အလှည့် · တိုက်ခိုက်/လှဲချကတ် ရွေးပါ',
    defenseTurnBanner: 'ပြိုင်ဘက် တိုက်ခိုက်မည် · ခုခံ/ရုန်းထွက်ကတ် ရွေးပါ',
    attackRoleBadge: 'အနီ တိုက်ခိုက် · အပြာ ခုခံ',
    defenseRoleBadge: 'အပြာ တိုက်ခိုက် · အနီ ခုခံ',
    cameraLabel: 'မြင်ကွင်း',
    camAuto: 'အလိုအလျောက်',
    camSide: 'ဘေးတိုက်',
    camCorner: 'ထောင့်မြင်',
    camHigh: 'အပေါ်စီး',
    camCover: 'အနီးကပ်',
    preFightTitle: 'ပွဲကြို ဗျူဟာနှင့် ကတ် ၄၀ စီမံချက်',
    preFightSubtitle: 'ကြိုးဝိုင်းထဲ မဝင်မီ ကတ် ၄၀ တွဲနှင့် Stance Radar တြိဂံကို စစ်ဆေးပြင်ဆင်ပါ',
    stepIntoRing: 'ကြိုးဝိုင်းထဲ ဝင်ပြိုင်မည်',
    editDeckShortcut: 'အမြန် ဗျူဟာပြောင်းရန်',
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
