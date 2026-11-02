/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Copy, Check, UploadCloud, AlertCircle, ArrowRight, ShieldCheck, History, Zap } from 'lucide-react';
import { AdminSettings, DepositRequest } from '../types/game';
import { sound } from '../utils/audio';
import { UpiQrCode } from './UpiQrCode';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminSettings: AdminSettings;
  userBalance: number;
  userId: string;
  deposits: DepositRequest[];
  onSubmitDeposit: (request: Omit<DepositRequest, 'id' | 'timestamp' | 'status'>) => void;
  language: 'hi' | 'en';
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  adminSettings,
  userBalance,
  userId,
  deposits,
  onSubmitDeposit,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'recharge' | 'history'>('recharge');
  const [amount, setAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>('500');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');

  if (!isOpen) return null;

  const quickAmounts = [100, 300, 500, 1000, 2000, 5000, 10000, 50000];

  const effectiveUpiId = adminSettings.ownerUpiId || 'tggamingempire@ybl';
  const effectiveUpiName = adminSettings.ownerUpiName || 'TG GAMING EMPIRE';
  const effectiveQrUrl = adminSettings.qrCodeUrl || '/assets/aistudio/Screenshot_20261031-165524_02660bea_02660bea.png';

  const handleCopyUpi = () => {
    sound.playClick();
    navigator.clipboard.writeText(effectiveUpiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAmountSelect = (val: number) => {
    sound.playClick();
    setAmount(val);
    setCustomAmount(val.toString());
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setCustomAmount(val);
    setAmount(Number(val) || 0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber || utrNumber.trim().length < 6) {
      alert(language === 'hi' ? 'कृपया 12-अंकीय मान्य UTR / Ref नंबर दर्ज करें' : 'Please enter a valid 12-digit UTR reference number');
      return;
    }
    if (amount < adminSettings.minDeposit) {
      alert(language === 'hi' ? `न्यूनतम रिचार्ज राशि ₹${adminSettings.minDeposit} है` : `Minimum deposit amount is ₹${adminSettings.minDeposit}`);
      return;
    }

    sound.playBet();
    onSubmitDeposit({
      userId,
      amount,
      utr: utrNumber.trim(),
      upiIdUsed: effectiveUpiId,
      screenshotUrl: screenshotPreview || undefined,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setUtrNumber('');
      setScreenshotPreview('');
      setActiveTab('history');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-[#151827] border-2 border-purple-500/30 rounded-3xl shadow-2xl text-white">
        {/* Modal Top Bar */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#2a134a] via-[#1c1a32] to-[#151827] border-b border-purple-500/20 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#5f259f] to-amber-500 flex items-center justify-center font-bold text-white text-sm shadow">
              पे
            </div>
            <div>
              <h3 className="font-extrabold text-base font-['Rajdhani'] uppercase tracking-wider text-white">
                {language === 'hi' ? 'रिचार्ज / पैसे डालें' : 'Recharge / Deposit'}
              </h3>
              <p className="text-[10px] text-gray-400 font-mono">
                {language === 'hi' ? 'वर्तमान बैलेंस:' : 'Current Balance:'} ₹{userBalance.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab(activeTab === 'recharge' ? 'history' : 'recharge');
              }}
              className="px-2.5 py-1 rounded-lg bg-[#2b304d] text-amber-400 text-xs font-bold flex items-center gap-1 hover:bg-[#353b5e]"
            >
              <History className="w-3.5 h-3.5" />
              <span>{activeTab === 'recharge' ? (language === 'hi' ? 'रिकॉर्ड' : 'Records') : (language === 'hi' ? 'जमा करें' : 'Deposit')}</span>
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

        {activeTab === 'recharge' ? (
          <div className="p-4 space-y-4">
            {/* Quick Amount Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-300">
                  {language === 'hi' ? '1. राशि चुनें (Select Amount)' : '1. Select Deposit Amount'}
                </label>
                <span className="text-[11px] font-mono text-amber-400 font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  Auto Pay Supported
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleAmountSelect(amt)}
                    className={`py-2 rounded-xl text-xs font-black font-mono transition-all border ${
                      amount === amt
                        ? 'bg-gradient-to-r from-[#5f259f] via-purple-600 to-amber-600 border-amber-300 text-white shadow-md shadow-purple-900/50 scale-[1.02]'
                        : 'bg-[#202438] border-white/5 text-gray-300 hover:bg-[#282d46]'
                    }`}
                  >
                    ₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              {/* Custom amount input */}
              <div className="mt-2 relative">
                <span className="absolute left-3 top-2.5 text-amber-400 font-bold text-sm">₹</span>
                <input
                  type="text"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  placeholder={`Min ₹${adminSettings.minDeposit}`}
                  className="w-full bg-[#202438] border border-white/10 rounded-xl pl-8 pr-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Official PhonePe QR Code & Auto Payment Box */}
            <div className="bg-[#1b1f33] border border-purple-500/30 rounded-3xl p-4 text-center space-y-3 shadow-inner">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{effectiveUpiName}</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                  Verified Merchant
                </span>
              </div>

              {/* PhonePe QR Code Component */}
              <div className="flex justify-center py-1">
                <UpiQrCode
                  upiId={effectiveUpiId}
                  name={effectiveUpiName}
                  amount={amount > 0 ? amount : 500}
                  customQrUrl={effectiveQrUrl}
                  size={195}
                />
              </div>

              {/* UPI ID with Copy Button */}
              <div className="bg-[#131522] border border-purple-500/30 rounded-2xl p-2.5 flex items-center justify-between gap-2">
                <div className="text-left overflow-hidden">
                  <div className="text-[9px] text-gray-400 uppercase font-mono tracking-wider">Official Owner UPI ID</div>
                  <div className="font-mono font-black text-amber-300 text-sm truncate select-all">
                    {effectiveUpiId}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-black font-black text-xs flex items-center gap-1 active:scale-95 transition-all shrink-0 shadow"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy UPI'}</span>
                </button>
              </div>

              <div className="text-[11px] text-gray-300 bg-white/5 p-2 rounded-xl border border-white/5 text-left leading-relaxed">
                <span className="text-amber-400 font-bold">📌 पेमेंट कैसे करें: </span>
                ऊपर <strong>"Pay via PhonePe (ऑटो पेमेंट)"</strong> दबाएं जिससे फोनपे में ₹{amount} अपने आप आ जाएगा। पेमेंट सफल होने के बाद 12-अंकीय <strong>UTR नंबर</strong> नीचे डालकर सबमिट करें। ओनर के अप्रूव करते ही पैसे <strong>हैंड-टू-हैंड</strong> आपके वॉलेट में आ जाएंगे।
              </div>
            </div>

            {/* Step 3: Enter UTR / Ref Number & Upload Screenshot */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">
                  {language === 'hi' ? '2. 12-अंकीय UTR / Ref नंबर दर्ज करें' : '2. Enter 12-Digit UTR / Transaction No.'}
                  <span className="text-rose-400 ml-1">*</span>
                </label>
                <input
                  type="text"
                  maxLength={18}
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.replace(/\s+/g, ''))}
                  placeholder="e.g. 412089472910"
                  className="w-full bg-[#202438] border border-white/10 rounded-xl px-3 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-400 placeholder:text-gray-500 font-bold"
                  required
                />
                <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>
                    {language === 'hi'
                      ? 'PhonePe / GPay / Paytm रसीद में दिखने वाला 12-अंकों का UTR नंबर डालें'
                      : 'Enter the 12-digit UTR from your PhonePe transaction details'}
                  </span>
                </p>
              </div>

              {/* Optional Screenshot Receipt */}
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">
                  {language === 'hi' ? 'पेमेंट स्क्रीनशॉट (वैकल्पिक)' : 'Payment Screenshot Receipt (Optional)'}
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 cursor-pointer bg-[#202438] hover:bg-[#282d46] border border-dashed border-white/20 rounded-xl p-2.5 text-center flex items-center justify-center gap-2 text-xs text-gray-300">
                    <UploadCloud className="w-4 h-4 text-amber-400" />
                    <span>{screenshotPreview ? 'Change Screenshot' : 'Upload Screenshot'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {screenshotPreview && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/20 shrink-0">
                      <img src={screenshotPreview} alt="Receipt" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitted || !utrNumber}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:brightness-110 active:scale-95 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-rose-950/40 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitted ? (
                  <span>Request Submitted! Verifying...</span>
                ) : (
                  <>
                    <span>{language === 'hi' ? `₹${amount} जमा का अनुरोध भेजें` : `Submit ₹${amount} Deposit`}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Tab 2: Deposit Records / History */
          <div className="p-4 space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {language === 'hi' ? 'जमा इतिहास' : 'Recharge Records'}
            </h4>
            {deposits.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-xs">
                {language === 'hi' ? 'कोई जमा रिकॉर्ड नहीं मिला' : 'No deposit records found.'}
              </div>
            ) : (
              <div className="space-y-2">
                {deposits.map((dep) => (
                  <div
                    key={dep.id}
                    className="bg-[#202438] p-3 rounded-2xl border border-white/5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-amber-400 text-sm">
                        +₹{dep.amount.toLocaleString('en-IN')}
                      </span>
                      {dep.status === 'approved' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Approved ✅
                        </span>
                      )}
                      {dep.status === 'pending' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                          Under Review ⏳
                        </span>
                      )}
                      {dep.status === 'rejected' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          Rejected ❌
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] font-mono text-gray-400 flex items-center justify-between">
                      <span>UTR: {dep.utr}</span>
                      <span>{new Date(dep.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {dep.rejectionReason && (
                      <div className="text-[10px] text-rose-400 bg-rose-500/10 p-1.5 rounded-lg border border-rose-500/20">
                        Reason: {dep.rejectionReason}
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
