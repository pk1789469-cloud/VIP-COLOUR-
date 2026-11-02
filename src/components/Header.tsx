/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Volume2, VolumeX, Shield, Plus, RefreshCw, Crown } from 'lucide-react';
import { UserProfile } from '../types/game';
import { sound } from '../utils/audio';

interface HeaderProps {
  user: UserProfile;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenAdmin: () => void;
  language: 'hi' | 'en';
  onToggleLanguage: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenDeposit,
  onOpenAdmin,
  language,
  onToggleLanguage,
}) => {
  const [isMuted, setIsMuted] = useState(!sound.isSoundEnabled());
  const [isRotating, setIsRotating] = useState(false);

  const toggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    sound.setSoundEnabled(!nextState);
    if (!nextState) sound.playClick();
  };

  const handleRefresh = () => {
    setIsRotating(true);
    sound.playClick();
    setTimeout(() => setIsRotating(false), 600);
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-b from-[#1b1e2e] via-[#161825] to-[#12141f] border-b border-white/10 px-3 py-2.5 shadow-lg backdrop-blur-md">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-600 to-red-600 p-[2px] shadow-md shadow-red-500/20">
            <div className="w-full h-full bg-[#171926] rounded-[10px] flex items-center justify-center font-black text-amber-400 text-sm tracking-wider">
              TG
            </div>
            <Crown className="w-3.5 h-3.5 text-amber-300 absolute -top-1.5 -right-1.5 rotate-12 drop-shadow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-white font-['Rajdhani'] uppercase">
                TG Gaming <span className="text-amber-400">Owner</span>
              </span>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-gradient-to-r from-red-600 to-amber-600 text-white rounded">
                PRO
              </span>
            </div>
            <div className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
              <span>UID: {user.uid}</span>
              <span className="text-amber-400/80 font-bold">VIP{user.vipLevel}</span>
            </div>
          </div>
        </div>

        {/* Right side controls: Balance chip & Action buttons */}
        <div className="flex items-center gap-1.5">
          {/* Wallet Balance Pill */}
          <div className="flex items-center bg-[#212437] border border-amber-500/30 rounded-full pl-2.5 pr-1 py-1 shadow-inner">
            <span className="text-[11px] font-bold text-amber-400 mr-1">₹</span>
            <span className="font-extrabold text-xs text-white font-mono tracking-tight mr-1.5">
              {user.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <button
              onClick={handleRefresh}
              title="Refresh Balance"
              className="p-1 text-gray-400 hover:text-amber-400 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isRotating ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onOpenDeposit();
              }}
              title="Recharge / Add Money"
              className="ml-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black p-1 rounded-full shadow transition-transform active:scale-95"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="w-7 h-7 rounded-lg bg-[#212437] text-gray-300 hover:text-white flex items-center justify-center border border-white/5 active:scale-95"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-gray-500" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
          </button>

          {/* Language Switch */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleLanguage();
            }}
            className="px-1.5 h-7 rounded-lg bg-[#212437] text-amber-400 text-[11px] font-bold flex items-center justify-center border border-white/5 active:scale-95 uppercase"
            title="Switch Language"
          >
            {language === 'hi' ? 'HI' : 'EN'}
          </button>

          {/* Secret / Dedicated Admin Control Access */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenAdmin();
            }}
            title="Owner Admin Panel"
            className="relative px-2 h-7 rounded-lg bg-gradient-to-r from-rose-950 to-red-900 border border-red-500/50 text-red-300 hover:text-white flex items-center gap-1 active:scale-95 shadow-sm shadow-red-900/40 text-[10px] font-bold"
          >
            <Shield className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span className="hidden sm:inline">Owner</span>
          </button>
        </div>
      </div>
    </header>
  );
};
