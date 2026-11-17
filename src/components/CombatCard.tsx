import React, { useId } from 'react';
import { Activity, Clock, Flame, Shield, Swords } from 'lucide-react';
import { localizeCard, UI_TEXT } from '../i18n/translations';
import { CardArtType, CombatCard as CombatCardType, Language } from '../types/game';

interface CombatCardProps {
  card: CombatCardType;
  effectivePower?: number;
  triangleBonusPct?: number;
  disabled?: boolean;
  selected?: boolean;
  compact?: boolean;
  lang?: Language;
  onClick?: () => void;
  actionLabel?: string;
}

/**
 * Detailed hand-inked cross-hatched martial arts comic illustration
 * matching the vintage parchment & pen-ink card sheet aesthetic.
 */
const CardIllustration: React.FC<{ artType: CardArtType }> = ({ artType }) => {
  const uid = useId().replace(/:/g, '');
  const gradParchment = `parch_${uid}`;
  const gradSkin = `skin_${uid}`;
  const gradShadow = `shad_${uid}`;
  const hatchPat = `hatch_${uid}`;

  const ink = '#14110f';
  const midInk = '#3a322b';
  const skinBase = '#dfd1b9';
  const skinDark = '#b8a589';
  const trunks = '#2e2925';
  const trunksDark = '#1c1816';
  const sash = '#8c2220';
  const ghostFill = '#cfc2aa';

  // Shared detailed comic fighter head helper (facing right by default)
  const renderHead = (
    cx: number,
    cy: number,
    scale = 1,
    flip = false,
    variant: 'fighter' | 'ghost' | 'sweat' = 'fighter'
  ) => {
    const fill = variant === 'ghost' ? ghostFill : `url(#${gradSkin})`;
    const strokeCol = variant === 'ghost' ? midInk : ink;
    return (
      <g
        transform={`translate(${cx}, ${cy}) scale(${flip ? -scale : scale}, ${scale})`}
        stroke={strokeCol}
        strokeLinejoin="round"
      >
        {/* Neck & Trap */}
        <path d="M -5 9 L -7 20 L 6 20 L 4 9 Z" fill={skinDark} strokeWidth="1.6" />
        {/* Cranium & Jaw */}
        <path
          d="M -10 -7 C -10 -16, 10 -16, 11 -6 L 11 2 C 11 9, 5 13, 0 13 C -6 13, -10 8, -10 1 Z"
          fill={fill}
          strokeWidth="1.9"
        />
        {/* Jawline cross-hatch shadow */}
        {variant !== 'ghost' && (
          <path d="M -8 1 L -8 7 C -5 11, 0 12, 3 11 L -2 2 Z" fill={skinDark} stroke="none" opacity="0.7" />
        )}
        {/* Hair & Ear */}
        <path
          d="M -11 -6 C -11 -16, 11 -16, 11 -7 C 6 -10, -4 -10, -10 -5 Z"
          fill={variant === 'ghost' ? '#9e907a' : ink}
          strokeWidth="1.4"
        />
        <ellipse cx="-9" cy="-1" rx="2" ry="3.5" fill={skinDark} strokeWidth="1.3" />
        {/* Brow, Eye, Nose, Gritted Teeth */}
        <path d="M 1 -5 L 8 -3.5" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <ellipse cx="5.5" cy="-1.5" rx="1.3" ry="1" fill={strokeCol} stroke="none" />
        <path d="M 8 -1 L 10 3 L 7 3.8" fill="none" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M 3 7.5 L 8.5 7.5" fill="none" strokeWidth="1.4" strokeLinecap="round" />
        {variant === 'sweat' && (
          <g stroke="#8c2220" strokeWidth="1.4" fill="none">
            <path d="M -15 -14 L -19 -18 M -16 -6 L -22 -7 M 14 -14 L 18 -18" strokeLinecap="round" />
          </g>
        )}
      </g>
    );
  };

  // Shared detailed hand-wrapped fist
  const renderFist = (x: number, y: number, rot = 0, wrapped = true, fillOverride?: string) => (
    <g transform={`translate(${x}, ${y}) rotate(${rot})`}>
      <rect
        x="-7"
        y="-6"
        width="14"
        height="11"
        rx="3.5"
        fill={fillOverride ?? (wrapped ? '#ebe2d0' : skinBase)}
        stroke={ink}
        strokeWidth="1.7"
      />
      <path d="M -5 -2 L 5 -2 M -5 1.5 L 5 1.5" stroke={ink} strokeWidth="0.9" opacity="0.65" />
      <rect x="-3" y="3" width="6" height="3.5" rx="1.5" fill={skinDark} stroke={ink} strokeWidth="1.2" />
    </g>
  );

  // Shared muscular torso + Lethwei shorts
  const renderTorsoAndShorts = (
    x: number,
    y: number,
    rot = 0,
    scale = 1,
    isGhost = false
  ) => {
    const strokeCol = isGhost ? midInk : ink;
    const bodyFill = isGhost ? ghostFill : `url(#${gradSkin})`;
    return (
      <g transform={`translate(${x}, ${y}) rotate(${rot}) scale(${scale})`} stroke={strokeCol}>
        {/* Shorts & Sash */}
        <path
          d="M -14 20 L 14 20 L 19 42 L 3 40 L 0 34 L -3 40 L -19 42 Z"
          fill={isGhost ? '#b5a78f' : trunks}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <rect x="-15" y="16" width="30" height="6" rx="2" fill={isGhost ? '#9e907a' : sash} strokeWidth="1.5" />
        {/* Shorts fold lines */}
        <path d="M -10 25 L -6 37 M 9 25 L 13 37" stroke={isGhost ? midInk : trunksDark} strokeWidth="1.3" />
        {/* Torso */}
        <path
          d="M -18 -14 C -20 -4, -15 8, -13 17 L 13 17 C 15 8, 20 -4, 18 -14 C 12 -19, -12 -19, -18 -14 Z"
          fill={bodyFill}
          strokeWidth="1.9"
          strokeLinejoin="round"
        />
        {/* Pectoral, Abs & Ink Cross-Hatching */}
        {!isGhost && (
          <>
            <path d="M -14 -4 Q -4 -1 0 -4 Q 5 -1 15 -4" fill="none" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M 0 -4 L 0 14 M -6 3 Q 0 5 6 3 M -5 9 Q 0 11 5 9" fill="none" strokeWidth="1.1" opacity="0.7" />
            <path d="M -16 -12 L -11 -12 L -11 14 L -13 16 L -15 3 Z" fill={`url(#${hatchPat})`} stroke="none" opacity="0.45" />
          </>
        )}
      </g>
    );
  };

  const renderSketch = () => {
    switch (artType) {
      case 'jab':
      case 'cross':
        return (
          <g>
            {/* Ghost Target Silhouette on right */}
            <g opacity="0.45">
              {renderTorsoAndShorts(144, 68, 8, 0.9, true)}
              {renderHead(140, 34, 0.9, true, 'ghost')}
            </g>
            {/* Sculpted Stepping Legs */}
            <path d="M 48 84 C 41 96, 35 104, 30 111 L 41 111 C 46 102, 51 94, 56 85 Z" fill={skinDark} stroke={ink} strokeWidth="1.7" strokeLinejoin="round" />
            <path d="M 60 84 C 68 95, 74 103, 78 111 L 89 111 C 84 101, 77 92, 68 83 Z" fill={skinBase} stroke={ink} strokeWidth="1.7" strokeLinejoin="round" />
            {renderTorsoAndShorts(58, 66, 11, 0.96)}
            {renderHead(64, 33, 0.96)}
            {/* Rear Tucked Guard */}
            <path d="M 46 54 L 54 62 L 66 47 L 59 42 Z" fill={skinDark} stroke={ink} strokeWidth="1.6" strokeLinejoin="round" />
            {renderFist(68, 43, -15)}
            {/* Sculpted Extended Punching Shoulder, Bicep & Forearm */}
            <path
              d={
                artType === 'cross'
                  ? 'M 64 49 C 80 44, 102 38, 126 34 L 128 42 C 104 48, 82 55, 66 59 Z'
                  : 'M 66 47 C 82 42, 102 35, 126 30 L 128 38 C 104 44, 84 51, 68 56 Z'
              }
              fill={`url(#${gradSkin})`}
              stroke={ink}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path d={artType === 'cross' ? 'M 80 48 Q 95 44 112 39' : 'M 82 46 Q 97 41 114 36'} stroke={ink} strokeWidth="1.1" opacity="0.6" fill="none" />
            {renderFist(131, artType === 'cross' ? 37 : 34, 0)}
            {/* Speed & Impact Bursts */}
            <g stroke={ink} strokeWidth="1.5" strokeLinecap="round">
              <line x1="86" y1="24" x2="116" y2="24" />
              <line x1="92" y1="46" x2="120" y2="44" />
            </g>
            <path d="M 136 22 L 142 15 M 140 31 L 150 28 M 138 40 L 146 46" stroke="#991b1b" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        );

      case 'hook':
        return (
          <g>
            <g opacity="0.45">
              {renderTorsoAndShorts(36, 70, -6, 0.9, true)}
              {renderHead(39, 36, 0.9, false, 'ghost')}
            </g>
            <path d="M 112 86 L 98 110 M 126 86 L 142 110" stroke={ink} strokeWidth="9" strokeLinecap="round" />
            <path d="M 112 86 L 98 110 M 126 86 L 142 110" stroke={skinBase} strokeWidth="5.2" strokeLinecap="round" />
            {renderTorsoAndShorts(120, 68, -12, 0.96)}
            {renderHead(112, 34, 0.96, true)}
            {/* Rear tucked guard */}
            <path d="M 122 56 L 106 46" stroke={ink} strokeWidth="8" strokeLinecap="round" />
            <path d="M 122 56 L 106 46" stroke={skinDark} strokeWidth="4.4" strokeLinecap="round" />
            {renderFist(103, 43, 15)}
            {/* Sweeping Hook Arm */}
            <path d="M 106 54 Q 76 42 54 62" fill="none" stroke={ink} strokeWidth="9.5" strokeLinecap="round" />
            <path d="M 106 54 Q 76 42 54 62" fill="none" stroke={skinBase} strokeWidth="5.6" strokeLinecap="round" />
            {renderFist(51, 63, -25)}
            <path d="M 52 46 Q 76 30 98 42" fill="none" stroke="#991b1b" strokeWidth="1.7" strokeDasharray="3 2" />
          </g>
        );

      case 'uppercut':
      case 'superman':
        return (
          <g>
            <g opacity="0.45">
              {renderTorsoAndShorts(138, 68, 12, 0.9, true)}
              {renderHead(138, 34, 0.9, true, 'ghost')}
            </g>
            {artType === 'superman' ? (
              <>
                {/* Airborne flying superman pose */}
                <path d="M 54 78 L 24 96 M 66 74 L 94 92" stroke={ink} strokeWidth="8.5" strokeLinecap="round" />
                <path d="M 54 78 L 24 96 M 66 74 L 94 92" stroke={skinBase} strokeWidth="4.8" strokeLinecap="round" />
                {renderTorsoAndShorts(66, 56, 28, 0.94)}
                {renderHead(79, 28, 0.94)}
                <path d="M 80 46 L 130 34" stroke={ink} strokeWidth="9" strokeLinecap="round" />
                <path d="M 80 46 L 130 34" stroke={skinBase} strokeWidth="5.4" strokeLinecap="round" />
                {renderFist(133, 33, 8)}
                <path d="M 28 54 L 60 44 M 22 66 L 54 58" stroke="#991b1b" strokeWidth="1.6" strokeLinecap="round" />
              </>
            ) : (
              <>
                <path d="M 58 88 L 44 110 M 76 86 L 94 110" stroke={ink} strokeWidth="9" strokeLinecap="round" />
                <path d="M 58 88 L 44 110 M 76 86 L 94 110" stroke={skinBase} strokeWidth="5.2" strokeLinecap="round" />
                {renderTorsoAndShorts(68, 70, 8, 0.96)}
                {renderHead(73, 37, 0.96)}
                <path d="M 80 68 L 116 58 L 126 36" fill="none" stroke={ink} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 80 68 L 116 58 L 126 36" fill="none" stroke={skinBase} strokeWidth="5.2" strokeLinecap="round" strokeLinejoin="round" />
                {renderFist(128, 32, -65)}
                <path d="M 118 66 Q 134 50 132 24" fill="none" stroke="#991b1b" strokeWidth="2" strokeLinecap="round" />
              </>
            )}
          </g>
        );

      case 'roundhouse':
      case 'sidekick':
      case 'teep':
      case 'lowkick':
      case 'axekick':
        return (
          <g>
            {/* Ghost Target on Right for Combat Context */}
            <g opacity="0.34">
              {renderTorsoAndShorts(152, 68, 8, 0.86, true)}
              {renderHead(148, 36, 0.86, true, 'ghost')}
            </g>
            {/* Sculpted Standing Pivot Leg */}
            <path
              d="M 46 81 C 42 93, 40 102, 39 111 L 49 111 C 51 101, 54 92, 57 82 Z"
              fill={skinDark}
              stroke={ink}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path d="M 38 110 L 54 110" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
            {renderTorsoAndShorts(53, 64, artType === 'lowkick' ? -8 : -22, 0.94)}
            {renderHead(43, 30, 0.94)}
            {/* Guarding Arms */}
            <path d="M 58 44 L 74 34 L 78 39 L 61 52 Z" fill={skinBase} stroke={ink} strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M 45 48 L 32 39 L 29 45 L 43 54 Z" fill={skinDark} stroke={ink} strokeWidth="1.6" strokeLinejoin="round" />
            {renderFist(79, 36, -10)}
            {renderFist(29, 40, 10)}
            {/* Sculpted Anatomical Striking Leg (Tapered Thigh -> Knee -> Shin) */}
            {(() => {
              const targetX = artType === 'teep' ? 138 : artType === 'axekick' ? 126 : 142;
              const targetY =
                artType === 'lowkick'
                  ? 89
                  : artType === 'teep' || artType === 'sidekick'
                  ? 53
                  : artType === 'axekick'
                  ? 25
                  : 24;
              const kneeX = artType === 'teep' ? 98 : artType === 'axekick' ? 96 : 102;
              const kneeY =
                artType === 'lowkick'
                  ? 82
                  : artType === 'teep' || artType === 'sidekick'
                  ? 59
                  : artType === 'axekick'
                  ? 34
                  : 46;
              return (
                <>
                  {/* Tapered Quad Thigh */}
                  <path
                    d={`M 57 73 Q ${(57 + kneeX) / 2} ${(73 + kneeY) / 2 - 7} ${kneeX} ${kneeY - 5} L ${kneeX + 2} ${kneeY + 5} Q ${(61 + kneeX) / 2} ${(83 + kneeY) / 2 + 5} 60 84 Z`}
                    fill={`url(#${gradSkin})`}
                    stroke={ink}
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  {/* Tapered Muscular Calf & Shin */}
                  <path
                    d={`M ${kneeX - 1} ${kneeY - 4} Q ${(kneeX + targetX) / 2} ${(kneeY + targetY) / 2 - 4} ${targetX - 4} ${targetY - 3} L ${targetX - 2} ${targetY + 3} Q ${(kneeX + targetX) / 2} ${(kneeY + targetY) / 2 + 5} ${kneeX + 2} ${kneeY + 4} Z`}
                    fill={`url(#${gradSkin})`}
                    stroke={ink}
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  {/* Knee Cap Line & Calf Contour */}
                  <path d={`M ${kneeX - 1} ${kneeY - 3} Q ${kneeX + 3} ${kneeY} ${kneeX} ${kneeY + 3}`} fill="none" stroke={ink} strokeWidth="1.2" />
                  {/* Ankle Wrap & Sculpted Bare Foot */}
                  <rect
                    x={targetX - 10}
                    y={targetY - 4}
                    width="11"
                    height="7.5"
                    rx="2"
                    transform={`rotate(${targetY < 45 ? -24 : 5} ${targetX} ${targetY})`}
                    fill="#ebe2d0"
                    stroke={ink}
                    strokeWidth="1.5"
                  />
                  <ellipse
                    cx={targetX + 4}
                    cy={targetY - 1.5}
                    rx="6.5"
                    ry="3.8"
                    transform={`rotate(${targetY < 45 ? -24 : 5} ${targetX} ${targetY})`}
                    fill={skinBase}
                    stroke={ink}
                    strokeWidth="1.5"
                  />
                  {/* Kinetic Arc */}
                  <path
                    d={
                      artType === 'axekick'
                        ? 'M 106 12 Q 146 16 142 56'
                        : artType === 'lowkick'
                        ? 'M 114 98 Q 148 92 148 72'
                        : artType === 'teep' || artType === 'sidekick'
                        ? 'M 98 53 L 154 53'
                        : 'M 102 68 Q 146 48 150 16'
                    }
                    fill="none"
                    stroke="#991b1b"
                    strokeWidth="2"
                    strokeDasharray={artType === 'teep' ? undefined : '4 2'}
                    strokeLinecap="round"
                  />
                </>
              );
            })()}
          </g>
        );

      case 'elbow':
      case 'upwardelbow':
        return (
          <g>
            {/* Dynamic Spinning / Rising Elbow */}
            <path d="M 76 86 L 56 110 M 96 86 L 116 110" stroke={ink} strokeWidth="9.5" strokeLinecap="round" />
            <path d="M 76 86 L 56 110 M 96 86 L 116 110" stroke={skinBase} strokeWidth="5.4" strokeLinecap="round" />
            {renderTorsoAndShorts(86, 68, artType === 'upwardelbow' ? 14 : -14, 0.98)}
            {renderHead(86, 33, 0.98, artType === 'elbow')}
            {artType === 'upwardelbow' ? (
              <>
                <path d="M 96 56 L 122 36 L 106 20" fill="none" stroke={ink} strokeWidth="9.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 96 56 L 122 36 L 106 20" fill="none" stroke={skinBase} strokeWidth="5.4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 118 58 Q 134 38 122 14" fill="none" stroke="#991b1b" strokeWidth="2.2" strokeLinecap="round" />
              </>
            ) : (
              <>
                <path d="M 94 52 L 128 32 L 110 22" fill="none" stroke={ink} strokeWidth="9.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 94 52 L 128 32 L 110 22" fill="none" stroke={skinBase} strokeWidth="5.4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 52 22 Q 92 8 134 26" fill="none" stroke="#991b1b" strokeWidth="2" strokeDasharray="4 2" />
              </>
            )}
            <path d="M 76 54 L 62 42" stroke={ink} strokeWidth="7.5" strokeLinecap="round" />
            {renderFist(60, 40, -10)}
          </g>
        );

      case 'knee':
        return (
          <g>
            {/* Left Fighter Clinching + Right Opponent */}
            <path d="M 54 84 L 46 110" stroke={ink} strokeWidth="9" strokeLinecap="round" />
            <path d="M 54 84 L 46 110" stroke={skinBase} strokeWidth="5" strokeLinecap="round" />
            <path d="M 126 84 L 136 110 M 116 84 L 114 110" stroke={ink} strokeWidth="9" strokeLinecap="round" />
            <path d="M 126 84 L 136 110 M 116 84 L 114 110" stroke={skinDark} strokeWidth="5" strokeLinecap="round" />
            {renderTorsoAndShorts(122, 66, -12, 0.92)}
            {renderHead(112, 32, 0.92, true)}
            {renderTorsoAndShorts(58, 64, 10, 0.95)}
            {renderHead(66, 30, 0.95)}
            {/* Plum Neck Clinch Arms */}
            <path d="M 68 48 L 106 30" stroke={ink} strokeWidth="7.5" strokeLinecap="round" />
            <path d="M 68 48 L 106 30" stroke={skinBase} strokeWidth="4.2" strokeLinecap="round" />
            {/* Driving Knee */}
            <path d="M 66 78 L 102 58 L 90 92" fill="none" stroke={ink} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 66 78 L 102 58 L 90 92" fill="none" stroke={skinBase} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 102 50 L 110 44 M 106 58 L 116 58 M 102 66 L 110 72" stroke="#991b1b" strokeWidth="2" strokeLinecap="round" />
          </g>
        );

      case 'headbutt':
      case 'desperation':
        return (
          <g>
            {/* Two Fighters Crashing Skulls in Clinch */}
            <path d="M 50 86 L 34 110 M 64 86 L 76 110" stroke={ink} strokeWidth="9" strokeLinecap="round" />
            <path d="M 50 86 L 34 110 M 64 86 L 76 110" stroke={skinBase} strokeWidth="5" strokeLinecap="round" />
            <path d="M 128 86 L 144 110 M 114 86 L 104 110" stroke={ink} strokeWidth="9" strokeLinecap="round" />
            <path d="M 128 86 L 144 110 M 114 86 L 104 110" stroke={skinDark} strokeWidth="5" strokeLinecap="round" />
            {renderTorsoAndShorts(58, 68, 22, 0.95)}
            {renderTorsoAndShorts(122, 68, -20, 0.95)}
            {renderHead(79, 36, 0.96)}
            {renderHead(101, 36, 0.96, true, artType === 'desperation' ? 'sweat' : 'fighter')}
            {/* Gripping Clinch Arms */}
            <path d="M 66 56 L 104 48 M 114 56 L 76 48" stroke={ink} strokeWidth="7" strokeLinecap="round" />
            <path d="M 66 56 L 104 48 M 114 56 L 76 48" stroke={skinBase} strokeWidth="3.8" strokeLinecap="round" />
            {/* Explosive Cranial Clash Star */}
            <polygon
              points="90,14 93,23 102,20 96,28 104,33 94,35 96,44 90,37 84,44 86,35 76,33 84,28 78,20 87,23"
              fill="#dc2626"
              stroke={ink}
              strokeWidth="1.4"
            />
          </g>
        );

      case 'slam':
        return (
          <g>
            {/* Standing Body Slam Lift */}
            <path d="M 48 86 L 34 110 M 64 86 L 80 110" stroke={ink} strokeWidth="9" strokeLinecap="round" />
            <path d="M 48 86 L 34 110 M 64 86 L 80 110" stroke={skinBase} strokeWidth="5" strokeLinecap="round" />
            {renderTorsoAndShorts(56, 66, 16, 0.94)}
            {renderHead(62, 34, 0.94)}
            {/* Lifted Opponent Horizontal */}
            <g transform="translate(116, 48) rotate(72)">
              {renderTorsoAndShorts(0, 0, 0, 0.85, true)}
              {renderHead(0, -32, 0.85, true, 'ghost')}
            </g>
            <path d="M 64 56 L 106 50" stroke={ink} strokeWidth="8.5" strokeLinecap="round" />
            <path d="M 64 56 L 106 50" stroke={skinBase} strokeWidth="4.8" strokeLinecap="round" />
            <path d="M 110 74 L 130 98 M 126 70 L 146 94" stroke="#991b1b" strokeWidth="2.2" strokeLinecap="round" />
          </g>
        );

      case 'block':
      case 'longguard':
      case 'sprawl':
        return (
          <g>
            {artType === 'sprawl' ? (
              <>
                {/* Clinch Break / Frame */}
                <path d="M 52 86 L 36 110 M 68 86 L 86 110" stroke={ink} strokeWidth="9" strokeLinecap="round" />
                <path d="M 52 86 L 36 110 M 68 86 L 86 110" stroke={skinBase} strokeWidth="5" strokeLinecap="round" />
                {renderTorsoAndShorts(62, 66, -12, 0.94)}
                {renderHead(54, 34, 0.94)}
                <path d="M 72 52 L 120 46" stroke={ink} strokeWidth="8.5" strokeLinecap="round" />
                <path d="M 72 52 L 120 46" stroke={skinBase} strokeWidth="4.8" strokeLinecap="round" />
                {renderFist(122, 46, 0)}
                <g opacity="0.5">
                  {renderTorsoAndShorts(138, 72, 24, 0.88, true)}
                  {renderHead(128, 42, 0.88, true, 'ghost')}
                </g>
              </>
            ) : (
              <>
                {/* High Guard / Long Guard Shell */}
                <g opacity="0.38">
                  {renderTorsoAndShorts(144, 68, -8, 0.9, true)}
                  {renderHead(138, 34, 0.9, true, 'ghost')}
                  <path d="M 128 52 L 88 38" stroke={midInk} strokeWidth="8" strokeLinecap="round" />
                </g>
                <path d="M 56 86 L 42 110 M 72 86 L 88 110" stroke={ink} strokeWidth="9" strokeLinecap="round" />
                <path d="M 56 86 L 42 110 M 72 86 L 88 110" stroke={skinBase} strokeWidth="5" strokeLinecap="round" />
                {renderTorsoAndShorts(64, 66, -6, 0.96)}
                {renderHead(64, 34, 0.96)}
                {artType === 'longguard' ? (
                  <>
                    <path d="M 72 52 L 116 36" stroke={ink} strokeWidth="8.5" strokeLinecap="round" />
                    <path d="M 72 52 L 116 36" stroke={skinBase} strokeWidth="4.8" strokeLinecap="round" />
                    {renderFist(118, 35, 0)}
                    <path d="M 54 54 L 68 38" stroke={ink} strokeWidth="7.5" strokeLinecap="round" />
                    {renderFist(70, 35, -20)}
                  </>
                ) : (
                  <>
                    <path d="M 52 54 L 74 36 L 68 24" fill="none" stroke={ink} strokeWidth="8.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M 52 54 L 74 36 L 68 24" fill="none" stroke={skinBase} strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />
                    {renderFist(68, 23, -10)}
                    {renderFist(78, 28, 10)}
                  </>
                )}
                <path d="M 88 22 Q 98 34 88 48" fill="none" stroke="#1d4ed8" strokeWidth="2.4" strokeLinecap="round" />
              </>
            )}
          </g>
        );

      case 'evade':
      case 'shoulderroll':
        return (
          <g>
            {/* Ghost Incoming Punch Overhead */}
            <g opacity="0.4">
              {renderTorsoAndShorts(142, 68, 12, 0.9, true)}
              {renderHead(134, 34, 0.9, true, 'ghost')}
              <path d="M 128 48 L 54 24" stroke={midInk} strokeWidth="8" strokeLinecap="round" />
            </g>
            <path d="M 68 88 L 48 110 M 86 88 L 106 110" stroke={ink} strokeWidth="9" strokeLinecap="round" />
            <path d="M 68 88 L 48 110 M 86 88 L 106 110" stroke={skinBase} strokeWidth="5" strokeLinecap="round" />
            {renderTorsoAndShorts(78, 72, artType === 'shoulderroll' ? -14 : -26, 0.94)}
            {renderHead(artType === 'shoulderroll' ? 76 : 62, artType === 'shoulderroll' ? 40 : 48, 0.94)}
            <path d="M 74 58 L 94 46" stroke={ink} strokeWidth="8" strokeLinecap="round" />
            {renderFist(96, 44, -15)}
            <path d="M 44 26 Q 76 12 108 30" fill="none" stroke="#15803d" strokeWidth="2.2" strokeDasharray="4 3" />
          </g>
        );

      case 'catchkick':
      case 'shincheck':
        return (
          <g>
            {artType === 'shincheck' ? (
              <>
                <g opacity="0.45">
                  {renderTorsoAndShorts(142, 68, -14, 0.9, true)}
                  {renderHead(146, 36, 0.9, true, 'ghost')}
                  <path d="M 134 76 L 88 78" stroke={midInk} strokeWidth="9" strokeLinecap="round" />
                </g>
                <path d="M 58 84 L 46 110" stroke={ink} strokeWidth="9" strokeLinecap="round" />
                <path d="M 58 84 L 46 110" stroke={skinDark} strokeWidth="5" strokeLinecap="round" />
                {/* Raised Lead Shin Check */}
                <path d="M 68 82 L 88 58 L 80 94" fill="none" stroke={ink} strokeWidth="9.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 68 82 L 88 58 L 80 94" fill="none" stroke={skinBase} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
                {renderTorsoAndShorts(60, 62, 6, 0.94)}
                {renderHead(62, 28, 0.94)}
                <polygon points="88,68 94,74 102,70 96,79 102,86 93,83 87,90 87,80 78,78 86,74" fill="#1d4ed8" stroke={ink} strokeWidth="1.2" />
              </>
            ) : (
              <>
                <path d="M 54 84 L 40 110 M 70 84 L 84 110" stroke={ink} strokeWidth="9" strokeLinecap="round" />
                <path d="M 54 84 L 40 110 M 70 84 L 84 110" stroke={skinBase} strokeWidth="5" strokeLinecap="round" />
                {renderTorsoAndShorts(62, 64, -6, 0.94)}
                {renderHead(62, 30, 0.94)}
                {/* Trapped opponent kick */}
                <g opacity="0.55">
                  {renderTorsoAndShorts(138, 66, -18, 0.9, true)}
                  {renderHead(144, 34, 0.9, true, 'ghost')}
                  <path d="M 128 74 L 78 58" stroke={ink} strokeWidth="9" strokeLinecap="round" />
                  <path d="M 128 74 L 78 58" stroke={skinDark} strokeWidth="5" strokeLinecap="round" />
                </g>
                <path d="M 68 54 L 94 60" stroke={ink} strokeWidth="8" strokeLinecap="round" />
                <path d="M 68 54 L 94 60" stroke={skinBase} strokeWidth="4.4" strokeLinecap="round" />
                {renderFist(96, 60, 12)}
              </>
            )}
          </g>
        );

      case 'parry':
        return (
          <g>
            <g opacity="0.45">
              {renderTorsoAndShorts(138, 68, 10, 0.9, true)}
              {renderHead(132, 34, 0.9, true, 'ghost')}
              <path d="M 124 48 L 80 34" stroke={midInk} strokeWidth="8" strokeLinecap="round" />
            </g>
            <path d="M 52 86 L 38 110 M 68 86 L 84 110" stroke={ink} strokeWidth="9" strokeLinecap="round" />
            <path d="M 52 86 L 38 110 M 68 86 L 84 110" stroke={skinBase} strokeWidth="5" strokeLinecap="round" />
            {renderTorsoAndShorts(60, 66, 6, 0.96)}
            {renderHead(62, 32, 0.96)}
            {/* Deflecting Parry Hand + Counter Strike */}
            <path d="M 68 50 L 94 34" stroke={ink} strokeWidth="7.5" strokeLinecap="round" />
            {renderFist(96, 32, -25)}
            <path d="M 70 58 L 122 44" stroke={ink} strokeWidth="8.5" strokeLinecap="round" />
            <path d="M 70 58 L 122 44" stroke={skinBase} strokeWidth="4.8" strokeLinecap="round" />
            {renderFist(124, 43, 0)}
            <path d="M 88 22 L 106 30 L 92 42" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" />
          </g>
        );

      case 'mani':
        return (
          <g>
            {/* Corner Cutman & Resting Warrior on Stool (Mani Time-Out) */}
            <rect x="44" y="76" width="38" height="8" rx="2" fill={midInk} stroke={ink} strokeWidth="1.6" />
            <path d="M 50 84 L 46 110 M 76 84 L 80 110" stroke={ink} strokeWidth="4" />
            {renderTorsoAndShorts(62, 58, 4, 0.88)}
            {renderHead(64, 28, 0.88)}
            {/* Cutman tending corner */}
            <g opacity="0.88">
              <path d="M 116 66 L 108 110 M 136 66 L 142 110" stroke={ink} strokeWidth="8" strokeLinecap="round" />
              <rect x="110" y="38" width="30" height="34" rx="5" fill="#2e2925" stroke={ink} strokeWidth="1.8" />
              {renderHead(124, 24, 0.84, true)}
              <path d="M 110 46 L 80 34" stroke={ink} strokeWidth="6.5" strokeLinecap="round" />
            </g>
            {/* Medical / Healing Cross Emblem */}
            <circle cx="152" cy="24" r="13" fill="#15803d" stroke={ink} strokeWidth="1.8" />
            <path d="M 152 17 L 152 31 M 145 24 L 159 24" stroke="#f5eedc" strokeWidth="3.6" strokeLinecap="round" />
          </g>
        );

      case 'surge':
        return (
          <g>
            {/* Second-wind Warrior Flexing Dual Guards */}
            <path d="M 78 86 L 62 110 M 102 86 L 118 110" stroke={ink} strokeWidth="9.5" strokeLinecap="round" />
            <path d="M 78 86 L 62 110 M 102 86 L 118 110" stroke={skinBase} strokeWidth="5.5" strokeLinecap="round" />
            {renderTorsoAndShorts(90, 66, 0, 1)}
            {renderHead(90, 32, 1)}
            <path d="M 70 54 L 46 42 L 42 26" fill="none" stroke={ink} strokeWidth="8.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 70 54 L 46 42 L 42 26" fill="none" stroke={skinBase} strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 110 54 L 134 42 L 138 26" fill="none" stroke={ink} strokeWidth="8.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 110 54 L 134 42 L 138 26" fill="none" stroke={skinBase} strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />
            {renderFist(41, 24, -10)}
            {renderFist(139, 24, 10)}
            <path d="M 28 16 L 34 26 M 152 16 L 146 26 M 90 6 L 90 14" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" />
          </g>
        );

      case 'takedown':
        return (
          <g>
            {/* Low Level-Change Double-Leg Takedown Drive */}
            <path d="M 30 98 L 16 110 M 54 96 L 78 110" stroke={ink} strokeWidth="9" strokeLinecap="round" />
            <path d="M 30 98 L 16 110 M 54 96 L 78 110" stroke={skinBase} strokeWidth="5" strokeLinecap="round" />
            <g transform="translate(56, 76) rotate(48)">
              {renderTorsoAndShorts(0, 0, 0, 0.92)}
              {renderHead(4, -30, 0.92)}
            </g>
            {/* Opponent Sprawl / Lifted Thighs */}
            <g opacity="0.72">
              <path d="M 118 82 L 106 110 M 136 82 L 154 110" stroke={ink} strokeWidth="9" strokeLinecap="round" />
              <path d="M 118 82 L 106 110 M 136 82 L 154 110" stroke={ghostFill} strokeWidth="5" strokeLinecap="round" />
              {renderTorsoAndShorts(128, 62, -16, 0.88, true)}
              {renderHead(122, 28, 0.88, true, 'ghost')}
            </g>
            {/* Gripping Takedown Arms Around Thighs */}
            <path d="M 74 72 L 114 84" stroke={ink} strokeWidth="8" strokeLinecap="round" />
            <path d="M 74 72 L 114 84" stroke={skinBase} strokeWidth="4.4" strokeLinecap="round" />
            {renderFist(116, 84, 15)}
            <path d="M 28 66 L 60 72 M 22 78 L 54 84" stroke="#991b1b" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        );

      case 'groundpound':
        return (
          <g>
            {/* Grounded Guard Opponent on Mat */}
            <g opacity="0.75">
              <path d="M 112 94 L 156 102" stroke={ink} strokeWidth="11" strokeLinecap="round" />
              <path d="M 112 94 L 156 102" stroke={ghostFill} strokeWidth="7" strokeLinecap="round" />
              <ellipse cx="136" cy="96" rx="22" ry="11" fill={ghostFill} stroke={midInk} strokeWidth="1.8" />
              {renderHead(102, 92, 0.84, true, 'sweat')}
            </g>
            {/* Top-Control Fighter Raining Heavy Hammerfist */}
            <path d="M 52 96 L 34 108 M 74 96 L 94 108" stroke={ink} strokeWidth="9" strokeLinecap="round" />
            <path d="M 52 96 L 34 108 M 74 96 L 94 108" stroke={skinBase} strokeWidth="5" strokeLinecap="round" />
            {renderTorsoAndShorts(66, 70, 26, 0.9)}
            {renderHead(78, 38, 0.9)}
            <path d="M 78 58 L 96 42 L 106 78" fill="none" stroke={ink} strokeWidth="8.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 78 58 L 96 42 L 106 78" fill="none" stroke={skinBase} strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />
            {renderFist(106, 80, 65)}
            <path d="M 104 42 L 114 70" stroke="#991b1b" strokeWidth="2" strokeDasharray="3 2" />
          </g>
        );

      case 'submission':
        return (
          <g>
            {/* Back-Mount / Armbar Lock Intertwined Fighters */}
            <g opacity="0.78">
              {renderTorsoAndShorts(106, 76, 36, 0.88, true)}
              {renderHead(124, 52, 0.88, true, 'sweat')}
            </g>
            <path d="M 48 92 L 34 108 M 74 92 L 122 104" stroke={ink} strokeWidth="9" strokeLinecap="round" />
            <path d="M 48 92 L 34 108 M 74 92 L 122 104" stroke={skinBase} strokeWidth="5" strokeLinecap="round" />
            {renderTorsoAndShorts(62, 68, 20, 0.92)}
            {renderHead(74, 34, 0.92)}
            {/* Locking Choke / Joint Control Forearm */}
            <path d="M 74 52 L 116 48 L 96 62" fill="none" stroke={ink} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 74 52 L 116 48 L 96 62" fill="none" stroke={skinBase} strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="122" cy="52" r="16" fill="none" stroke="#991b1b" strokeWidth="2" strokeDasharray="4 2" />
          </g>
        );

      case 'escape':
        return (
          <g>
            {/* Shrimp Hip Escape Standing Up Back to Guard */}
            <g opacity="0.45">
              {renderTorsoAndShorts(138, 80, 32, 0.86, true)}
              {renderHead(124, 56, 0.86, true, 'ghost')}
            </g>
            <path d="M 44 92 L 28 110 M 64 88 L 84 108" stroke={ink} strokeWidth="9" strokeLinecap="round" />
            <path d="M 44 92 L 28 110 M 64 88 L 84 108" stroke={skinBase} strokeWidth="5" strokeLinecap="round" />
            {renderTorsoAndShorts(56, 66, -12, 0.92)}
            {renderHead(54, 34, 0.92)}
            <path d="M 66 54 L 106 60" stroke={ink} strokeWidth="8" strokeLinecap="round" />
            <path d="M 66 54 L 106 60" stroke={skinBase} strokeWidth="4.4" strokeLinecap="round" />
            {renderFist(108, 60, 0)}
            <path d="M 38 42 L 38 18 M 31 25 L 38 16 L 45 25" fill="none" stroke="#15803d" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );

      case 'groggy':
      default:
        return (
          <g>
            {/* Wobbling Warrior Catching Balance Before Knockdown */}
            <path d="M 84 86 L 64 110 M 96 86 L 122 106" stroke={ink} strokeWidth="9" strokeLinecap="round" />
            <path d="M 84 86 L 64 110 M 96 86 L 122 106" stroke={skinBase} strokeWidth="5" strokeLinecap="round" />
            {renderTorsoAndShorts(86, 68, -22, 0.95)}
            {renderHead(74, 38, 0.95, false, 'sweat')}
            <path d="M 74 56 L 48 64 M 98 52 L 122 36" stroke={ink} strokeWidth="7.5" strokeLinecap="round" />
            {renderFist(46, 65, -20)}
            {renderFist(124, 34, 15)}
            <ellipse cx="74" cy="17" rx="18" ry="4" fill="none" stroke="#991b1b" strokeWidth="1.6" strokeDasharray="3 3" />
          </g>
        );
    }
  };

  return (
    <svg viewBox="0 0 180 112" className="w-full h-full" aria-hidden="true">
      <defs>
        <radialGradient id={gradParchment} cx="50%" cy="46%" r="65%">
          <stop offset="0%" stopColor="#efe6d4" />
          <stop offset="68%" stopColor="#dfd1b4" />
          <stop offset="100%" stopColor="#bfa985" />
        </radialGradient>
        <linearGradient id={gradSkin} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8dac2" />
          <stop offset="55%" stopColor="#d7c5a7" />
          <stop offset="100%" stopColor="#b09c7d" />
        </linearGradient>
        <linearGradient id={gradShadow} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14110f" stopOpacity="0" />
          <stop offset="100%" stopColor="#14110f" stopOpacity="0.16" />
        </linearGradient>
        <pattern id={hatchPat} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#14110f" strokeWidth="1" />
        </pattern>
      </defs>

      <rect x="0" y="0" width="180" height="112" fill={`url(#${gradParchment})`} />
      {/* Subtle vintage ink cross-hatched corner vignette */}
      <rect x="0" y="92" width="180" height="20" fill={`url(#${gradShadow})`} />
      <line x1="16" y1="106" x2="164" y2="106" stroke="#8a7961" strokeWidth="1.2" opacity="0.55" />
      {renderSketch()}
    </svg>
  );
};

