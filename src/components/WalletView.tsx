/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowUpRight, ArrowDownLeft, ShieldCheck, CreditCard, Sparkles, History } from 'lucide-react';
import { UserProfile, DepositRequest, WithdrawRequest } from '../types/game';
import { sound } from '../utils/audio';

interface WalletViewProps {
  user: UserProfile;
  deposits: DepositRequest[];
  withdrawals: WithdrawRequest[];
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  language: 'hi' | 'en';
}

export const WalletView: React.FC<WalletViewProps> = ({
  user,
  deposits,
  withdrawals,
  onOpenDeposit,
  onOpenWithdraw,
  language,
}) => {
  const totalDeposited = deposits
    .filter((d) => d.status === 'approved')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalWithdrawn = withdrawals
    .filter((w) => w.status === 'approved')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="max-w-md mx-auto px-3 py-4 space-y-4 pb-24 animate-in fade-in text-white">
      {/* Wallet Balance Master Card */}
      <div className="relative rounded-3xl p-5 bg-gradient-to-br from-red-600 via-rose-700 to-amber-600 shadow-2xl border border-white/20 overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between text-white/90">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-200" />
            <span className="text-xs uppercase font-extrabold tracking-widest font-mono">
              TG Gaming Wallet
            </span>
          </div>
          <span className="text-[10px] font-black bg-black/30 px-2 py-0.5 rounded-full border border-white/20">
            VIP {user.vipLevel}
          </span>
        </div>

        <div className="mt-4">
          <div className="text-xs text-white/80 font-medium">
            {language === 'hi' ? 'कुल उपलब्ध शेष' : 'Total Available Balance'}
          </div>
          <div className="text-3xl font-black font-mono tracking-tight text-white mt-1">
            ₹{user.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Deposit & Withdraw Big Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <button
            onClick={() => {
              sound.playClick();
              onOpenDeposit();
            }}
            className="py-3 px-3 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-black/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <ArrowDownLeft className="w-4 h-4 stroke-[3]" />
            <span>{language === 'hi' ? 'जमा / रिचार्ज' : 'Deposit / Recharge'}</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenWithdraw();
            }}
            className="py-3 px-3 bg-white/20 hover:bg-white/30 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg border border-white/30 flex items-center justify-center gap-1.5 active:scale-95 transition-all backdrop-blur-sm"
          >
            <ArrowUpRight className="w-4 h-4 stroke-[3]" />
            <span>{language === 'hi' ? 'निकासी' : 'Withdraw'}</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Card */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#1b1e2e] p-3.5 rounded-2xl border border-white/10 space-y-1">
          <div className="text-[11px] text-gray-400">
            {language === 'hi' ? 'कुल रिचार्ज राशि' : 'Total Deposited'}
          </div>
          <div className="font-mono font-bold text-emerald-400 text-base">
            +₹{totalDeposited.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-[#1b1e2e] p-3.5 rounded-2xl border border-white/10 space-y-1">
          <div className="text-[11px] text-gray-400">
            {language === 'hi' ? 'कुल सफल निकासी' : 'Total Withdrawn'}
          </div>
          <div className="font-mono font-bold text-rose-400 text-base">
            -₹{totalWithdrawn.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Safety & Instant Payout Notice */}
      <div className="bg-[#171926] p-3.5 rounded-2xl border border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs">
          <div className="font-bold text-white">
            {language === 'hi' ? '24/7 तत्काल UPI भुगतान' : '24x7 Instant UPI Payout'}
          </div>
          <div className="text-gray-400 text-[11px]">
            {language === 'hi'
              ? 'जमा और निकासी सीधे अधिकृत मालिक के UPI द्वारा संभाली जाती है।'
              : 'Deposits & withdrawals handled directly via owner verified UPI gateway.'}
          </div>
        </div>
      </div>

      {/* Recent Activity Combined Records */}
      <div className="bg-[#171926] p-4 rounded-2xl border border-white/10 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-gray-300">
          <div className="flex items-center gap-1.5">
            <History className="w-4 h-4 text-amber-400" />
            <span>{language === 'hi' ? 'हाल के लेन-देन' : 'Recent Transactions'}</span>
          </div>
          <span className="text-[11px] text-gray-500">Live Status</span>
        </div>

        <div className="space-y-2">
          {deposits.slice(0, 3).map((d) => (
            <div key={d.id} className="bg-[#20253b] p-2.5 rounded-xl flex items-center justify-between text-xs">
              <div>
                <div className="font-semibold text-white">Deposit via UPI</div>
                <div className="text-[10px] text-gray-400 font-mono">UTR: {d.utr}</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-emerald-400">+₹{d.amount}</div>
                <div className="text-[10px] capitalize text-gray-400">{d.status}</div>
              </div>
            </div>
          ))}

          {withdrawals.slice(0, 3).map((w) => (
            <div key={w.id} className="bg-[#20253b] p-2.5 rounded-xl flex items-center justify-between text-xs">
              <div>
                <div className="font-semibold text-white">Withdrawal to UPI</div>
                <div className="text-[10px] text-gray-400 font-mono">{w.upiId}</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-rose-400">-₹{w.amount}</div>
                <div className="text-[10px] capitalize text-gray-400">{w.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
