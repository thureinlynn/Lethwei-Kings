import { Discipline, GymId, GymInfo } from '../types/game';

export const GYMS: Record<GymId, GymInfo> = {
  thuwunna: {
    id: 'thuwunna',
    name: 'Thuwunna Lethwei Club',
    location: 'Yangon, Myanmar',
    specialty: 'Traditional Nine-Limbs Combat',
    bonusSummary: '+2 Headbutt & Elbow DMG · Starts with Spinning Elbow unlocked',
    headbuttElbowBonus: 2,
    kickKneeBonus: 0,
    bonusMaxSta: 0,
    bonusMaxHp: 4,
    starterCards: ['spinning_elbow', 'clinch_defense'],
  },
  golden_land: {
    id: 'golden_land',
    name: 'Golden Land Striker Gym',
    location: 'Hpa-An, Myanmar',
    specialty: 'Iron-Lung Conditioning & Grit',
    bonusSummary: '+3 Max Stamina & +6 Max HP · Starts with Parry & Counter unlocked',
    headbuttElbowBonus: 0,
    kickKneeBonus: 0,
    bonusMaxSta: 3,
    bonusMaxHp: 6,
    starterCards: ['parry_counter'],
  },
  tiger_mt: {
    id: 'tiger_mt',
    name: 'Tiger Muay Thai & Kickboxing',
    location: 'Bangkok / Phuket',
    specialty: 'Precision Kicks & Clinch Knees',
    bonusSummary: '+2 Kick & Knee DMG · Starts with Clinch Knee & Catch Kick unlocked',
    headbuttElbowBonus: 0,
    kickKneeBonus: 2,
    bonusMaxSta: 0,
    bonusMaxHp: 0,
    starterCards: ['clinch_knee', 'catch_kick'],
  },
};

export const DISCIPLINES: {
  id: Discipline;
  title: string;
  origin: string;
  focus: string;
}[] = [
  {
    id: 'Lethwei',
    title: 'Burmese Lethwei',
    origin: 'Myanmar',
    focus: 'Bare-knuckle headbutts, slams & Mani grit',
  },
  {
    id: 'Muay Thai',
    title: 'Muay Thai',
    origin: 'Thailand',
    focus: 'Cutting spinning elbows, clinch knees & kick catches',
  },
  {
    id: 'Boxing',
    title: 'Western Boxing',
    origin: 'Global',
    focus: 'Blinding jab speed, body hooks & head slips',
  },
  {
    id: 'Kickboxing',
    title: 'Dutch Kickboxing',
    origin: 'Netherlands / Japan',
    focus: 'Chopping calf kicks & pressure combinations',
  },
  {
    id: 'Karate',
    title: 'Full-Contact Karate',
    origin: 'Okinawa / Japan',
    focus: 'Whip roundhouse kicks, side kicks & counter parries',
  },
];

export const BIRTHPLACES = [
  'Yangon, Myanmar',
  'Hpa-An, Myanmar',
  'Mandalay, Myanmar',
  'Mawlamyine, Myanmar',
  'Bangkok, Thailand',
  'Chiang Mai, Thailand',
  'Tokyo, Japan',
  'Osaka, Japan',
  'Amsterdam, Netherlands',
  'Manila, Philippines',
];

export const SKIN_TONES = [
  { label: 'Warm Sand', hex: '#e2b48f' },
  { label: 'Golden Tan', hex: '#c88d61' },
  { label: 'Bronze', hex: '#a46943' },
  { label: 'Deep Umber', hex: '#6e432b' },
  { label: 'Fair Olive', hex: '#edd0b6' },
];

export const HAIR_COLORS = [
  { label: 'Jet Black', hex: '#18181b' },
  { label: 'Espresso', hex: '#3f281d' },
  { label: 'Crimson Dye', hex: '#b91c1c' },
  { label: 'Bleached Gold', hex: '#eab308' },
  { label: 'Steel Grey', hex: '#71717a' },
];

export const SHORTS_COLORS = [
  { label: 'Crimson Gold', hex: '#b91c1c' },
  { label: 'Royal Jade', hex: '#047857' },
  { label: 'Obsidian', hex: '#1f2937' },
  { label: 'Cobalt Blue', hex: '#1d4ed8' },
  { label: 'Saffron', hex: '#d97706' },
];
