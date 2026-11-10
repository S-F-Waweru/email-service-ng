import { DestroyRef, inject, signal, type Signal } from '@angular/core';

/** A signal that follows a CSS media query, e.g. mediaQuery('(min-width: 1024px)'). Call in an injection context. */
export function mediaQuery(query: string): Signal<boolean> {
  const media = typeof window !== 'undefined' ? window.matchMedia(query) : null;
  const matches = signal(media?.matches ?? false);
  if (media) {
    const listener = (event: MediaQueryListEvent) => matches.set(event.matches);
    media.addEventListener('change', listener);
    inject(DestroyRef).onDestroy(() => media.removeEventListener('change', listener));
  }
  return matches.asReadonly();
}
