'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';

export function AuthInitializer() {
  useEffect(() => {
    useAuthStore.getState().initializeFromStorage();
  }, []);

  return null;
}