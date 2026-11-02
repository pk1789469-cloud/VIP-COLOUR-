/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parser with 10MB limit for gallery image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data storage directory
const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Types
interface PeriodResult {
  periodId: string;
  timeMode: '1m';
  number: number;
  color: 'green' | 'red' | 'violet' | 'green-violet' | 'red-violet';
  size: 'big' | 'small';
  timestamp: number;
}

interface Bet {
  id: string;
  userId: string;
  periodId: string;
  timeMode: '1m';
  target: string | number;
  amount: number;
  multiplier: number;
  timestamp: number;
  status: 'pending' | 'won' | 'lost';
  winAmount?: number;
}

interface DepositRequest {
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

interface WithdrawRequest {
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

interface UserProfile {
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

interface AdminSettings {
  ownerUpiId: string;
  ownerUpiName: string;
  qrCodeUrl: string;
  minDeposit: number;
  minWithdraw: number;
  marqueeNotice: string;
  rigMode: 'fair' | 'smart_house_win' | 'force_result';
  forcedNextResult: {
    number: number | null;
  };
  adminPasscode: string;
}

interface ServerDatabase {
  users: Record<string, UserProfile>;
  adminSettings: AdminSettings;
  history: PeriodResult[];
  bets: Bet[];
  deposits: DepositRequest[];
  withdrawals: WithdrawRequest[];
  lastResolvedPeriod: string;
}

// Generate starting periods for rich total history
function createInitialHistory(): PeriodResult[] {
  const list: PeriodResult[] = [];
  const now = Date.now();
  const currentMinute = Math.floor(now / 60000);

  // Generate 80 past periods so user sees comprehensive total history
  for (let i = 80; i >= 1; i--) {
    const periodTime = (currentMinute - i) * 60000;
    const d = new Date(periodTime);
    const dateStr = d.toISOString().slice(0, 10).replace(/-/g, '');
    const periodSeq = String(d.getUTCHours() * 60 + d.getUTCMinutes()).padStart(4, '0');
    const periodId = `${dateStr}1000${periodSeq}`;

    const num = Math.floor(Math.random() * 10);
    let color: PeriodResult['color'] = 'green';
    if (num === 0) color = 'red-violet';
    else if (num === 5) color = 'green-violet';
    else if ([1, 3, 7, 9].includes(num)) color = 'green';
    else color = 'red';

    list.push({
      periodId,
      timeMode: '1m',
      number: num,
      color,
      size: num >= 5 ? 'big' : 'small',
      timestamp: periodTime,
    });
  }
  return list;
}

// Default In-Memory DB
let db: ServerDatabase = {
  users: {
    'user_1': {
      id: 'user_1',
      uid: '984120',
      phone: '98765****10',
      balance: 1000.0,
      vipLevel: 2,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      invitationCode: 'TG99281',
      totalWon: 1420.0,
      totalBets: 24,
    },
  },
  adminSettings: {
    ownerUpiId: 'tggamingempire@ybl',
    ownerUpiName: 'TG GAMING EMPIRE',
    qrCodeUrl: '/assets/aistudio/Screenshot_20261031-165524_02660bea_02660bea.png',
    minDeposit: 100,
    minWithdraw: 110,
    marqueeNotice: '🔥 Welcome to TG Gaming Owner! Official PhonePe QR & UPI: tggamingempire@ybl. Instant Deposit & Fast Withdrawal 24/7! 🔥',
    rigMode: 'fair',
    forcedNextResult: { number: null },
    adminPasscode: 'tgowner8888',
  },
  history: createInitialHistory(),
  bets: [],
  deposits: [
    {
      id: 'dep_1',
      userId: 'user_1',
      amount: 500,
      utr: '412089472910',
      upiIdUsed: 'tggamingempire@ybl',
      timestamp: Date.now() - 3600000 * 2,
      status: 'approved',
    },
  ],
  withdrawals: [
    {
      id: 'wth_1',
      userId: 'user_1',
      amount: 400,
      upiId: 'winner98@ybl',
      accountHolderName: 'Rahul Kumar',
      timestamp: Date.now() - 3600000 * 5,
      status: 'approved',
    },
  ],
  lastResolvedPeriod: '',
};

// Load saved DB if exists
if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    db = { ...db, ...parsed };
    // Always ensure the user's latest UPI and QR code are set
    db.adminSettings.ownerUpiId = 'tggamingempire@ybl';
    db.adminSettings.ownerUpiName = 'TG GAMING EMPIRE';
    db.adminSettings.qrCodeUrl = '/assets/aistudio/Screenshot_20261031-165524_02660bea_02660bea.png';
    if (!db.history || db.history.length === 0) {
      db.history = createInitialHistory();
    }
  } catch {
    // fallback
  }
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error('Failed to save db:', err);
  }
}

