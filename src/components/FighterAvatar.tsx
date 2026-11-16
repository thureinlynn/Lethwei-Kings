import React from 'react';
import { FighterAppearance, FighterPose, Gender } from '../types/game';

interface FighterAvatarProps {
  appearance: FighterAppearance;
  gender: Gender;
  pose?: FighterPose;
  isRhythm?: boolean;
  facing?: 'right' | 'left';
  mode?: 'portrait' | 'fullbody';
  hasCut?: boolean;
  isChampion?: boolean;
  animKey?: string | number;
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

function lightenHex(hex: string, amount = 0.14): string {
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
        frontArm: 'anim-arm-block',
        backArm: 'anim-arm-block',
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
  isRhythm = false,
  facing = 'right',
  mode = 'portrait',
  hasCut = false,
  isChampion = false,
  animKey,
  className = '',
}) => {
  const skin = appearance.skinTone;
  const skinShadow = darkenHex(skin, 0.24);
  const skinHighlight = lightenHex(skin, 0.16);
  const hair = appearance.hairColor;
  const shorts = appearance.shortsColor;
  const shortsShadow = darkenHex(shorts, 0.34);
  const wrap = appearance.wrapColor;
  const wrapShadow = darkenHex(wrap, 0.22);
  const sashColor = facing === 'left' ? '#1d4ed8' : '#dc2626';
  const sashShadow = darkenHex(sashColor, 0.28);

  const torsoScaleX =
    appearance.build === 'Heavy' ? 1.15 : appearance.build === 'Lean' ? 0.9 : 1.02;
  const shoulderW = (gender === 'Male' ? 32 : 26) * torsoScaleX;
  const waistW = (gender === 'Male' ? 21 : 17) * torsoScaleX;

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

  // ================= FULLBODY ARTICULATED COMIC FIGHTER (Reference Sheet Style) =================
  const heightScale = 0.94 + ((appearance.heightCm - 165) / 30) * 0.12;
  const joints = getJointClasses(pose, isRhythm, facing);
  const activeKey = pose === 'idle' ? 'idle' : String(animKey ?? pose);

  // Relative to pelvis pivot (108, 150)
  const backShoulderX = -shoulderW * 0.56;
  const frontShoulderX = shoulderW * 0.62;
  const shoulderY = -62;

  const isVictory = pose === 'victory';

  return (
    <svg viewBox="0 0 240 260" className={`select-none overflow-visible ${className}`} aria-hidden="true">
      <g
        transform={`${
          facing === 'left' ? 'translate(240, 0) scale(-1, 1) ' : ''
        }translate(0, ${250 * (1 - heightScale)}) scale(1, ${heightScale})`}
      >
        {/* Crisp Dark Cast Shadow on Mat (Image 1 Style) */}
        <ellipse cx="108" cy="245" rx="64" ry="11" fill="#06070a" opacity="0.68" />
        <polygon points="74,244 138,244 14,262 -18,258" fill="#06070a" opacity="0.34" />

        {/* Pelvis / Center of Mass Anchor (108, 150) */}
        <g transform="translate(108, 150)">
          <g key={activeKey} className={joints.body} style={{ transformOrigin: '0px 0px' }}>
            {/* 1. BACK LEG (Wide Orthodox Stance, Anchored at Hip (-14, 6)) */}
            <g transform="translate(-14, 6)">
              <g className={joints.backLeg} style={{ transformOrigin: '0px 0px' }}>
                {/* Rear Thigh (Open-bottom ink outline so knee blends seamlessly) */}
                <path
                  d="M -12 -6 C -19 14, -24 28, -26 42 L -11 43 C -4 28, 2 14, 6 -4 Z"
                  fill={skinShadow}
                />
                <path
                  d="M -12 -6 C -19 14, -24 28, -26 42 M 6 -4 C 2 14, -4 28, -11 43"
                  fill="none"
                  stroke="#090a0c"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />

                {/* Back Knee Pivot (-18, 42) */}
                <g transform="translate(-18, 42)">
                  <g className={joints.backShin} style={{ transformOrigin: '0px 0px' }}>
                    {/* Seamless Knee Blend Fill */}
                    <circle cx="0" cy="0" r="7.5" fill={skinShadow} />
                    {/* Calf & Shin */}
                    <path
                      d="M -8 -2 C -15 14, -15 28, -12 42 L 0 42 C 4 28, 7 14, 7 -1 Z"
                      fill={skinShadow}
                    />
                    <path
                      d="M -8 -2 C -15 14, -15 28, -12 42 M 7 -1 C 7 14, 4 28, 0 42"
                      fill="none"
                      stroke="#090a0c"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                    />
                    <path d="M -5 5 Q -2 10 2 8" fill="none" stroke="#090a0c" strokeWidth="1.6" strokeLinecap="round" opacity="0.65" />
                    {/* Ankle Wrap */}
                    <rect x="-13" y="29" width="14" height="10" rx="2" fill={wrapShadow} stroke="#090a0c" strokeWidth="2.1" />
                    {/* Bare Rear Foot */}
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

            {/* 2. BACK ARM (Rear Guard Hand Held Near Jaw, Anchored at Back Shoulder) */}
            <g transform={`translate(${backShoulderX}, ${shoulderY})`}>
              <g
                transform={isVictory ? 'rotate(-122)' : undefined}
                className={joints.backArm}
                style={{ transformOrigin: '0px 0px' }}
              >
                {/* Rear Upper Arm */}
                <path
                  d="M -6 -6 C -9 6, -3 18, 6 24 L 15 18 C 12 8, 9 0, 5 -6 Z"
                  fill={skinShadow}
                />
                <path
                  d="M -6 -6 C -9 6, -3 18, 6 24 M 15 18 C 12 8, 9 0, 5 -6"
                  fill="none"
                  stroke="#090a0c"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                />

                {/* Back Elbow Pivot (10, 20) */}
                <g transform="translate(10, 20)">
                  <g className={joints.backFore} style={{ transformOrigin: '0px 0px' }}>
                    <circle cx="0" cy="0" r="5" fill={skinShadow} />
                    <path
                      d="M -5 1 L 24 -22 L 32 -14 L 4 7 Z"
                      fill={skinShadow}
                    />
                    <path
                      d="M -5 1 L 24 -22 M 4 7 L 32 -14"
                      fill="none"
                      stroke="#090a0c"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                    />
                    {/* Wrapped Rear Fist (Visible guarding jaw/cheek) */}
                    <g transform="translate(26, -26) rotate(-22)">
                      <rect x="0" y="0" width="19" height="15.5" rx="5" fill={wrapShadow} stroke="#090a0c" strokeWidth="2.4" />
                      <path d="M 3 5 L 16 5 M 3 10.5 L 16 10.5" stroke="#090a0c" strokeWidth="1.4" opacity="0.65" />
                    </g>
                  </g>
                </g>
              </g>
            </g>

            {/* 3. FRONT LEG (Athletic Bent Knee Forward, Anchored at Hip (11, 8)) */}
            <g transform="translate(11, 8)">
              <g className={joints.frontLeg} style={{ transformOrigin: '0px 0px' }}>
                {/* Muscular Lead Thigh (Seamless open bottom edge) */}
                <path
                  d="M -9 -6 C -2 12, 8 28, 17 42 L 30 38 C 25 20, 18 4, 11 -7 Z"
                  fill={skin}
                />
                <path
                  d="M -9 -6 C -2 12, 8 28, 17 42 M 11 -7 C 18 4, 25 20, 30 38"
                  fill="none"
                  stroke="#090a0c"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
                {/* Thigh Shading & Traditional Ink Marking */}
                <path d="M 11 10 Q 17 20 21 31" fill="none" stroke="#090a0c" strokeWidth="1.5" opacity="0.45" />
                <path d="M 8 18 L 15 16 M 10 23 L 17 21" stroke="#090a0c" strokeWidth="1.2" opacity="0.35" />

                {/* Front Knee Pivot (23, 39) */}
                <g transform="translate(23, 39)">
                  <g className={joints.frontShin} style={{ transformOrigin: '0px 0px' }}>
                    {/* Seamless Knee Blend Fill */}
                    <circle cx="0" cy="0" r="7.5" fill={skin} />
                    {/* Sculpted Calf & Shin */}
                    <path
                      d="M -7 -1 C -9 14, -6 28, -3 41 L 8 41 C 10 27, 9 13, 6 -2 Z"
                      fill={skin}
                    />
                    <path
                      d="M -7 -1 C -9 14, -6 28, -3 41 M 6 -2 C 9 13, 10 27, 8 41"
                      fill="none"
                      stroke="#090a0c"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                    />
                    <path d="M -2 3 Q 2 7 4 4" fill="none" stroke="#090a0c" strokeWidth="1.7" strokeLinecap="round" opacity="0.6" />
                    <path d="M -2 14 Q -3 24 0 32" fill="none" stroke="#090a0c" strokeWidth="1.5" opacity="0.45" />
                    {/* Front Ankle Wrap */}
                    <rect x="-4" y="29" width="13.5" height="10" rx="2" fill={wrap} stroke="#090a0c" strokeWidth="2.1" />
                    {/* Bare Lead Foot */}
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

            {/* 4. LETHWEI SHORTS & TRADITIONAL SASH (Anchored around Pelvis (0,0)) */}
            <path
              d={`M ${-waistW - 1} -18 L ${waistW + 2} -18 L ${waistW + 13} 22 L 5 19 L 0 13 L -5 19 L ${-waistW - 12} 22 Z`}
              fill={shorts}
              stroke="#090a0c"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Comic Folds on Shorts */}
            <path d={`M ${-waistW - 5} 14 L -6 12 M 6 12 L ${waistW + 6} 14`} stroke={shortsShadow} strokeWidth="2.8" strokeLinecap="round" />
            <path d={`M ${waistW + 3} -10 L ${waistW + 10} 16`} stroke="#ffffff" strokeWidth="1.5" opacity="0.22" />
            {/* Traditional Waist Sash & Hanging Cloth Ties */}
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

            {/* 5. SCULPTED COMIC TORSO (Anchored above Waist) */}
            <path
              d={`M -11 -78 Q ${-shoulderW * 0.85} -75 ${-shoulderW} -60 L ${-waistW} -20 L ${waistW} -20 L ${shoulderW} -60 Q ${shoulderW * 0.85} -75 11 -78 Z`}
              fill={skin}
              stroke="#090a0c"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Comic Torso Shadow & Chest Highlight */}
            <path
              d={`M -11 -76 Q ${-shoulderW * 0.8} -73 ${-shoulderW + 2} -60 L ${-waistW + 2} -21 L -3 -21 L -4 -66 Z`}
              fill={skinShadow}
              opacity="0.45"
            />
            <path
              d={`M 3 -64 Q ${shoulderW * 0.6} -64 ${shoulderW - 6} -56 Q ${shoulderW * 0.55} -46 3 -48 Z`}
              fill={skinHighlight}
              opacity="0.35"
            />
            {/* Pectorals, Collarbone & Ab Linework */}
            <path
              d={`M ${-shoulderW + 8} -54 Q -4 -47 2 -52 Q ${shoulderW * 0.65} -48 ${shoulderW - 7} -55`}
              fill="none"
              stroke="#090a0c"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path d="M 1 -62 L 1 -24" stroke="#090a0c" strokeWidth="1.8" opacity="0.6" />
            <path d="M -7 -42 Q 1 -40 9 -42 M -6 -33 Q 1 -31 8 -33" fill="none" stroke="#090a0c" strokeWidth="1.6" opacity="0.55" />
            {/* Traditional Lethwei Chest & Abdomen Sak Yant Ink Motifs */}
            <g stroke="#090a0c" strokeWidth="1.1" opacity="0.36" fill="none">
              <path d="M -9 -59 L 11 -59 M -7 -56 L 9 -56" />
              <circle cx="1" cy="-37" r="6" strokeDasharray="2 2" />
            </g>

            {/* 6. HEAD & NECK (Anchored at Neck Base (2, -76)) */}
            <g transform="translate(2, -76)">
              <g className={joints.head} style={{ transformOrigin: '0px 0px' }}>
                {/* Muscular Neck (Blends cleanly behind jawline) */}
                <path d="M -9 4 L -7 -13 L 8 -13 L 10 4 Z" fill={skinShadow} stroke="#090a0c" strokeWidth="2.6" />
                {/* 3/4 Profile Head & Strong Jawline */}
                <path
                  d="M -15 -34 C -15 -49, 17 -49, 18 -34 L 18 -19 C 18 -7, 10 -2, 2 -2 C -7 -2, -15 -8, -15 -20 Z"
                  fill={skin}
                  stroke="#090a0c"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />
                {/* Cheekbone Shadow & Ear */}
                <path d="M -13 -22 L -13 -12 C -10 -6, -4 -3, 1 -3 L -4 -20 Z" fill={skinShadow} opacity="0.55" />
                <ellipse cx="-14" cy="-21" rx="3.4" ry="5.5" fill={skinShadow} stroke="#090a0c" strokeWidth="2.2" />

                {/* Hairstyle */}
                {appearance.hairstyle !== 'Shaved' && (
                  <path
                    d={
                      appearance.hairstyle === 'Mohawk'
                        ? 'M -6 -36 L -8 -55 L 5 -52 L 5 -36 Z'
                        : appearance.hairstyle === 'Topknot'
                        ? 'M -15 -34 C -15 -47, 17 -47, 17 -34 L 7 -38 L 4 -52 L -4 -51 L -4 -38 Z'
                        : appearance.hairstyle === 'LongTied'
                        ? 'M -15 -34 C -15 -47, 18 -47, 18 -34 C 8 -39, -5 -39, -15 -34 M -15 -34 C -22 -27, -23 -14, -17 -10 Z'
                        : 'M -15 -33 C -15 -48, 18 -48, 18 -33 C 9 -38, -5 -38, -15 -33 Z'
                    }
                    fill={hair}
                    stroke="#090a0c"
                    strokeWidth="2.4"
                    strokeLinejoin="round"
                  />
                )}
                {isChampion && (
                  <rect x="-15" y="-36" width="33" height="4.5" fill="#eab308" stroke="#090a0c" strokeWidth="1.5" />
                )}

                {/* Focused Fighter Brow, Eye, Nose & Mouth */}
                <path d="M 1 -28 L 14 -26" stroke="#090a0c" strokeWidth="2.6" strokeLinecap="round" />
                <ellipse cx="9" cy="-22.5" rx="2.4" ry="1.8" fill="#090a0c" />
                <path d="M 11 -22 L 13 -14 L 8 -13" fill="none" stroke="#090a0c" strokeWidth="2" strokeLinecap="round" />
                <path d="M 4 -8.5 L 12 -9" stroke="#090a0c" strokeWidth="2.2" strokeLinecap="round" />

                {hasCut && (
                  <g>
                    <path d="M 10 -31 L 15 -23" stroke="#dc2626" strokeWidth="2.6" strokeLinecap="round" />
                    <path d="M 12 -23 L 12 -15" stroke="#b91c1c" strokeWidth="1.8" strokeLinecap="round" />
                  </g>
                )}
              </g>
            </g>

            {/* 7. FRONT LEAD ARM (Seamless Shoulder & Elbow Transitions, Anchored at Front Shoulder) */}
            <g transform={`translate(${frontShoulderX}, ${shoulderY})`}>
              <g
                transform={isVictory ? 'rotate(-128)' : undefined}
                className={joints.frontArm}
                style={{ transformOrigin: '0px 0px' }}
              >
                {/* Seamless Deltoid Cap & Bicep */}
                <circle cx="0" cy="0" r="10.2" fill={skin} />
                <path
                  d="M -7 -5 C -10 2, -6 12, 6 26 L 18 20 C 16 10, 12 0, 7 -6 C 2 -11, -5 -9, -7 -5 Z"
                  fill={skin}
                />
                <path
                  d="M -7 -4 C -7 4, -2 15, 6 25 M 7 -6 C 12 0, 16 10, 18 20"
                  fill="none"
                  stroke="#090a0c"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
                <path d="M -4 -7 Q 3 -11 8 -6" fill="none" stroke="#090a0c" strokeWidth="2.6" strokeLinecap="round" />
                <path d="M 3 5 Q 7 13 11 19" fill="none" stroke="#090a0c" strokeWidth="1.5" opacity="0.45" />

                {/* Front Elbow Pivot (13, 23) */}
                <g transform="translate(13, 23)">
                  <g className={joints.frontFore} style={{ transformOrigin: '0px 0px' }}>
                    {/* Seamless Elbow Cap */}
                    <circle cx="0" cy="0" r="6.4" fill={skin} />
                    {/* Forearm anchored squarely on elbow pivot */}
                    <path
                      d="M -4 -3 L 20 -18 L 28 -11 L 4 6 Z"
                      fill={skin}
                    />
                    <path
                      d="M -4 -3 L 20 -18 M 4 6 L 28 -11"
                      fill="none"
                      stroke="#090a0c"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                    />
                    <path d="M -5 1 Q -3 7 4 6" fill="none" stroke="#090a0c" strokeWidth="2.4" strokeLinecap="round" />
                    {/* Bandaged Lethwei Lead Fist */}
                    <g transform="translate(19, -24) rotate(-32)">
                      <rect x="0" y="0" width="21" height="17" rx="5.5" fill={wrap} stroke="#090a0c" strokeWidth="2.6" />
                      <path d="M 3 5.5 L 18 5.5 M 3 11 L 18 11" stroke="#090a0c" strokeWidth="1.5" opacity="0.55" />
                      <rect x="3" y="13" width="11" height="5" rx="2.5" fill={wrap} stroke="#090a0c" strokeWidth="1.8" />
                    </g>
                  </g>
                </g>
              </g>
            </g>

            {/* 8. COMIC STRIKE / GUARD / IMPACT SPEED LINES */}
            {(pose === 'jab' || pose === 'hook' || pose === 'elbow' || pose === 'headbutt' || pose === 'slam') && (
              <g stroke="#fbbf24" strokeWidth="2.6" strokeLinecap="round" opacity="0.92">
                <line x1="62" y1="-82" x2="108" y2="-86" />
                <line x1="68" y1="-68" x2="118" y2="-68" />
                <line x1="62" y1="-54" x2="104" y2="-48" />
              </g>
            )}
            {(pose === 'kick' || pose === 'knee') && (
              <path
                d="M 42 -10 Q 94 -32 82 -82"
                fill="none"
                stroke="#f5f2eb"
                strokeWidth="3.2"
                strokeDasharray="7 4"
                strokeLinecap="round"
                opacity="0.9"
              />
            )}
            {(pose === 'block' || pose === 'parry' || pose === 'catchkick') && (
              <path
                d="M 42 -84 Q 68 -52 44 -18"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="3.8"
                strokeLinecap="round"
                opacity="0.85"
              />
            )}
            {pose === 'evade' && (
              <path
                d="M -32 -76 Q -56 -56 -38 -30"
                fill="none"
                stroke="#34d399"
                strokeWidth="3"
                strokeDasharray="5 3"
                strokeLinecap="round"
              />
            )}
            {pose === 'hit' && (
              <g stroke="#ef4444" strokeWidth="3" strokeLinecap="round">
                <line x1="22" y1="-98" x2="42" y2="-112" />
                <line x1="28" y1="-84" x2="50" y2="-88" />
              </g>
            )}
          </g>
        </g>
      </g>
    </svg>
  );
};

