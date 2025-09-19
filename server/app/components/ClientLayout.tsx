"use client";
import React from 'react';
import { AppHeader } from './AppHeader';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}