// Calculate Universal Synchronized Period ID & Seconds Remaining
function getLivePeriodInfo() {
  const now = Date.now();
  const nowSeconds = Math.floor(now / 1000);
  const timeLeft = 60 - (nowSeconds % 60); // 60 to 1

  const d = new Date(now);
  const dateStr = d.toISOString().slice(0, 10).replace(/-/g, '');
  const totalMinutes = d.getUTCHours() * 60 + d.getUTCMinutes();
  const periodSeq = String(totalMinutes).padStart(4, '0');
  const periodId = `${dateStr}1000${periodSeq}`;

  return { periodId, timeLeft, serverTime: now };
}

// Server-side Engine: Checks and resolves round draw synchronously
function checkAndResolveGame() {
  const { periodId, timeLeft } = getLivePeriodInfo();

  // If we are at the beginning of a period (e.g. timeLeft >= 58)
  // and we haven't resolved the previous period yet:
  const prevPeriodNumber = BigInt(periodId) - 1n;
  const prevPeriodId = prevPeriodNumber.toString();

  if (db.lastResolvedPeriod !== prevPeriodId && prevPeriodId !== periodId) {
    // Check if prevPeriod is already recorded in history
    const alreadyExists = db.history.some((h) => h.periodId === prevPeriodId);
    if (!alreadyExists) {
      // Resolve the winning outcome for prevPeriodId
      let winningNum: number;

      if (db.adminSettings.forcedNextResult.number !== null) {
        winningNum = Number(db.adminSettings.forcedNextResult.number);
        // consume forced result
        db.adminSettings.forcedNextResult.number = null;
        db.adminSettings.rigMode = 'fair';
      } else if (db.adminSettings.rigMode === 'smart_house_win') {
        const periodBets = db.bets.filter((b) => b.periodId === prevPeriodId && b.status === 'pending');
        if (periodBets.length === 0) {
          winningNum = Math.floor(Math.random() * 10);
        } else {
          let minPayout = Infinity;
          let bestCandidate = 0;
          for (let candidate = 0; candidate <= 9; candidate++) {
            let testPayout = 0;
            for (const b of periodBets) {
              const betSum = b.amount * b.multiplier;
              if (Number(b.target) === candidate) testPayout += betSum * 9;
              if (b.target === 'big' && candidate >= 5) testPayout += betSum * 2;
              if (b.target === 'small' && candidate < 5) testPayout += betSum * 2;
              if (b.target === 'green') {
                if ([1, 3, 7, 9].includes(candidate)) testPayout += betSum * 2;
                if (candidate === 5) testPayout += betSum * 1.5;
              }
              if (b.target === 'red') {
                if ([2, 4, 6, 8].includes(candidate)) testPayout += betSum * 2;
                if (candidate === 0) testPayout += betSum * 1.5;
              }
              if (b.target === 'violet' && (candidate === 0 || candidate === 5)) {
                testPayout += betSum * 4.5;
              }
            }
            if (testPayout < minPayout) {
              minPayout = testPayout;
              bestCandidate = candidate;
            }
          }
          winningNum = bestCandidate;
        }
      } else {
        winningNum = Math.floor(Math.random() * 10);
      }

      let color: PeriodResult['color'] = 'green';
      if (winningNum === 0) color = 'red-violet';
      else if (winningNum === 5) color = 'green-violet';
      else if ([1, 3, 7, 9].includes(winningNum)) color = 'green';
      else color = 'red';

      const size = winningNum >= 5 ? 'big' : 'small';

      const resultItem: PeriodResult = {
        periodId: prevPeriodId,
        timeMode: '1m',
        number: winningNum,
        color,
        size,
        timestamp: Date.now() - (60 - timeLeft) * 1000,
      };

      db.history.unshift(resultItem);
      // Keep up to 500 items in history
      if (db.history.length > 500) {
        db.history = db.history.slice(0, 500);
      }

      // Resolve user bets on prevPeriodId
      const targetBets = db.bets.filter((b) => b.periodId === prevPeriodId && b.status === 'pending');
      targetBets.forEach((b) => {
        const totalBet = b.amount * b.multiplier;
        let won = false;
        let payout = 0;

        if (Number(b.target) === winningNum) {
          won = true;
          payout = totalBet * 9;
        } else if (b.target === 'big' && size === 'big') {
          won = true;
          payout = totalBet * 2;
        } else if (b.target === 'small' && size === 'small') {
          won = true;
          payout = totalBet * 2;
        } else if (b.target === 'green') {
          if ([1, 3, 7, 9].includes(winningNum)) {
            won = true;
            payout = totalBet * 2;
          } else if (winningNum === 5) {
            won = true;
            payout = totalBet * 1.5;
          }
        } else if (b.target === 'red') {
          if ([2, 4, 6, 8].includes(winningNum)) {
            won = true;
            payout = totalBet * 2;
          } else if (winningNum === 0) {
            won = true;
            payout = totalBet * 1.5;
          }
        } else if (b.target === 'violet' && (winningNum === 0 || winningNum === 5)) {
          won = true;
          payout = totalBet * 4.5;
        }

        if (won) {
          b.status = 'won';
          b.winAmount = payout;
          if (db.users[b.userId]) {
            db.users[b.userId].balance += payout;
            db.users[b.userId].totalWon += payout;
          }
        } else {
          b.status = 'lost';
          b.winAmount = 0;
        }
      });

      db.lastResolvedPeriod = prevPeriodId;
      saveDb();
    }
  }
}

