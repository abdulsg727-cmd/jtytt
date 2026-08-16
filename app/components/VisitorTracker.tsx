'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  initVisitorSession,
  updateVisitorPage,
  updateVisitorPresence,
} from '../lib/firebase';

type VisitorTrackerProps = {
  language: string;
};

function pageNameFromPath(pathname: string): string {
  if (!pathname || pathname === '/') return 'home';
  return pathname.replace(/^\//, '').replace(/\//g, ':');
}

export default function VisitorTracker({ language }: VisitorTrackerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialized = useRef(false);
  const lastLocation = useRef('');

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const page = pageNameFromPath(pathname);

    void initVisitorSession(page, language);

    return () => {
      void updateVisitorPresence(false);
    };
    // Initialize once per browser session mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!initialized.current) return;

    const query = searchParams.toString();
    const location = query ? `${pathname}?${query}` : pathname;

    if (lastLocation.current === location) return;
    lastLocation.current = location;

    void updateVisitorPage(pageNameFromPath(pathname), 'browse');
  }, [pathname, searchParams]);

  return null;
}
