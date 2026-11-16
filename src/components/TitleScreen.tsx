import React, { useEffect, useState } from 'react';
import { BookOpen, Play, PlusCircle, Shield, Swords, Timer, Trophy, X } from 'lucide-react';
import { FighterProfile } from '../types/game';
import { soundEngine } from '../utils/sound';

interface TitleScreenProps {
  savedFighter: FighterProfile | null;
  onNewCareer: () => void;
  onContinueCareer: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  savedFighter,
  onNewCareer,
  onContinueCareer,
}) => {
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showHowToPlay) {
        if (e.key === 'Escape') setShowHowToPlay(false);
        return;
      }
      if (e.key === 'Enter' || e.key === ' ') {
        const activeTag = document.activeElement?.tagName;
        if (activeTag === 'BUTTON') return;
        e.preventDefault();
        soundEngine.playClick();
        if (savedFighter) {
          onContinueCareer();
        } else {
          onNewCareer();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [savedFighter, showHowToPlay, onContinueCareer, onNewCareer]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#0a0b0e] text-[#f5f2eb] flex flex-col justify-between">
      {/* Uploaded Image 2: Fighting Stage Key Art Backdrop */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <img
          src="/assets/aistudio/Gemini_Generated_Image_wgz2tawgz2tawgz2_2a766fe9.jpeg"
          alt="Nine Limbs Lethwei Arena Stage"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090a0c]/95 via-[#090a0c]/75 to-[#090a0c]/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090a0c]/90 via-transparent to-[#090a0c]/40" />
      </div>

      {/* Left-Aligned Championship Title Lockup & Menu Actions */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-6 sm:px-12 flex-1 flex flex-col justify-center">
        <div className="max-w-lg">
          <div className="mb-4">
            <svg
              viewBox="0 0 540 160"
              className="w-full max-w-[460px] h-auto drop-shadow-[6px_6px_0px_#090a0c]"
              role="img"
              aria-label="Lethwei Kings: Striking Federation"
            >
              <polygon
                points="14,16 492,6 476,40 8,46"
                fill="#dc2626"
                stroke="#090a0c"
                strokeWidth="4"
              />
              <text
                x="28"
                y="32"
                fill="#fef3c7"
                fontFamily="Barlow Condensed, sans-serif"
                fontWeight="800"
                fontSize="20"
                letterSpacing="4"
              >
                MYANMAR LETHWEI · STAND-UP FEDERATION
              </text>
              <text
                x="12"
                y="108"
                fill="#f5f2eb"
                stroke="#090a0c"
                strokeWidth="9"
                paintOrder="stroke fill"
                fontFamily="Barlow Condensed, sans-serif"
                fontWeight="800"
                fontStyle="italic"
                fontSize="80"
                letterSpacing="2"
              >
                LETHWEI
              </text>
              <text
                x="18"
                y="152"
                fill="#eab308"
                stroke="#090a0c"
                strokeWidth="8"
                paintOrder="stroke fill"
                fontFamily="Barlow Condensed, sans-serif"
                fontWeight="800"
                fontStyle="italic"
                fontSize="56"
                letterSpacing="5"
              >
                KINGS
              </text>
            </svg>
          </div>

          <p className="text-zinc-200 text-sm sm:text-base leading-relaxed max-w-md mb-6">
            Master bare-knuckle Lethwei, Muay Thai, Boxing, Kickboxing, and Karate in strict standing combat. No ground game—generate AI rivals &amp; custom techniques with Gemini.
          </p>

          {/* Primary Menu Buttons (3 actions) */}
          <div className="flex flex-col gap-3 max-w-sm">
            <button
              type="button"
              data-start={savedFighter ? 'true' : undefined}
              disabled={!savedFighter}
              onClick={() => {
                if (!savedFighter) return;
                soundEngine.playClick();
                onContinueCareer();
              }}
              className={`group flex items-center justify-between px-5 py-3.5 rounded-lg comic-panel transition-transform duration-150 ${
                savedFighter
                  ? 'bg-red-600 hover:bg-red-500 text-white active:translate-y-0.5 cursor-pointer'
                  : 'bg-[#181b22]/90 text-zinc-500 opacity-70 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3 text-left">
                <Play className="w-5 h-5 shrink-0 fill-current" aria-hidden="true" />
                <div>
                  <div className="font-display font-extrabold text-2xl tracking-wide leading-none">
                    CONTINUE CAREER
                  </div>
                  <div className="text-xs mt-1 font-medium">
                    {savedFighter
                      ? `${savedFighter.name} · ${savedFighter.record.wins}W-${savedFighter.record.losses}L (${savedFighter.record.kos} KO)`
                      : 'No saved career yet'}
                  </div>
                </div>
              </div>
              {savedFighter && (
                <span className="font-mono-num text-xs font-bold bg-black/30 px-2 py-1 rounded">
                  RESUME
                </span>
              )}
            </button>

            <button
              type="button"
              data-start={savedFighter ? undefined : 'true'}
              onClick={() => {
                soundEngine.playClick();
                onNewCareer();
              }}
              className={`flex items-center justify-between px-5 py-3.5 rounded-lg comic-panel transition-transform duration-150 active:translate-y-0.5 cursor-pointer ${
                savedFighter
                  ? 'bg-[#20232b] hover:bg-[#2a2e38] text-white'
                  : 'bg-red-600 hover:bg-red-500 text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <PlusCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span className="font-display font-extrabold text-2xl tracking-wide leading-none">
                  NEW CAREER
                </span>
              </div>
              <span className="text-xs uppercase tracking-wider font-bold text-amber-300">
                Create Fighter
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setShowHowToPlay(true);
              }}
              className="flex items-center justify-between px-5 py-3 bg-[#16181e]/95 hover:bg-[#20232b] text-zinc-200 rounded-lg comic-panel-sm transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-amber-400 shrink-0" aria-hidden="true" />
                <span className="font-display font-bold text-xl tracking-wide leading-none">
                  HOW TO PLAY
                </span>
              </div>
              <span className="text-xs text-zinc-400">Rules &amp; Badges</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Safe Margin Control Hint */}
      <footer className="relative z-10 max-w-7xl w-full mx-auto px-6 sm:px-12 pb-4 flex items-center justify-between gap-4 text-xs text-zinc-400">
        <span>Enter / Space Start · Landscape Ring View · Click Cards to Clash</span>
        <span>Progress auto-saved locally</span>
      </footer>

      {/* HOW TO PLAY MODAL */}
      {showHowToPlay && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="howtoplay-title"
        >
          <div className="bg-[#181b22] text-[#f5f2eb] rounded-xl comic-panel max-w-2xl w-full max-h-[86vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-700">
              <h2 id="howtoplay-title" className="font-display font-extrabold text-3xl text-amber-400">
                LETHWEI RULES &amp; COMBAT GUIDE
              </h2>
              <button
                type="button"
                onClick={() => setShowHowToPlay(false)}
                aria-label="Close How To Play"
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mt-4 text-sm text-zinc-200 leading-relaxed">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-[#12141a] border border-sky-700/60">
                  <div className="font-display font-bold text-lg text-sky-400 mb-1">
                    BLUE BADGE · STA
                  </div>
                  <p className="text-xs text-zinc-300">
                    Stamina cost to play the card. Click REST / RECOVER STA (+4 STA) when fatigued.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[#12141a] border border-red-700/60">
                  <div className="font-display font-bold text-lg text-red-400 mb-1">
                    RED BADGE · DMG / DEF
                  </div>
                  <p className="text-xs text-zinc-300">
                    Base damage dealt on Strikes, or damage blocked/evaded on Defense cards.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[#12141a] border border-emerald-700/60">
                  <div className="font-display font-bold text-lg text-emerald-400 mb-1">
                    GREEN BADGE · SPD
                  </div>
                  <p className="text-xs text-zinc-300">
                    Lower SPD strikes first! A KO strike cancels the slower opponent&apos;s move.
                  </p>
                </div>
              </div>

              <div className="bg-[#12141a] p-4 rounded-lg border border-zinc-800 space-y-2">
                <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
                  <Swords className="w-5 h-5 text-red-500" aria-hidden="true" />
                  <span>STRICTLY STANDING COMBAT (NO GROUND GAME)</span>
                </h3>
                <p className="text-zinc-300 text-xs">
                  Only standing strikes (fists, kicks, elbows, knees, Lethwei Headbutt), Clinch, and Body Slams (which deal impact damage and reset distance) are permitted.
                </p>
              </div>

              <div className="bg-[#12141a] p-4 rounded-lg border border-zinc-800 space-y-2">
                <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
                  <Timer className="w-5 h-5 text-amber-400" aria-hidden="true" />
                  <span>CRITICAL CARDS (&lt;35% HP) &amp; GEMINI AI FORGE</span>
                </h3>
                <p className="text-zinc-300 text-xs">
                  Below 35% HP, Mani (heals 25% HP once per match), Desperation Combo, Adrenaline Surge, and Groggy Recovery unlock. Use Gemini AI in Character Creation and Training Camp to forge custom Fighters &amp; Skill Cards!
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-sky-400" aria-hidden="true" />
                  10-card Fight Deck in Game Plan
                </span>
                <span className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" aria-hidden="true" />
                  3 Local Promotion Wins unlock Championship
                </span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHowToPlay(false)}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-display font-bold text-lg rounded-lg comic-panel-sm cursor-pointer"
              >
                GOT IT, LET&apos;S FIGHT
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
