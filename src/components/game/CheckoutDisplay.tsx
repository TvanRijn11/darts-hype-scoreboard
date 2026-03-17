"use client";

import React from "react";
import { Checkout, formatCheckout, getDifficultyColor } from "@/src/lib/game/checkout";

interface CheckoutDisplayProps {
  checkouts: Checkout[];
}

export const CheckoutDisplay: React.FC<CheckoutDisplayProps> = ({
  checkouts,
}) => {
  if (checkouts.length === 0) return null;

  const bestCheckout = checkouts[0];

  return (
    <div className="mt-4 p-4 bg-zinc-900/80 rounded-xl border border-zinc-700/50">
      <div className="text-xs uppercase tracking-wider text-zinc-400 mb-2">
        Checkout Paths
      </div>
      
      <div className="space-y-2">
        {checkouts.slice(0, 3).map((checkout, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between text-sm ${
              idx === 0 ? "text-emerald-400" : "text-zinc-400"
            }`}
          >
            <span className="font-mono">
              {checkout.throws.map((t) => t.label).join(" + ")}
            </span>
            <span
              className={`text-xs ${getDifficultyColor(checkout.difficulty)}`}
            >
              {checkout.dartCount}-dart
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface MiniCheckoutProps {
  score: number;
}

export const MiniCheckout: React.FC<MiniCheckoutProps> = ({ score }) => {
  if (score <= 0 || score > 170) return null;

  const { getCheckouts, getDifficultyColor } = require("@/src/lib/game/checkout");
  const checkouts = getCheckouts(score);

  if (checkouts.length === 0) return null;

  const best = checkouts[0];

  return (
    <div className="text-xs text-zinc-500 font-mono mt-1">
      <span className="text-zinc-600">Fin: </span>
      <span className={getDifficultyColor(best.difficulty)}>
        {best.throws.map((t: any) => t.label).join(" + ")}
      </span>
    </div>
  );
};