export const CombatCard: React.FC<CombatCardProps> = ({
  card,
  effectivePower,
  triangleBonusPct = 0,
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
  const tierLabel = card.tier ?? 'I';
  const posTag =
    card.position === 'Ground'
      ? 'GROUND'
      : card.position === 'Clinch'
      ? 'CLINCH'
      : card.position === 'Any'
      ? 'ANY'
      : 'STAND';

  const cardBody = (
    <div
      className={`relative flex flex-col justify-between rounded-md bg-gradient-to-b from-[#3d342d] via-[#2c2520] to-[#1e1916] border-2 border-[#0a0908] shadow-[0_4px_0_#090a0c,inset_0_1px_0_rgba(255,235,200,0.22)] text-[#f5f2eb] overflow-hidden transition-transform duration-150 ${
        selected
          ? 'ring-3 ring-amber-400 -translate-y-1.5'
          : disabled
          ? 'opacity-45 grayscale-[40%]'
          : onClick
          ? 'hover:-translate-y-1.5 hover:ring-2 hover:ring-amber-400 cursor-pointer'
          : ''
      } p-1`}
    >
      {/* Top Crimson-Burgundy Banner with Tier Roman Numeral */}
      <div className="flex items-center justify-between gap-1 px-1.5 py-0.5 mb-1 rounded-t-sm bg-gradient-to-b from-[#8c2320] to-[#631513] border border-[#14100e] shadow-[inset_0_1px_0_rgba(255,210,190,0.2)]">
        <span
          className={`text-[9px] font-display font-extrabold px-1 rounded-xs border border-[#0a0908] shrink-0 ${
            tierLabel === 'III'
              ? 'bg-amber-400 text-black'
              : tierLabel === 'II'
              ? 'bg-zinc-200 text-black'
              : 'bg-[#2a221d] text-amber-200'
          }`}
          title={`Tier ${tierLabel}`}
        >
          {tierLabel}
        </span>
        <div
          className={`font-display font-extrabold tracking-wide leading-tight text-[#faf5eb] drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] truncate flex-1 text-center ${
            compact ? 'text-[11px]' : lang === 'my' ? 'text-[12px]' : 'text-xs sm:text-sm'
          }`}
          title={loc.name}
        >
          {loc.name}
        </div>
        {triangleBonusPct > 0 ? (
          <span className="text-[8px] font-mono-num font-extrabold px-1 rounded bg-emerald-400 text-black shrink-0">
            +{triangleBonusPct}%
          </span>
        ) : card.isCustomAi ? (
          <span className="text-[8px] font-bold uppercase px-1 rounded bg-amber-400 text-black shrink-0">
            AI
          </span>
        ) : null}
      </div>

      {/* Aged Parchment Cross-Hatched Comic Illustration Box + Overlapping Role Shield */}
      <div
        className={`relative w-full rounded-sm border-[1.5px] border-[#0a0908] overflow-visible bg-[#e6dac3] ${
          compact ? 'h-14' : 'h-[72px]'
        }`}
      >
        <div className="w-full h-full overflow-hidden rounded-[2px]">
          <CardIllustration artType={card.artType} />
        </div>
        {/* Position Badge Top-Left */}
        <span
          className={`absolute top-0.5 left-0.5 px-1 py-0.2 rounded-xs text-[7.5px] font-extrabold tracking-wider border border-[#0a0908] z-10 ${
            posTag === 'GROUND'
              ? 'bg-purple-800 text-amber-100'
              : posTag === 'CLINCH'
              ? 'bg-amber-600 text-black'
              : posTag === 'ANY'
              ? 'bg-zinc-800 text-zinc-200'
              : 'bg-[#1e2430]/90 text-sky-200'
          }`}
        >
          {posTag}
        </span>
        {/* Shield Emblem Badge at Bottom-Right Corner */}
        <div
          className={`absolute -bottom-1.5 right-1 w-5 h-5 rounded-b-md rounded-t-xs border-[1.5px] border-[#0a0908] shadow-md flex items-center justify-center z-10 ${
            isHeal
              ? 'bg-emerald-700'
              : isDefense
              ? 'bg-[#1e4d8c]'
              : 'bg-[#8f1d1d]'
          }`}
          aria-hidden="true"
        >
          {isHeal ? (
            <Flame className="w-3 h-3 text-amber-200" />
          ) : isDefense ? (
            <Shield className="w-3 h-3 text-sky-100" />
          ) : (
            <Swords className="w-3 h-3 text-amber-100" />
          )}
        </div>
      </div>

      {/* Charcoal Zone & Discipline Ribbon */}
      <div className="mt-1 mb-1 px-1.5 py-0.5 rounded-sm bg-[#211d1a] border border-[#0a0908] text-center text-[10px] font-bold tracking-wide text-[#f2e8d5] truncate pr-6">
        {loc.zoneLabel} ({loc.disciplineLabel})
      </div>

      {/* 3 Bold Color-Coded Stat Pills: Blue STA, Red DMG/DEF, Green SPD */}
      <div className="grid grid-cols-3 gap-1">
        <div
          className="flex items-center justify-center gap-0.5 rounded-sm bg-gradient-to-b from-[#2563eb] to-[#1e40af] border border-[#0a0908] py-0.5 px-1 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]"
          title={t.badgeSta}
        >
          <Activity className="w-2.5 h-2.5 shrink-0 text-sky-200" aria-hidden="true" />
          <span className="text-[8px] font-bold uppercase text-sky-100">{t.badgeSta}</span>
          <span className="font-mono-num font-extrabold text-[11px] leading-none">{card.staCost}</span>
        </div>

        <div
          className={`flex items-center justify-center gap-0.5 rounded-sm border border-[#0a0908] py-0.5 px-1 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] ${
            isHeal
              ? 'bg-gradient-to-b from-[#16a34a] to-[#15803d]'
              : 'bg-gradient-to-b from-[#dc2626] to-[#991b1b]'
          }`}
          title={isHeal ? t.badgeHeal : isDefense ? t.badgeDef : t.badgeDmg}
        >
          <span className="text-[8px] font-bold uppercase">
            {isHeal ? t.badgeHeal : isDefense ? t.badgeDef : t.badgeDmg}
          </span>
          <span className="font-mono-num font-extrabold text-[11px] leading-none">
            {isHeal ? `${powerValue}%` : powerValue}
          </span>
        </div>

        <div
          className="flex items-center justify-center gap-0.5 rounded-sm bg-gradient-to-b from-[#16a34a] to-[#166534] border border-[#0a0908] py-0.5 px-1 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]"
          title={t.badgeSpd}
        >
          <Clock className="w-2.5 h-2.5 shrink-0 text-emerald-200" aria-hidden="true" />
          <span className="text-[8px] font-bold uppercase text-emerald-100">{t.badgeSpd}</span>
          <span className="font-mono-num font-extrabold text-[11px] leading-none">{card.speed}</span>
        </div>
      </div>

      {/* Warm Parchment Footer Description Strip */}
      {!compact && (
        <div className="mt-1 px-1.5 py-0.5 rounded-sm bg-[#ded2b8] border border-[#0a0908] text-[#1c1917] h-[2.1rem] flex items-center">
          <p className="text-[9.5px] font-semibold leading-[1.18] line-clamp-2 w-full text-center">
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
      className="text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-md disabled:cursor-not-allowed"
    >
      {cardBody}
    </button>
  );
};
