import type { MouseEvent } from 'react';

export function returnToWebsite(event: MouseEvent<HTMLAnchorElement>) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (new URLSearchParams(window.location.search).get('return') === 'web' && window.parent !== window) {
    event.preventDefault();
    window.parent.postMessage({type:'roleplay-return-home'}, window.location.origin);
  }
}
