import { BigSoundboard } from "@/components/BigSoundboard";
import DartsGame from "@/components/DartsGame";
import { Soundboard } from "@/components/Soundboard";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col items-center justify-center p-4 md:p-8 selection:bg-emerald-500/30">
      <BigSoundboard />
    </main>
  );
}