// Run engine every 1 second
setInterval(checkAndResolveGame, 1000);

// --- REST API ENDPOINTS ---

// 1. Live synchronized Game State (Used by all phones)
app.get('/api/game/state', (req: Request, res: Response) => {
  checkAndResolveGame();
  const { periodId, timeLeft, serverTime } = getLivePeriodInfo();
  res.json({
    periodId,
    timeLeft,
    serverTime,
    latestResult: db.history[0] || null,
    adminSettings: {
      ownerUpiId: db.adminSettings.ownerUpiId,
      ownerUpiName: db.adminSettings.ownerUpiName,
      qrCodeUrl: db.adminSettings.qrCodeUrl,
      minDeposit: db.adminSettings.minDeposit,
      minWithdraw: db.adminSettings.minWithdraw,
      marqueeNotice: db.adminSettings.marqueeNotice,
    },
  });
});

// 2. Complete Game History with Pagination
app.get('/api/game/history', (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 20;

  const startIndex = (page - 1) * limit;
  const items = db.history.slice(startIndex, startIndex + limit);

  res.json({
    total: db.history.length,
    page,
    limit,
    totalPages: Math.ceil(db.history.length / limit),
    records: items,
  });
});

// 3. User Bets (Total My History)
app.get('/api/bets/:userId', (req: Request, res: Response) => {
  const userId = req.params.userId;
  const userBets = db.bets.filter((b) => b.userId === userId);
  res.json({ bets: userBets });
});

