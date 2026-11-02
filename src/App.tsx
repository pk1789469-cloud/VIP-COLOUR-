/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { MarqueeBanner } from './components/MarqueeBanner';
import { WinGoGame } from './components/WinGoGame';
import { WalletView } from './components/WalletView';
import { PromotionView } from './components/PromotionView';
import { AccountView } from './components/AccountView';
import { BottomNav, MainNavTab } from './components/BottomNav';
import { DepositModal } from './components/DepositModal';
import { WithdrawModal } from './components/WithdrawModal';
import { AdminPanel } from './components/AdminPanel';
import {
  UserProfile,
  AdminSettings,
  Bet,
  PeriodResult,
  DepositRequest,
  WithdrawRequest,
} from './types/game';
import {
  getSavedUser,
  saveUser,
  getSavedAdminSettings,
  saveAdminSettings,
  getSavedDeposits,
  saveDeposits,
  getSavedWithdrawals,
  saveWithdrawals,
  getSavedBets,
  saveBets,
  generateInitialHistory,
} from './utils/storage';
import { sound } from './utils/audio';

export default function App() {
  const [currentTab, setCurrentTab] = useState<MainNavTab>('home');
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');

  // Application State
  const [user, setUser] = useState<UserProfile>(() => getSavedUser());
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => getSavedAdminSettings());
  const [deposits, setDeposits] = useState<DepositRequest[]>(() => getSavedDeposits());
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>(() => getSavedWithdrawals());
  const [userBets, setUserBets] = useState<Bet[]>(() => getSavedBets());
  const [history, setHistory] = useState<PeriodResult[]>(() => generateInitialHistory('1m'));

  // Modals
  const [depositOpen, setDepositOpen] = useState<boolean>(false);
  const [withdrawOpen, setWithdrawOpen] = useState<boolean>(false);
  const [adminOpen, setAdminOpen] = useState<boolean>(false);

  // Sync state to LocalStorage
  useEffect(() => {
    saveUser(user);
  }, [user]);

  useEffect(() => {
    saveAdminSettings(adminSettings);
  }, [adminSettings]);

  useEffect(() => {
    saveDeposits(deposits);
  }, [deposits]);

  useEffect(() => {
    saveWithdrawals(withdrawals);
  }, [withdrawals]);

  useEffect(() => {
    saveBets(userBets);
  }, [userBets]);

  // Server Synchronization: fetch live state, history, and admin settings
  const fetchServerState = useCallback(async () => {
    try {
      const res = await fetch('/api/game/state');
      if (res.ok) {
        const data = await res.json();
        if (data.adminSettings) {
          setAdminSettings((prev) => ({
            ...prev,
            ownerUpiId: data.adminSettings.ownerUpiId || prev.ownerUpiId,
            ownerUpiName: data.adminSettings.ownerUpiName || prev.ownerUpiName,
            qrCodeUrl: data.adminSettings.qrCodeUrl !== undefined ? data.adminSettings.qrCodeUrl : prev.qrCodeUrl,
            marqueeNotice: data.adminSettings.marqueeNotice || prev.marqueeNotice,
          }));
        }
      }
    } catch {
      // Offline / dev fallback
    }
  }, []);

  const fetchServerHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/game/history?limit=100');
      if (res.ok) {
        const data = await res.json();
        if (data.records && Array.isArray(data.records) && data.records.length > 0) {
          setHistory(data.records);
        }
      }
    } catch {
      // fallback
    }
  }, []);

  const [approvalToast, setApprovalToast] = useState<string | null>(null);

  // Poll server state & deposits every 2 seconds to keep all devices in sync
  useEffect(() => {
    fetchServerState();
    fetchServerHistory();

    const interval = setInterval(async () => {
      fetchServerState();

      // Live sync deposits and user balance from server
      try {
        const [depRes, userRes] = await Promise.all([
          fetch('/api/deposits'),
          fetch(`/api/user/${user.id}`),
        ]);

        if (depRes.ok) {
          const depData = await depRes.json();
          if (depData.deposits && Array.isArray(depData.deposits)) {
            setDeposits((prev) => {
              // Check if any deposit was newly approved
              depData.deposits.forEach((newD: DepositRequest) => {
                const oldD = prev.find((p) => p.id === newD.id);
                if (oldD && oldD.status === 'pending' && newD.status === 'approved') {
                  sound.playWin();
                  setApprovalToast(`🎉 बधाई हो! ₹${newD.amount} का डिपॉजिट ओनर द्वारा अप्रूव हो गया है और आपके वॉलेट में जुड़ चुका है!`);
                  setTimeout(() => setApprovalToast(null), 5000);
                }
              });
              return depData.deposits;
            });
          }
        }

        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.user) {
            setUser((prev) => ({
              ...prev,
              balance: userData.user.balance !== undefined ? userData.user.balance : prev.balance,
              vipLevel: userData.user.vipLevel || prev.vipLevel,
            }));
          }
        }
      } catch {
        // network fallback
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [fetchServerState, fetchServerHistory, user.id]);

  // Handlers for User Balance
  const handleUpdateUserBalance = (newBalance: number, wonAmount?: number) => {
    setUser((prev) => ({
      ...prev,
      balance: Math.max(0, newBalance),
      totalWon: wonAmount ? prev.totalWon + wonAmount : prev.totalWon,
    }));
  };

  const handleUpdateUserVip = (newVip: number) => {
    setUser((prev) => ({
      ...prev,
      vipLevel: newVip,
    }));
  };

  // Gallery Avatar Photo Upload Handler
  const handleUpdateAvatar = async (avatarDataUrl: string) => {
    setUser((prev) => ({
      ...prev,
      avatar: avatarDataUrl,
    }));

    try {
      await fetch(`/api/user/${user.id}/avatar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: avatarDataUrl }),
      });
    } catch {
      // Local fallback already handled
    }
  };

  // Handlers for Game Bets
  const handleAddBet = async (bet: Bet) => {
    setUserBets((prev) => [bet, ...prev]);
    setUser((prev) => ({
      ...prev,
      totalBets: prev.totalBets + 1,
    }));

    try {
      await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          target: bet.target,
          amount: bet.amount,
          multiplier: bet.multiplier,
        }),
      });
    } catch {
      // Fallback
    }
  };

  const handleUpdateBetStatus = (betId: string, status: 'won' | 'lost', winAmount: number) => {
    setUserBets((prev) =>
      prev.map((b) => (b.id === betId ? { ...b, status, winAmount } : b))
    );
  };

  const handleAddPeriodResult = (result: PeriodResult) => {
    setHistory((prev) => {
      if (prev.some((item) => item.periodId === result.periodId)) {
        return prev;
      }
      return [result, ...prev];
    });
  };

  const handleConsumeForcedResult = () => {
    setAdminSettings((prev) => ({
      ...prev,
      forcedNextResult: { number: null },
      rigMode: 'fair',
    }));

    fetch('/api/admin/rig', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rigMode: 'fair', forcedNumber: null }),
    }).catch(() => {});
  };

  // Deposit Handlers
  const handleSubmitDeposit = async (req: Omit<DepositRequest, 'id' | 'timestamp' | 'status'>) => {
    const newDep: DepositRequest = {
      ...req,
      id: `dep_${Date.now()}`,
      timestamp: Date.now(),
      status: 'pending',
    };
    setDeposits((prev) => [newDep, ...prev]);

    try {
      await fetch('/api/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDep),
      });
    } catch {
      // Local fallback
    }
  };

  const handleApproveDeposit = async (depositId: string) => {
    const dep = deposits.find((d) => d.id === depositId);
    if (!dep || dep.status === 'approved') return;

    setDeposits((prev) =>
      prev.map((d) => (d.id === depositId ? { ...d, status: 'approved' } : d))
    );

    setUser((prev) => ({
      ...prev,
      balance: prev.balance + dep.amount,
    }));

    try {
      await fetch(`/api/deposits/${depositId}/approve`, { method: 'POST' });
    } catch {
      // Local
    }
  };

  const handleRejectDeposit = async (depositId: string, reason?: string) => {
    setDeposits((prev) =>
      prev.map((d) =>
        d.id === depositId
          ? { ...d, status: 'rejected', rejectionReason: reason || 'Transaction not verified' }
          : d
      )
    );

    try {
      await fetch(`/api/deposits/${depositId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
    } catch {
      // Local
    }
  };

  // Withdrawal Handlers
  const handleSubmitWithdraw = async (req: Omit<WithdrawRequest, 'id' | 'timestamp' | 'status'>) => {
    setUser((prev) => ({
      ...prev,
      balance: Math.max(0, prev.balance - req.amount),
    }));

    const newWth: WithdrawRequest = {
      ...req,
      id: `wth_${Date.now()}`,
      timestamp: Date.now(),
      status: 'pending',
    };
    setWithdrawals((prev) => [newWth, ...prev]);

    try {
      await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWth),
      });
    } catch {
      // Local
    }
  };

  const handleApproveWithdraw = async (withdrawId: string) => {
    setWithdrawals((prev) =>
      prev.map((w) => (w.id === withdrawId ? { ...w, status: 'approved' } : w))
    );

    try {
      await fetch(`/api/withdrawals/${withdrawId}/approve`, { method: 'POST' });
    } catch {
      // Local
    }
  };

  const handleRejectWithdraw = async (withdrawId: string, reason?: string) => {
    const wth = withdrawals.find((w) => w.id === withdrawId);
    if (!wth || wth.status === 'rejected') return;

    setWithdrawals((prev) =>
      prev.map((w) =>
        w.id === withdrawId
          ? { ...w, status: 'rejected', rejectionReason: reason || 'Details mismatch' }
          : w
      )
    );

    setUser((prev) => ({
      ...prev,
      balance: prev.balance + wth.amount,
    }));

    try {
      await fetch(`/api/withdrawals/${withdrawId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
    } catch {
      // Local
    }
  };

  const handleSaveAdminSettings = async (newSettings: AdminSettings) => {
    setAdminSettings(newSettings);
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      if (newSettings.rigMode) {
        await fetch('/api/admin/rig', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rigMode: newSettings.rigMode,
            forcedNumber: newSettings.forcedNextResult.number,
          }),
        });
      }
    } catch {
      // Local
    }
  };

  return (
    <div className="min-h-screen bg-[#0e101a] text-white flex justify-center selection:bg-rose-600 selection:text-white">
      {/* Mobile-contained app frame */}
      <div className="w-full max-w-md bg-[#12141f] min-h-screen shadow-2xl relative flex flex-col border-x border-white/5">
        {/* App Header */}
        <Header
          user={user}
          onOpenDeposit={() => setDepositOpen(true)}
          onOpenWithdraw={() => setWithdrawOpen(true)}
          onOpenAdmin={() => setAdminOpen(true)}
          language={language}
          onToggleLanguage={() => setLanguage((prev) => (prev === 'hi' ? 'en' : 'hi'))}
        />

        {/* Instant Approval Alert Toast */}
        {approvalToast && (
          <div className="bg-gradient-to-r from-emerald-600 to-green-700 text-white p-3 px-4 text-xs font-bold shadow-lg animate-in fade-in slide-in-from-top flex items-center justify-between border-y border-emerald-400/50">
            <span>{approvalToast}</span>
            <button onClick={() => setApprovalToast(null)} className="text-white/80 hover:text-white ml-2 text-sm">✕</button>
          </div>
        )}

        {/* Marquee Announcement */}
        <MarqueeBanner notice={adminSettings.marqueeNotice} />

        {/* Active Tab View */}
        <main className="flex-1">
          {currentTab === 'home' && (
            <WinGoGame
              user={user}
              adminSettings={adminSettings}
              onUpdateUserBalance={handleUpdateUserBalance}
              onAddBet={handleAddBet}
              userBets={userBets}
              onUpdateBetStatus={handleUpdateBetStatus}
              onConsumeForcedResult={handleConsumeForcedResult}
              language={language}
              history={history}
              onAddPeriodResult={handleAddPeriodResult}
            />
          )}

          {currentTab === 'wallet' && (
            <WalletView
              user={user}
              deposits={deposits}
              withdrawals={withdrawals}
              onOpenDeposit={() => setDepositOpen(true)}
              onOpenWithdraw={() => setWithdrawOpen(true)}
              language={language}
            />
          )}

          {currentTab === 'promotion' && (
            <PromotionView user={user} language={language} />
          )}

          {currentTab === 'account' && (
            <AccountView
              user={user}
              onOpenDeposit={() => setDepositOpen(true)}
              onOpenWithdraw={() => setWithdrawOpen(true)}
              onOpenAdmin={() => setAdminOpen(true)}
              onUpdateAvatar={handleUpdateAvatar}
              language={language}
              onToggleLanguage={() => setLanguage((prev) => (prev === 'hi' ? 'en' : 'hi'))}
            />
          )}
        </main>

        {/* Bottom Navigation (Win Go 1M, Wallet, Promotion, Account) */}
        <BottomNav
          currentTab={currentTab}
          onChangeTab={setCurrentTab}
          language={language}
        />

        {/* Deposit / Recharge Modal */}
        <DepositModal
          isOpen={depositOpen}
          onClose={() => setDepositOpen(false)}
          adminSettings={adminSettings}
          userBalance={user.balance}
          userId={user.uid}
          deposits={deposits}
          onSubmitDeposit={handleSubmitDeposit}
          language={language}
        />

        {/* Withdraw Modal */}
        <WithdrawModal
          isOpen={withdrawOpen}
          onClose={() => setWithdrawOpen(false)}
          userBalance={user.balance}
          userId={user.uid}
          adminSettings={adminSettings}
          withdrawals={withdrawals}
          onSubmitWithdraw={handleSubmitWithdraw}
          language={language}
        />

        {/* Owner Admin Control Panel */}
        <AdminPanel
          isOpen={adminOpen}
          onClose={() => setAdminOpen(false)}
          adminSettings={adminSettings}
          onUpdateAdminSettings={handleSaveAdminSettings}
          deposits={deposits}
          onApproveDeposit={handleApproveDeposit}
          onRejectDeposit={handleRejectDeposit}
          withdrawals={withdrawals}
          onApproveWithdraw={handleApproveWithdraw}
          onRejectWithdraw={handleRejectWithdraw}
          user={user}
          onUpdateUserBalance={(bal) => handleUpdateUserBalance(bal)}
          onUpdateUserVip={handleUpdateUserVip}
          activeBets={userBets}
        />
      </div>
    </div>
  );
}
