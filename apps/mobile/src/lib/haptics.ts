import type { Tier } from '@offby/core';
import * as Haptics from 'expo-haptics';

import { useSettings } from '@/features/settings/store';

/** Fire-and-forget so haptic dispatch never blocks the reveal animation. */
function fire(trigger: () => Promise<void>) {
  if (!useSettings.getState().haptics) return;
  void trigger().catch(() => {
    // Haptics are garnish — a device without an engine should fail silently.
  });
}

/**
 * Juice v1 (PRD F-5): feedback intensity maps to accuracy. Miss is silent on
 * purpose — quiet failure keeps the retry inviting (PRD §10).
 */
export function tierHaptic(tier: Tier) {
  switch (tier) {
    case 'bullseye':
      fire(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
      break;
    case 'insane':
      fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));
      break;
    case 'great':
      fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
      break;
    case 'good':
      fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
      break;
    case 'close':
      fire(() => Haptics.selectionAsync());
      break;
    case 'miss':
      break;
  }
}

export function misfireHaptic() {
  fire(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
}
