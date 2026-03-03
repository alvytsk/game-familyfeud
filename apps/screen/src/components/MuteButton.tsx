import { useState } from 'react';
import { setMuted, isMuted, ensureResumed } from '../audio/soundEngine.js';

export function MuteButton() {
  const [muted, setMutedState] = useState(isMuted);

  function toggle() {
    ensureResumed();
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  }

  return (
    <button
      onClick={toggle}
      className="fixed bottom-4 right-4 z-50 bg-black/40 hover:bg-black/60 backdrop-blur rounded-full p-3 text-white transition-colors"
      aria-label={muted ? 'Unmute' : 'Mute'}
    >
      {muted ? (
        // Speaker off icon
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        // Speaker on icon
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      )}
    </button>
  );
}
