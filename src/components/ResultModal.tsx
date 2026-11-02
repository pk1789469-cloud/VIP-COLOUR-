/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Frown, X } from 'lucide-react';
import { PeriodResult } from '../types/game';
import { sound } from '../utils/audio';

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: PeriodResult | null;
  totalWon: number;
  totalLost: number;
  language: 'hi' | 'en';
}

export const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  onClose,
  result,
  totalWon,
  totalLost,
  language,
}) => {
  useEffect(() => {
    if (isOpen && totalWon > 0) {
      sound.playWin();
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ffd700', '#ff0055', '#00ff88', '#ffffff'],
        });
      } catch {
        // Ignore
      }
    } else if (isOpen && totalLost > 0 && totalWon === 0) {
      sound.playLose();
    }
  }, [isOpen, totalWon, totalLost]);

  if (!isOpen || !result) return null;

  const isWin = totalWon > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-[#171926] text-center">
        {/* Top Header Background */}
        <div
          className={`py-6 px-4 ${
            isWin
              ? 'bg-gradient-to-b from-amber-500 via-rose-600 to-red-700'
              : 'bg-gradient-to-b from-gray-700 via-slate-800 to-[#171926]'
          } text-white flex flex-col items-center justify-center`}
        >
          {isWin ? (
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-2 shadow-inner border border-white/30 animate-bounce">
              <Trophy className="w-9 h-9 text-amber-300 drop-shadow" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-2">
              <Frown className="w-8 h-8 text-gray-400" />
            </div>
          )}

          <h3 className="text-2xl font-black font-['Rajdhani'] uppercase tracking-wider">
            {isWin
              ? language === 'hi'
                ? '🎉 बधाई हो! आप जीत गए!'
                : '🎉 Congratulations! You Won!'
              : language === 'hi'
              ? 'अगली बार बेहतर प्रयास करें'
              : 'Better Luck Next Time'}
          </h3>
          <p className="text-xs text-white/80 font-mono mt-0.5">
            Period: {result.periodId}
          </p>
        </div>

        {/* Content Box */}
        <div className="p-5 space-y-4">
          {/* Winning outcome badge */}
          <div className="bg-[#212437] p-3 rounded-2xl border border-white/5 flex items-center justify-around">
            <div>
              <div className="text-[11px] text-gray-400 mb-1">
                {language === 'hi' ? 'लकी नंबर' : 'Lucky Number'}
              </div>
              <div
                className={`w-12 h-12 mx-auto rounded-full font-black text-2xl flex items-center justify-center shadow-lg ${
                  result.color === 'green'
                    ? 'bg-emerald-600 text-white'
                    : result.color === 'red'
                    ? 'bg-rose-600 text-white'
                    : result.color === 'green-violet'
                    ? 'bg-gradient-to-tr from-emerald-600 to-purple-600 text-white'
                    : 'bg-gradient-to-tr from-rose-600 to-purple-600 text-white'
                }`}
              >
                {result.number}
              </div>
            </div>

            <div className="h-10 w-[1px] bg-white/10" />

            <div>
              <div className="text-[11px] text-gray-400 mb-1">
                {language === 'hi' ? 'रंग / आकार' : 'Color / Size'}
              </div>
              <div className="flex items-center gap-1.5 justify-center">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                    result.color.includes('green')
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  }`}
                >
                  {result.color}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  {result.size}
                </span>
              </div>
            </div>
          </div>

          {/* Win/Loss Amount Display */}
          {isWin ? (
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3 text-center">
              <div className="text-xs text-emerald-400 font-semibold">
                {language === 'hi' ? 'कुल जीती गई राशि' : 'Total Net Profit'}
              </div>
              <div className="text-3xl font-black text-amber-400 font-mono tracking-tight mt-0.5">
                +₹{totalWon.toFixed(2)}
              </div>
            </div>
          ) : (
            <div className="bg-rose-950/30 border border-rose-500/20 rounded-2xl p-3 text-center">
              <div className="text-xs text-rose-300 font-semibold">
                {language === 'hi' ? 'कुल राशि' : 'Total Amount'}
              </div>
              <div className="text-2xl font-black text-rose-400 font-mono tracking-tight mt-0.5">
                -₹{totalLost.toFixed(2)}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:brightness-110 text-white font-extrabold text-sm tracking-wider uppercase shadow-lg shadow-rose-900/40 active:scale-95"
          >
            {language === 'hi' ? 'जारी रखें' : 'Continue Playing'}
          </button>
        </div>

        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/70 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
