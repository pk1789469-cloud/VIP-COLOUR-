/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, ArrowRight, ShieldCheck, History, AlertCircle } from 'lucide-react';
import { AdminSettings, WithdrawRequest } from '../types/game';
import { sound } from '../utils/audio';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  userBalance: number;
  userId: string;
  adminSettings: AdminSettings;
  withdrawals: WithdrawRequest[];
  onSubmitWithdraw: (request: Omit<WithdrawRequest, 'id' | 'timestamp' | 'status'>) => void;
  language: 'hi' | 'en';
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  userBalance,
  userId,
  adminSettings,
  withdrawals,
  onSubmitWithdraw,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'withdraw' | 'history'>('withdraw');
  const [amount, setAmount] = useState<string>('500');
  const [upiId, setUpiId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [bankAcc, setBankAcc] = useState<string>('');
  const [ifsc, setIfsc] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const numAmount = Number(amount) || 0;
  const canWithdraw = numAmount >= adminSettings.minWithdraw && numAmount <= userBalance;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWithdraw) {
      alert(
        language === 'hi'
          ? `न्यूनतम निकासी ₹${adminSettings.minWithdraw} है और आपके पास पर्याप्त बैलेंस होना चाहिए`
          : `Minimum withdrawal is ₹${adminSettings.minWithdraw} and you must have sufficient balance`
      );
      return;
    }
    if (!upiId.trim() || !name.trim()) {
      alert(language === 'hi' ? 'कृपया अपना नाम और UPI ID दर्ज करें' : 'Please enter your name and UPI ID');
      return;
    }

    sound.playBet();
    onSubmitWithdraw({
      userId,
      amount: numAmount,
      upiId: upiId.trim(),
      accountHolderName: name.trim(),
      bankAccountNo: bankAcc.trim() || undefined,
      ifsc: ifsc.trim() || undefined,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setAmount('');
      setActiveTab('history');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-[#171926] border border-white/15 rounded-3xl shadow-2xl text-white">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#1f2338] border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center font-bold text-white text-sm">
              🏦
            </div>
            <div>
              <h3 className="font-extrabold text-base font-['Rajdhani'] uppercase tracking-wider">
                {language === 'hi' ? 'पैसे निकालें / निकासी' : 'Withdraw Money'}
              </h3>
              <p className="text-[10px] text-gray-400 font-mono">
                {language === 'hi' ? 'निकासी योग्य शेष:' : 'Withdrawable Balance:'} ₹{userBalance.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab(activeTab === 'withdraw' ? 'history' : 'withdraw');
              }}
              className="px-2.5 py-1 rounded-lg bg-[#2b304d] text-amber-400 text-xs font-bold flex items-center gap-1 hover:bg-[#353b5e]"
            >
              <History className="w-3.5 h-3.5" />
              <span>{activeTab === 'withdraw' ? (language === 'hi' ? 'इतिहास' : 'History') : (language === 'hi' ? 'निकासी' : 'Withdraw')}</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {activeTab === 'withdraw' ? (
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Amount input */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-gray-300 mb-1">
                <span>{language === 'hi' ? 'निकासी राशि दर्ज करें' : 'Enter Withdrawal Amount'}</span>
                <span className="text-amber-400 font-mono">
                  {language === 'hi' ? 'उपलब्ध:' : 'Available:'} ₹{userBalance.toFixed(2)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-amber-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min={adminSettings.minWithdraw}
                  max={userBalance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Min ₹${adminSettings.minWithdraw}`}
                  className="w-full bg-[#212437] border border-white/10 rounded-xl pl-8 pr-16 py-2.5 text-sm font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setAmount(Math.floor(userBalance).toString())}
                  className="absolute right-2 top-1.5 px-2 py-1 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 rounded-lg text-xs font-bold"
                >
                  MAX
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                {language === 'hi'
                  ? `न्यूनतम निकासी ₹${adminSettings.minWithdraw} | 24x7 तत्काल प्रसंस्करण`
                  : `Minimum withdrawal ₹${adminSettings.minWithdraw} | 24x7 Instant Processing`}
              </p>
            </div>

            {/* Recipient Details */}
            <div className="bg-[#1f2338] p-3.5 rounded-2xl border border-white/5 space-y-3">
              <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{language === 'hi' ? 'भुगतान विवरण' : 'Payout Account Details'}</span>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  {language === 'hi' ? 'खाता धारक का नाम' : 'Account Holder Full Name'}
                  <span className="text-rose-400 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Kumar"
                  className="w-full bg-[#171926] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  {language === 'hi' ? 'UPI ID' : 'UPI ID (PhonePe / GPay / Paytm)'}
                  <span className="text-rose-400 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value.trim())}
                  placeholder="e.g. 9876543210@paytm or name@okaxis"
                  className="w-full bg-[#171926] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">
                    {language === 'hi' ? 'बैंक खाता (वैकल्पिक)' : 'Bank Account (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={bankAcc}
                    onChange={(e) => setBankAcc(e.target.value)}
                    placeholder="Account Number"
                    className="w-full bg-[#171926] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">
                    {language === 'hi' ? 'IFSC कोड (वैकल्पिक)' : 'IFSC Code (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                    placeholder="e.g. SBIN0001234"
                    className="w-full bg-[#171926] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-[11px] text-amber-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                {language === 'hi'
                  ? 'निकासी अनुरोध सबमिट करने के बाद एडमिन द्वारा स्वीकृत होते ही पैसा आपके खाते में भेज दिया जाएगा।'
                  : 'Withdrawal requests are reviewed and disbursed directly to your specified UPI ID by the owner.'}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!canWithdraw || submitted || !upiId || !name}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:brightness-110 active:scale-95 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-rose-950/40 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {submitted ? (
                <span>Request Submitted! Processing...</span>
              ) : (
                <>
                  <span>{language === 'hi' ? `₹${numAmount} की निकासी करें` : `Withdraw ₹${numAmount}`}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Tab 2: Withdrawal Records / History */
          <div className="p-4 space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {language === 'hi' ? 'निकासी इतिहास' : 'Withdrawal Records'}
            </h4>
            {withdrawals.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-xs">
                {language === 'hi' ? 'कोई निकासी रिकॉर्ड नहीं मिला' : 'No withdrawal records found.'}
              </div>
            ) : (
              <div className="space-y-2">
                {withdrawals.map((wth) => (
                  <div
                    key={wth.id}
                    className="bg-[#212437] p-3 rounded-2xl border border-white/5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-rose-400 text-sm">
                        -₹{wth.amount.toLocaleString('en-IN')}
                      </span>
                      {wth.status === 'approved' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Disbursed / Paid ✅
                        </span>
                      )}
                      {wth.status === 'pending' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Under Review ⏳
                        </span>
                      )}
                      {wth.status === 'rejected' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          Rejected (Refunded) ❌
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] font-mono text-gray-400 flex items-center justify-between">
                      <span>UPI: {wth.upiId}</span>
                      <span>{new Date(wth.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="text-[10px] text-gray-400">
                      Holder: <strong className="text-gray-300">{wth.accountHolderName}</strong>
                    </div>

                    {wth.rejectionReason && (
                      <div className="text-[10px] text-rose-400 bg-rose-500/10 p-1.5 rounded-lg border border-rose-500/20">
                        Reason: {wth.rejectionReason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
