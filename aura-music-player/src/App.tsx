import { MusicPlayer } from './components/MusicPlayer';
import { songs } from './data/songs';

export default function App() {
  return (
    <main className="player-backdrop flex min-h-dvh w-full items-center justify-center px-4 py-8 sm:px-6">
      <MusicPlayer playlist={songs} />
    </main>
  );
}
