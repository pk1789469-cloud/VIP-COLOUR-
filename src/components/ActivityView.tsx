/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Gift, CalendarCheck, Sparkles, Check, Flame, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';

interface ActivityViewProps {
  onClaimReward: (amount: number) => void;
  language: 'hi' | 'en';
}

export const ActivityView: React.FC<ActivityViewProps> = ({ onClaimReward, language }) => {
  const [claimedDays, setClaimedDays] = useState<number[]>([1, 2]);
  const [todayClaimed, setTodayClaimed] = useState<boolean>(false);

  const days = [
    { day: 1, reward: 5 },
    { day: 2, reward: 10 },
    { day: 3, reward: 15 },
    { day: 4, reward: 25 },
    { day: 5, reward: 35 },
    { day: 6, reward: 50 },
    { day: 7, reward: 100 },
  ];

  const handleClaimToday = () => {
    if (todayClaimed) return;
    sound.playWin();
    try {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    } catch {
      // ignore
    }
    setClaimedDays((prev) => [...prev, 3]);
    setTodayClaimed(true);
    onClaimReward(15);
  };

  return (
    <div className="max-w-md mx-auto px-3 py-4 space-y-4 pb-24 animate-in fade-in text-white">
      {/* Daily Sign-In Banner */}
      <div className="rounded-3xl p-5 bg-gradient-to-br from-amber-500 via-rose-600 to-red-700 shadow-xl border border-white/20 text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 border border-white/20 text-xs font-bold text-amber-300">
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>7-Day Attendance Reward</span>
        </div>
        <h3 className="text-xl font-black font-['Rajdhani'] uppercase tracking-wider text-white">
          {language === 'hi' ? 'दैनिक उपस्थिति बोनस प्राप्त करें' : 'Daily Sign-In Cash Rewards'}
        </h3>
        <p className="text-xs text-white/90">
          Sign in daily to claim up to ₹100 free betting credits!
        </p>
      </div>

      {/* 7 Days Grid */}
      <div className="bg-[#171926] p-4 rounded-2xl border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-gray-300">Continuous Sign-In: 3 Days</div>
          <span className="text-xs text-amber-400 font-bold">Rule: Reset on skip</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {days.map((d) => {
            const isClaimed = claimedDays.includes(d.day);
            const isToday = d.day === 3 && !todayClaimed;

            return (
              <div
                key={d.day}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                  isClaimed
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : isToday
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 animate-pulse'
                    : 'bg-[#20253b] border-white/5 text-gray-400'
                }`}
              >
                <span className="text-[10px] font-mono font-semibold">Day {d.day}</span>
                <div className="w-7 h-7 my-1 rounded-full bg-white/10 flex items-center justify-center">
                  {isClaimed ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Gift className={`w-3.5 h-3.5 ${isToday ? 'text-amber-400' : 'text-gray-400'}`} />
                  )}
                </div>
                <span className="text-xs font-black font-mono">₹{d.reward}</span>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleClaimToday}
          disabled={todayClaimed}
          className={`w-full py-3 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg transition-all active:scale-95 ${
            todayClaimed
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-60'
              : 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white shadow-rose-950/40 hover:brightness-110'
          }`}
        >
          {todayClaimed ? 'Already Claimed Today ✅' : 'Claim Today\'s ₹15 Bonus'}
        </button>
      </div>

      {/* Bonus Activities List */}
      <div className="space-y-2.5">
        <div className="bg-[#171926] p-3.5 rounded-2xl border border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-xs text-white">First Deposit 100% Cash Bonus</div>
            <div className="text-[11px] text-gray-400">Recharge ₹500 get extra ₹500 instantly</div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
            Active
          </span>
        </div>

        <div className="bg-[#171926] p-3.5 rounded-2xl border border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-rose-600 flex items-center justify-center text-white shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-xs text-white">Weekly Win Streak Bonanza</div>
            <div className="text-[11px] text-gray-400">Win 5 consecutive games to unlock ₹2,000 prize</div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 font-bold">
            Participate
          </span>
        </div>
      </div>
    </div>
  );
};
