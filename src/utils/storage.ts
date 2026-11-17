import { DEFAULT_STARTER_DECK, DEFAULT_STARTER_UNLOCKED, getCardById } from '../data/cards';
import { createInitialSkills, createNewFighter, DECK_SIZE } from '../game/rules';
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
    const unlocked = Array.from(
      new Set([...(parsed.unlockedCardIds ?? []), ...DEFAULT_STARTER_UNLOCKED])
    );
    const skills = parsed.skills ?? createInitialSkills(parsed.gymId, 25);

    if (parsed.activeDeckIds.length < DECK_SIZE) {
      const nextDeck = [...parsed.activeDeckIds];
      const padPool = [...DEFAULT_STARTER_DECK];
      // Ensure balanced ATK/DEF padding up to 40
      let atkCount = nextDeck.filter((id) => getCardById(id, parsed.customCards)?.category === 'Striking').length;
      let defCount = nextDeck.length - atkCount;

      for (const id of padPool) {
        if (nextDeck.length >= DECK_SIZE) break;
        const card = getCardById(id, parsed.customCards);
        if (!card) continue;
        const count = nextDeck.filter((d) => d === id).length;
        if (count >= 3) continue;
        if (card.category === 'Striking' && atkCount >= 22) continue;
        if (card.category === 'Defense' && defCount >= 22) continue;
        nextDeck.push(id);
        if (card.category === 'Striking') atkCount += 1;
        else defCount += 1;
      }
      // Fallback sweep if still under 40
      for (const id of unlocked) {
        if (nextDeck.length >= DECK_SIZE) break;
        const card = getCardById(id, parsed.customCards);
        if (!card || card.category === 'Critical') continue;
        while (nextDeck.length < DECK_SIZE && nextDeck.filter((d) => d === id).length < 3) {
          nextDeck.push(id);
        }
      }
      return {
        ...parsed,
        skills,
        unlockedCardIds: unlocked,
        activeDeckIds: nextDeck.slice(0, DECK_SIZE),
      };
    }
    return {
      ...parsed,
      skills,
      unlockedCardIds: unlocked,
    };
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
