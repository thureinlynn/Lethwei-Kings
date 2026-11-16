import { createNewFighter } from '../game/rules';
import { FighterProfile, Language } from '../types/game';

const STORAGE_KEY = 'lethwei_kings_career_v1';
const LANG_KEY = 'lethwei_kings_lang_v1';

export function saveLanguage(lang: Language): void {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    // Ignore
  }
}

export function loadLanguage(): Language {
  try {
    const val = localStorage.getItem(LANG_KEY);
    return val === 'my' ? 'my' : 'en';
  } catch {
    return 'en';
  }
}

export function saveCareer(fighter: FighterProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fighter));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadCareer(): FighterProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FighterProfile;
    if (!parsed || !parsed.id || !parsed.stats || !Array.isArray(parsed.activeDeckIds)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearCareer(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}

export function createQuickStartDemoFighter(): FighterProfile {
  return createNewFighter({
    name: 'Aung Kyaw',
    nickname: 'The Iron Skull',
    gender: 'Male',
    age: 23,
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
    stats: {
      strength: 7,
      speed: 7,
      stamina: 6,
      durability: 7,
    },
  });
}
