/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AdminSettings, Bet, DepositRequest, PeriodResult, TimeMode, UserProfile, WithdrawRequest } from '../types/game';

const STORAGE_KEYS = {
  USER: 'tg_user_profile',
  ADMIN_SETTINGS: 'tg_admin_settings',
  PERIOD_HISTORY: 'tg_period_history',
  USER_BETS: 'tg_user_bets',
  DEPOSITS: 'tg_deposits',
  WITHDRAWALS: 'tg_withdrawals',
};

export const INITIAL_USER: UserProfile = {
  id: 'user_1',
  uid: '984120',
  phone: '98765****10',
  balance: 500.0,
  vipLevel: 2,
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  invitationCode: 'TG99281',
  totalWon: 1420.0,
  totalBets: 24,
};

export const INITIAL_ADMIN_SETTINGS: AdminSettings = {
  ownerUpiId: 'tggamingempire@ybl',
  ownerUpiName: 'TG GAMING EMPIRE',
  qrCodeUrl: '/assets/aistudio/Screenshot_20261031-165524_02660bea_02660bea.png',
  minDeposit: 100,
  minWithdraw: 110,
  marqueeNotice: '🔥 Welcome to TG Gaming Owner! Official PhonePe QR & UPI: tggamingempire@ybl. Instant Deposit & Fast Withdrawal 24/7! 🔥',
  rigMode: 'fair',
  forcedNextResult: {
    number: null,
  },
  adminPasscode: 'tgowner8888',
};

// Generate realistic starting period history
export const generateInitialHistory = (mode: TimeMode): PeriodResult[] => {
  const history: PeriodResult[] = [];
  const basePeriod = 20261102100010000;
  const now = Date.now();

  for (let i = 25; i >= 1; i--) {
    const num = Math.floor(Math.random() * 10);
    let color: PeriodResult['color'] = 'green';
    if (num === 0) color = 'red-violet';
    else if (num === 5) color = 'green-violet';
    else if ([1, 3, 7, 9].includes(num)) color = 'green';
    else color = 'red';

    const size = num >= 5 ? 'big' : 'small';
    history.push({
      periodId: `${basePeriod + i}`,
      timeMode: mode,
      number: num,
      color,
      size,
      timestamp: now - (25 - i) * 60000,
    });
  }

  return history;
};

// Helper for local storage with fallback
export function getSavedUser(): UserProfile {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    if (data) return JSON.parse(data);
  } catch {
    // fallback
  }
  return INITIAL_USER;
}

export function saveUser(user: UserProfile) {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch {
    // fallback
  }
}

export function getSavedAdminSettings(): AdminSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ADMIN_SETTINGS);
    if (data) return JSON.parse(data);
  } catch {
    // fallback
  }
  return INITIAL_ADMIN_SETTINGS;
}

export function saveAdminSettings(settings: AdminSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_SETTINGS, JSON.stringify(settings));
  } catch {
    // fallback
  }
}

export function getSavedDeposits(): DepositRequest[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DEPOSITS);
    if (data) return JSON.parse(data);
  } catch {
    // fallback
  }
  return [
    {
      id: 'dep_101',
      userId: 'user_1',
      amount: 500,
      utr: '412089472910',
      upiIdUsed: 'tgowner976@upi',
      timestamp: Date.now() - 3600000 * 2,
      status: 'approved',
    },
    {
      id: 'dep_102',
      userId: 'user_1',
      amount: 1000,
      utr: '412093849182',
      upiIdUsed: 'tgowner976@upi',
      timestamp: Date.now() - 3600000 * 5,
      status: 'approved',
    },
  ];
}

export function saveDeposits(deposits: DepositRequest[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.DEPOSITS, JSON.stringify(deposits));
  } catch {
    // fallback
  }
}

export function getSavedWithdrawals(): WithdrawRequest[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.WITHDRAWALS);
    if (data) return JSON.parse(data);
  } catch {
    // fallback
  }
  return [
    {
      id: 'wth_101',
      userId: 'user_1',
      amount: 400,
      upiId: 'winner98@ybl',
      accountHolderName: 'Rahul Kumar',
      timestamp: Date.now() - 3600000 * 8,
      status: 'approved',
    },
  ];
}

export function saveWithdrawals(withdrawals: WithdrawRequest[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(withdrawals));
  } catch {
    // fallback
  }
}

export function getSavedBets(): Bet[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_BETS);
    if (data) return JSON.parse(data);
  } catch {
    // fallback
  }
  return [];
}

export function saveBets(bets: Bet[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_BETS, JSON.stringify(bets));
  } catch {
    // fallback
  }
}
