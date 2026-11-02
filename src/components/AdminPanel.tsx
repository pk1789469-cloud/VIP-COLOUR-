/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Shield,
  KeyRound,
  QrCode,
  Sliders,
  DollarSign,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Eye,
  LogOut,
  Sparkles,
  Users,
  AlertTriangle,
  RefreshCw,
  Copy,
  Lock,
} from 'lucide-react';
import { AdminSettings, DepositRequest, WithdrawRequest, UserProfile, Bet } from '../types/game';
import { sound } from '../utils/audio';
import { UpiQrCode } from './UpiQrCode';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  adminSettings: AdminSettings;
  onUpdateAdminSettings: (newSettings: AdminSettings) => void;
  deposits: DepositRequest[];
  onApproveDeposit: (depositId: string) => void;
  onRejectDeposit: (depositId: string, reason?: string) => void;
  withdrawals: WithdrawRequest[];
  onApproveWithdraw: (withdrawId: string) => void;
  onRejectWithdraw: (withdrawId: string, reason?: string) => void;
  user: UserProfile;
  onUpdateUserBalance: (newBalance: number) => void;
  onUpdateUserVip: (newVip: number) => void;
  activeBets: Bet[];
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  adminSettings,
  onUpdateAdminSettings,
  deposits,
  onApproveDeposit,
  onRejectDeposit,
  withdrawals,
  onApproveWithdraw,
  onRejectWithdraw,
  user,
  onUpdateUserBalance,
  onUpdateUserVip,
  activeBets,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcodeInput, setPasscodeInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'control' | 'upi' | 'deposits' | 'withdrawals' | 'users' | 'settings'>('control');

  // Form states for settings
  const [upiId, setUpiId] = useState<string>(adminSettings.ownerUpiId);
  const [upiName, setUpiName] = useState<string>(adminSettings.ownerUpiName);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>(adminSettings.qrCodeUrl || '');
  const [marqueeNotice, setMarqueeNotice] = useState<string>(adminSettings.marqueeNotice);
  const [minDeposit, setMinDeposit] = useState<number>(adminSettings.minDeposit);
  const [minWithdraw, setMinWithdraw] = useState<number>(adminSettings.minWithdraw);

  // Balance adjustment input
  const [adjustAmount, setAdjustAmount] = useState<string>('500');

  // Preview screenshot
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput.trim() === adminSettings.adminPasscode) {
      sound.playWin();
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      sound.playLose();
      setAuthError('Incorrect passcode! Default is: tgowner8888');
    }
  };

  const handleSaveUpi = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    onUpdateAdminSettings({
      ...adminSettings,
      ownerUpiId: upiId.trim(),
      ownerUpiName: upiName.trim(),
      qrCodeUrl: qrCodeUrl.trim(),
    });
    alert('Owner UPI & QR Code updated successfully!');
  };

  const handleSavePlatformSettings = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    onUpdateAdminSettings({
      ...adminSettings,
      marqueeNotice,
      minDeposit: Number(minDeposit) || 100,
      minWithdraw: Number(minWithdraw) || 110,
    });
    alert('Platform settings saved!');
  };

  const handleSetRigMode = (mode: AdminSettings['rigMode']) => {
    sound.playClick();
    onUpdateAdminSettings({
      ...adminSettings,
      rigMode: mode,
      forcedNextResult: {
        number: null,
      },
    });
  };

  const handleForceNumber = (num: number) => {
    sound.playClick();
    onUpdateAdminSettings({
      ...adminSettings,
      rigMode: 'force_result',
      forcedNextResult: {
        number: num,
      },
    });
  };

  const handleClearForced = () => {
    sound.playClick();
    onUpdateAdminSettings({
      ...adminSettings,
      forcedNextResult: {
        number: null,
      },
      rigMode: 'fair',
    });
  };

  const pendingDepositsCount = deposits.filter((d) => d.status === 'pending').length;
  const pendingWithdrawalsCount = withdrawals.filter((w) => w.status === 'pending').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[94vh] overflow-y-auto bg-[#131622] border-2 border-red-500/40 rounded-3xl shadow-2xl text-white flex flex-col">
        {/* Admin Header */}
        <div className="sticky top-0 z-20 bg-gradient-to-r from-red-950 via-[#1b1f33] to-[#131622] border-b border-red-500/30 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center shadow-lg shadow-red-900/50">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-['Rajdhani'] font-black text-lg tracking-wider uppercase text-white">
                  TG Gaming <span className="text-amber-400">Owner Portal</span>
                </h3>
                <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                  ADMIN ONLY
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-mono">
                Full Game & Payment Control Room
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={() => {
                  sound.playClick();
                  setIsAuthenticated(false);
                }}
                title="Lock Admin"
                className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-500/30 text-xs flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lock</span>
              </button>
            )}
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Auth Screen if not logged in */}
        {!isAuthenticated ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-red-600 to-amber-600 flex items-center justify-center shadow-xl shadow-red-900/50">
              <Lock className="w-8 h-8 text-white" />
            </div>

            <div>
              <h4 className="text-xl font-black font-['Rajdhani'] uppercase tracking-wider text-white">
                Enter Owner Access PIN
              </h4>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">
                This panel gives you 100% control over payments, UPI QR, user balance, and winning game results.
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full max-w-xs space-y-3">
              <div className="relative">
                <KeyRound className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  placeholder="Enter Passcode"
                  className="w-full bg-[#1b1f33] border border-white/20 rounded-xl pl-9 pr-3 py-2.5 text-center font-mono font-bold tracking-widest text-white text-base focus:outline-none focus:border-amber-400"
                  autoFocus
                />
              </div>

              {authError && (
                <div className="text-rose-400 text-xs font-semibold bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:brightness-110 active:scale-95 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-red-900/40"
              >
                Access Owner Control
              </button>

              <div className="text-[11px] text-gray-400 font-mono bg-white/5 p-2 rounded-lg border border-white/10">
                Default Owner Passcode: <span className="text-amber-400 font-bold">tgowner8888</span>
              </div>
            </form>
          </div>
        ) : (
          /* Authenticated Admin Dashboard */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Nav Tabs */}
            <div className="flex border-b border-white/10 bg-[#161929] overflow-x-auto">
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('control');
                }}
                className={`px-3.5 py-3 text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'control'
                    ? 'text-amber-400 border-b-2 border-amber-400 bg-white/5'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Game Rigging</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('upi');
                }}
                className={`px-3.5 py-3 text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'upi'
                    ? 'text-amber-400 border-b-2 border-amber-400 bg-white/5'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>UPI & QR Settings</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('deposits');
                }}
                className={`px-3.5 py-3 text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 relative ${
                  activeTab === 'deposits'
                    ? 'text-amber-400 border-b-2 border-amber-400 bg-white/5'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Deposits</span>
                {pendingDepositsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                    {pendingDepositsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('withdrawals');
                }}
                className={`px-3.5 py-3 text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 relative ${
                  activeTab === 'withdrawals'
                    ? 'text-amber-400 border-b-2 border-amber-400 bg-white/5'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Withdrawals</span>
                {pendingWithdrawalsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-black font-bold">
                    {pendingWithdrawalsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('users');
                }}
                className={`px-3.5 py-3 text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'users'
                    ? 'text-amber-400 border-b-2 border-amber-400 bg-white/5'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>User Balances</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {/* TAB 1: GAME RIGGING & RESULT CONTROLLER */}
              {activeTab === 'control' && (
                <div className="space-y-4">
                  {/* Status Banner */}
                  <div className="bg-gradient-to-r from-red-950/60 to-[#1f243a] p-4 rounded-2xl border border-red-500/30 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-gray-400 uppercase font-mono">Current Game Mode Control</div>
                      <div className="text-lg font-black text-amber-400 font-['Rajdhani'] uppercase flex items-center gap-2 mt-0.5">
                        <span>Mode: {adminSettings.rigMode.replace('_', ' ')}</span>
                        {adminSettings.forcedNextResult.number !== null && (
                          <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-xs font-mono font-bold animate-pulse">
                            FORCED NEXT: {adminSettings.forcedNextResult.number}
                          </span>
                        )}
                      </div>
                    </div>
                    {adminSettings.forcedNextResult.number !== null && (
                      <button
                        onClick={handleClearForced}
                        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-xs font-bold"
                      >
                        Reset to Fair
                      </button>
                    )}
                  </div>

                  {/* Mode Selector */}
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-2">
                      Choose How The Next Round Decides Winner:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleSetRigMode('fair')}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          adminSettings.rigMode === 'fair'
                            ? 'bg-emerald-950/50 border-emerald-500 shadow-lg shadow-emerald-950/50'
                            : 'bg-[#1b1f33] border-white/5 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div className="font-bold text-sm text-emerald-400 flex items-center gap-1.5">
                          <span>🎲 Fair / Random</span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1 leading-snug">
                          Numbers 0-9 generated randomly (10% chance each).
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSetRigMode('smart_house_win')}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          adminSettings.rigMode === 'smart_house_win'
                            ? 'bg-amber-950/50 border-amber-500 shadow-lg shadow-amber-950/50'
                            : 'bg-[#1b1f33] border-white/5 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
                          <span>🧠 Smart House Win</span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1 leading-snug">
                          Automatically draws the number where the platform pays minimum payout!
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSetRigMode('force_result')}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          adminSettings.rigMode === 'force_result'
                            ? 'bg-rose-950/50 border-rose-500 shadow-lg shadow-rose-950/50'
                            : 'bg-[#1b1f33] border-white/5 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div className="font-bold text-sm text-rose-400 flex items-center gap-1.5">
                          <span>🎯 Manual Force</span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1 leading-snug">
                          You pick the exact winning number or color below.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Manual Pick Controller (Numbers 0-9) */}
                  <div className="bg-[#1a1e30] p-4 rounded-2xl border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-300">
                        Force Exact Winning Number on Next Round:
                      </label>
                      <span className="text-[10px] text-amber-400 font-mono">
                        (Click any number below to force)
                      </span>
                    </div>

                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                        const isSelected = adminSettings.forcedNextResult.number === num;
                        let colorTag = 'Green';
                        if (num === 0) colorTag = 'Red+Vio';
                        else if (num === 5) colorTag = 'Grn+Vio';
                        else if ([1, 3, 7, 9].includes(num)) colorTag = 'Green';
                        else colorTag = 'Red';

                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handleForceNumber(num)}
                            className={`py-3 px-1 rounded-xl font-black text-base flex flex-col items-center justify-center border transition-all ${
                              isSelected
                                ? 'bg-amber-400 border-white text-black scale-105 shadow-lg shadow-amber-400/40 ring-2 ring-white'
                                : 'bg-[#242942] border-white/5 text-white hover:bg-[#2d3353]'
                            }`}
                          >
                            <span>{num}</span>
                            <span className="text-[8px] font-mono opacity-80 uppercase">{colorTag}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Quick Color Force Presets */}
                    <div className="pt-2 border-t border-white/5">
                      <div className="text-[11px] text-gray-400 mb-2">Quick Outcomes Presets:</div>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        <button
                          type="button"
                          onClick={() => handleForceNumber(1)}
                          className="py-1.5 px-2 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 rounded-lg text-xs font-bold text-emerald-300"
                        >
                          Force Green (1)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleForceNumber(2)}
                          className="py-1.5 px-2 bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 rounded-lg text-xs font-bold text-rose-300"
                        >
                          Force Red (2)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleForceNumber(0)}
                          className="py-1.5 px-2 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 rounded-lg text-xs font-bold text-purple-300"
                        >
                          Force Violet (0)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleForceNumber(7)}
                          className="py-1.5 px-2 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 rounded-lg text-xs font-bold text-amber-300"
                        >
                          Force Big (7)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleForceNumber(3)}
                          className="py-1.5 px-2 bg-sky-600/30 hover:bg-sky-600/50 border border-sky-500/40 rounded-lg text-xs font-bold text-sky-300"
                        >
                          Force Small (3)
                        </button>
                        <button
                          type="button"
                          onClick={handleClearForced}
                          className="py-1.5 px-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs font-bold text-gray-300"
                        >
                          Clear (Fair)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Active Bets Inspector */}
                  <div className="bg-[#1a1e30] p-4 rounded-2xl border border-white/10 space-y-2">
                    <div className="text-xs font-bold text-gray-300 flex items-center justify-between">
                      <span>Live Bets Placed by Users on Current Round:</span>
                      <span className="text-[10px] text-amber-400 font-mono">
                        {activeBets.filter((b) => b.status === 'pending').length} Active
                      </span>
                    </div>

                    {activeBets.filter((b) => b.status === 'pending').length === 0 ? (
                      <div className="text-xs text-gray-500 py-3 text-center">
                        No pending bets placed on current period yet.
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {activeBets
                          .filter((b) => b.status === 'pending')
                          .map((b) => (
                            <div
                              key={b.id}
                              className="bg-[#242942] p-2 rounded-xl text-xs flex items-center justify-between font-mono"
                            >
                              <span>
                                Target: <strong className="text-amber-400 capitalize">{b.target}</strong>
                              </span>
                              <span className="text-emerald-400 font-bold">
                                ₹{b.amount * b.multiplier}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: OWNER UPI & QR CODE MANAGER */}
              {activeTab === 'upi' && (
                <div className="space-y-4">
                  <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl text-xs text-amber-300 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      The UPI ID and QR code you configure here will be displayed to all users when they click "Recharge / Deposit". When users pay, the funds go directly to your UPI!
                    </span>
                  </div>

                  <form onSubmit={handleSaveUpi} className="space-y-3.5">
                    <div>
                      <label className="text-xs font-bold text-gray-300 block mb-1">
                        Owner UPI ID (Where Users Send Money):
                      </label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value.trim())}
                        placeholder="e.g. papatg976@upi or 9876543210@paytm"
                        className="w-full bg-[#1b1f33] border border-white/10 rounded-xl px-3 py-2 text-sm font-mono text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-300 block mb-1">
                        Merchant / Owner Title Name:
                      </label>
                      <input
                        type="text"
                        value={upiName}
                        onChange={(e) => setUpiName(e.target.value)}
                        placeholder="e.g. TG GAMING OFFICIAL"
                        className="w-full bg-[#1b1f33] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-300 block mb-1">
                        Custom QR Code Image (URL or Upload below):
                      </label>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={qrCodeUrl}
                          onChange={(e) => setQrCodeUrl(e.target.value.trim())}
                          placeholder="Optional: Paste direct image URL of your PhonePe/GPay QR code"
                          className="w-full bg-[#1b1f33] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-gray-300 focus:outline-none focus:border-amber-400"
                        />
                        <div className="flex items-center gap-2">
                          <label className="flex-1 cursor-pointer bg-[#242942] hover:bg-[#2d3353] border border-dashed border-white/20 rounded-xl p-2 text-center text-xs text-gray-300">
                            <span>Upload QR Code from Phone / PC</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) {
                                  const r = new FileReader();
                                  r.onloadend = () => setQrCodeUrl(r.result as string);
                                  r.readAsDataURL(f);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                          {qrCodeUrl && (
                            <button
                              type="button"
                              onClick={() => setQrCodeUrl('')}
                              className="px-2.5 py-2 rounded-xl bg-rose-600/30 text-rose-300 text-xs font-bold"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Live Preview */}
                    <div className="bg-[#1b1f33] p-4 rounded-2xl border border-white/5 flex flex-col items-center">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Live Preview of Deposit Screen QR Code:
                      </div>
                      <UpiQrCode
                        upiId={upiId || 'tgowner@upi'}
                        name={upiName || 'TG GAMING OFFICIAL'}
                        customQrUrl={qrCodeUrl}
                        size={170}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:brightness-110 active:scale-95 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-red-950/40"
                    >
                      Save UPI & QR Code Settings
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: DEPOSIT REQUESTS MANAGER */}
              {activeTab === 'deposits' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase tracking-wider">
                    <span>User Deposit Requests ({deposits.length})</span>
                    <span>Pending: {pendingDepositsCount}</span>
                  </div>

                  {deposits.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 text-xs">
                      No deposit requests submitted yet.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {deposits.map((dep) => (
                        <div
                          key={dep.id}
                          className="bg-[#1a1e30] p-3.5 rounded-2xl border border-white/10 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-base font-mono text-emerald-400">
                                ₹{dep.amount.toLocaleString('en-IN')}
                              </span>
                              <span className="text-[11px] font-mono text-gray-400">
                                User: {dep.userId}
                              </span>
                            </div>

                            {dep.status === 'approved' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                Approved ✅
                              </span>
                            )}
                            {dep.status === 'pending' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                Pending Verification ⏳
                              </span>
                            )}
                            {dep.status === 'rejected' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                Rejected ❌
                              </span>
                            )}
                          </div>

                          <div className="bg-[#242942] p-2 rounded-xl text-xs font-mono space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">UTR / Ref No:</span>
                              <span className="text-amber-300 font-bold select-all">{dep.utr}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-gray-400">Time:</span>
                              <span className="text-gray-300">{new Date(dep.timestamp).toLocaleString()}</span>
                            </div>
                          </div>

                          {dep.screenshotUrl && (
                            <div>
                              <button
                                type="button"
                                onClick={() => setPreviewImage(dep.screenshotUrl!)}
                                className="text-xs text-sky-400 hover:underline flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View Payment Screenshot Receipt</span>
                              </button>
                            </div>
                          )}

                          {dep.status === 'pending' && (
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  sound.playWin();
                                  onApproveDeposit(dep.id);
                                }}
                                className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 active:scale-95 shadow-md shadow-emerald-950/40"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve (+₹{dep.amount})</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  sound.playClick();
                                  const reason = prompt('Rejection reason (optional):', 'Payment not received in account');
                                  onRejectDeposit(dep.id, reason || undefined);
                                }}
                                className="py-2 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center justify-center gap-1 active:scale-95"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: WITHDRAWALS MANAGER */}
              {activeTab === 'withdrawals' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase tracking-wider">
                    <span>User Withdrawal Requests ({withdrawals.length})</span>
                    <span>Pending: {pendingWithdrawalsCount}</span>
                  </div>

                  {withdrawals.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 text-xs">
                      No withdrawal requests yet.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {withdrawals.map((wth) => (
                        <div
                          key={wth.id}
                          className="bg-[#1a1e30] p-3.5 rounded-2xl border border-white/10 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-base font-mono text-rose-400">
                              ₹{wth.amount.toLocaleString('en-IN')}
                            </span>

                            {wth.status === 'approved' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                Sent / Completed ✅
                              </span>
                            )}
                            {wth.status === 'pending' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                Pending Payout ⏳
                              </span>
                            )}
                            {wth.status === 'rejected' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                Rejected & Refunded ❌
                              </span>
                            )}
                          </div>

                          <div className="bg-[#242942] p-2.5 rounded-xl text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Send To UPI:</span>
                              <div className="flex items-center gap-1">
                                <span className="text-amber-300 font-mono font-bold">{wth.upiId}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(wth.upiId);
                                    sound.playClick();
                                    alert(`Copied UPI: ${wth.upiId}`);
                                  }}
                                  className="text-gray-400 hover:text-white"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Name:</span>
                              <span className="text-white font-semibold">{wth.accountHolderName}</span>
                            </div>
                            {wth.bankAccountNo && (
                              <div className="flex items-center justify-between font-mono text-[11px]">
                                <span className="text-gray-400">Bank / IFSC:</span>
                                <span>{wth.bankAccountNo} ({wth.ifsc})</span>
                              </div>
                            )}
                          </div>

                          {wth.status === 'pending' && (
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  sound.playWin();
                                  onApproveWithdraw(wth.id);
                                }}
                                className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 active:scale-95 shadow-md shadow-emerald-950/40"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Mark Paid & Approve</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  sound.playClick();
                                  const reason = prompt('Rejection reason (will refund balance to user):', 'Invalid UPI details');
                                  onRejectWithdraw(wth.id, reason || undefined);
                                }}
                                className="py-2 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center justify-center gap-1 active:scale-95"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Reject & Refund</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: USERS & BALANCE EDITOR */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  <div className="bg-[#1a1e30] p-4 rounded-2xl border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-400">Target User UID</div>
                        <div className="text-base font-bold font-mono text-white">
                          UID: {user.uid} (VIP{user.vipLevel})
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400">Current Balance</div>
                        <div className="text-xl font-black font-mono text-amber-400">
                          ₹{user.balance.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 space-y-2">
                      <label className="text-xs font-bold text-gray-300 block">
                        Quick Balance Adjuster:
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[100, 500, 1000, 5000].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => {
                              sound.playWin();
                              onUpdateUserBalance(user.balance + amt);
                            }}
                            className="py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 font-bold text-xs"
                          >
                            +₹{amt}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="number"
                          value={adjustAmount}
                          onChange={(e) => setAdjustAmount(e.target.value)}
                          placeholder="Amount"
                          className="w-32 bg-[#242942] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = Number(adjustAmount) || 0;
                            sound.playWin();
                            onUpdateUserBalance(user.balance + val);
                          }}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold"
                        >
                          + Add Custom
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const val = Number(adjustAmount) || 0;
                            sound.playClick();
                            onUpdateUserBalance(Math.max(0, user.balance - val));
                          }}
                          className="px-3 py-2 bg-rose-600 hover:bg-rose-500 rounded-xl text-xs font-bold"
                        >
                          - Deduct
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            onUpdateUserBalance(0);
                          }}
                          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-xs font-bold text-gray-300"
                        >
                          Reset ₹0
                        </button>
                      </div>
                    </div>

                    {/* VIP Level */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs text-gray-400">Change VIP Level:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5, 6, 7].map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              onUpdateUserVip(v);
                            }}
                            className={`w-7 h-7 rounded-lg text-xs font-bold ${
                              user.vipLevel === v
                                ? 'bg-amber-400 text-black font-black'
                                : 'bg-[#242942] text-gray-400'
                            }`}
                          >
                            V{v}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* General settings */}
                  <form onSubmit={handleSavePlatformSettings} className="bg-[#1a1e30] p-4 rounded-2xl border border-white/10 space-y-3">
                    <div className="text-xs font-bold text-gray-300">Platform Marquee & Limits:</div>
                    <div>
                      <label className="text-[11px] text-gray-400 block mb-1">Marquee Announcement:</label>
                      <input
                        type="text"
                        value={marqueeNotice}
                        onChange={(e) => setMarqueeNotice(e.target.value)}
                        className="w-full bg-[#242942] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-gray-400 block mb-1">Min Deposit (₹):</label>
                        <input
                          type="number"
                          value={minDeposit}
                          onChange={(e) => setMinDeposit(Number(e.target.value))}
                          className="w-full bg-[#242942] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-400 block mb-1">Min Withdraw (₹):</label>
                        <input
                          type="number"
                          value={minWithdraw}
                          onChange={(e) => setMinWithdraw(Number(e.target.value))}
                          className="w-full bg-[#242942] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase"
                    >
                      Update Platform Settings
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Screenshot Preview */}
        {previewImage && (
          <div
            className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            <div className="max-w-md max-h-[85vh] overflow-hidden rounded-2xl bg-white p-2">
              <img src={previewImage} alt="Payment Receipt" className="w-full h-full object-contain" />
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="w-full mt-2 py-2 bg-black text-white text-xs font-bold rounded-lg"
              >
                Close Receipt
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
