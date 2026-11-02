/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Clock, HelpCircle, ShieldAlert, Sparkles, Wifi } from 'lucide-react';
import { Bet, BetTarget, PeriodResult, AdminSettings, UserProfile } from '../types/game';
import { sound } from '../utils/audio';
import { BetModal } from './BetModal';
import { ResultModal } from './ResultModal';
import { GameHistory } from './GameHistory';

interface WinGoGameProps {
  user: UserProfile;
  adminSettings: AdminSettings;
  onUpdateUserBalance: (newBalance: number, wonAmount?: number) => void;
  onAddBet: (bet: Bet) => void;
  userBets: Bet[];
  onUpdateBetStatus: (betId: string, status: 'won' | 'lost', winAmount: number) => void;
  onConsumeForcedResult: () => void;
  language: 'hi' | 'en';
  history: PeriodResult[];
  onAddPeriodResult: (result: PeriodResult) => void;
}

export const WinGoGame: React.FC<WinGoGameProps> = ({
  user,
  adminSettings,
  onUpdateUserBalance,
  onAddBet,
  userBets,
  onUpdateBetStatus,
  onConsumeForcedResult,
  language,
  history,
  onAddPeriodResult,
}) => {
  // Synchronized 1-Minute Period calculation from universal clock
  const getUniversalPeriod = () => {
    const now = Date.now();
    const nowSec = Math.floor(now / 1000);
    const sec = 60 - (nowSec % 60);

    const d = new Date(now);
    const dateStr = d.toISOString().slice(0, 10).replace(/-/g, '');
    const totalMinutes = d.getUTCHours() * 60 + d.getUTCMinutes();
    const periodSeq = String(totalMinutes).padStart(4, '0');
    const pId = `${dateStr}1000${periodSeq}`;

    return { pId, sec };
  };

  const initial = getUniversalPeriod();
  const [timeLeft, setTimeLeft] = useState<number>(initial.sec);
  const [periodId, setPeriodId] = useState<string>(initial.pId);

  // Bet modal state
  const [betModalOpen, setBetModalOpen] = useState<boolean>(false);
  const [selectedTarget, setSelectedTarget] = useState<BetTarget | null>(null);

  // Result dialog state
  const [resultModalOpen, setResultModalOpen] = useState<boolean>(false);
  const [latestResult, setLatestResult] = useState<PeriodResult | null>(null);
  const [lastRoundWon, setLastRoundWon] = useState<number>(0);
  const [lastRoundLost, setLastRoundLost] = useState<number>(0);

  // Rules popup
  const [rulesOpen, setRulesOpen] = useState<boolean>(false);

  // Reference to track bets for current period
  const userBetsRef = useRef<Bet[]>(userBets);
  useEffect(() => {
    userBetsRef.current = userBets;
  }, [userBets]);

  const lastDrawnPeriodRef = useRef<string>('');

  // 1-Minute Universal Timer Tick (Synced across all phones!)
  useEffect(() => {
    const syncInterval = setInterval(() => {
      const { pId, sec } = getUniversalPeriod();
      setTimeLeft(sec);
      setPeriodId(pId);

      // Play tick audio on last 5 seconds
      if (sec <= 6 && sec > 1) {
        sound.playTick();
      }

      // Check for round draw at transition to new minute (sec === 60 or sec === 59)
      const prevPeriodNumber = BigInt(pId) - 1n;
      const prevPeriodId = prevPeriodNumber.toString();

      if (lastDrawnPeriodRef.current !== prevPeriodId && sec >= 58) {
        lastDrawnPeriodRef.current = prevPeriodId;
        resolveRoundForPeriod(prevPeriodId);
      }
    }, 1000);

    return () => clearInterval(syncInterval);
  }, [adminSettings]);

  // Function to resolve round for a specific period ID
  const resolveRoundForPeriod = (drawPeriodId: string) => {
    let winningNum: number;

    if (adminSettings.forcedNextResult.number !== null && adminSettings.forcedNextResult.number !== undefined) {
      winningNum = Number(adminSettings.forcedNextResult.number);
      onConsumeForcedResult();
    } else if (adminSettings.rigMode === 'smart_house_win') {
      const periodBets = userBetsRef.current.filter(
        (b) => b.periodId === drawPeriodId && b.status === 'pending'
      );
      if (periodBets.length === 0) {
        winningNum = Math.floor(Math.random() * 10);
      } else {
        let minPayout = Infinity;
        let bestCandidate = 0;
        for (let candidate = 0; candidate <= 9; candidate++) {
          let testPayout = 0;
          for (const b of periodBets) {
            const betSum = b.amount * b.multiplier;
            if (typeof b.target === 'number' && b.target === candidate) testPayout += betSum * 9;
            if (b.target === 'big' && candidate >= 5) testPayout += betSum * 2;
            if (b.target === 'small' && candidate < 5) testPayout += betSum * 2;
            if (b.target === 'green') {
              if ([1, 3, 7, 9].includes(candidate)) testPayout += betSum * 2;
              if (candidate === 5) testPayout += betSum * 1.5;
            }
            if (b.target === 'red') {
              if ([2, 4, 6, 8].includes(candidate)) testPayout += betSum * 2;
              if (candidate === 0) testPayout += betSum * 1.5;
            }
            if (b.target === 'violet' && (candidate === 0 || candidate === 5)) {
              testPayout += betSum * 4.5;
            }
          }
          if (testPayout < minPayout) {
            minPayout = testPayout;
            bestCandidate = candidate;
          }
        }
        winningNum = bestCandidate;
      }
    } else {
      winningNum = Math.floor(Math.random() * 10);
    }

    let color: PeriodResult['color'] = 'green';
    if (winningNum === 0) color = 'red-violet';
    else if (winningNum === 5) color = 'green-violet';
    else if ([1, 3, 7, 9].includes(winningNum)) color = 'green';
    else color = 'red';

    const size = winningNum >= 5 ? 'big' : 'small';

    const newResult: PeriodResult = {
      periodId: drawPeriodId,
      timeMode: '1m',
      number: winningNum,
      color,
      size,
      timestamp: Date.now(),
    };

    onAddPeriodResult(newResult);
    setLatestResult(newResult);

    // Evaluate user's pending bets
    const currentPeriodBets = userBetsRef.current.filter(
      (b) => b.periodId === drawPeriodId && b.status === 'pending'
    );

    let roundWinTotal = 0;
    let roundLostTotal = 0;

    currentPeriodBets.forEach((b) => {
      const betTotal = b.amount * b.multiplier;
      let won = false;
      let payout = 0;

      if (typeof b.target === 'number' && b.target === winningNum) {
        won = true;
        payout = betTotal * 9;
      } else if (b.target === 'big' && size === 'big') {
        won = true;
        payout = betTotal * 2;
      } else if (b.target === 'small' && size === 'small') {
        won = true;
        payout = betTotal * 2;
      } else if (b.target === 'green') {
        if ([1, 3, 7, 9].includes(winningNum)) {
          won = true;
          payout = betTotal * 2;
        } else if (winningNum === 5) {
          won = true;
          payout = betTotal * 1.5;
        }
      } else if (b.target === 'red') {
        if ([2, 4, 6, 8].includes(winningNum)) {
          won = true;
          payout = betTotal * 2;
        } else if (winningNum === 0) {
          won = true;
          payout = betTotal * 1.5;
        }
      } else if (b.target === 'violet' && (winningNum === 0 || winningNum === 5)) {
        won = true;
        payout = betTotal * 4.5;
      }

      if (won) {
        roundWinTotal += payout;
        onUpdateBetStatus(b.id, 'won', payout);
      } else {
        roundLostTotal += betTotal;
        onUpdateBetStatus(b.id, 'lost', 0);
      }
    });

    if (currentPeriodBets.length > 0) {
      setLastRoundWon(roundWinTotal);
      setLastRoundLost(roundLostTotal);
      if (roundWinTotal > 0) {
        onUpdateUserBalance(user.balance + roundWinTotal, roundWinTotal);
      }
      setResultModalOpen(true);
    }
  };

  // Open bet modal
  const handleOpenBet = (target: BetTarget) => {
    if (timeLeft <= 5) return; // Locked in last 5 seconds!
    sound.playClick();
    setSelectedTarget(target);
    setBetModalOpen(true);
  };

  // Confirm bet
  const handleConfirmBet = (target: BetTarget, amount: number, multiplier: number) => {
    const totalBet = amount * multiplier;
    if (user.balance < totalBet) return;

    onUpdateUserBalance(user.balance - totalBet);

    const newBet: Bet = {
      id: `bet_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      periodId,
      timeMode: '1m',
      target,
      amount,
      multiplier,
      timestamp: Date.now(),
      status: 'pending',
    };

    onAddBet(newBet);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLocked = timeLeft <= 5;

  return (
    <div className="max-w-md mx-auto px-2 py-3 space-y-3 pb-24">
      {/* 1-Minute Live Server Status Header (Universal Sync) */}
      <div className="bg-gradient-to-r from-red-950 via-[#1b1f33] to-[#141624] p-3 rounded-2xl border border-red-500/30 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-amber-600 flex items-center justify-center text-white shadow-md">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-['Rajdhani'] font-extrabold text-white text-sm uppercase tracking-wider">
                Win Go 1Min
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-black text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                LIVE SYNC
              </span>
            </div>
            <div className="text-[10px] text-gray-400">
              {language === 'hi' ? 'सभी फ़ोनों में एक समान लाइव टाइमर' : 'Universal Real-Time 1-Minute Game'}
            </div>
          </div>
        </div>

        <button
          onClick={() => setRulesOpen(true)}
          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 text-xs font-bold flex items-center gap-1"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>{language === 'hi' ? 'नियम' : 'Rules'}</span>
        </button>
      </div>

      {/* Main Game Status Card (Tiranga / OK Win Signature Card) */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-amber-500/30 bg-gradient-to-br from-[#1b1e2e] via-[#161825] to-[#12141f] p-4">
        {/* Top Info Row */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <div className="text-xs font-extrabold text-amber-400 font-['Rajdhani'] uppercase tracking-wider">
              {language === 'hi' ? 'वर्तमान अवधि (Period)' : 'Current Period'}
            </div>
            <div className="text-sm font-mono font-bold text-white mt-0.5">
              {periodId}
            </div>
          </div>

          {/* Digital Countdown Timer */}
          <div className="text-right">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">
              Time Remaining
            </div>
            <div className="flex items-center gap-1 font-mono font-black text-xl">
              <span className="bg-[#24283d] text-white px-2 py-1 rounded-lg border border-white/10 shadow-inner">
                {String(minutes).padStart(2, '0')}
              </span>
              <span className="text-amber-400 animate-pulse">:</span>
              <span
                className={`px-2 py-1 rounded-lg border shadow-inner ${
                  isLocked
                    ? 'bg-rose-600/30 text-rose-400 border-rose-500 animate-bounce'
                    : 'bg-[#24283d] text-white border-white/10'
                }`}
              >
                {String(seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* 5-Second Countdown Overlay when Locked */}
        {isLocked && (
          <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in">
            <div className="text-xs uppercase tracking-widest text-amber-400 font-bold mb-1 flex items-center gap-1">
              <ShieldAlert className="w-4 h-4 text-rose-500 animate-spin" />
              <span>Betting Locked</span>
            </div>
            <div className="text-7xl font-black font-['Chakra_Petch'] text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-rose-500 to-red-600 animate-ping">
              {seconds}
            </div>
            <div className="text-xs text-gray-300 font-medium mt-2">
              Synchronizing Draw with All Devices...
            </div>
          </div>
        )}

        {/* Betting Area */}
        <div className="pt-3 space-y-3">
          {/* Three Main Color Buttons: Green, Violet, Red */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleOpenBet('green')}
              disabled={isLocked}
              className="group relative overflow-hidden py-3 px-2 rounded-2xl bg-gradient-to-b from-emerald-500 to-emerald-700 hover:brightness-110 active:scale-95 shadow-lg shadow-emerald-900/40 border border-emerald-400/40 transition-all disabled:opacity-50"
            >
              <div className="font-extrabold text-sm tracking-wide text-white drop-shadow">
                {language === 'hi' ? 'हरा Green' : 'Green'}
              </div>
              <div className="text-[10px] font-bold text-emerald-200 mt-0.5">2X</div>
            </button>

            <button
              onClick={() => handleOpenBet('violet')}
              disabled={isLocked}
              className="group relative overflow-hidden py-3 px-2 rounded-2xl bg-gradient-to-b from-purple-500 to-purple-800 hover:brightness-110 active:scale-95 shadow-lg shadow-purple-900/40 border border-purple-400/40 transition-all disabled:opacity-50"
            >
              <div className="font-extrabold text-sm tracking-wide text-white drop-shadow">
                {language === 'hi' ? 'बैंगनी Violet' : 'Violet'}
              </div>
              <div className="text-[10px] font-bold text-purple-200 mt-0.5">4.5X</div>
            </button>

            <button
              onClick={() => handleOpenBet('red')}
              disabled={isLocked}
              className="group relative overflow-hidden py-3 px-2 rounded-2xl bg-gradient-to-b from-rose-600 to-red-700 hover:brightness-110 active:scale-95 shadow-lg shadow-red-900/40 border border-rose-400/40 transition-all disabled:opacity-50"
            >
              <div className="font-extrabold text-sm tracking-wide text-white drop-shadow">
                {language === 'hi' ? 'लाल Red' : 'Red'}
              </div>
              <div className="text-[10px] font-bold text-rose-200 mt-0.5">2X</div>
            </button>
          </div>

          {/* Numbers 0 to 9 Grid (9X payout) */}
          <div className="bg-[#1c2033] p-2.5 rounded-2xl border border-white/10 shadow-inner">
            <div className="grid grid-cols-5 gap-2">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                let bgGradient = '';
                if (num === 0) bgGradient = 'from-rose-600 via-rose-600 to-purple-700';
                else if (num === 5) bgGradient = 'from-emerald-600 via-emerald-600 to-purple-700';
                else if ([1, 3, 7, 9].includes(num)) bgGradient = 'from-emerald-500 to-emerald-700';
                else bgGradient = 'from-rose-500 to-red-700';

                return (
                  <button
                    key={num}
                    onClick={() => handleOpenBet(num)}
                    disabled={isLocked}
                    className={`relative py-2 rounded-xl bg-gradient-to-br ${bgGradient} text-white font-black text-lg shadow-md hover:brightness-115 active:scale-95 transition-all flex flex-col items-center justify-center border border-white/20 disabled:opacity-50`}
                  >
                    <span>{num}</span>
                    <span className="text-[9px] font-bold text-white/80 font-mono -mt-1">
                      9X
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Big & Small Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleOpenBet('big')}
              disabled={isLocked}
              className="py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-orange-950/40 hover:brightness-110 active:scale-95 border border-amber-400/40 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <span>{language === 'hi' ? 'बड़ा (Big 5-9)' : 'Big (5-9)'}</span>
              <span className="text-xs text-amber-200">2X</span>
            </button>

            <button
              onClick={() => handleOpenBet('small')}
              disabled={isLocked}
              className="py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-700 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-950/40 hover:brightness-110 active:scale-95 border border-sky-400/40 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <span>{language === 'hi' ? 'छोटा (Small 0-4)' : 'Small (0-4)'}</span>
              <span className="text-xs text-sky-200">2X</span>
            </button>
          </div>
        </div>
      </div>

      {/* Rules Dialog */}
      {rulesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#171926] border border-white/20 rounded-3xl p-5 max-w-sm text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-base text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>{language === 'hi' ? 'Win Go 1Min के नियम' : 'Win Go 1Min Rules'}</span>
              </h3>
              <button
                onClick={() => setRulesOpen(false)}
                className="text-gray-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-xs text-gray-300 py-3 leading-relaxed">
              <p>
                <strong>1. 1 Minute Synchronized:</strong> Every minute on the universal clock is one full betting & draw cycle across all phones.
              </p>
              <p>
                <strong>2. Green (2X):</strong> If the result is 1, 3, 7, 9, you win 2X. If the result is 5, you win 1.5X.
              </p>
              <p>
                <strong>3. Red (2X):</strong> If the result is 2, 4, 6, 8, you win 2X. If the result is 0, you win 1.5X.
              </p>
              <p>
                <strong>4. Violet (4.5X):</strong> If the result is 0 or 5, you win 4.5X.
              </p>
              <p>
                <strong>5. Numbers 0-9 (9X):</strong> If your chosen number appears, you win 9X!
              </p>
              <p className="text-amber-400/90 font-medium">
                * Betting closes at the final 5 seconds before the 1-minute mark.
              </p>
            </div>
            <button
              onClick={() => setRulesOpen(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase"
            >
              {language === 'hi' ? 'समझ गया' : 'I Understand'}
            </button>
          </div>
        </div>
      )}

      {/* Bet Modal */}
      <BetModal
        target={selectedTarget}
        periodId={periodId}
        userBalance={user.balance}
        isOpen={betModalOpen}
        onClose={() => setBetModalOpen(false)}
        onConfirm={handleConfirmBet}
        language={language}
      />

      {/* Result Celebration Modal */}
      <ResultModal
        isOpen={resultModalOpen}
        onClose={() => setResultModalOpen(false)}
        result={latestResult}
        totalWon={lastRoundWon}
        totalLost={lastRoundLost}
        language={language}
      />

      {/* Game History Tabs & Trend Chart with Total Records */}
      <GameHistory history={history} userBets={userBets} language={language} />
    </div>
  );
};
