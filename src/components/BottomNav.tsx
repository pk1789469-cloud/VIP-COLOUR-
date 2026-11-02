/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Gamepad2, Share2, Wallet, User } from 'lucide-react';
import { sound } from '../utils/audio';

export type MainNavTab = 'home' | 'wallet' | 'promotion' | 'account';

interface BottomNavProps {
  currentTab: MainNavTab;
  onChangeTab: (tab: MainNavTab) => void;
  language: 'hi' | 'en';
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onChangeTab,
  language,
}) => {
  const tabs = [
    {
      id: 'home' as MainNavTab,
      label: language === 'hi' ? 'Win Go 1M' : 'Win Go 1M',
      icon: Gamepad2,
    },
    {
      id: 'wallet' as MainNavTab,
      label: language === 'hi' ? 'बटुआ' : 'Wallet',
      icon: Wallet,
    },
    {
      id: 'promotion' as MainNavTab,
      label: language === 'hi' ? 'प्रमोशन' : 'Promotion',
      icon: Share2,
    },
    {
      id: 'account' as MainNavTab,
      label: language === 'hi' ? 'माई प्रोफाइल' : 'Account',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#161825]/95 border-t border-white/10 backdrop-blur-lg">
      <div className="max-w-md mx-auto grid grid-cols-4 px-2 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                onChangeTab(tab.id);
              }}
              className={`flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
                isActive
                  ? 'text-amber-400 font-extrabold'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-amber-400/15 scale-110' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : 'text-gray-400'}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
