import { useEffect, useState } from 'react';
import { BattleArena } from './components/BattleArena';
import { CharacterCreation } from './components/CharacterCreation';
import { FighterHub } from './components/FighterHub';
import { TitleScreen } from './components/TitleScreen';
import { generateOpponent } from './game/rules';
import {
  FighterProfile,
  GameScreen,
  Language,
  MatchMode,
  OpponentProfile,
} from './types/game';
import {
  createQuickStartDemoFighter,
  loadCareer,
  loadLanguage,
  saveCareer,
  saveLanguage,
} from './utils/storage';

export default function App() {
  const [lang, setLang] = useState<Language>(() => loadLanguage());
  const [savedFighter, setSavedFighter] = useState<FighterProfile | null>(() =>
    loadCareer()
  );
  const [fighter, setFighter] = useState<FighterProfile | null>(null);
  const [screen, setScreen] = useState<GameScreen>('title');
  const [activeMatch, setActiveMatch] = useState<{
    mode: MatchMode;
    opponent: OpponentProfile;
    matchKey: number;
  } | null>(null);

  // Support ?autostart=1 to jump directly into playable Battle Arena
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      const f = loadCareer() ?? createQuickStartDemoFighter();
      saveCareer(f);
      setSavedFighter(f);
      setFighter(f);
      setActiveMatch({
        mode: 'sparring',
        opponent: generateOpponent(f, 'sparring'),
        matchKey: Date.now(),
      });
      setScreen('battle');
    }
  }, []);

  // Sync document.body.dataset.state for non-battle screens
  useEffect(() => {
    if (screen === 'title') {
      document.body.dataset.state = 'title';
    } else if (screen === 'creation') {
      document.body.dataset.state = 'creation';
    } else if (screen === 'hub') {
      document.body.dataset.state = 'hub';
    }
  }, [screen]);

  const handleToggleLang = () => {
    setLang((prev) => {
      const next: Language = prev === 'en' ? 'my' : 'en';
      saveLanguage(next);
      return next;
    });
  };

  const handleUpdateFighter = (updated: FighterProfile) => {
    setFighter(updated);
    setSavedFighter(updated);
    saveCareer(updated);
  };

  const handleConfirmNewFighter = (newFighter: FighterProfile) => {
    handleUpdateFighter(newFighter);
    setScreen('hub');
  };

  const handleContinueCareer = () => {
    const loaded = loadCareer();
    if (!loaded) return;
    setFighter(loaded);
    setScreen('hub');
  };

  const handleStartMatch = (mode: MatchMode, customOpponent?: OpponentProfile) => {
    if (!fighter) return;
    const healedFighter = {
      ...fighter,
      currentHp: fighter.maxHp,
      currentSta: fighter.maxSta,
    };
    handleUpdateFighter(healedFighter);
    setActiveMatch({
      mode,
      opponent: customOpponent ?? generateOpponent(healedFighter, mode),
      matchKey: Date.now(),
    });
    setScreen('battle');
  };

  const handleMatchFinish = (result: {
    winner: 'player' | 'ai';
    method: string;
    isKo: boolean;
    xpEarned: number;
    remainingHp: number;
    remainingSta: number;
    damageDealt: number;
  }) => {
    if (!fighter || !activeMatch) return;
    const mode = activeMatch.mode;
    const won = result.winner === 'player';

    const nextRecord = { ...fighter.record };
    if (mode === 'sparring') {
      if (won) nextRecord.sparringWins += 1;
    } else {
      if (won) {
        nextRecord.wins += 1;
        if (result.isKo) nextRecord.kos += 1;
        if (mode === 'local') nextRecord.localWins += 1;
        if (mode === 'championship') nextRecord.championshipWins += 1;
      } else {
        nextRecord.losses += 1;
      }
    }

    const updated: FighterProfile = {
      ...fighter,
      trainingXp: fighter.trainingXp + result.xpEarned,
      currentHp: Math.max(Math.round(fighter.maxHp * 0.25), result.remainingHp),
      currentSta: Math.max(2, result.remainingSta),
      record: nextRecord,
    };
    handleUpdateFighter(updated);
  };

  const handleRematch = () => {
    if (!fighter || !activeMatch) return;
    setActiveMatch({
      mode: activeMatch.mode,
      opponent: generateOpponent(fighter, activeMatch.mode),
      matchKey: Date.now(),
    });
  };

  if (screen === 'title') {
    return (
      <TitleScreen
        savedFighter={savedFighter}
        lang={lang}
        onToggleLang={handleToggleLang}
        onNewCareer={() => setScreen('creation')}
        onContinueCareer={handleContinueCareer}
      />
    );
  }

  if (screen === 'creation') {
    return (
      <CharacterCreation
        lang={lang}
        onToggleLang={handleToggleLang}
        onBack={() => setScreen('title')}
        onConfirm={handleConfirmNewFighter}
      />
    );
  }

  if (screen === 'battle' && fighter && activeMatch) {
    return (
      <BattleArena
        key={activeMatch.matchKey}
        fighter={fighter}
        opponent={activeMatch.opponent}
        mode={activeMatch.mode}
        lang={lang}
        onToggleLang={handleToggleLang}
        onMatchFinish={handleMatchFinish}
        onExitToHub={() => {
          setActiveMatch(null);
          setScreen('hub');
        }}
        onRematch={handleRematch}
      />
    );
  }

  if (screen === 'hub' && fighter) {
    return (
      <FighterHub
        fighter={fighter}
        lang={lang}
        onToggleLang={handleToggleLang}
        onUpdateFighter={handleUpdateFighter}
        onStartMatch={handleStartMatch}
        onBackToTitle={() => setScreen('title')}
      />
    );
  }

  return (
    <TitleScreen
      savedFighter={savedFighter}
      lang={lang}
      onToggleLang={handleToggleLang}
      onNewCareer={() => setScreen('creation')}
      onContinueCareer={handleContinueCareer}
    />
  );
}
