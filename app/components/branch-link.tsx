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
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(
          new CustomEvent('tour:choose-branch', { detail: part }),
        );
      }}
    >
      {children}
    </button>
  );
}
