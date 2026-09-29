import React from 'react';

// Web: the service's own embeddable player as an iframe.
export function SongPlayer({ embedUrl, height }: { embedUrl: string; height: number }) {
  return (
    <iframe
      src={embedUrl}
      title="Song player"
      loading="lazy"
      style={{ border: 'none', width: '100%', height, display: 'block' }}
      allow="autoplay; encrypted-media; clipboard-write; picture-in-picture; fullscreen"
    />
  );
}
