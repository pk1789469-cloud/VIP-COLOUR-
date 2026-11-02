/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameColor = 'green' | 'red' | 'violet';
export type BetTarget = GameColor | 'big' | 'small' | number;

export type TimeMode = '30s' | '1m' | '3m' | '5m';

export interface Bet {
  id: string;
  periodId: string;
  timeMode: TimeMode;
  target: BetTarget;
  amount: number;
  multiplier: number;
  timestamp: number;
  status: 'pending' | 'won' | 'lost';
  winAmount?: number;
}

export interface PeriodResult {
  periodId: string;
  timeMode: TimeMode;
  number: number; // 0 - 9
  color: GameColor | 'green-violet' | 'red-violet';
  size: 'big' | 'small';
  timestamp: number;
}

export interface DepositRequest {
  id: string;
  userId: string;
  amount: number;
  utr: string;
  upiIdUsed: string;
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  screenshotUrl?: string;
}

export interface WithdrawRequest {
  id: string;
  userId: string;
  amount: number;
  upiId: string;
  accountHolderName: string;
  bankAccountNo?: string;
  ifsc?: string;
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface AdminSettings {
  ownerUpiId: string;
  ownerUpiName: string;
  qrCodeUrl: string;
  minDeposit: number;
  minWithdraw: number;
  marqueeNotice: string;
  // Control mechanism for game
  rigMode: 'fair' | 'smart_house_win' | 'force_result';
  forcedNextResult: {
    number: number | null; // null means none forced
  };
  adminPasscode: string;
}

export interface UserProfile {
  id: string;
  uid: string;
  phone: string;
  balance: number;
  vipLevel: number;
  avatar: string;
  invitationCode: string;
  totalWon: number;
  totalBets: number;
}
