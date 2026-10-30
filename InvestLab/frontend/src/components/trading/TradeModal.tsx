import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { Stock, EnrichedHolding } from '../../types';
import { tradingApi, stocksApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatINR } from '../../utils/formatters';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock?: Stock | null;
  initialType?: 'BUY' | 'SELL';
  onTradeComplete?: () => void;
}

export const TradeModal: React.FC<TradeModalProps> = ({
  isOpen,
  onClose,
  stock: initialStock,
  initialType = 'BUY',
  onTradeComplete,
}) => {
  const { user, updateVirtualCash } = useAuth();
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>(initialType);
  const [allStocks, setAllStocks] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(initialStock || null);
  const [quantity, setQuantity] = useState<number>(1);
  const [userHoldings, setUserHoldings] = useState<EnrichedHolding[]>([]);
  const [loadingHoldings, setLoadingHoldings] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'ORDER' | 'CONFIRM' | 'SUCCESS'>('ORDER');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [tradeResult, setTradeResult] = useState<any>(null);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTradeType(initialType);
      setQuantity(1);
      setStep('ORDER');
      setErrorMsg(null);
      setTradeResult(null);

      // Load all stocks if not loaded
      stocksApi.getAll().then((list) => {
        setAllStocks(list);
        if (initialStock) {
          const fresh = list.find((s) => s.symbol === initialStock.symbol);
          setSelectedStock(fresh || initialStock);
        } else if (list.length > 0) {
          setSelectedStock(list[0]);
        }
      });

      // Load user holdings to verify owned shares for selling
      setLoadingHoldings(true);
      tradingApi
        .getPortfolio()
        .then((p) => {
          setUserHoldings(p.holdings);
        })
        .finally(() => setLoadingHoldings(false));
    }
  }, [isOpen, initialStock, initialType]);

  if (!isOpen) return null;

  const currentHolding = selectedStock
    ? userHoldings.find((h) => h.symbol === selectedStock.symbol)
    : null;
  const ownedQuantity = currentHolding ? currentHolding.quantity : 0;

  const executionPrice = selectedStock?.price || 0;
  const orderTotal = Number((executionPrice * quantity).toFixed(2));
  const availableCash = user?.virtualCash || 0;

  // Validation
  const hasEnoughCash = tradeType === 'BUY' ? availableCash >= orderTotal : true;
  const hasEnoughShares = tradeType === 'SELL' ? ownedQuantity >= quantity : true;
  const isValidQuantity = quantity > 0 && Number.isInteger(quantity);

  const handleProceedToConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isValidQuantity) {
      setErrorMsg('Please enter a valid positive integer quantity.');
      return;
    }
    if (tradeType === 'BUY' && !hasEnoughCash) {
      setErrorMsg(
        `Insufficient virtual cash. Needed: ${formatINR(orderTotal)}, Available: ${formatINR(availableCash)}`
      );
      return;
    }
    if (tradeType === 'SELL' && !hasEnoughShares) {
      setErrorMsg(`You only own ${ownedQuantity} shares of ${selectedStock?.symbol}.`);
      return;
    }

    setStep('CONFIRM');
  };

  const handleExecuteTrade = async () => {
    if (!selectedStock) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      let res;
      if (tradeType === 'BUY') {
        res = await tradingApi.buy(selectedStock.symbol, quantity);
      } else {
        res = await tradingApi.sell(selectedStock.symbol, quantity);
      }

      setTradeResult(res);
      if (res.data?.remainingCash !== undefined) {
        updateVirtualCash(res.data.remainingCash);
      }
      setStep('SUCCESS');
      if (onTradeComplete) {
        onTradeComplete();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message || 'Trade execution failed');
      setStep('ORDER');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] max-w-md w-full overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Simulated Paper Trade
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#172B4D] mt-1">
              {step === 'SUCCESS' ? 'Order Filled' : `${tradeType === 'BUY' ? 'Buy' : 'Sell'} Shares`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#64748B] hover:text-[#172B4D] hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 'ORDER' && (
            <form onSubmit={handleProceedToConfirm} className="space-y-4">
              {/* Buy / Sell Tabs */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setTradeType('BUY');
                    setErrorMsg(null);
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    tradeType === 'BUY'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-[#64748B] hover:text-[#172B4D]'
                  }`}
                >
                  BUY (Long)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTradeType('SELL');
                    setErrorMsg(null);
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    tradeType === 'SELL'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-[#64748B] hover:text-[#172B4D]'
                  }`}
                >
                  SELL
                </button>
              </div>

              {/* Stock Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#172B4D] mb-1.5">
                  Select Stock
                </label>
                <select
                  value={selectedStock?.symbol || ''}
                  onChange={(e) => {
                    const st = allStocks.find((s) => s.symbol === e.target.value);
                    if (st) setSelectedStock(st);
                  }}
                  className="w-full bg-[#F7F9FC] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                >
                  {allStocks.map((s) => (
                    <option key={s.symbol} value={s.symbol}>
                      {s.name} ({s.symbol}) — {formatINR(s.price)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price & Holding Snapshot */}
              <div className="bg-slate-50 border border-[#E2E8F0] rounded-xl p-3 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#64748B] block">Execution Quote</span>
                  <span className="font-bold text-[#172B4D] text-sm">
                    {formatINR(executionPrice)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[#64748B] block">
                    {tradeType === 'BUY' ? 'Available Cash' : 'Shares Owned'}
                  </span>
                  <span className="font-bold text-[#172B4D] text-sm">
                    {tradeType === 'BUY' ? formatINR(availableCash) : `${ownedQuantity} Shares`}
                  </span>
                </div>
              </div>

              {/* Quantity Input */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-[#172B4D]">Quantity</label>
                  {tradeType === 'SELL' && ownedQuantity > 0 && (
                    <button
                      type="button"
                      onClick={() => setQuantity(ownedQuantity)}
                      className="text-[11px] font-bold text-blue-600 hover:underline"
                    >
                      Sell Max ({ownedQuantity})
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={tradeType === 'SELL' ? ownedQuantity : undefined}
                    value={quantity || ''}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full bg-[#F7F9FC] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#64748B] font-medium">
                    Shares
                  </span>
                </div>
              </div>

              {/* Order Estimation Box */}
              <div className="pt-2 border-t border-[#E2E8F0] space-y-1.5 text-xs">
                <div className="flex justify-between text-[#64748B]">
                  <span>Estimated Total</span>
                  <span className="font-bold text-[#172B4D] text-base">{formatINR(orderTotal)}</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Est. Cash Remaining</span>
                  <span className="font-semibold text-[#172B4D]">
                    {tradeType === 'BUY'
                      ? formatINR(availableCash - orderTotal)
                      : formatINR(availableCash + orderTotal)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={tradeType === 'BUY' ? !hasEnoughCash : !hasEnoughShares}
                className={`w-full py-3 rounded-xl font-bold text-sm text-white shadow-sm transition-all ${
                  tradeType === 'BUY'
                    ? hasEnoughCash
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-slate-300 cursor-not-allowed'
                    : hasEnoughShares && ownedQuantity > 0
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                Review {tradeType} Order
              </button>
            </form>
          )}

          {step === 'CONFIRM' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-800">
                <ShieldCheck className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p>
                  <strong>Paper Trading Confirmation:</strong> This is a simulated transaction.
                  No real money or stock-market order will be placed.
                </p>
              </div>

              <div className="border border-[#E2E8F0] rounded-xl p-4 divide-y divide-slate-100 text-xs">
                <div className="pb-2 flex justify-between">
                  <span className="text-[#64748B]">Order Action</span>
                  <span
                    className={`font-bold uppercase ${
                      tradeType === 'BUY' ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {tradeType}
                  </span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-[#64748B]">Company</span>
                  <span className="font-bold text-[#172B4D]">{selectedStock?.name}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-[#64748B]">Symbol</span>
                  <span className="font-bold text-[#172B4D]">{selectedStock?.symbol}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-[#64748B]">Quantity</span>
                  <span className="font-bold text-[#172B4D]">{quantity} Shares</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-[#64748B]">Execution Price</span>
                  <span className="font-bold text-[#172B4D]">{formatINR(executionPrice)}</span>
                </div>
                <div className="pt-2 flex justify-between text-sm">
                  <span className="font-bold text-[#172B4D]">Total Transaction Amount</span>
                  <span className="font-bold text-blue-600">{formatINR(orderTotal)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('ORDER')}
                  className="flex-1 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#64748B] hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleExecuteTrade}
                  disabled={isSubmitting}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all ${
                    tradeType === 'BUY'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isSubmitting ? 'Executing...' : `Confirm & Execute`}
                </button>
              </div>
            </div>
          )}

          {step === 'SUCCESS' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-base font-bold text-[#172B4D]">
                  {tradeResult?.message || 'Order Executed Successfully!'}
                </h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Virtual Cash Remaining:{' '}
                  <strong className="text-[#172B4D]">
                    {formatINR(tradeResult?.data?.remainingCash)}
                  </strong>
                </p>
              </div>

              <div className="bg-slate-50 border border-[#E2E8F0] rounded-xl p-3 text-left text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Transaction ID</span>
                  <span className="font-mono text-[11px] text-[#172B4D]">
                    {tradeResult?.data?.trade?.id?.slice(0, 12)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Position Quantity</span>
                  <span className="font-bold text-[#172B4D]">
                    {tradeResult?.data?.holding?.quantity ?? quantity} Shares
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-all"
              >
                Close & Return
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
