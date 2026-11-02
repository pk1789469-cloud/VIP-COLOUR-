/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { BetTarget } from '../types/game';
import { sound } from '../utils/audio';

interface BetModalProps {
  target: BetTarget | null;
  periodId: string;
  userBalance: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (target: BetTarget, amount: number, multiplier: number) => void;
  language: 'hi' | 'en';
}

export const BetModal: React.FC<BetModalProps> = ({
  target,
  periodId,
  userBalance,
  isOpen,
  onClose,
  onConfirm,
  language,
}) => {
  const [baseAmount, setBaseAmount] = useState<number>(10);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [agreed, setAgreed] = useState<boolean>(true);

  if (!isOpen || target === null) return null;

  const totalBet = baseAmount * multiplier;
  const canAfford = userBalance >= totalBet;

  const getTargetTitle = () => {
    if (typeof target === 'number') {
      return language === 'hi' ? `संख्या ${target} चुनें (9X)` : `Select Number ${target} (9X)`;
    }
    if (target === 'green') return language === 'hi' ? 'हरा (Green) चुनें (2X)' : 'Select Green (2X)';
    if (target === 'violet') return language === 'hi' ? 'बैंगनी (Violet) चुनें (4.5X)' : 'Select Violet (4.5X)';
    if (target === 'red') return language === 'hi' ? 'लाल (Red) चुनें (2X)' : 'Select Red (2X)';
    if (target === 'big') return language === 'hi' ? 'बड़ा (Big) चुनें (2X)' : 'Select Big (2X)';
    if (target === 'small') return language === 'hi' ? 'छोटा (Small) चुनें (2X)' : 'Select Small (2X)';
    return '';
  };

  const getTargetBg = () => {
    if (target === 'green') return 'from-emerald-600 to-emerald-700';
    if (target === 'violet') return 'from-purple-600 to-purple-800';
    if (target === 'red') return 'from-rose-600 to-red-700';
    if (target === 'big') return 'from-amber-600 to-orange-600';
    if (target === 'small') return 'from-sky-600 to-blue-700';
    if (typeof target === 'number') {
      if (target === 0) return 'from-rose-600 via-purple-600 to-rose-700';
      if (target === 5) return 'from-emerald-600 via-purple-600 to-emerald-700';
      if ([1, 3, 7, 9].includes(target)) return 'from-emerald-600 to-emerald-700';
      return 'from-rose-600 to-red-700';
    }
    return 'from-amber-600 to-red-600';
  };

  const multipliers = [1, 5, 10, 20, 50, 100];
  const amounts = [1, 10, 100, 1000];

  const handleConfirm = () => {
    if (!canAfford || !agreed) return;
    sound.playBet();
    onConfirm(target, baseAmount, multiplier);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#1a1d2e] border-t sm:border border-white/15 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden pb-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar colored by target */}
        <div className={`p-4 bg-gradient-to-r ${getTargetBg()} flex items-center justify-between text-white shadow-md`}>
          <div>
            <div className="font-extrabold text-lg flex items-center gap-2">
              <span>Win Go</span>
              <span className="text-xs bg-black/30 px-2 py-0.5 rounded-full font-mono font-medium">
                Period: {periodId.slice(-5)}
              </span>
            </div>
            <div className="text-xs font-bold text-white/90">{getTargetTitle()}</div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Base Amount Selector */}
          <div>
            <div className="text-xs text-gray-400 font-medium mb-1.5 flex justify-between">
              <span>{language === 'hi' ? 'राशि चुनें (Balance)' : 'Select Bet Amount'}</span>
              <span className="text-amber-400 font-mono">
                {language === 'hi' ? 'उपलब्ध:' : 'Available:'} ₹{userBalance.toFixed(2)}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {amounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setBaseAmount(amt);
                  }}
                  className={`py-2 rounded-xl font-bold font-mono text-sm transition-all border ${
                    baseAmount === amt
                      ? 'bg-gradient-to-b from-amber-500 to-amber-600 border-amber-300 text-black shadow-lg shadow-amber-500/20 scale-[1.02]'
                      : 'bg-[#24283d] border-white/5 text-gray-300 hover:bg-[#2b304a]'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Multiplier Presets */}
          <div>
            <div className="text-xs text-gray-400 font-medium mb-1.5">
              {language === 'hi' ? 'गुणक (Multiplier)' : 'Multiplier'}
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {multipliers.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setMultiplier(m);
                  }}
                  className={`py-1.5 rounded-lg font-bold text-xs font-mono transition-all border ${
                    multiplier === m
                      ? 'bg-rose-600 border-rose-400 text-white shadow-md scale-[1.03]'
                      : 'bg-[#24283d] border-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  X{m}
                </button>
              ))}
            </div>
          </div>

          {/* Stepper adjustment */}
          <div className="flex items-center justify-between bg-[#24283d] p-2 rounded-xl border border-white/5">
            <span className="text-xs text-gray-300 ml-2 font-medium">
              {language === 'hi' ? 'मात्रा (Quantity)' : 'Quantity'}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setMultiplier((prev) => Math.max(1, prev - 1));
                }}
                className="w-8 h-8 rounded-lg bg-[#1a1d2e] border border-white/10 font-bold text-lg flex items-center justify-center hover:bg-white/10 text-gray-300"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max="1000"
                value={multiplier}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setMultiplier(Math.max(1, val));
                }}
                className="w-14 text-center font-mono font-bold bg-[#1a1d2e] border border-white/10 rounded-lg py-1 text-amber-400 text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setMultiplier((prev) => prev + 1);
                }}
                className="w-8 h-8 rounded-lg bg-[#1a1d2e] border border-white/10 font-bold text-lg flex items-center justify-center hover:bg-white/10 text-gray-300"
              >
                +
              </button>
            </div>
          </div>

          {/* Agreement Checkbox */}
          <div
            onClick={() => setAgreed(!agreed)}
            className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer pt-1"
          >
            <div
              className={`w-4 h-4 rounded border flex items-center justify-center ${
                agreed ? 'bg-amber-500 border-amber-400 text-black' : 'border-gray-500 bg-transparent'
              }`}
            >
              {agreed && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <span>
              {language === 'hi' ? 'मैं प्री-सेल नियमों से सहमत हूँ' : 'I agree to the 《Presale Rules》'}
            </span>
          </div>

          {!canAfford && (
            <div className="text-center text-xs text-rose-400 font-semibold bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
              {language === 'hi' ? '⚠️ अपर्याप्त शेष! कृपया रिचार्ज करें।' : '⚠️ Insufficient balance! Please recharge.'}
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="py-3 rounded-xl bg-[#24283d] hover:bg-[#2e334f] text-gray-300 font-bold text-sm border border-white/5 active:scale-95"
            >
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="button"
              disabled={!canAfford || !agreed}
              onClick={handleConfirm}
              className={`py-3 rounded-xl font-black text-sm tracking-wide shadow-lg transition-all active:scale-95 ${
                canAfford && agreed
                  ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white shadow-rose-600/30 hover:brightness-110'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-60'
              }`}
            >
              {language === 'hi' ? `शर्त लगाएं ₹${totalBet}` : `Total Bet ₹${totalBet}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
