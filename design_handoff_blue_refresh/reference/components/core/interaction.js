import React from 'react';

// Hover / press / focus-visible state for inline-styled controls.
export function useInteraction() {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const [focus, setFocus] = React.useState(false);
  const handlers = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => { setHover(false); setPress(false); },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    onFocus: (e) => setFocus(e.target.matches ? e.target.matches(':focus-visible') : false),
    onBlur: () => setFocus(false),
  };
  return { hover, press, focus, handlers };
}

export const focusRing = { outline: '2px solid var(--color-accent)', outlineOffset: '2px' };
