import React from "react";

interface CommentaryButtonProps {
  enabled: boolean;
  onToggle: () => void;
}

export const CommentaryButton: React.FC<CommentaryButtonProps> = ({
  enabled,
  onToggle,
}) => {
  return (
    <div className="flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={onToggle}
        className={`px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-widest transition ${
          enabled
            ? "bg-emerald-500 text-black border-emerald-400"
            : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:bg-zinc-800"
        }`}
      >
        Commentary {enabled ? "On" : "Off"}
      </button>
    </div>
  );
};
