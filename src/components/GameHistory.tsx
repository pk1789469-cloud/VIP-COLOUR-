/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PeriodResult, Bet } from '../types/game';
import { sound } from '../utils/audio';
import { Award, TrendingUp, History, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

interface GameHistoryProps {
  history: PeriodResult[];
  userBets: Bet[];
  language: 'hi' | 'en';
}

export const GameHistory: React.FC<GameHistoryProps> = ({
  history,
  userBets,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'record' | 'trend' | 'mybets'>('record');
  const [page, setPage] = useState<number>(1);
  const pageSize = 15;

  // Filter for my bets
  const [betFilter, setBetFilter] = useState<'all' | 'won' | 'lost' | 'pending'>('all');
  const [betPage, setBetPage] = useState<number>(1);
  const betPageSize = 10;

  const totalPages = Math.max(1, Math.ceil(history.length / pageSize));
  const paginatedHistory = history.slice((page - 1) * pageSize, page * pageSize);

  const filteredBets = userBets.filter((b) => {
    if (betFilter === 'all') return true;
    return b.status === betFilter;
  });
  const totalBetPages = Math.max(1, Math.ceil(filteredBets.length / betPageSize));
  const paginatedBets = filteredBets.slice((betPage - 1) * betPageSize, betPage * betPageSize);

  const renderColorBall = (color: PeriodResult['color']) => {
    if (color === 'green') {
      return <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />;
    }
    if (color === 'red') {
      return <div className="w-3.5 h-3.5 rounded-full bg-rose-600 shadow-sm shadow-rose-600/50" />;
    }
    if (color === 'violet') {
      return <div className="w-3.5 h-3.5 rounded-full bg-purple-600 shadow-sm shadow-purple-600/50" />;
    }
    if (color === 'green-violet') {
      return (
        <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-emerald-500 via-emerald-500 to-purple-600 shadow-sm" />
      );
    }
    return (
      <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-rose-600 via-rose-600 to-purple-600 shadow-sm" />
    );
  };

  const getNumberBg = (num: number, color: PeriodResult['color']) => {
    if (num === 0) return 'bg-gradient-to-tr from-rose-600 to-purple-600 text-white';
    if (num === 5) return 'bg-gradient-to-tr from-emerald-600 to-purple-600 text-white';
    if (color.includes('green')) return 'bg-emerald-600 text-white';
    return 'bg-rose-600 text-white';
  };

  return (
    <div className="bg-[#171926] rounded-2xl border border-white/10 shadow-xl overflow-hidden mt-4">
      {/* Sub Tabs */}
      <div className="flex border-b border-white/10 bg-[#1c2033]">
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('record');
          }}
          className={`flex-1 py-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'record'
              ? 'text-amber-400 border-b-2 border-amber-400 bg-white/5'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'गेम रिकॉर्ड (Total)' : 'Game Records'}</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('trend');
          }}
          className={`flex-1 py-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'trend'
              ? 'text-amber-400 border-b-2 border-amber-400 bg-white/5'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'ट्रेंड चार्ट' : 'Trend Chart'}</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('mybets');
          }}
          className={`flex-1 py-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 relative ${
            activeTab === 'mybets'
              ? 'text-amber-400 border-b-2 border-amber-400 bg-white/5'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'माय हिस्ट्री (Total)' : 'My History'}</span>
          <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-full">
            {userBets.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Complete Game Record with Pagination */}
      {activeTab === 'record' && (
        <div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#20253b] text-gray-400 text-[11px] font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Period</th>
                  <th className="py-2.5 px-3 text-center">Number</th>
                  <th className="py-2.5 px-3 text-center">Big/Small</th>
                  <th className="py-2.5 px-3 text-right">Color</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedHistory.map((item, idx) => (
                  <tr key={`rec_${item.periodId}_${idx}`} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-3 font-mono text-gray-300">
                      {item.periodId}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-black text-xs shadow ${getNumberBg(
                          item.number,
                          item.color
                        )}`}
                      >
                        {item.number}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.size === 'big'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        }`}
                      >
                        {item.size}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {renderColorBall(item.color)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-3 bg-[#161826] border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-gray-400 font-mono text-[11px]">
              {language === 'hi' ? `कुल ${history.length} रिकॉर्ड्स | पेज ${page} of ${totalPages}` : `Total ${history.length} | Page ${page} of ${totalPages}`}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => {
                  sound.playClick();
                  setPage((p) => Math.max(1, p - 1));
                }}
                className="p-1.5 rounded-lg bg-[#24283d] text-gray-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 py-1 bg-[#24283d] rounded-lg font-mono font-bold text-amber-400 text-xs">
                {page}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => {
                  sound.playClick();
                  setPage((p) => Math.min(totalPages, p + 1));
                }}
                className="p-1.5 rounded-lg bg-[#24283d] text-gray-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Trend Chart */}
      {activeTab === 'trend' && (
        <div className="p-3 overflow-x-auto">
          <div className="min-w-[340px]">
            {/* Header numbers 0 to 9 */}
            <div className="grid grid-cols-12 gap-1 text-[11px] font-bold text-gray-400 pb-2 border-b border-white/10 text-center">
              <span className="col-span-2 text-left">Period</span>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <span key={n} className="font-mono">{n}</span>
              ))}
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/5 text-xs">
              {history.slice(0, 20).map((item, idx) => (
                <div key={`trend_${item.periodId}_${idx}`} className="grid grid-cols-12 gap-1 py-1.5 items-center text-center">
                  <span className="col-span-2 text-left font-mono text-[10px] text-gray-400 truncate">
                    {item.periodId.slice(-4)}
                  </span>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
                    const isWinner = item.number === n;
                    return (
                      <div key={n} className="flex items-center justify-center">
                        {isWinner ? (
                          <div
                            className={`w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center shadow-md animate-pulse ${getNumberBg(
                              item.number,
                              item.color
                            )}`}
                          >
                            {n}
                          </div>
                        ) : (
                          <span className="text-gray-600 text-[10px] font-mono">•</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Complete My History with Filters & Pagination */}
      {activeTab === 'mybets' && (
        <div className="p-3 space-y-3">
          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-gray-500 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
            </span>
            {(['all', 'won', 'lost', 'pending'] as const).map((st) => (
              <button
                key={st}
                onClick={() => {
                  sound.playClick();
                  setBetFilter(st);
                  setBetPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold uppercase text-[10px] transition-all ${
                  betFilter === st
                    ? 'bg-amber-400 text-black'
                    : 'bg-[#20253b] text-gray-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {filteredBets.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-xs">
              {language === 'hi' ? 'कोई शर्त रिकॉर्ड नहीं मिला' : 'No bet records found for this filter.'}
            </div>
          ) : (
            <div className="space-y-2">
              {paginatedBets.map((bet, idx) => (
                <div
                  key={`bet_${bet.id}_${idx}`}
                  className="bg-[#20253b] p-3 rounded-xl border border-white/5 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-gray-300 text-[11px] font-bold">
                      Period: {bet.periodId}
                    </span>
                    <div>
                      {bet.status === 'pending' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Pending ⏳
                        </span>
                      )}
                      {bet.status === 'won' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          Won +₹{bet.winAmount?.toFixed(2)}
                        </span>
                      )}
                      {bet.status === 'lost' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          Failed
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-gray-400 text-[11px]">
                    <div>
                      Select: <strong className="text-amber-300 capitalize text-xs">{bet.target}</strong>
                    </div>
                    <div>
                      Amount: <span className="font-mono font-bold text-white">₹{bet.amount * bet.multiplier}</span>
                    </div>
                    <div>
                      {new Date(bet.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bet Pagination */}
          {totalBetPages > 1 && (
            <div className="pt-2 flex items-center justify-between text-xs text-gray-400">
              <span className="text-[11px] font-mono">
                {language === 'hi' ? `कुल ${filteredBets.length} | पेज ${betPage} of ${totalBetPages}` : `Total ${filteredBets.length} | Page ${betPage} of ${totalBetPages}`}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={betPage <= 1}
                  onClick={() => {
                    sound.playClick();
                    setBetPage((p) => Math.max(1, p - 1));
                  }}
                  className="p-1 rounded bg-[#24283d] text-gray-300 hover:text-white disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono font-bold text-amber-400 text-xs px-1">
                  {betPage}
                </span>
                <button
                  type="button"
                  disabled={betPage >= totalBetPages}
                  onClick={() => {
                    sound.playClick();
                    setBetPage((p) => Math.min(totalBetPages, p + 1));
                  }}
                  className="p-1 rounded bg-[#24283d] text-gray-300 hover:text-white disabled:opacity-40"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
