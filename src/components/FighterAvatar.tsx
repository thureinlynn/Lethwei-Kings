import React from 'react';
import { FighterAppearance, FighterPose, Gender } from '../types/game';

interface FighterAvatarProps {
  appearance: FighterAppearance;
  gender: Gender;
  pose?: FighterPose;
  facing?: 'right' | 'left';
  mode?: 'portrait' | 'fullbody';
  hasCut?: boolean;
  isChampion?: boolean;
  className?: string;
}

function darkenHex(hex: string, amount = 0.22): string {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  if (Number.isNaN(num)) return '#7c5238';
  const r = Math.max(0, Math.floor(((num >> 16) & 255) * (1 - amount)));
  const g = Math.max(0, Math.floor(((num >> 8) & 255) * (1 - amount)));
  const b = Math.max(0, Math.floor((num & 255) * (1 - amount)));
  return `rgb(${r}, ${g}, ${b})`;
}

export const FighterAvatar: React.FC<FighterAvatarProps> = ({
  appearance,
  gender,
  pose = 'idle',
  facing = 'right',
  mode = 'portrait',
  hasCut = false,
  isChampion = false,
  className = '',
}) => {
  const skin = appearance.skinTone;
  const skinShadow = darkenHex(skin, 0.22);
  const hair = appearance.hairColor;
  const shorts = appearance.shortsColor;
  const shortsShadow = darkenHex(shorts, 0.28);
  const wrap = appearance.wrapColor;

  const torsoScaleX =
    appearance.build === 'Heavy' ? 1.15 : appearance.build === 'Lean' ? 0.9 : 1.02;
  const shoulderW = (gender === 'Male' ? 34 : 28) * torsoScaleX;
  const waistW = (gender === 'Male' ? 23 : 19) * torsoScaleX;

  const renderPortraitHair = () => {
    switch (appearance.hairstyle) {
      case 'Buzz':
        return (
          <path
            d="M 80 42 C 80 26, 118 26, 118 42 L 116 48 C 106 42, 92 42, 82 48 Z"
            fill={hair}
            stroke="#090a0c"
            strokeWidth="2.5"
          />
        );
      case 'Topknot':
        return (
          <g>
            <path
              d="M 80 43 C 80 27, 118 27, 118 43 L 116 48 C 106 42, 92 42, 82 48 Z"
              fill={hair}
              stroke="#090a0c"
              strokeWidth="2.5"
            />
            <path
              d="M 92 28 C 88 14, 108 12, 106 28 Z"
              fill={hair}
              stroke="#090a0c"
              strokeWidth="2.5"
            />
            <rect x="93" y="25" width="12" height="4" rx="1" fill="#eab308" stroke="#090a0c" strokeWidth="1.5" />
          </g>
        );
      case 'Mohawk':
        return (
          <path
            d="M 92 44 L 88 18 L 100 13 L 110 21 L 106 44 Z"
            fill={hair}
            stroke="#090a0c"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        );
      case 'Undercut':
        return (
          <path
            d="M 79 44 C 78 24, 122 22, 121 44 C 110 38, 92 38, 82 47 Z"
            fill={hair}
            stroke="#090a0c"
            strokeWidth="2.5"
          />
        );
      case 'LongTied':
        return (
          <g>
            <path
              d="M 79 44 C 78 26, 120 26, 119 44 C 108 39, 92 39, 81 47 Z"
              fill={hair}
              stroke="#090a0c"
              strokeWidth="2.5"
            />
            <path
              d="M 81 44 C 70 50, 68 68, 76 74 C 82 66, 84 55, 84 48 Z"
              fill={hair}
              stroke="#090a0c"
              strokeWidth="2.5"
            />
          </g>
        );
      case 'Shaved':
      default:
        return null;
    }
  };

  if (mode === 'portrait') {
    return (
      <svg viewBox="0 0 200 180" className={`select-none ${className}`} aria-hidden="true">
        <rect x="0" y="0" width="200" height="180" fill="#181a20" />
        <path d="M 0 180 L 55 20 L 95 20 L 40 180 Z" fill={shorts} opacity="0.22" />
        <path d="M 110 180 L 160 0 L 195 0 L 145 180 Z" fill={shorts} opacity="0.14" />

        <g transform={facing === 'left' ? 'translate(200, 0) scale(-1, 1)' : undefined}>
          {/* Rounded Muscular Shoulders */}
          <path
            d={`M ${100 - shoulderW - 22} 180 L ${100 - shoulderW - 14} 134 C ${100 - shoulderW - 10} 114, ${100 - 20} 112, 100 112 C ${100 + 20} 112, ${100 + shoulderW + 10} 114, ${100 + shoulderW + 14} 134 L ${100 + shoulderW + 22} 180 Z`}
            fill={skin}
            stroke="#090a0c"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path
            d={`M ${100 - shoulderW} 145 Q 100 158 ${100 + shoulderW} 145`}
            fill="none"
            stroke="#090a0c"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path d="M 100 132 L 100 165" stroke="#090a0c" strokeWidth="2.5" strokeLinecap="round" />

          {/* Neck */}
          <path d="M 86 92 L 84 120 L 116 120 L 112 92 Z" fill={skinShadow} stroke="#090a0c" strokeWidth="3" />

          {/* Head */}
          <path
            d="M 79 48 C 79 29, 119 29, 119 48 L 119 72 C 119 92, 108 103, 99 103 C 88 103, 79 92, 79 72 Z"
            fill={skin}
            stroke="#090a0c"
            strokeWidth="3.5"
          />
          <path d="M 83 68 L 83 84 C 86 93, 93 98, 99 99 L 94 74 Z" fill={skinShadow} opacity="0.65" />
          <ellipse cx="78" cy="68" rx="4.5" ry="8" fill={skinShadow} stroke="#090a0c" strokeWidth="2.5" />

          {renderPortraitHair()}

          {isChampion && (
            <path
              d="M 78 46 Q 100 41 120 46 L 120 52 Q 100 47 78 52 Z"
              fill="#eab308"
              stroke="#090a0c"
              strokeWidth="2"
            />
          )}

          <path d="M 89 58 L 99 61" stroke="#090a0c" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M 105 61 L 116 57" stroke="#090a0c" strokeWidth="3.2" strokeLinecap="round" />
          <ellipse cx="94" cy="65" rx="3" ry="2.2" fill="#090a0c" />
          <ellipse cx="110" cy="65" rx="3" ry="2.2" fill="#090a0c" />
          <path d="M 102 65 L 105 76 L 99 78" fill="none" stroke="#090a0c" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M 93 87 Q 102 85 110 88" fill="none" stroke="#090a0c" strokeWidth="2.8" strokeLinecap="round" />

          {hasCut && (
            <g>
              <path d="M 108 53 L 115 62" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
              <path d="M 111 61 L 111 72" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" />
            </g>
          )}

          {/* Raised Bandaged Guard Fist */}
          <g transform="translate(122, 98) rotate(-14)">
            <rect x="0" y="18" width="22" height="58" rx="8" fill={skin} stroke="#090a0c" strokeWidth="3" />
            <rect x="-2" y="0" width="27" height="28" rx="7" fill={wrap} stroke="#090a0c" strokeWidth="3" />
            <path d="M 0 10 L 23 10 M 0 18 L 23 18" stroke="#090a0c" strokeWidth="1.8" opacity="0.5" />
          </g>
        </g>
      </svg>
    );
  }

  // ================= FULLBODY COMIC RING FIGHTER (Joint-Anchored Anatomy) =================
  const heightScale = 0.92 + ((appearance.heightCm - 165) / 30) * 0.14;
  const frontShoulderX = 100 + shoulderW - 4;
  const frontShoulderY = 82;
  const backShoulderX = 100 - shoulderW + 4;
  const backShoulderY = 82;

  let bodyTransform = '';
  let headAngle = 0;
  let frontArmAngle = 0;
  let frontArmStretch = 0;
  let backArmAngle = 0;
  let backArmStretch = 0;
  let frontLegAngle = 0;
  let backLegAngle = 0;

  switch (pose) {
    case 'jab':
      bodyTransform = 'translate(18, 0) rotate(6 100 135)';
      frontArmAngle = -88;
      frontArmStretch = 22;
      break;
    case 'hook':
      bodyTransform = 'translate(22, 2) rotate(10 100 135)';
      backArmAngle = -72;
      backArmStretch = 16;
      break;
    case 'elbow':
      bodyTransform = 'translate(22, -2) rotate(13 100 135)';
      frontArmAngle = -112;
      frontArmStretch = 6;
      break;
    case 'headbutt':
      bodyTransform = 'translate(28, 6) rotate(22 100 135)';
      headAngle = 14;
      frontArmAngle = 24;
      backArmAngle = 22;
      break;
    case 'kick':
      bodyTransform = 'translate(14, -6) rotate(-14 100 135)';
      frontLegAngle = -78;
      frontArmAngle = 18;
      break;
    case 'knee':
      bodyTransform = 'translate(22, -10) rotate(8 100 135)';
      frontLegAngle = -48;
      frontArmAngle = -35;
      backArmAngle = -30;
      break;
    case 'slam':
      bodyTransform = 'translate(28, 12) rotate(24 100 135)';
      frontArmAngle = -30;
      frontArmStretch = 14;
      backArmAngle = -28;
      backArmStretch = 12;
      break;
    case 'block':
      bodyTransform = 'translate(-4, 4)';
      frontArmAngle = -42;
      backArmAngle = -36;
      break;
    case 'evade':
      bodyTransform = 'translate(-20, 12) rotate(-18 100 145)';
      break;
    case 'hit':
      bodyTransform = 'translate(-16, 4) rotate(-14 100 135)';
      headAngle = -16;
      break;
    case 'ko':
      bodyTransform = 'translate(-22, 74) rotate(-78 100 165)';
      break;
    case 'victory':
      frontArmAngle = -135;
      frontArmStretch = 10;
      backArmAngle = -130;
      backArmStretch = 10;
      break;
    case 'idle':
    default:
      break;
  }

  return (
    <svg viewBox="0 0 220 260" className={`select-none overflow-visible ${className}`} aria-hidden="true">
      <g
        transform={`${
          facing === 'left' ? 'translate(220, 0) scale(-1, 1) ' : ''
        }translate(0, ${250 * (1 - heightScale)}) scale(1, ${heightScale})`}
      >
        {/* Ground contact shadow */}
        <ellipse cx="104" cy="244" rx="50" ry="10" fill="#090a0c" opacity="0.45" />

        <g transform={bodyTransform}>
          {/* Back Leg (anchored at hip 88, 154) */}
          <g transform={`rotate(${backLegAngle}, 88, 154)`}>
            <path
              d="M 80 152 C 74 176, 70 194, 66 206 L 58 238 L 76 238 L 86 204 L 98 160 Z"
              fill={skinShadow}
              stroke="#090a0c"
              strokeWidth="3.2"
              strokeLinejoin="round"
            />
            <rect x="60" y="218" width="17" height="14" rx="3" fill={wrap} stroke="#090a0c" strokeWidth="2.2" />
          </g>

          {/* Back Arm (anchored at backShoulderX, backShoulderY) */}
          <g transform={`rotate(${backArmAngle}, ${backShoulderX}, ${backShoulderY})`}>
            <circle cx={backShoulderX} cy={backShoulderY} r="10" fill={skinShadow} stroke="#090a0c" strokeWidth="3" />
            <path
              d={`M ${backShoulderX - 6} ${backShoulderY + 4} L ${backShoulderX - 10} ${backShoulderY + 26} L ${backShoulderX + 18 + backArmStretch} ${backShoulderY + 20} L ${backShoulderX + 20 + backArmStretch} ${backShoulderY + 6} L ${backShoulderX + 4} ${backShoulderY + 12} Z`}
              fill={skinShadow}
              stroke="#090a0c"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <rect
              x={backShoulderX + 14 + backArmStretch}
              y={backShoulderY + 2}
              width="21"
              height="18"
              rx="6"
              fill={wrap}
              stroke="#090a0c"
              strokeWidth="2.6"
            />
          </g>

          {/* Front Leg (anchored at hip 114, 154) */}
          <g transform={`rotate(${frontLegAngle}, 114, 154)`}>
            <path
              d="M 104 152 L 122 198 L 128 240 L 146 240 L 140 198 C 136 178, 130 162, 122 152 Z"
              fill={skin}
              stroke="#090a0c"
              strokeWidth="3.2"
              strokeLinejoin="round"
            />
            <rect x="125" y="219" width="17" height="14" rx="3" fill={wrap} stroke="#090a0c" strokeWidth="2.2" />
          </g>

          {/* Lethwei Shorts & Traditional Waist Sash (Image 1 Style) */}
          <path
            d={`M ${100 - waistW} 130 L ${100 + waistW} 130 L ${100 + waistW + 12} 170 L 103 166 L 97 166 L ${100 - waistW - 10} 170 Z`}
            fill={shorts}
            stroke="#090a0c"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          {/* Traditional Red/Blue Waist Sash + Hanging Ties */}
          <rect
            x={100 - waistW - 1}
            y="126"
            width={waistW * 2 + 2}
            height="12"
            rx="3"
            fill={facing === 'left' ? '#1d4ed8' : '#dc2626'}
            stroke="#090a0c"
            strokeWidth="2.5"
          />
          <path
            d={`M ${100 - waistW + 4} 138 L ${100 - waistW - 6} 158 L ${100 - waistW + 4} 156 Z`}
            fill={facing === 'left' ? '#1d4ed8' : '#dc2626'}
            stroke="#090a0c"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path d={`M ${100 - waistW - 4} 162 L ${100 - 4} 160`} stroke={shortsShadow} strokeWidth="3" />

          {/* Muscular Curved Torso with Traps */}
          <path
            d={`M 88 68 Q ${100 - shoulderW} 72 ${100 - shoulderW - 4} 84 L ${100 - waistW} 130 L ${100 + waistW} 130 L ${100 + shoulderW + 4} 84 Q ${100 + shoulderW} 72 112 68 Z`}
            fill={skin}
            stroke="#090a0c"
            strokeWidth="3.4"
            strokeLinejoin="round"
          />
          <path
            d={`M ${100 - shoulderW + 8} 94 Q 100 102 ${100 + shoulderW - 8} 94`}
            fill="none"
            stroke="#090a0c"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path d="M 100 84 L 100 122" stroke="#090a0c" strokeWidth="2" opacity="0.65" />

          {/* Head */}
          <g transform={`rotate(${headAngle}, 100, 62)`}>
            <rect x="92" y="58" width="16" height="16" fill={skinShadow} stroke="#090a0c" strokeWidth="2.8" />
            <path
              d="M 83 34 C 83 18, 117 18, 117 34 L 117 52 C 117 65, 108 71, 100 71 C 92 71, 83 65, 83 52 Z"
              fill={skin}
              stroke="#090a0c"
              strokeWidth="3.2"
            />
            {appearance.hairstyle !== 'Shaved' && (
              <path
                d={
                  appearance.hairstyle === 'Mohawk'
                    ? 'M 94 32 L 92 12 L 105 14 L 105 32 Z'
                    : appearance.hairstyle === 'Topknot'
                    ? 'M 83 34 C 83 20, 117 20, 117 34 L 106 30 L 102 15 L 94 16 L 94 30 Z'
                    : 'M 83 35 C 83 19, 117 19, 117 35 C 107 30, 93 30, 83 35 Z'
                }
                fill={hair}
                stroke="#090a0c"
                strokeWidth="2.4"
              />
            )}
            {isChampion && (
              <rect x="82" y="33" width="36" height="5" fill="#eab308" stroke="#090a0c" strokeWidth="1.5" />
            )}
            <path d="M 96 42 L 112 44" stroke="#090a0c" strokeWidth="2.8" strokeLinecap="round" />
            <circle cx="107" cy="48" r="2.2" fill="#090a0c" />
            <path d="M 101 59 L 111 59" stroke="#090a0c" strokeWidth="2.2" strokeLinecap="round" />
            {hasCut && (
              <path d="M 108 38 L 114 48" stroke="#dc2626" strokeWidth="2.8" strokeLinecap="round" />
            )}
          </g>

          {/* Front Lead Arm (anchored cleanly at frontShoulderX, frontShoulderY) */}
          <g transform={`rotate(${frontArmAngle}, ${frontShoulderX}, ${frontShoulderY})`}>
            <circle cx={frontShoulderX} cy={frontShoulderY} r="10.5" fill={skin} stroke="#090a0c" strokeWidth="3" />
            <path
              d={`M ${frontShoulderX - 5} ${frontShoulderY + 4} L ${frontShoulderX + 4} ${frontShoulderY + 26} L ${frontShoulderX + 26 + frontArmStretch} ${frontShoulderY + 18} L ${frontShoulderX + 24 + frontArmStretch} ${frontShoulderY + 4} L ${frontShoulderX + 6} ${frontShoulderY + 12} Z`}
              fill={skin}
              stroke="#090a0c"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <rect
              x={frontShoulderX + 20 + frontArmStretch}
              y={frontShoulderY - 1}
              width="23"
              height="19"
              rx="6"
              fill={wrap}
              stroke="#090a0c"
              strokeWidth="2.8"
            />
            <path
              d={`M ${frontShoulderX + 24 + frontArmStretch} ${frontShoulderY + 5} L ${frontShoulderX + 39 + frontArmStretch} ${frontShoulderY + 5} M ${frontShoulderX + 24 + frontArmStretch} ${frontShoulderY + 12} L ${frontShoulderX + 39 + frontArmStretch} ${frontShoulderY + 12}`}
              stroke="#090a0c"
              strokeWidth="1.6"
              opacity="0.55"
            />
          </g>
        </g>
      </g>
    </svg>
  );
};
