"use client";
import React, { useEffect, useState } from 'react';
import { ThemeToggle } from './ThemeToggle';

export function AppHeader() {
  const [online, setOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-3">
      <div className="flex items-center gap-2 bg-card/80 backdrop-blur rounded-md border border-border px-2.5 py-1 shadow-sm whitespace-nowrap">
        <span
          aria-label={online ? 'online' : 'offline'}
          className={`inline-block h-2.5 w-2.5 rounded-full ${online ? 'bg-emerald-500' : 'bg-red-500'}`}
        />
        {/* Compact text for small screens */}
        <div className="text-[11px] text-foreground sm:hidden">
          {online ? 'Online' : 'Offline (local)'}
        </div>
        {/* Full text for >= sm screens */}
        <div className="hidden sm:block text-xs text-foreground">
          {online ? 'Online — funcționalitate completă' : 'Offline — generarea este locală pe dispozitiv'}
        </div>
      </div>
      <ThemeToggle />
    </div>
  );
}