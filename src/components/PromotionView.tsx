/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Copy, Check, Users, Gift, Share2, Award, TrendingUp } from 'lucide-react';
import { UserProfile } from '../types/game';
import { sound } from '../utils/audio';

interface PromotionViewProps {
  user: UserProfile;
  language: 'hi' | 'en';
}

export const PromotionView: React.FC<PromotionViewProps> = ({ user, language }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const inviteLink = `https://tggaming.vip/register?invitationCode=${user.invitationCode}`;

  const handleCopyCode = () => {
    sound.playClick();
    navigator.clipboard.writeText(user.invitationCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    sound.playClick();
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-md mx-auto px-3 py-4 space-y-4 pb-24 animate-in fade-in text-white">
      {/* Banner */}
      <div className="rounded-3xl p-5 bg-gradient-to-br from-amber-500 via-rose-600 to-red-700 shadow-xl border border-white/20 text-center space-y-2">
        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-black/30 border border-white/20 text-amber-300">
          Agent Commission Partner
        </span>
        <h3 className="text-2xl font-black font-['Rajdhani'] uppercase tracking-wider text-white">
          {language === 'hi' ? 'दोस्तों को आमंत्रित करें और कमाएं' : 'Invite Friends & Earn Real Cash'}
        </h3>
        <p className="text-xs text-white/90">
          Up to 85% Rebate commission on every bet made by your subordinates!
        </p>
      </div>

      {/* Invite Code & Link Box */}
      <div className="bg-[#171926] p-4 rounded-2xl border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400">
              {language === 'hi' ? 'आपका आमंत्रण कोड' : 'Your Invitation Code'}
            </div>
            <div className="text-xl font-black font-mono text-amber-400 tracking-wider">
              {user.invitationCode}
            </div>
          </div>
          <button
            onClick={handleCopyCode}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1 active:scale-95 transition-all"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>

        <div className="pt-2 border-t border-white/5">
          <div className="text-[11px] text-gray-400 mb-1">
            {language === 'hi' ? 'रेफरल लिंक' : 'Referral Share Link'}
          </div>
          <div className="flex items-center gap-2 bg-[#20253b] p-2 rounded-xl border border-white/5">
            <span className="text-xs font-mono text-gray-300 truncate flex-1">{inviteLink}</span>
            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white shrink-0 active:scale-95"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#171926] p-3.5 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Total Subordinates</span>
          </div>
          <div className="text-xl font-black font-mono text-white">48</div>
          <div className="text-[10px] text-emerald-400 font-medium">+6 today</div>
        </div>

        <div className="bg-[#171926] p-3.5 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Total Commission</span>
          </div>
          <div className="text-xl font-black font-mono text-amber-400">₹4,280.50</div>
          <div className="text-[10px] text-gray-400">Directly withdrawable</div>
        </div>
      </div>

      {/* Commission Structure */}
      <div className="bg-[#171926] p-4 rounded-2xl border border-white/10 space-y-2">
        <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
          Multi-Tier Rebate Structure
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center bg-[#20253b] p-2 rounded-xl">
            <span className="text-gray-300">Level 1 (Direct Friends)</span>
            <span className="font-mono font-bold text-emerald-400">0.6% Bet Rebate</span>
          </div>
          <div className="flex justify-between items-center bg-[#20253b] p-2 rounded-xl">
            <span className="text-gray-300">Level 2 (Friends' Friends)</span>
            <span className="font-mono font-bold text-emerald-400">0.3% Bet Rebate</span>
          </div>
          <div className="flex justify-between items-center bg-[#20253b] p-2 rounded-xl">
            <span className="text-gray-300">Level 3 (Team Subordinates)</span>
            <span className="font-mono font-bold text-emerald-400">0.1% Bet Rebate</span>
          </div>
        </div>
      </div>
    </div>
  );
};
