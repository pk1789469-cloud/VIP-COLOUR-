/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Megaphone, Flame } from 'lucide-react';

interface MarqueeBannerProps {
  notice: string;
}

export const MarqueeBanner: React.FC<MarqueeBannerProps> = ({ notice }) => {
  return (
    <div className="bg-[#1a1d2e] border-y border-white/5 py-1.5 px-3 flex items-center gap-2 overflow-hidden">
      <div className="flex items-center gap-1 text-amber-400 shrink-0 font-bold text-xs">
        <Megaphone className="w-3.5 h-3.5 animate-bounce" />
        <span className="text-[10px] tracking-wider uppercase text-amber-400/90 font-mono hidden xs:inline">Notice</span>
      </div>

      <div className="relative overflow-hidden w-full whitespace-nowrap">
        <div className="inline-block animate-marquee text-xs text-gray-300 font-medium tracking-wide">
          <span className="inline-flex items-center gap-2 mr-8">
            <Flame className="w-3 h-3 text-red-500 inline" />
            {notice}
          </span>
          <span className="inline-flex items-center gap-2 mr-8 text-amber-300/90">
            ★ Member UID 928371 won ₹24,500 on Green (Period 10481)
          </span>
          <span className="inline-flex items-center gap-2 mr-8 text-emerald-400">
            ★ Member UID 184920 recharged ₹10,000 via Instant UPI
          </span>
          <span className="inline-flex items-center gap-2 mr-8 text-rose-400">
            ★ Member UID 738192 withdrew ₹35,000 successfully
          </span>
        </div>
      </div>
    </div>
  );
};