// 4. Place Bet
app.post('/api/bets', (req: Request, res: Response) => {
  const { userId, target, amount, multiplier } = req.body;
  const { periodId, timeLeft } = getLivePeriodInfo();

  if (timeLeft <= 5) {
    res.status(400).json({ error: 'Betting is locked for current period' });
    return;
  }

  const user = db.users[userId];
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const totalBet = Number(amount) * Number(multiplier);
  if (user.balance < totalBet) {
    res.status(400).json({ error: 'Insufficient wallet balance' });
    return;
  }

  // Deduct balance
  user.balance -= totalBet;
  user.totalBets += 1;

  const newBet: Bet = {
    id: `bet_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    userId,
    periodId,
    timeMode: '1m',
    target,
    amount: Number(amount),
    multiplier: Number(multiplier),
    timestamp: Date.now(),
    status: 'pending',
  };

  db.bets.unshift(newBet);
  saveDb();

  res.json({ success: true, bet: newBet, newBalance: user.balance });
});

// 5. User Profile & Gallery Photo Upload
app.get('/api/user/:userId', (req: Request, res: Response) => {
  const userId = req.params.userId;
  let user = db.users[userId];
  if (!user) {
    user = {
      id: userId,
      uid: String(Math.floor(100000 + Math.random() * 900000)),
      phone: '98765****10',
      balance: 500.0,
      vipLevel: 1,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      invitationCode: 'TG' + Math.floor(10000 + Math.random() * 90000),
      totalWon: 0,
      totalBets: 0,
    };
    db.users[userId] = user;
    saveDb();
  }
  res.json({ user });
});

app.post('/api/user/:userId/avatar', (req: Request, res: Response) => {
  const userId = req.params.userId;
  const { avatar } = req.body;
  if (!avatar) {
    res.status(400).json({ error: 'Missing avatar image data' });
    return;
  }

  const user = db.users[userId];
  if (user) {
    user.avatar = avatar;
    saveDb();
    res.json({ success: true, avatar: user.avatar });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// 6. Deposits
app.get('/api/deposits', (req: Request, res: Response) => {
  res.json({ deposits: db.deposits });
});

app.post('/api/deposits', (req: Request, res: Response) => {
  const { userId, amount, utr, upiIdUsed, screenshotUrl } = req.body;
  const newDep: DepositRequest = {
    id: `dep_${Date.now()}`,
    userId,
    amount: Number(amount),
    utr,
    upiIdUsed: upiIdUsed || db.adminSettings.ownerUpiId,
    timestamp: Date.now(),
    status: 'pending',
    screenshotUrl,
  };
  db.deposits.unshift(newDep);
  saveDb();
  res.json({ success: true, deposit: newDep });
});

app.post('/api/deposits/:id/approve', (req: Request, res: Response) => {
  const id = req.params.id;
  const dep = db.deposits.find((d) => d.id === id);
  if (!dep) {
    res.status(404).json({ error: 'Deposit not found' });
    return;
  }
  if (dep.status === 'approved') {
    res.json({ success: true, deposit: dep });
    return;
  }

  dep.status = 'approved';
  if (db.users[dep.userId]) {
    db.users[dep.userId].balance += dep.amount;
  }
  saveDb();
  res.json({ success: true, deposit: dep, user: db.users[dep.userId] });
});

app.post('/api/deposits/:id/reject', (req: Request, res: Response) => {
  const id = req.params.id;
  const { reason } = req.body;
  const dep = db.deposits.find((d) => d.id === id);
  if (!dep) {
    res.status(404).json({ error: 'Deposit not found' });
    return;
  }

  dep.status = 'rejected';
  dep.rejectionReason = reason || 'Payment not verified';
  saveDb();
  res.json({ success: true, deposit: dep });
});

// 7. Withdrawals
app.get('/api/withdrawals', (req: Request, res: Response) => {
  res.json({ withdrawals: db.withdrawals });
});

app.post('/api/withdrawals', (req: Request, res: Response) => {
  const { userId, amount, upiId, accountHolderName, bankAccountNo, ifsc } = req.body;
  const user = db.users[userId];
  const numAmount = Number(amount);

  if (!user || user.balance < numAmount) {
    res.status(400).json({ error: 'Insufficient balance' });
    return;
  }

  user.balance -= numAmount;

  const newWth: WithdrawRequest = {
    id: `wth_${Date.now()}`,
    userId,
    amount: numAmount,
    upiId,
    accountHolderName,
    bankAccountNo,
    ifsc,
    timestamp: Date.now(),
    status: 'pending',
  };

  db.withdrawals.unshift(newWth);
  saveDb();
  res.json({ success: true, withdrawal: newWth, newBalance: user.balance });
});

app.post('/api/withdrawals/:id/approve', (req: Request, res: Response) => {
  const id = req.params.id;
  const wth = db.withdrawals.find((w) => w.id === id);
  if (!wth) {
    res.status(404).json({ error: 'Withdrawal not found' });
    return;
  }
  wth.status = 'approved';
  saveDb();
  res.json({ success: true, withdrawal: wth });
});

app.post('/api/withdrawals/:id/reject', (req: Request, res: Response) => {
  const id = req.params.id;
  const { reason } = req.body;
  const wth = db.withdrawals.find((w) => w.id === id);
  if (!wth) {
    res.status(404).json({ error: 'Withdrawal not found' });
    return;
  }

  if (wth.status !== 'rejected') {
    wth.status = 'rejected';
    wth.rejectionReason = reason || 'Details verification failed';
    // Refund to user
    if (db.users[wth.userId]) {
      db.users[wth.userId].balance += wth.amount;
    }
    saveDb();
  }
  res.json({ success: true, withdrawal: wth, user: db.users[wth.userId] });
});

// 8. Admin Control Endpoints
app.get('/api/admin/data', (req: Request, res: Response) => {
  const { periodId } = getLivePeriodInfo();
  const currentBets = db.bets.filter((b) => b.periodId === periodId && b.status === 'pending');
  res.json({
    adminSettings: db.adminSettings,
    deposits: db.deposits,
    withdrawals: db.withdrawals,
    activeBets: currentBets,
    users: Object.values(db.users),
  });
});

app.post('/api/admin/rig', (req: Request, res: Response) => {
  const { rigMode, forcedNumber } = req.body;
  if (rigMode) db.adminSettings.rigMode = rigMode;
  if (forcedNumber !== undefined) {
    db.adminSettings.forcedNextResult.number = forcedNumber;
    db.adminSettings.rigMode = forcedNumber !== null ? 'force_result' : 'fair';
  }
  saveDb();
  res.json({ success: true, adminSettings: db.adminSettings });
});

app.post('/api/admin/settings', (req: Request, res: Response) => {
  const { ownerUpiId, ownerUpiName, qrCodeUrl, marqueeNotice, minDeposit, minWithdraw } = req.body;
  if (ownerUpiId) db.adminSettings.ownerUpiId = ownerUpiId;
  if (ownerUpiName) db.adminSettings.ownerUpiName = ownerUpiName;
  if (qrCodeUrl !== undefined) db.adminSettings.qrCodeUrl = qrCodeUrl;
  if (marqueeNotice) db.adminSettings.marqueeNotice = marqueeNotice;
  if (minDeposit) db.adminSettings.minDeposit = Number(minDeposit);
  if (minWithdraw) db.adminSettings.minWithdraw = Number(minWithdraw);
  saveDb();
  res.json({ success: true, adminSettings: db.adminSettings });
});

app.post('/api/admin/user-balance', (req: Request, res: Response) => {
  const { userId, newBalance, vipLevel } = req.body;
  const user = db.users[userId];
  if (user) {
    if (newBalance !== undefined) user.balance = Math.max(0, Number(newBalance));
    if (vipLevel !== undefined) user.vipLevel = Number(vipLevel);
    saveDb();
    res.json({ success: true, user });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Setup Vite or Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TG Gaming Server live and synchronized on port ${PORT}`);
  });
}

startServer();
