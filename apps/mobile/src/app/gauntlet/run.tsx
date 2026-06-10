import { formatSeconds, gauntletBandCs, rollGauntletTarget } from '@offby/core';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useGauntletRound, useGauntletRun } from '@/features/gauntlet/store';
import { RoundSurface } from '@/features/round/round-surface';

/**
 * Gauntlet — Round (Figma 148:114): the round surface re-dressed with the
 * HUD strip. Survival chains Ready→Ready inside the machine; the only exits
 * are death and the voluntary "End run" — both land on /gauntlet/end.
 * Per-round constants only in the HUD: no elapsed anything (PRD F-2).
 */
export default function GauntletRunScreen() {
  const router = useRouter();
  const over = useGauntletRun((s) => s.over);
  const round = useGauntletRun((s) => s.round);

  useEffect(() => {
    if (over) router.replace('/gauntlet/end');
  }, [over, router]);

  return (
    <RoundSurface
      useStore={useGauntletRound}
      revealGlow={false}
      context={() => ({
        label: `GAUNTLET · ROUND ${round}`,
        subline: 'land inside the window to survive',
        action: { label: 'End run', onPress: () => useGauntletRun.getState().endRun() },
      })}
      hud={<GauntletHud />}
      beginOnMount={() => useGauntletRound.getState().begin(rollGauntletTarget())}
      renderReveal={() => null}
    />
  );
}

/** The slim HUD strip (148:128): lives · score | target · band. */
function GauntletHud() {
  const lives = useGauntletRun((s) => s.lives);
  const score = useGauntletRun((s) => s.score);
  const round = useGauntletRun((s) => s.round);
  const targetCs = useGauntletRound((s) => s.targetCs);

  return (
    <View style={styles.hud}>
      <View style={styles.hudGroup}>
        <View style={styles.lifeDots}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.lifeDot, i >= lives && styles.lifeDotSpent]} />
          ))}
        </View>
        <Text style={styles.hudValue}>Score {score}</Text>
      </View>
      <Text style={styles.hudValue}>
        Target {formatSeconds(targetCs)} · ±{formatSeconds(gauntletBandCs(round))}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  hud: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: theme.space[12],
  },
  hudGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[12],
  },
  lifeDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lifeDot: {
    width: 7,
    height: 7,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.tier.great,
  },
  lifeDotSpent: {
    backgroundColor: theme.colors.stroke.subtle,
  },
  hudValue: {
    fontFamily: theme.fontFamily.semiBold,
    fontSize: 13,
    color: theme.colors.text.secondary,
  },
}));
