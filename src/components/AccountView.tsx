/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import {
  Shield,
  History,
  Globe,
  Headphones,
  Award,
  ChevronRight,
  Copy,
  Check,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import { UserProfile } from '../types/game';
import { sound } from '../utils/audio';

interface AccountViewProps {
  user: UserProfile;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenAdmin: () => void;
  onUpdateAvatar: (avatarDataUrl: string) => void;
  language: 'hi' | 'en';
  onToggleLanguage: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  user,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenAdmin,
  onUpdateAvatar,
  language,
  onToggleLanguage,
}) => {
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopyUid = () => {
    sound.playClick();
    navigator.clipboard.writeText(user.uid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        sound.playWin();
        onUpdateAvatar(base64);
        alert(language === 'hi' ? 'प्रोफ़ाइल फोटो सफलतापूर्वक अपडेट हो गई!' : 'Profile photo updated successfully from gallery!');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-md mx-auto px-3 py-4 space-y-4 pb-24 animate-in fade-in text-white">
      {/* Profile Card */}
      <div className="relative rounded-3xl p-5 bg-gradient-to-br from-[#1e2338] via-[#181a28] to-[#12141e] border border-white/10 shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3.5">
          {/* Avatar with Gallery upload trigger */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group relative w-18 h-18 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-xl cursor-pointer shrink-0"
            title="Click to change photo from gallery"
          >
            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera className="w-6 h-6 text-white drop-shadow" />
            </div>
            <div className="absolute bottom-0 inset-x-0 bg-red-600/90 text-[9px] font-black text-center text-white uppercase py-0.5">
              VIP {user.vipLevel}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base tracking-wide text-white">
                Member {user.phone}
              </h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-black">
                VIP {user.vipLevel}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1 text-xs text-gray-400 font-mono">
              <span>UID: {user.uid}</span>
              <button
                onClick={handleCopyUid}
                className="text-amber-400 hover:text-amber-300 p-0.5"
                title="Copy UID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Change Gallery Photo Action Pill */}
            <div className="mt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300 text-[11px] font-bold border border-white/10 active:scale-95 transition-all"
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'hi' ? 'गैलरी से फोटो लगाएं' : 'Change Photo from Gallery'}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Balance & Actions */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-400">
              {language === 'hi' ? 'कुल शेष राशि' : 'Total Balance'}
            </div>
            <div className="text-2xl font-black font-mono text-amber-400">
              ₹{user.balance.toFixed(2)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onOpenDeposit();
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:brightness-110 text-white font-extrabold text-xs rounded-xl shadow-md active:scale-95"
            >
              {language === 'hi' ? 'जमा' : 'Deposit'}
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onOpenWithdraw();
              }}
              className="px-3.5 py-2 bg-[#252a42] hover:bg-[#2e3452] border border-white/10 text-gray-200 font-bold text-xs rounded-xl active:scale-95"
            >
              {language === 'hi' ? 'निकासी' : 'Withdraw'}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Options */}
      <div className="bg-[#171926] rounded-2xl border border-white/10 divide-y divide-white/5 overflow-hidden">
        {/* Gallery Photo explicit item */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-200">
                {language === 'hi' ? 'गैलरी से अपना फोटो बदलें' : 'Upload Avatar from Photo Gallery'}
              </div>
              <div className="text-[10px] text-gray-400">
                {language === 'hi' ? 'फोन गैलरी से अपनी कोई भी तस्वीर लगाएं' : 'Set custom photo from your device'}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        {/* Owner Admin Panel Entrance */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenAdmin();
          }}
          className="w-full p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-950/80 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <Shield className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-black text-rose-400 uppercase tracking-wide">
                TG Owner Admin Panel
              </div>
              <div className="text-[10px] text-gray-400">
                {language === 'hi'
                  ? 'यूपीआई, क्यूआर कोड और गेम रिजल्ट कंट्रोल करें'
                  : 'Manage UPI ID, QR Code & Rig Game Results'}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        {/* Language switch */}
        <button
          onClick={() => {
            sound.playClick();
            onToggleLanguage();
          }}
          className="w-full p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-950/50 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-200">
                {language === 'hi' ? 'भाषा (Language)' : 'Language'}
              </div>
              <div className="text-[10px] text-gray-400">
                {language === 'hi' ? 'हिंदी (Hindi) में सक्रिय' : 'Active in English'}
              </div>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400">
            {language === 'hi' ? 'हिन्दी' : 'English'}
          </span>
        </button>

        {/* Customer Support */}
        <div className="p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-950/50 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-200">
                {language === 'hi' ? 'ग्राहक सेवा 24/7' : '24x7 Customer Support'}
              </div>
              <div className="text-[10px] text-gray-400">
                TG Gaming Owner Official Telegram & Live Chat
              </div>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
            Online
          </span>
        </div>

        {/* About TG Gaming Owner */}
        <div className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-950/50 text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-200">
                Live Server Status
              </div>
              <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>1-Minute Universal Sync Active</span>
              </div>
            </div>
          </div>
          <span className="text-[11px] text-gray-400 font-mono">v3.3 Live</span>
        </div>
      </div>
    </div>
  );
};
