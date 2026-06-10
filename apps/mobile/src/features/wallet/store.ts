import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { zustandStorage } from '@/lib/storage';

/**
 * Soft-currency wallet (PRD §9.2): earn-on-reveal lands here from Phase 1;
 * spending arrives with the Shop in Phase 6.
 */
interface WalletState {
  coins: number;
  earn: (amount: number) => void;
  reset: () => void;
}

export const useWallet = create<WalletState>()(
  persist(
    (set) => ({
      coins: 0,
      earn: (amount) => set((s) => ({ coins: s.coins + amount })),
      reset: () => set({ coins: 0 }),
    }),
    {
      name: 'wallet',
      version: 0,
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
