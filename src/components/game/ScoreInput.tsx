import React, { useEffect, useRef } from "react";
import { GameMode } from "@/src/types/game";
import { useIsMobile } from "@/src/hooks/use-mobile";

interface ScoreInputProps {
  currentPlayerName: string;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onNumpadClick: (num: string) => void;
  onBackspace: () => void;
  onUndo: () => void;
  canUndo: boolean;
  gameMode: GameMode;
}

export const ScoreInput: React.FC<ScoreInputProps> = ({
  currentPlayerName,
  inputValue,
  onInputChange,
  onSubmit,
  onNumpadClick,
  onBackspace,
  onUndo,
  canUndo,
  gameMode,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isCricket = gameMode === 'cricket';
  const isMobile = useIsMobile();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentPlayerName]);

  useEffect(() => {
    if (isMobile && inputRef.current) {
      inputRef.current.blur();
    }
  }, [isMobile, currentPlayerName]);

  const getPlaceholder = () => {
    if (isCricket) return "20-3";
    return "0";
  };

  const cricketShortcuts = [20, 19, 18, 17, 16, 15, 25];

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 backdrop-blur-sm">
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <div className="text-center space-y-2">
          <div className="text-sm font-bold text-emerald-400 uppercase tracking-widest">
            {currentPlayerName}&apos;s Turn
          </div>
          
          {!isMobile && (
            <div className="relative max-w-xs mx-auto">
              <input
                ref={inputRef}
                type={isCricket ? "text" : "text"}
                value={inputValue}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  if (isCricket) {
                    onInputChange(val);
                  } else {
                    onInputChange(val);
                  }
                }}
                className="w-full bg-zinc-950 border-2 border-zinc-700 rounded-2xl py-4 text-center text-4xl font-black focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all uppercase"
                placeholder={getPlaceholder()}
                autoFocus
              />
              {isCricket && (
                <div className="text-[10px] text-zinc-500 mt-2">
                  Enter target-marks (e.g. 20-3 for T20)
                </div>
              )}
            </div>
          )}
          {isMobile && (
            <div className="max-w-xs mx-auto bg-zinc-950 border-2 border-zinc-700 rounded-2xl py-4 text-center">
              <div className="text-4xl font-black uppercase text-white">
                {inputValue || (isCricket ? "20-3" : "0")}
              </div>
              {isCricket && (
                <div className="text-[10px] text-zinc-500 mt-2">
                  Enter target-marks (e.g. 20-3 for T20)
                </div>
              )}
            </div>
          )}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto w-full">
          {(isCricket ? [20, 19, 18, 17, 16, 15, 25] : [1, 2, 3, 4, 5, 6, 7, 8, 9]).map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => {
                if (isCricket) {
                  onInputChange(num === 25 ? '25-' : `${num}-`);
                } else {
                  onNumpadClick(num.toString());
                }
              }}
              className={`bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 font-bold py-4 rounded-xl transition-colors ${
                isCricket ? 'text-lg' : 'text-xl'
              } ${isCricket && num === 25 ? 'col-span-1' : ''}`}
            >
              {num === 25 ? 'BULL' : num}
            </button>
          ))}
          <button
            type="button"
            onClick={onBackspace}
            className="bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-xl font-bold py-4 rounded-xl transition-colors"
          >
            ⌫
          </button>
          {!isCricket && (
            <button
              type="button"
              onClick={() => onNumpadClick("0")}
              className="bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-xl font-bold py-4 rounded-xl transition-colors"
            >
              0
            </button>
          )}
          {isCricket && (
            <div className="grid grid-cols-3 gap-1 col-span-1">
              {[1, 2, 3].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    const current = inputValue.split('-')[0];
                    if (current) onInputChange(`${current}-${m}`);
                  }}
                  className="bg-emerald-900/40 hover:bg-emerald-800 text-emerald-400 font-bold rounded-lg py-1 border border-emerald-500/30"
                >
                  {m}
                </button>
              ))}
            </div>
          )}
          <button
            type="submit"
            disabled={inputValue === ""}
            className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white text-xl font-bold py-4 rounded-xl transition-colors"
          >
            ↵
          </button>
        </div>

        {/* Undo button */}
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="w-full bg-amber-600 hover:bg-amber-500 active:bg-amber-700 disabled:opacity-30 disabled:hover:bg-amber-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
        >
          ↶ Undo Last Dart
        </button>
      </form>
    </div>
  );
};
