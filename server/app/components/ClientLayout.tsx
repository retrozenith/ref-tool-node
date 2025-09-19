"use client";
import React, { useEffect, useRef } from 'react';
import { AppHeader } from './AppHeader';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const warmedUpRef = useRef(false);

  useEffect(() => {
    const warmup = async () => {
      if (warmedUpRef.current) return;
      if (!navigator.onLine) return; // only warmup when online
      try {
        // Pre-fetch font and all known templates to seed the SW cache
        const templates = ['/reports/referee_template_u9.pdf', '/reports/referee_template_u11.pdf', '/reports/referee_template_u13.pdf', '/reports/referee_template_u15.pdf'];
        const fontUrl = '/fonts/Roboto-Medium.ttf';
        const favicon = '/favicon.ico';
        await Promise.allSettled([
          fetch(fontUrl),
          ...templates.map(t => fetch(t)),
          fetch(favicon),
        ]);
        warmedUpRef.current = true;
      } catch {
        // ignore warmup failures
      }
    };

    warmup();

    const onOnline = () => warmup();
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, []);

  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}