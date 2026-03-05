import React from "react";
import { GameMode } from "@/types/game";

interface HeaderProps {
  gameMode?: GameMode;
}

export const Header: React.FC<HeaderProps> = ({ gameMode = '501' }) => {
  const getSubTitle = () => {
    switch (gameMode) {
      case '301': return '301 Scoreboard & Soundboard';
      case 'cricket': return 'Cricket Scoreboard & Soundboard';
      default: return '501 Scoreboard & Soundboard';
    }
  };

  return (
    <div className="text-center space-y-2">
      <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 uppercase italic">
        Darts Hype
      </h1>
      <p className="text-zinc-400 font-medium tracking-wide uppercase text-sm">
        {getSubTitle()}
      </p>
    </div>
  );
};
