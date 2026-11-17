import React, { useId } from 'react';
import { CombatPosition, FighterAppearance, FighterPose, Gender } from '../types/game';

interface FighterAvatarProps {
  appearance: FighterAppearance;
  gender: Gender;
  pose?: FighterPose;
  position?: CombatPosition;
  isRhythm?: boolean;
  facing?: 'right' | 'left';
  mode?: 'portrait' | 'fullbody';
  hasCut?: boolean;
  isChampion?: boolean;
  animKey?: string | number;
  className?: string;
}

function darkenHex(hex: string, amount = 0.24): string {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  if (Number.isNaN(num)) return '#7c5238';
  const r = Math.max(0, Math.floor(((num >> 16) & 255) * (1 - amount)));
  const g = Math.max(0, Math.floor(((num >> 8) & 255) * (1 - amount)));
  const b = Math.max(0, Math.floor((num & 255) * (1 - amount)));
  return `rgb(${r}, ${g}, ${b})`;
}

function lightenHex(hex: string, amount = 0.18): string {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  if (Number.isNaN(num)) return '#e2b48d';
  const r = Math.min(255, Math.floor(((num >> 16) & 255) + (255 - ((num >> 16) & 255)) * amount));
  const g = Math.min(255, Math.floor(((num >> 8) & 255) + (255 - ((num >> 8) & 255)) * amount));
  const b = Math.min(255, Math.floor((num & 255) + (255 - (num & 255)) * amount));
  return `rgb(${r}, ${g}, ${b})`;
}

interface JointClasses {
  body: string;
  head: string;
  frontArm: string;
  frontFore: string;
  backArm: string;
  backFore: string;
  frontLeg: string;
  frontShin: string;
  backLeg: string;
  backShin: string;
}

function getJointClasses(
  pose: FighterPose,
  isRhythm: boolean,
  facing: 'right' | 'left'
): JointClasses {
  const empty: JointClasses = {
    body: '',
    head: '',
    frontArm: '',
    frontFore: '',
    backArm: '',
    backFore: '',
    frontLeg: '',
    frontShin: '',
    backLeg: '',
    backShin: '',
  };

  if (pose === 'idle') {
    if (!isRhythm) return empty;
    return {
      body: facing === 'left' ? 'anim-rhythm-body-alt' : 'anim-rhythm-body',
      head: 'anim-rhythm-head',
      frontArm: 'anim-rhythm-arm-lead',
      frontFore: 'anim-rhythm-fore-lead',
      backArm: 'anim-rhythm-arm-rear',
      backFore: 'anim-rhythm-fore-lead',
      frontLeg: 'anim-rhythm-leg-front',
      frontShin: 'anim-rhythm-shin-front',
      backLeg: 'anim-rhythm-leg-back',
      backShin: '',
    };
  }

  switch (pose) {
    case 'jab':
      return {
        ...empty,
        body: 'anim-body-jab',
        frontArm: 'anim-arm-jab-lead',
        frontFore: 'anim-fore-jab-lead',
        frontLeg: 'anim-leg-lunge',
        frontShin: 'anim-shin-lunge',
        backLeg: 'anim-leg-drive',
      };
    case 'hook':
      return {
        ...empty,
        body: 'anim-body-hook',
        backArm: 'anim-arm-hook-rear',
        backFore: 'anim-fore-hook-rear',
        frontLeg: 'anim-leg-lunge',
        frontShin: 'anim-shin-lunge',
        backLeg: 'anim-leg-drive',
      };
    case 'elbow':
      return {
        ...empty,
        body: 'anim-body-elbow',
        frontArm: 'anim-arm-elbow-lead',
        frontFore: 'anim-fore-elbow-lead',
        frontLeg: 'anim-leg-lunge',
        frontShin: 'anim-shin-lunge',
        backLeg: 'anim-leg-drive',
      };
    case 'headbutt':
      return {
        ...empty,
        body: 'anim-body-headbutt',
        head: 'anim-head-butt',
        frontLeg: 'anim-leg-lunge',
        frontShin: 'anim-shin-lunge',
        backLeg: 'anim-leg-drive',
      };
    case 'kick':
      return {
        ...empty,
        body: 'anim-body-kick',
        head: 'anim-head-balance',
        frontArm: 'anim-arm-block',
        backArm: 'anim-arm-hit',
        frontLeg: 'anim-leg-kick',
        frontShin: 'anim-shin-kick',
        backLeg: 'anim-leg-drive',
      };
    case 'knee':
      return {
        ...empty,
        body: 'anim-body-knee',
        frontArm: 'anim-arm-jab-lead',
        backArm: 'anim-arm-block',
        frontLeg: 'anim-leg-knee',
        frontShin: 'anim-shin-knee',
      };
    case 'slam':
      return {
        ...empty,
        body: 'anim-body-headbutt',
        frontArm: 'anim-arm-jab-lead',
        frontFore: 'anim-fore-jab-lead',
        backArm: 'anim-arm-hook-rear',
        backFore: 'anim-fore-hook-rear',
        frontLeg: 'anim-leg-lunge',
        frontShin: 'anim-shin-lunge',
        backLeg: 'anim-leg-drive',
      };
    case 'block':
    case 'catchkick':
      return {
        ...empty,
        body: 'anim-body-block',
        head: 'anim-head-tuck',
        frontArm: 'anim-arm-block',
        frontFore: 'anim-fore-block',
        backArm: 'anim-arm-block',
        backFore: 'anim-fore-block',
        frontLeg: 'anim-leg-lunge',
        backLeg: 'anim-leg-drive',
      };
    case 'parry':
      return {
        ...empty,
        body: 'anim-body-block',
        head: 'anim-head-tuck',
        frontArm: 'anim-arm-jab-lead',
        frontFore: 'anim-fore-jab-lead',
        backArm: 'anim-arm-block',
        backFore: 'anim-fore-block',
        frontLeg: 'anim-leg-lunge',
      };
    case 'evade':
      return {
        ...empty,
        body: 'anim-body-evade',
        head: 'anim-head-evade',
        frontArm: 'anim-arm-block',
        backArm: 'anim-arm-block',
        frontLeg: 'anim-leg-bend',
        frontShin: 'anim-shin-bend',
        backLeg: 'anim-leg-bend',
        backShin: 'anim-shin-bend',
      };
    case 'takedown':
      return {
        ...empty,
        body: 'anim-body-takedown',
        head: 'anim-head-tuck',
        frontArm: 'anim-arm-jab-lead',
        frontFore: 'anim-fore-jab-lead',
        backArm: 'anim-arm-hook-rear',
        backFore: 'anim-fore-hook-rear',
        frontLeg: 'anim-leg-bend',
        frontShin: 'anim-shin-bend',
        backLeg: 'anim-leg-drive',
      };
    case 'groundpound':
      return {
        ...empty,
        body: 'anim-body-groundpound',
        head: 'anim-head-tuck',
        frontArm: 'anim-arm-elbow-lead',
        frontFore: 'anim-fore-jab-lead',
        backArm: 'anim-arm-hook-rear',
        backFore: 'anim-fore-hook-rear',
        frontLeg: 'anim-leg-bend',
        frontShin: 'anim-shin-bend',
        backLeg: 'anim-leg-bend',
      };
    case 'submission':
      return {
        ...empty,
        body: 'anim-body-submission',
        head: 'anim-head-tuck',
        frontArm: 'anim-arm-block',
        frontFore: 'anim-fore-block',
        backArm: 'anim-arm-hook-rear',
        backFore: 'anim-fore-hook-rear',
        frontLeg: 'anim-leg-bend',
        backLeg: 'anim-leg-bend',
      };
    case 'escape':
      return {
        ...empty,
        body: 'anim-body-evade',
        head: 'anim-head-evade',
        frontArm: 'anim-arm-jab-lead',
        backArm: 'anim-arm-block',
        frontLeg: 'anim-leg-lunge',
        backLeg: 'anim-leg-drive',
      };
    case 'hit':
      return {
        ...empty,
        body: 'anim-body-hit',
        head: 'anim-head-hit',
        frontArm: 'anim-arm-hit',
        backArm: 'anim-arm-hit',
        frontLeg: 'anim-leg-bend',
      };
    case 'ko':
      return {
        ...empty,
        body: 'anim-body-ko',
        head: 'anim-head-hit',
        frontArm: 'anim-arm-hit',
        backArm: 'anim-arm-hit',
      };
    case 'victory':
      return {
        ...empty,
        body: 'anim-rhythm-body',
      };
    default:
      return empty;
  }
}

