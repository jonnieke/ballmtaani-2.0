import React from "react";
import { Badge } from "../ui/badge";
import { CheckCircle, ShieldCheck, Printer } from "lucide-react";
import { Button } from "../ui/button";

export interface ReceiptViewProps {
  paymentReference: string;
  providerTransactionId?: string;
  planName: string;
  amount: number;
  currency?: string;
  paymentDate: string;
  startsAt: string;
  expiresAt: string;
  phoneMasked: string;
}

export default function ReceiptView({
  paymentReference,
  providerTransactionId = "M-PESA-TX-99210",
  planName,
  amount,
  currency = "KES",
  paymentDate,
  startsAt,
  expiresAt,
  phoneMasked,
}: ReceiptViewProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#121212] p-6 space-y-6 max-w-md mx-auto text-white">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">BallMtaani Edge</h2>
          <span className="text-xs text-gray-400">Payment Receipt</span>
        </div>
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
          <CheckCircle className="h-3 w-3 mr-1" /> Paid
        </Badge>
      </div>

      <div className="space-y-3 text-xs font-mono">
        <div className="flex justify-between py-1 border-b border-white/5">
          <span className="text-gray-400 font-sans">Payment Reference:</span>
          <span className="text-white font-bold">{paymentReference}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-white/5">
          <span className="text-gray-400 font-sans">M-Pesa Transaction ID:</span>
          <span className="text-emerald-400 font-bold">{providerTransactionId}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-white/5">
          <span className="text-gray-400 font-sans">Purchased Plan:</span>
          <span className="text-white font-bold">{planName}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-white/5">
          <span className="text-gray-400 font-sans">Amount Paid:</span>
          <span className="text-white font-bold">{currency} {amount}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-white/5">
          <span className="text-gray-400 font-sans">M-Pesa Phone:</span>
          <span className="text-gray-300">{phoneMasked}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-white/5">
          <span className="text-gray-400 font-sans">Access Start:</span>
          <span className="text-gray-300">{new Date(startsAt).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-white/5">
          <span className="text-gray-400 font-sans">Access Expiry:</span>
          <span className="text-emerald-400 font-bold">{new Date(expiresAt).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })}</span>
        </div>
      </div>

      <div className="pt-2 text-[10px] text-gray-400 text-center space-y-2 border-t border-white/10">
        <p className="flex items-center justify-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> BallMtaani Edge Statistical Match Intelligence
        </p>
        <Button onClick={() => window.print()} variant="outline" size="sm" className="text-xs text-gray-300 border-white/20">
          <Printer className="mr-1.5 h-3.5 w-3.5" /> Print Receipt
        </Button>
      </div>
    </div>
  );
}
