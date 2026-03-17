import { BigSoundboard } from "@/src/components/soundboard/BigSoundboard";
import DartsGame from "@/src/components/game/DartsGame";
import { Soundboard } from "@/src/components/soundboard/Soundboard";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col items-center justify-center p-4 md:p-8 selection:bg-emerald-500/30">
      <BigSoundboard />
    </main>
  );
}
