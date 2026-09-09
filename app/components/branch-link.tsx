'use client';

import type { ReactNode } from 'react';

export default function BranchLink({
  part,
  children,
}: {
  part: 'A' | 'B';
  children: ReactNode;
}) {
  return (
    <a
      href={`/?part=${part}#book`}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
          return;
        event.preventDefault();
        const url = new URL(window.location.href);
        url.searchParams.set('part', part);
        url.hash = 'book';
        window.history.replaceState(window.history.state, '', url);
        window.dispatchEvent(
          new CustomEvent('tour:choose-branch', { detail: part }),
        );
      }}
    >
      {children}
    </a>
  );
}
