/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';

interface UpiQrCodeProps {
  upiId: string;
  name: string;
  amount?: number;
  customQrUrl?: string;
  size?: number;
}

export const UpiQrCode: React.FC<UpiQrCodeProps> = ({
  upiId,
  name,
  amount = 500,
  customQrUrl,
  size = 230,
}) => {
  // Direct UPI Intent URIs
  const phonepeUri = `phonepe://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${encodeURIComponent('TG Gaming Deposit')}`;
  const universalUpiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${encodeURIComponent('TG Gaming Deposit')}`;
  const gpayUri = `tez://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${encodeURIComponent('TG Gaming Deposit')}`;
  const paytmUri = `paytmmp://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${encodeURIComponent('TG Gaming Deposit')}`;

  const qrImageUrl = customQrUrl && customQrUrl.trim().length > 0
    ? customQrUrl
    : '/assets/aistudio/Screenshot_20261031-165524_02660bea_02660bea.png';

  const handlePayViaPhonePe = () => {
    try {
      window.location.href = phonepeUri;
      setTimeout(() => {
        window.location.href = universalUpiUri;
      }, 500);
    } catch {
      window.location.href = universalUpiUri;
    }
  };

  const handlePayViaUniversal = (uri: string) => {
    try {
      window.location.href = uri;
      setTimeout(() => {
        window.location.href = universalUpiUri;
      }, 500);
    } catch {
      window.location.href = universalUpiUri;
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Official QR Container */}
      <div className="relative p-3 bg-white rounded-3xl shadow-2xl border-4 border-[#5f259f]/80 flex flex-col items-center">
        {/* PhonePe Header inside QR Frame */}
        <div className="w-full flex items-center justify-between px-2 pb-2 mb-1 border-b border-gray-100">
          <div className="flex items-center gap-1.5">
            {/* PhonePe Logo Badge */}
            <div className="w-6 h-6 rounded-full bg-[#5f259f] flex items-center justify-center text-white font-black text-xs shadow">
              पे
            </div>
            <span className="font-extrabold text-xs text-[#5f259f] tracking-tight">
              PhonePe
            </span>
          </div>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">
            Accepted Here
          </span>
        </div>

        {/* QR Code Image */}
        <div
          className="overflow-hidden rounded-2xl flex items-center justify-center bg-black p-1 shadow-inner"
          style={{ width: size, height: size }}
        >
          <img
            src={qrImageUrl}
            alt="Official PhonePe QR Code"
            className="w-full h-full object-contain rounded-xl"
            onError={(e) => {
              // Fallback to dynamic qr server if local path fails
              (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=8&data=${encodeURIComponent(universalUpiUri)}`;
            }}
          />
        </div>

        {/* Scan & Pay Tag */}
        <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-[#5f259f]">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Scan with PhonePe or Any UPI App</span>
        </div>
      </div>

      {/* Auto Payment / Direct Pay Action Buttons */}
      <div className="w-full mt-4 space-y-2">
        {/* Primary PhonePe Auto Pay Button */}
        <button
          type="button"
          onClick={handlePayViaPhonePe}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#5f259f] via-[#6739b7] to-[#7b1fa2] hover:brightness-110 active:scale-95 text-white font-black text-sm uppercase tracking-wide shadow-xl shadow-purple-950/40 flex items-center justify-center gap-2 border border-purple-400/30 transition-all cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full bg-white text-[#5f259f] font-black text-xs flex items-center justify-center shadow">
            पे
          </div>
          <span>Pay ₹{amount.toLocaleString('en-IN')} via PhonePe (ऑटो पेमेंट)</span>
          <ExternalLink className="w-4 h-4 ml-1" />
        </button>

        {/* Other UPI Apps Intent Grid */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handlePayViaUniversal(gpayUri)}
            className="py-2 px-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-1 active:scale-95"
          >
            <span className="text-emerald-400 font-extrabold">GPay</span>
          </button>
          <button
            type="button"
            onClick={() => handlePayViaUniversal(paytmUri)}
            className="py-2 px-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-1 active:scale-95"
          >
            <span className="text-sky-400 font-extrabold">Paytm</span>
          </button>
          <button
            type="button"
            onClick={() => handlePayViaUniversal(universalUpiUri)}
            className="py-2 px-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-1 active:scale-95"
          >
            <span className="text-amber-400 font-extrabold">Other UPI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