export const FighterAvatar: React.FC<FighterAvatarProps> = ({
  appearance,
  gender,
  pose = 'idle',
  position = 'Standing',
  isRhythm = false,
  facing = 'right',
  mode = 'portrait',
  hasCut = false,
  isChampion = false,
  animKey,
  className = '',
}) => {
  const uid = useId().replace(/:/g, '');
  const skinGradId = `sk_${uid}`;
  const skinRearGradId = `skr_${uid}`;
  const bgGradId = `bg_${uid}`;
  const shortsGradId = `sh_${uid}`;
  const hatchId = `ht_${uid}`;

  const skin = appearance.skinTone;
  const skinShadow = darkenHex(skin, 0.28);
  const skinDeepShadow = darkenHex(skin, 0.42);
  const skinHighlight = lightenHex(skin, 0.22);
  const hair = appearance.hairColor;
  const hairHighlight = lightenHex(hair, 0.22);
  const shorts = appearance.shortsColor;
  const shortsShadow = darkenHex(shorts, 0.36);
  const wrap = appearance.wrapColor;
  const wrapShadow = darkenHex(wrap, 0.24);
  const sashColor = facing === 'left' ? '#1d4ed8' : '#dc2626';
  const sashShadow = darkenHex(sashColor, 0.3);

  const torsoScaleX =
    appearance.build === 'Heavy' ? 1.15 : appearance.build === 'Lean' ? 0.9 : 1.02;
  const shoulderW = (gender === 'Male' ? 32 : 26) * torsoScaleX;
  const waistW = (gender === 'Male' ? 21 : 17) * torsoScaleX;

  const renderPortraitHair = () => {
    switch (appearance.hairstyle) {
      case 'Buzz':
        return (
          <g>
            <path
              d="M 79 44 C 79 25, 119 25, 119 44 L 116 49 C 106 43, 92 43, 82 49 Z"
              fill={hair}
              stroke="#090a0c"
              strokeWidth="2.5"
            />
            <path d="M 88 33 Q 100 29 112 33" stroke={hairHighlight} strokeWidth="1.5" fill="none" opacity="0.5" />
          </g>
        );
      case 'Topknot':
        return (
          <g>
            <path
              d="M 79 44 C 79 26, 119 26, 119 44 L 116 49 C 106 43, 92 43, 82 49 Z"
              fill={hair}
              stroke="#090a0c"
              strokeWidth="2.5"
            />
            <path
              d="M 91 28 C 87 12, 109 10, 107 28 Z"
              fill={hair}
              stroke="#090a0c"
              strokeWidth="2.5"
            />
            <rect x="92" y="25" width="13" height="4.5" rx="1" fill="#eab308" stroke="#090a0c" strokeWidth="1.6" />
          </g>
        );
      case 'Mohawk':
        return (
          <path
            d="M 91 45 L 87 15 L 100 10 L 112 19 L 107 45 Z"
            fill={hair}
            stroke="#090a0c"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        );
      case 'Undercut':
        return (
          <g>
            <path
              d="M 78 44 C 77 22, 123 20, 121 44 C 110 38, 92 38, 82 47 Z"
              fill={hair}
              stroke="#090a0c"
              strokeWidth="2.5"
            />
            <path d="M 86 30 Q 104 26 116 32" stroke={hairHighlight} strokeWidth="1.8" fill="none" opacity="0.55" />
          </g>
        );
      case 'LongTied':
        return (
          <g>
            <path
              d="M 78 44 C 77 25, 121 25, 120 44 C 108 39, 92 39, 81 47 Z"
              fill={hair}
              stroke="#090a0c"
              strokeWidth="2.5"
            />
            <path
              d="M 80 44 C 68 50, 66 70, 75 76 C 82 67, 84 55, 84 48 Z"
              fill={hair}
              stroke="#090a0c"
              strokeWidth="2.5"
            />
          </g>
        );
      case 'Shaved':
      default:
        return (
          <path d="M 87 34 Q 100 29 112 34" stroke={skinHighlight} strokeWidth="2.2" fill="none" opacity="0.5" />
        );
    }
  };

  if (mode === 'portrait') {
    return (
      <svg viewBox="0 0 200 180" className={`select-none ${className}`} aria-hidden="true">
        <defs>
          <radialGradient id={bgGradId} cx="50%" cy="38%" r="70%">
            <stop offset="0%" stopColor="#2c313d" />
            <stop offset="65%" stopColor="#171920" />
            <stop offset="100%" stopColor="#0a0b0f" />
          </radialGradient>
          <linearGradient id={skinGradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={skinHighlight} />
            <stop offset="45%" stopColor={skin} />
            <stop offset="100%" stopColor={skinShadow} />
          </linearGradient>
          <pattern id={hatchId} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <line x1="0" y1="0" x2="0" y2="5" stroke="#090a0c" strokeWidth="1.2" />
          </pattern>
        </defs>

        <rect x="0" y="0" width="200" height="180" fill={`url(#${bgGradId})`} />
        {/* Dramatic Comic Speed Stripes */}
        <path d="M 0 180 L 52 10 L 92 10 L 40 180 Z" fill={shorts} opacity="0.28" />
        <path d="M 110 180 L 160 0 L 195 0 L 145 180 Z" fill={shorts} opacity="0.18" />
        <circle cx="100" cy="74" r="68" fill={sashColor} opacity="0.09" />

        <g transform={facing === 'left' ? 'translate(200, 0) scale(-1, 1)' : undefined}>
          {/* Sculpted Trapezius & Muscular Shoulders */}
          <path
            d={`M ${100 - shoulderW - 24} 180 L ${100 - shoulderW - 14} 133 C ${100 - shoulderW - 10} 113, ${100 - 20} 109, 100 109 C ${100 + 20} 109, ${100 + shoulderW + 10} 113, ${100 + shoulderW + 14} 133 L ${100 + shoulderW + 24} 180 Z`}
            fill={`url(#${skinGradId})`}
            stroke="#090a0c"
            strokeWidth="3.4"
            strokeLinejoin="round"
          />
          {/* Shoulder Ink Cross-Hatching + Collarbones + Pecs */}
          <path
            d={`M ${100 - shoulderW - 15} 134 L ${100 - shoulderW - 22} 180 L ${100 - 12} 180 L ${100 - 16} 114 Z`}
            fill={`url(#${hatchId})`}
            opacity="0.3"
          />
          <path
            d={`M ${100 - shoulderW + 6} 122 Q ${100 - 14} 129 100 125 Q ${100 + 14} 129 ${100 + shoulderW - 6} 122`}
            fill="none"
            stroke="#090a0c"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d={`M ${100 - shoulderW} 148 Q 100 162 ${100 + shoulderW} 148`}
            fill="none"
            stroke="#090a0c"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path d="M 100 132 L 100 172" stroke="#090a0c" strokeWidth="2.4" strokeLinecap="round" />

          {/* Muscular Neck with Sternocleidomastoid Tendon Shading */}
          <path d="M 85 92 L 82 119 L 118 119 L 113 92 Z" fill={skinShadow} stroke="#090a0c" strokeWidth="3" />
          <path d="M 90 96 L 98 117 M 110 96 L 104 117" stroke="#090a0c" strokeWidth="1.8" opacity="0.6" />

          {/* Detailed Comic Head & Chiseled Jawline */}
          <path
            d="M 79 48 C 79 28, 118 28, 119 49 L 120 67 C 120 82, 113 98, 102 103 C 94 106, 84 99, 80 86 L 78 68 Z"
            fill={`url(#${skinGradId})`}
            stroke="#090a0c"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          {/* Deep Cheekbone, Temple & Jaw Shadow + Cross-Hatching */}
          <path d="M 80 62 L 80 85 C 84 95, 93 102, 100 103 L 94 74 Q 87 68 80 62 Z" fill={skinShadow} opacity="0.72" />
          <path d="M 81 74 L 88 96 L 97 101 L 87 73 Z" fill={`url(#${hatchId})`} opacity="0.34" />
          <path d="M 118 68 Q 112 78 106 81" fill="none" stroke={skinDeepShadow} strokeWidth="1.8" opacity="0.72" />
          <path d="M 114 54 Q 119 60 116 67" fill="none" stroke={skinDeepShadow} strokeWidth="1.5" opacity="0.5" />
          {/* Detailed Sculpted Ear */}
          <path d="M 79 61 C 72 60, 71 75, 79 77 Z" fill={skinShadow} stroke="#090a0c" strokeWidth="2.3" strokeLinejoin="round" />
          <path d="M 76.5 65 Q 78.5 69 75.5 73" fill="none" stroke="#090a0c" strokeWidth="1.4" />

          {renderPortraitHair()}

          {isChampion && (
            <path
              d="M 77 46 Q 100 40 121 46 L 121 52 Q 100 46 77 52 Z"
              fill="#eab308"
              stroke="#090a0c"
              strokeWidth="2"
            />
          )}

          {/* Expressive Comic Eyes, Heavy Furrowed Brows, Sculpted Nose & Mouth */}
          <path d="M 86 55 Q 93 57 99 60.5" fill="none" stroke="#090a0c" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M 105 60.5 Q 111 57 118 55" fill="none" stroke="#090a0c" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M 88 64 Q 93.5 61 98 64.5 Q 93.5 67.5 88 64 Z" fill="#f8fafc" stroke="#090a0c" strokeWidth="1.4" />
          <circle cx="94" cy="64.5" r="2.2" fill="#090a0c" />
          <circle cx="94.7" cy="63.8" r="0.7" fill="#ffffff" />
          <path d="M 106 64.5 Q 111 61 116 64 Q 111 67.5 106 64.5 Z" fill="#f8fafc" stroke="#090a0c" strokeWidth="1.4" />
          <circle cx="110.5" cy="64.5" r="2.2" fill="#090a0c" />
          <circle cx="111.2" cy="63.8" r="0.7" fill="#ffffff" />
          {/* Sculpted Nose Bridge & Nostril */}
          <path d="M 101 63 L 106.5 74.5 Q 104 78.5 99 77.5" fill="none" stroke="#090a0c" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 97.5 76.5 Q 100 79 102.5 78" fill="none" stroke="#090a0c" strokeWidth="1.4" />
          {/* Grim Fighter Mouth & Chin */}
          <path d="M 93 86.5 Q 102 84.2 110.5 87.5" fill="none" stroke="#090a0c" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M 98 93.5 Q 102 95 106 93.5" fill="none" stroke="#090a0c" strokeWidth="1.5" opacity="0.65" />

          {hasCut && (
            <g>
              <path d="M 107 52 L 116 62" stroke="#dc2626" strokeWidth="3.2" strokeLinecap="round" />
              <path d="M 111 60 L 112 73" stroke="#b91c1c" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="112" cy="76" r="1.6" fill="#dc2626" />
            </g>
          )}

          {/* Raised Bandaged Guard Fist (with Finger Knuckles & Wrap Ridges) */}
          <g transform="translate(122, 96) rotate(-14)">
            <path d="M 1 18 C -2 40, 2 62, 6 78 L 22 76 C 24 58, 24 38, 22 18 Z" fill={`url(#${skinGradId})`} stroke="#090a0c" strokeWidth="2.8" />
            <path d="M 7 32 L 11 56" stroke="#090a0c" strokeWidth="1.5" opacity="0.55" />
            <rect x="-2" y="0" width="27" height="28" rx="7" fill={wrap} stroke="#090a0c" strokeWidth="2.8" />
            <path d="M -1 9 L 24 9 M -1 16 L 24 16 M -1 22 L 24 22" stroke="#090a0c" strokeWidth="1.6" opacity="0.55" />
            <path d="M 5 0 L 5 8 M 12 0 L 12 8 M 18 0 L 18 8" stroke="#090a0c" strokeWidth="1.4" opacity="0.45" />
          </g>
        </g>
      </svg>
    );
  }

  // ================= FULLBODY COMIC-NOVEL ARTICULATED FIGHTER =================
  const heightScale = 0.94 + ((appearance.heightCm - 165) / 30) * 0.12;
  const joints = getJointClasses(pose, isRhythm, facing);
  const activeKey = pose === 'idle' ? 'idle' : String(animKey ?? pose);

  const backShoulderX = -shoulderW * 0.56;
  const frontShoulderX = shoulderW * 0.62;
  const shoulderY = -62;
  const isVictory = pose === 'victory';

  return (
    <svg viewBox="0 0 240 260" className={`select-none overflow-visible ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={skinGradId} x1="0.15" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor={skinHighlight} />
          <stop offset="48%" stopColor={skin} />
          <stop offset="100%" stopColor={skinShadow} />
        </linearGradient>
        <linearGradient id={skinRearGradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={skin} />
          <stop offset="60%" stopColor={skinShadow} />
          <stop offset="100%" stopColor={skinDeepShadow} />
        </linearGradient>
        <linearGradient id={shortsGradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={shorts} />
          <stop offset="100%" stopColor={shortsShadow} />
        </linearGradient>
        <pattern id={hatchId} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <line x1="0" y1="0" x2="0" y2="5" stroke="#090a0c" strokeWidth="1.15" />
        </pattern>
      </defs>

      <g
        transform={`${
          facing === 'left' ? 'translate(240, 0) scale(-1, 1) ' : ''
        }translate(0, ${250 * (1 - heightScale)}) scale(1, ${heightScale})`}
      >
        {/* Crisp Comic Cast Shadow on Mat */}
        <ellipse cx="108" cy="245" rx="64" ry="11" fill="#06070a" opacity="0.7" />
        <polygon points="74,244 138,244 14,262 -18,258" fill="#06070a" opacity="0.36" />

        {/* Pelvis / Center of Mass Anchor (108, 150) — drops into crouched/ground posture when in Ground */}
        <g
          transform={
            position === 'Ground'
              ? 'translate(108, 178) rotate(10)'
              : position === 'Clinch'
              ? 'translate(114, 152)'
              : 'translate(108, 150)'
          }
        >
          <g key={activeKey} className={joints.body} style={{ transformOrigin: '0px 0px' }}>
            {/* 1. BACK LEG */}
            <g transform="translate(-14, 6)">
              <g className={joints.backLeg} style={{ transformOrigin: '0px 0px' }}>
                <path
                  d="M -12 -6 C -19 14, -24 28, -26 42 L -11 43 C -4 28, 2 14, 6 -4 Z"
                  fill={`url(#${skinRearGradId})`}
                />
                <path
                  d="M -12 -6 C -19 14, -24 28, -26 42 M 6 -4 C 2 14, -4 28, -11 43"
                  fill="none"
                  stroke="#090a0c"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
                <path d="M -17 12 L -20 30" stroke="#090a0c" strokeWidth="1.3" opacity="0.45" />

                {/* Back Knee Pivot (-18, 42) */}
                <g transform="translate(-18, 42)">
                  <g className={joints.backShin} style={{ transformOrigin: '0px 0px' }}>
                    <circle cx="0" cy="0" r="7.5" fill={skinShadow} />
                    <path
                      d="M -8 -2 C -15 14, -15 28, -12 42 L 0 42 C 4 28, 7 14, 7 -1 Z"
                      fill={`url(#${skinRearGradId})`}
                    />
                    <path
                      d="M -8 -2 C -15 14, -15 28, -12 42 M 7 -1 C 7 14, 4 28, 0 42"
                      fill="none"
                      stroke="#090a0c"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                    />
                    <path d="M -5 5 Q -2 10 2 8" fill="none" stroke="#090a0c" strokeWidth="1.6" strokeLinecap="round" opacity="0.65" />
                    <rect x="-13" y="29" width="14" height="10" rx="2" fill={wrapShadow} stroke="#090a0c" strokeWidth="2.1" />
                    <path d="M -12 34 L 0 34" stroke="#090a0c" strokeWidth="1.2" opacity="0.5" />
                    <path
                      d="M -13 40 L -16 46 L 8 46 C 9 42, 3 40, -1 40 Z"
                      fill={skinShadow}
                      stroke="#090a0c"
                      strokeWidth="2.6"
                      strokeLinejoin="round"
                    />
                  </g>
                </g>
              </g>
            </g>

            {/* 2. BACK ARM */}
            <g transform={`translate(${backShoulderX}, ${shoulderY})`}>
              <g
                transform={isVictory ? 'rotate(-122)' : undefined}
                className={joints.backArm}
                style={{ transformOrigin: '0px 0px' }}
              >
                <path
                  d="M -6 -6 C -9 6, -3 18, 6 24 L 15 18 C 12 8, 9 0, 5 -6 Z"
                  fill={`url(#${skinRearGradId})`}
                />
                <path
                  d="M -6 -6 C -9 6, -3 18, 6 24 M 15 18 C 12 8, 9 0, 5 -6"
                  fill="none"
                  stroke="#090a0c"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                />

                <g transform="translate(10, 20)">
                  <g className={joints.backFore} style={{ transformOrigin: '0px 0px' }}>
                    <circle cx="0" cy="0" r="5" fill={skinShadow} />
                    <path d="M -5 1 L 24 -22 L 32 -14 L 4 7 Z" fill={`url(#${skinRearGradId})`} />
                    <path
                      d="M -5 1 L 24 -22 M 4 7 L 32 -14"
                      fill="none"
                      stroke="#090a0c"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                    />
                    <g transform="translate(26, -26) rotate(-22)">
                      <rect x="0" y="0" width="19" height="15.5" rx="5" fill={wrapShadow} stroke="#090a0c" strokeWidth="2.4" />
                      <path d="M 3 5 L 16 5 M 3 10.5 L 16 10.5" stroke="#090a0c" strokeWidth="1.4" opacity="0.65" />
                    </g>
                  </g>
                </g>
              </g>
            </g>

            {/* 3. FRONT LEG */}
            <g transform="translate(11, 8)">
              <g className={joints.frontLeg} style={{ transformOrigin: '0px 0px' }}>
                <path
                  d="M -9 -6 C -2 12, 8 28, 17 42 L 30 38 C 25 20, 18 4, 11 -7 Z"
                  fill={`url(#${skinGradId})`}
                />
                <path
                  d="M -9 -6 C -2 12, 8 28, 17 42 M 11 -7 C 18 4, 25 20, 30 38"
                  fill="none"
                  stroke="#090a0c"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
                {/* Muscular Quad Striations + Traditional Sak Yant Thigh Tattoo */}
                <path d="M 11 8 Q 17 19 22 32" fill="none" stroke="#090a0c" strokeWidth="1.6" opacity="0.52" />
                <path d="M 6 16 L 14 14 M 8 21 L 16 19 M 10 26 L 17 24" stroke="#090a0c" strokeWidth="1.2" opacity="0.4" />

                {/* Front Knee Pivot (23, 39) */}
                <g transform="translate(23, 39)">
                  <g className={joints.frontShin} style={{ transformOrigin: '0px 0px' }}>
                    <circle cx="0" cy="0" r="7.5" fill={skin} />
                    <path
                      d="M -7 -1 C -9 14, -6 28, -3 41 L 8 41 C 10 27, 9 13, 6 -2 Z"
                      fill={`url(#${skinGradId})`}
                    />
                    <path
                      d="M -7 -1 C -9 14, -6 28, -3 41 M 6 -2 C 9 13, 10 27, 8 41"
                      fill="none"
                      stroke="#090a0c"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                    />
                    <path d="M -2 3 Q 2 7 4 4" fill="none" stroke="#090a0c" strokeWidth="1.7" strokeLinecap="round" opacity="0.6" />
                    <path d="M -2 14 Q -3 24 0 32" fill="none" stroke="#090a0c" strokeWidth="1.6" opacity="0.5" />
                    <rect x="-4" y="29" width="13.5" height="10" rx="2" fill={wrap} stroke="#090a0c" strokeWidth="2.1" />
                    <path d="M -3 34 L 8.5 34" stroke="#090a0c" strokeWidth="1.2" opacity="0.5" />
                    <path
                      d="M -4 40 L -5 47 L 19 47 C 20 43, 13 40, 7 40 Z"
                      fill={skin}
                      stroke="#090a0c"
                      strokeWidth="2.6"
                      strokeLinejoin="round"
                    />
                  </g>
                </g>
              </g>
            </g>

            {/* 4. LETHWEI SHORTS & TRADITIONAL WAIST SASH */}
            <path
              d={`M ${-waistW - 1} -18 L ${waistW + 2} -18 L ${waistW + 13} 22 L 5 19 L 0 13 L -5 19 L ${-waistW - 12} 22 Z`}
              fill={`url(#${shortsGradId})`}
              stroke="#090a0c"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path d={`M ${-waistW - 6} 14 L -6 12 M 6 12 L ${waistW + 6} 14`} stroke={shortsShadow} strokeWidth="2.8" strokeLinecap="round" />
            <path d={`M ${-waistW + 2} -14 L ${-waistW - 4} 12 M ${waistW - 4} -14 L ${waistW + 6} 14`} stroke="#090a0c" strokeWidth="1.4" opacity="0.5" />
            <rect
              x={-waistW - 2}
              y="-22"
              width={waistW * 2 + 5}
              height="10"
              rx="3"
              fill={sashColor}
              stroke="#090a0c"
              strokeWidth="2.4"
            />
            <path
              d={`M ${-waistW + 4} -12 L ${-waistW - 9} 8 L ${-waistW} 8 Z M ${-waistW + 9} -12 L ${-waistW + 1} 11 L ${-waistW + 10} 9 Z`}
              fill={sashColor}
              stroke="#090a0c"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <rect x={-waistW + 2} y="-22" width="7" height="10" rx="2" fill={sashShadow} stroke="#090a0c" strokeWidth="1.8" />

            {/* 5. SCULPTED COMIC TORSO WITH HATCHED DEPTH */}
            <path
              d={`M -11 -78 Q ${-shoulderW * 0.85} -75 ${-shoulderW} -60 L ${-waistW} -20 L ${waistW} -20 L ${shoulderW} -60 Q ${shoulderW * 0.85} -75 11 -78 Z`}
              fill={`url(#${skinGradId})`}
              stroke="#090a0c"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Comic Lat/Oblique Shadow & Cross-Hatching */}
            <path
              d={`M -11 -76 Q ${-shoulderW * 0.8} -73 ${-shoulderW + 2} -60 L ${-waistW + 2} -21 L -3 -21 L -4 -66 Z`}
              fill={skinShadow}
              opacity="0.52"
            />
            <path
              d={`M ${-shoulderW + 4} -58 L ${-waistW + 4} -23 L -10 -23 L -12 -58 Z`}
              fill={`url(#${hatchId})`}
              opacity="0.28"
            />
            <path
              d={`M 3 -64 Q ${shoulderW * 0.6} -64 ${shoulderW - 6} -56 Q ${shoulderW * 0.55} -46 3 -48 Z`}
              fill={skinHighlight}
              opacity="0.38"
            />
            {/* Pectorals, Collarbone, Serratus Ribs & Six-Pack Linework */}
            <path
              d={`M ${-shoulderW + 8} -54 Q -4 -47 2 -52 Q ${shoulderW * 0.65} -48 ${shoulderW - 7} -55`}
              fill="none"
              stroke="#090a0c"
              strokeWidth="2.3"
              strokeLinecap="round"
            />
            <path d="M 1 -62 L 1 -24" stroke="#090a0c" strokeWidth="1.8" opacity="0.62" />
            <path d="M -7 -42 Q 1 -40 9 -42 M -6 -34 Q 1 -32 8 -34 M -5 -26 Q 1 -25 7 -26" fill="none" stroke="#090a0c" strokeWidth="1.6" opacity="0.58" />
            <path d={`M ${-shoulderW + 10} -43 L ${-shoulderW + 15} -41 M ${-shoulderW + 11} -37 L ${-shoulderW + 16} -35`} stroke="#090a0c" strokeWidth="1.3" opacity="0.45" />
            {/* Traditional Burmese Yant Chest Script */}
            <g stroke="#090a0c" strokeWidth="1.15" opacity="0.4" fill="none">
              <path d="M -10 -59 L 11 -59 M -8 -56 L 9 -56" />
              <circle cx="1" cy="-37" r="6" strokeDasharray="2 2" />
            </g>

            {/* 6. DETAILED COMIC HEAD & NECK */}
            <g transform="translate(2, -76)">
              <g className={joints.head} style={{ transformOrigin: '0px 0px' }}>
                <path d="M -9 4 L -7 -14 L 8 -14 L 10 4 Z" fill={skinShadow} stroke="#090a0c" strokeWidth="2.5" />
                <path d="M -4 -10 L 1 2" stroke="#090a0c" strokeWidth="1.4" opacity="0.55" />
                <path
                  d="M -14 -33 C -14 -48, 17 -48, 17 -33 L 18 -21 C 18 -11, 13 -3, 4 -1 C -4 0, -12 -5, -14 -16 Z"
                  fill={`url(#${skinGradId})`}
                  stroke="#090a0c"
                  strokeWidth="2.8"
                  strokeLinejoin="round"
                />
                <path d="M -13 -22 L -13 -12 C -10 -6, -4 -2, 2 -2 L -3 -20 Z" fill={skinShadow} opacity="0.68" />
                <path d="M -12 -18 L -5 -3 L -11 -8 Z" fill={`url(#${hatchId})`} opacity="0.32" />
                <path d="M -13 -25 C -18 -26, -18 -15, -13 -15 Z" fill={skinShadow} stroke="#090a0c" strokeWidth="2" strokeLinejoin="round" />

                {appearance.hairstyle !== 'Shaved' && (
                  <path
                    d={
                      appearance.hairstyle === 'Mohawk'
                        ? 'M -6 -36 L -8 -55 L 5 -52 L 5 -36 Z'
                        : appearance.hairstyle === 'Topknot'
                        ? 'M -14 -34 C -14 -46, 17 -46, 17 -34 L 7 -38 L 4 -52 L -4 -51 L -4 -38 Z'
                        : appearance.hairstyle === 'LongTied'
                        ? 'M -14 -34 C -14 -46, 17 -46, 17 -34 C 8 -39, -5 -39, -14 -34 M -14 -34 C -22 -27, -23 -14, -17 -10 Z'
                        : 'M -14 -33 C -14 -47, 17 -47, 17 -33 C 9 -38, -5 -38, -14 -33 Z'
                    }
                    fill={hair}
                    stroke="#090a0c"
                    strokeWidth="2.3"
                    strokeLinejoin="round"
                  />
                )}
                {isChampion && (
                  <rect x="-15" y="-36" width="32" height="4.5" fill="#eab308" stroke="#090a0c" strokeWidth="1.5" />
                )}

                {/* Focused Fighter Brow, Detailed Sclera/Iris Eye, Sculpted Nose & Mouth */}
                <path d="M 1 -28.5 Q 8 -27 14.5 -25.5" fill="none" stroke="#090a0c" strokeWidth="2.6" strokeLinecap="round" />
                <path d="M 5 -22.5 Q 9 -25 13 -22.5 Q 9 -20 5 -22.5 Z" fill="#f8fafc" stroke="#090a0c" strokeWidth="1.2" />
                <circle cx="9.5" cy="-22.5" r="1.7" fill="#090a0c" />
                <circle cx="10" cy="-23" r="0.6" fill="#ffffff" />
                <path d="M 11.5 -22 L 15 -14.5 Q 13 -12 8.5 -12.5" fill="none" stroke="#090a0c" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 5 -8 Q 9 -9.2 12.5 -8" fill="none" stroke="#090a0c" strokeWidth="2.1" strokeLinecap="round" />

                {hasCut && (
                  <g>
                    <path d="M 10 -31 L 15 -23" stroke="#dc2626" strokeWidth="2.8" strokeLinecap="round" />
                    <path d="M 12 -23 L 12 -15" stroke="#b91c1c" strokeWidth="1.9" strokeLinecap="round" />
                  </g>
                )}
              </g>
            </g>

            {/* 7. FRONT LEAD ARM */}
            <g transform={`translate(${frontShoulderX}, ${shoulderY})`}>
              <g
                transform={isVictory ? 'rotate(-128)' : undefined}
                className={joints.frontArm}
                style={{ transformOrigin: '0px 0px' }}
              >
                <circle cx="0" cy="0" r="10.2" fill={`url(#${skinGradId})`} />
                <path
                  d="M -7 -5 C -10 2, -6 12, 6 26 L 18 20 C 16 10, 12 0, 7 -6 C 2 -11, -5 -9, -7 -5 Z"
                  fill={`url(#${skinGradId})`}
                />
                <path
                  d="M -7 -4 C -7 4, -2 15, 6 25 M 7 -6 C 12 0, 16 10, 18 20"
                  fill="none"
                  stroke="#090a0c"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
                <path d="M -4 -7 Q 3 -11 8 -6" fill="none" stroke="#090a0c" strokeWidth="2.6" strokeLinecap="round" />
                <path d="M 3 5 Q 7 13 11 19" fill="none" stroke="#090a0c" strokeWidth="1.5" opacity="0.5" />

                <g transform="translate(13, 23)">
                  <g className={joints.frontFore} style={{ transformOrigin: '0px 0px' }}>
                    <circle cx="0" cy="0" r="6.4" fill={skin} />
                    <path d="M -4 -3 L 20 -18 L 28 -11 L 4 6 Z" fill={`url(#${skinGradId})`} />
                    <path
                      d="M -4 -3 L 20 -18 M 4 6 L 28 -11"
                      fill="none"
                      stroke="#090a0c"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                    />
                    <path d="M -5 1 Q -3 7 4 6" fill="none" stroke="#090a0c" strokeWidth="2.4" strokeLinecap="round" />
                    <g transform="translate(19, -24) rotate(-32)">
                      <rect x="0" y="0" width="21" height="17" rx="5.5" fill={wrap} stroke="#090a0c" strokeWidth="2.6" />
                      <path d="M 3 5.5 L 18 5.5 M 3 11 L 18 11" stroke="#090a0c" strokeWidth="1.5" opacity="0.55" />
                      <path d="M 7 0 L 7 5 M 12 0 L 12 5" stroke="#090a0c" strokeWidth="1.3" opacity="0.45" />
                      <rect x="3" y="13" width="11" height="5" rx="2.5" fill={wrap} stroke="#090a0c" strokeWidth="1.8" />
                    </g>
                  </g>
                </g>
              </g>
            </g>

            {/* 8. COMIC STRIKE / HEADBUTT / SLAM / GUARD / IMPACT / SWEAT FX */}
            {(pose === 'jab' || pose === 'hook' || pose === 'elbow') && (
              <g>
                <g stroke="#fbbf24" strokeWidth="2.8" strokeLinecap="round" opacity="0.95">
                  <line x1="62" y1="-84" x2="112" y2="-88" />
                  <line x1="68" y1="-68" x2="124" y2="-68" />
                  <line x1="62" y1="-52" x2="108" y2="-46" />
                </g>
                <polygon
                  points="106,-78 112,-69 122,-73 115,-64 124,-58 113,-56 116,-46 106,-54 98,-46 101,-56 91,-58 100,-64 93,-73 103,-69"
                  fill="#f59e0b"
                  stroke="#090a0c"
                  strokeWidth="1.6"
                  opacity="0.9"
                />
              </g>
            )}
            {pose === 'headbutt' && (
              <g>
                {/* Cranial Forehead Impact Starburst & Radial Shockwaves */}
                <g stroke="#ef4444" strokeWidth="2.8" strokeLinecap="round">
                  <line x1="34" y1="-116" x2="58" y2="-130" />
                  <line x1="40" y1="-102" x2="72" y2="-104" />
                  <line x1="34" y1="-88" x2="60" y2="-76" />
                </g>
                <polygon
                  points="46,-116 51,-107 61,-110 54,-101 62,-95 52,-94 54,-84 46,-92 38,-85 41,-94 31,-96 39,-102 33,-110 42,-107"
                  fill="#ef4444"
                  stroke="#fbbf24"
                  strokeWidth="1.8"
                  opacity="0.95"
                />
              </g>
            )}
            {pose === 'slam' && (
              <g>
                <g stroke="#f59e0b" strokeWidth="2.8" strokeLinecap="round">
                  <line x1="32" y1="-62" x2="68" y2="-28" />
                  <line x1="48" y1="-72" x2="84" y2="-36" />
                </g>
                <ellipse cx="64" cy="82" rx="34" ry="7" fill="none" stroke="#fbbf24" strokeWidth="2.4" strokeDasharray="5 3" />
              </g>
            )}
            {(pose === 'kick' || pose === 'knee') && (
              <g>
                <path
                  d="M 42 -10 Q 98 -34 86 -86"
                  fill="none"
                  stroke="#f5f2eb"
                  strokeWidth="3.6"
                  strokeDasharray="7 4"
                  strokeLinecap="round"
                  opacity="0.92"
                />
                <path
                  d="M 52 -4 Q 112 -28 96 -76"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  opacity="0.85"
                />
              </g>
            )}
            {(pose === 'block' || pose === 'parry' || pose === 'catchkick') && (
              <g>
                <path
                  d="M 42 -84 Q 72 -52 44 -18"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="4.2"
                  strokeLinecap="round"
                  opacity="0.9"
                />
                <path
                  d="M 50 -74 Q 78 -52 52 -28"
                  fill="none"
                  stroke="#e0f2fe"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.85"
                />
              </g>
            )}
            {(pose === 'takedown' || pose === 'groundpound' || pose === 'submission') && (
              <g>
                <g stroke={pose === 'submission' ? '#a855f7' : '#f59e0b'} strokeWidth="2.8" strokeLinecap="round">
                  <line x1="28" y1="-58" x2="74" y2="-28" />
                  <line x1="40" y1="-70" x2="86" y2="-40" />
                </g>
                <ellipse cx="64" cy="76" rx="34" ry="8" fill="none" stroke={pose === 'submission' ? '#c084fc' : '#fbbf24'} strokeWidth="2.4" strokeDasharray="5 3" />
              </g>
            )}
            {(pose === 'evade' || pose === 'escape') && (
              <path
                d="M -32 -76 Q -58 -56 -38 -28"
                fill="none"
                stroke="#34d399"
                strokeWidth="3.4"
                strokeDasharray="5 3"
                strokeLinecap="round"
              />
            )}
            {pose === 'hit' && (
              <g>
                <g stroke="#ef4444" strokeWidth="3.2" strokeLinecap="round">
                  <line x1="22" y1="-98" x2="46" y2="-114" />
                  <line x1="28" y1="-84" x2="54" y2="-88" />
                  <line x1="20" y1="-72" x2="42" y2="-66" />
                </g>
                {/* Sweat Droplets */}
                <circle cx="-12" cy="-116" r="2.2" fill="#e0f2fe" stroke="#090a0c" strokeWidth="1" />
                <circle cx="-22" cy="-108" r="1.8" fill="#e0f2fe" stroke="#090a0c" strokeWidth="1" />
              </g>
            )}
          </g>
        </g>
      </g>
    </svg>
  );
};
