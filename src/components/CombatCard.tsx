import React from 'react';
import { Activity, Clock, Flame, Shield, Swords } from 'lucide-react';
import { localizeCard, UI_TEXT } from '../i18n/translations';
import { CardArtType, CombatCard as CombatCardType, Language } from '../types/game';

interface CombatCardProps {
  card: CombatCardType;
  effectivePower?: number;
  disabled?: boolean;
  selected?: boolean;
  compact?: boolean;
  lang?: Language;
  onClick?: () => void;
  actionLabel?: string;
}

const CardIllustration: React.FC<{ artType: CardArtType }> = ({ artType }) => {
  const ink = '#171412';
  const shade = '#cbbba0';
  const hi = '#f5eedc';

  const renderSketch = () => {
    switch (artType) {
      case 'headbutt':
      case 'desperation':
        return (
          <g>
            {/* Two fighters clashing skulls in clinch */}
            <path d="M 16 64 L 26 36 L 42 38 L 36 64 Z" fill={shade} stroke={ink} strokeWidth="2.4" />
            <circle cx="36" cy="24" r="10" fill={hi} stroke={ink} strokeWidth="2.4" />
            <path d="M 84 64 L 74 36 L 58 38 L 64 64 Z" fill={shade} stroke={ink} strokeWidth="2.4" />
            <circle cx="64" cy="24" r="10" fill={shade} stroke={ink} strokeWidth="2.4" />
            {/* Impact shock lines */}
            <path d="M 50 8 L 50 18 M 42 12 L 46 20 M 58 12 L 54 20 M 44 28 L 56 28" stroke="#b91c1c" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="50" cy="23" r="4.5" fill="#dc2626" stroke={ink} strokeWidth="1.6" />
          </g>
        );
      case 'elbow':
        return (
          <g>
            {/* Torso + raised sharp elbow strike + motion arc */}
            <path d="M 28 64 L 34 32 L 54 34 L 50 64 Z" fill={shade} stroke={ink} strokeWidth="2.4" />
            <circle cx="42" cy="21" r="9" fill={hi} stroke={ink} strokeWidth="2.4" />
            <path d="M 48 34 L 70 16 L 58 30" fill="none" stroke={ink} strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 48 34 L 70 16 L 58 30" fill="none" stroke={hi} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 62 10 Q 82 14 78 30" fill="none" stroke="#b91c1c" strokeWidth="2" strokeDasharray="3 2" />
          </g>
        );
      case 'knee':
        return (
          <g>
            {/* Clinch knee drive */}
            <path d="M 22 64 L 26 28 L 42 30 L 38 64 Z" fill={shade} stroke={ink} strokeWidth="2.4" />
            <circle cx="34" cy="18" r="8.5" fill={hi} stroke={ink} strokeWidth="2.4" />
            <path d="M 38 46 L 62 32 L 50 56" fill="none" stroke={ink} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 38 46 L 62 32 L 50 56" fill="none" stroke={hi} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 66 18 L 76 64" stroke={shade} strokeWidth="10" strokeLinecap="round" />
            <circle cx="71" cy="18" r="8" fill={shade} stroke={ink} strokeWidth="2.2" />
            <circle cx="63" cy="32" r="5" fill="#dc2626" stroke={ink} strokeWidth="1.6" />
          </g>
        );
      case 'roundhouse':
      case 'sidekick':
      case 'lowkick':
        return (
          <g>
            {/* Dynamic martial arts kicking silhouette */}
            <circle cx="28" cy="20" r="8.5" fill={hi} stroke={ink} strokeWidth="2.4" />
            <path d="M 22 29 L 36 29 L 34 50 L 22 50 Z" fill={shade} stroke={ink} strokeWidth="2.4" />
            <path d="M 25 50 L 22 64" stroke={ink} strokeWidth="6" strokeLinecap="round" />
            <path
              d={
                artType === 'lowkick'
                  ? 'M 33 46 L 78 52'
                  : artType === 'sidekick'
                  ? 'M 34 40 L 82 32'
                  : 'M 34 44 L 80 18'
              }
              stroke={ink}
              strokeWidth="7.5"
              strokeLinecap="round"
            />
            <path
              d={
                artType === 'lowkick'
                  ? 'M 33 46 L 78 52'
                  : artType === 'sidekick'
                  ? 'M 34 40 L 82 32'
                  : 'M 34 44 L 80 18'
              }
              stroke={hi}
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path
              d={
                artType === 'lowkick'
                  ? 'M 64 42 Q 82 48 76 58'
                  : artType === 'sidekick'
                  ? 'M 72 22 L 88 32 L 72 42'
                  : 'M 64 12 Q 86 14 82 28'
              }
              fill="none"
              stroke="#b91c1c"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </g>
        );
      case 'slam':
        return (
          <g>
            {/* Standing body slam lift */}
            <path d="M 18 64 L 26 36 L 44 38 L 36 64 Z" fill={shade} stroke={ink} strokeWidth="2.4" />
            <circle cx="36" cy="26" r="8" fill={hi} stroke={ink} strokeWidth="2.4" />
            <path d="M 42 36 Q 64 18 82 46" fill="none" stroke={ink} strokeWidth="7" strokeLinecap="round" />
            <path d="M 42 36 Q 64 18 82 46" fill="none" stroke={shade} strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 56 54 L 86 54" stroke="#b91c1c" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );
      case 'block':
      case 'sprawl':
      case 'catchkick':
      case 'parry':
        return (
          <g>
            {/* Tight defensive guard / catch / parry sketch */}
            <circle cx="38" cy="20" r="8.5" fill={hi} stroke={ink} strokeWidth="2.4" />
            <path d="M 28 30 L 48 30 L 46 64 L 30 64 Z" fill={shade} stroke={ink} strokeWidth="2.4" />
            <path
              d={
                artType === 'catchkick'
                  ? 'M 46 38 L 68 38 M 84 28 L 58 38'
                  : artType === 'parry'
                  ? 'M 46 34 L 74 24 M 76 34 L 54 28'
                  : 'M 44 34 L 54 20 L 48 44'
              }
              fill="none"
              stroke={ink}
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="54" cy="22" r="5" fill="#1d4ed8" stroke={ink} strokeWidth="1.8" />
          </g>
        );
      case 'evade':
        return (
          <g>
            {/* Slipping weave motion */}
            <circle cx="54" cy="26" r="8.5" fill={hi} stroke={ink} strokeWidth="2.4" />
            <path d="M 40 36 L 62 36 L 56 64 L 38 64 Z" fill={shade} stroke={ink} strokeWidth="2.4" />
            <path d="M 22 22 Q 46 8 76 24" fill="none" stroke="#15803d" strokeWidth="2.4" strokeDasharray="4 3" />
            <polygon points="78,24 68,18 70,29" fill="#15803d" />
          </g>
        );
      case 'mani':
      case 'groggy':
      case 'surge':
        return (
          <g>
            {artType === 'mani' ? (
              <>
                <circle cx="34" cy="24" r="8" fill={hi} stroke={ink} strokeWidth="2.2" />
                <path d="M 24 34 L 44 34 L 44 62 L 24 62 Z" fill={shade} stroke={ink} strokeWidth="2.2" />
                <circle cx="68" cy="34" r="14" fill="#15803d" stroke={ink} strokeWidth="2.4" />
                <path d="M 68 25 L 68 43 M 59 34 L 77 34" stroke="#f5eedc" strokeWidth="4" strokeLinecap="round" />
              </>
            ) : artType === 'groggy' ? (
              <>
                <circle cx="50" cy="24" r="8.5" fill={hi} stroke={ink} strokeWidth="2.4" />
                <path d="M 38 34 L 60 34 L 54 62 L 36 62 Z" fill={shade} stroke={ink} strokeWidth="2.4" />
                <path d="M 34 12 Q 50 6 66 12" fill="none" stroke="#b91c1c" strokeWidth="2.2" strokeDasharray="3 2" />
              </>
            ) : (
              <>
                <circle cx="50" cy="22" r="8.5" fill={hi} stroke={ink} strokeWidth="2.4" />
                <path d="M 36 32 L 64 32 L 60 62 L 40 62 Z" fill={shade} stroke={ink} strokeWidth="2.4" />
                <path d="M 34 40 L 20 24 M 66 40 L 80 24" stroke={ink} strokeWidth="5.5" strokeLinecap="round" />
                <circle cx="20" cy="23" r="4.5" fill="#dc2626" stroke={ink} strokeWidth="1.6" />
                <circle cx="80" cy="23" r="4.5" fill="#dc2626" stroke={ink} strokeWidth="1.6" />
              </>
            )}
          </g>
        );
      case 'jab':
      case 'hook':
      case 'uppercut':
      default:
        return (
          <g>
            {/* Boxing / Lethwei punching form */}
            <circle cx="32" cy="21" r="8.5" fill={hi} stroke={ink} strokeWidth="2.4" />
            <path d="M 22 31 L 42 31 L 39 64 L 24 64 Z" fill={shade} stroke={ink} strokeWidth="2.4" />
            <path
              d={
                artType === 'uppercut'
                  ? 'M 40 42 L 58 24 L 64 14'
                  : artType === 'hook'
                  ? 'M 40 36 Q 58 22 72 34'
                  : 'M 40 34 L 78 30'
              }
              fill="none"
              stroke={ink}
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={
                artType === 'uppercut'
                  ? 'M 40 42 L 58 24 L 64 14'
                  : artType === 'hook'
                  ? 'M 40 36 Q 58 22 72 34'
                  : 'M 40 34 L 78 30'
              }
              fill="none"
              stroke={hi}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <rect
              x={artType === 'uppercut' ? 56 : 70}
              y={artType === 'uppercut' ? 8 : 24}
              width="13"
              height="12"
              rx="3"
              fill="#b91c1c"
              stroke={ink}
              strokeWidth="2"
            />
          </g>
        );
    }
  };

  return (
    <svg viewBox="0 0 100 68" className="w-full h-full" aria-hidden="true">
      <rect x="0" y="0" width="100" height="68" fill="#e6dac3" />
      <path d="M 0 68 L 100 68" stroke="#cbbba0" strokeWidth="6" />
      {renderSketch()}
    </svg>
  );
};

export const CombatCard: React.FC<CombatCardProps> = ({
  card,
  effectivePower,
  disabled = false,
  selected = false,
  compact = false,
  lang = 'en',
  onClick,
  actionLabel,
}) => {
  const powerValue = effectivePower ?? card.power;
  const loc = localizeCard(card, lang);
  const t = UI_TEXT[lang];
  const isDefense =
    card.category === 'Defense' ||
    card.specialEffect === 'adrenaline_sta' ||
    card.specialEffect === 'prevent_ko';
  const isHeal = card.specialEffect === 'mani_heal';

  const cardBody = (
    <div
      className={`relative flex flex-col justify-between rounded-lg bg-[#6e1c1c] text-[#f5f2eb] comic-panel overflow-hidden transition-transform duration-150 ${
        selected
          ? 'ring-3 ring-amber-400 -translate-y-1.5'
          : disabled
          ? 'opacity-45 grayscale-[35%]'
          : onClick
          ? 'hover:-translate-y-1.5 hover:ring-2 hover:ring-amber-400 cursor-pointer'
          : ''
      } p-1.5`}
    >
      {/* Top Crimson Title Header (Matches Image 3) */}
      <div className="flex items-center justify-between gap-1 px-1 pb-1">
        <div
          className={`font-display font-extrabold tracking-wide leading-tight text-white truncate flex-1 text-center ${
            compact ? 'text-xs' : lang === 'my' ? 'text-[13px]' : 'text-sm sm:text-base'
          }`}
          title={loc.name}
        >
          {loc.name}
        </div>
        {card.isCustomAi && (
          <span className="text-[9px] font-bold uppercase px-1 rounded bg-amber-400 text-black shrink-0">
            AI
          </span>
        )}
      </div>

      {/* Warm Parchment Comic Illustration Frame */}
      <div
        className={`relative w-full rounded-sm border-2 border-[#090a0c] overflow-hidden bg-[#e6dac3] ${
          compact ? 'h-12' : 'h-14'
        }`}
      >
        <CardIllustration artType={card.artType} />
        <div
          className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border border-[#090a0c] flex items-center justify-center ${
            isHeal ? 'bg-emerald-700' : isDefense ? 'bg-sky-700' : 'bg-red-700'
          }`}
          aria-hidden="true"
        >
          {isHeal ? (
            <Flame className="w-3 h-3 text-white" />
          ) : isDefense ? (
            <Shield className="w-3 h-3 text-white" />
          ) : (
            <Swords className="w-3 h-3 text-white" />
          )}
        </div>
      </div>

      {/* Dark Charcoal Discipline Ribbon */}
      <div className="my-1 px-1.5 py-0.5 rounded-sm bg-[#231f20] border border-[#090a0c] text-center text-[10px] font-semibold tracking-wide text-[#f5eedc] truncate">
        {loc.zoneLabel} ({loc.disciplineLabel})
      </div>

      {/* 3 Color-Coded Badges: Blue (STA), Red (DMG/DEF), Green (SPD) */}
      <div className="grid grid-cols-3 gap-1">
        {/* Blue STA */}
        <div
          className="flex items-center justify-center gap-0.5 rounded-sm bg-[#1d4ed8] border border-[#090a0c] py-0.5 px-1 text-white"
          title={t.badgeSta}
        >
          <Activity className="w-2.5 h-2.5 shrink-0 text-sky-200" aria-hidden="true" />
          <span className="text-[9px] font-bold uppercase text-sky-100">{t.badgeSta}</span>
          <span className="font-mono-num font-bold text-xs leading-none">{card.staCost}</span>
        </div>

        {/* Red DMG / DEF */}
        <div
          className={`flex items-center justify-center gap-0.5 rounded-sm border border-[#090a0c] py-0.5 px-1 text-white ${
            isHeal ? 'bg-[#15803d]' : 'bg-[#b91c1c]'
          }`}
          title={isHeal ? t.badgeHeal : isDefense ? t.badgeDef : t.badgeDmg}
        >
          <span className="text-[9px] font-bold uppercase">
            {isHeal ? t.badgeHeal : isDefense ? t.badgeDef : t.badgeDmg}
          </span>
          <span className="font-mono-num font-bold text-xs leading-none">
            {isHeal ? `${powerValue}%` : powerValue}
          </span>
        </div>

        {/* Green SPD */}
        <div
          className="flex items-center justify-center gap-0.5 rounded-sm bg-[#15803d] border border-[#090a0c] py-0.5 px-1 text-white"
          title={t.badgeSpd}
        >
          <Clock className="w-2.5 h-2.5 shrink-0 text-emerald-200" aria-hidden="true" />
          <span className="text-[9px] font-bold uppercase text-emerald-100">{t.badgeSpd}</span>
          <span className="font-mono-num font-bold text-xs leading-none">{card.speed}</span>
        </div>
      </div>

      {/* Parchment Description Strip */}
      {!compact && (
        <div className="mt-1 px-1.5 py-1 rounded-sm bg-[#dfd3b8] border border-[#090a0c] text-[#1c1917] h-[2.5rem] flex items-center">
          <p className="text-[10px] font-medium leading-[1.28] line-clamp-2 w-full">
            {loc.description}
          </p>
        </div>
      )}

      {actionLabel && (
        <div className="mt-1 text-center text-[10px] font-bold uppercase tracking-wider py-0.5 rounded bg-zinc-950 text-amber-300">
          {actionLabel}
        </div>
      )}
    </div>
  );

  if (!onClick) return cardBody;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`${loc.name}, ${loc.disciplineLabel}, STA ${card.staCost}, ${
        isHeal ? `Heal ${powerValue}%` : isDefense ? `DEF ${powerValue}` : `DMG ${powerValue}`
      }, SPD ${card.speed}`}
      className="text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg disabled:cursor-not-allowed"
    >
      {cardBody}
    </button>
  );
};
