import { formatSeconds } from '@offby/core';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Share, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Card } from '@/components/card';
import { Glow } from '@/components/glow';
import { PrimaryButton } from '@/components/primary-button';
import { Screen } from '@/components/screen';
import { SecondaryButton } from '@/components/secondary-button';
import { StatRow } from '@/components/stat-row';
import { useGauntletBest, useGauntletRun } from '@/features/gauntlet/store';
import { failureHaptic } from '@/lib/haptics';

/** Gauntlet — End (Figma 149:114): the run's obituary, score as the hero. */
export default function GauntletEnd() {
  const router = useRouter();
  const { theme } = useUnistyles();
  const run = useGauntletRun();
  const bestScore = useGauntletBest((s) => s.bestScore);
  const isNewBest = run.score > 0 && run.score >= bestScore;

  // A death (lives spent) lands harder than a voluntary end.
  useEffect(() => {
    if (run.lives === 0) failureHaptic();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on arrival
  }, []);

  return (
    <Screen style={styles.screen}>
      <Glow
        size={560}
        blur={24}
        color={theme.colors.tier.great}
        opacity={0.1}
        style={styles.glow}
      />
      <View style={styles.spacerTop} />
      <View style={styles.hero}>
        <Text style={styles.overline}>RUN OVER · FINAL SCORE</Text>
        <Text style={styles.score}>{run.score}</Text>
        <Text style={styles.caption}>
          {run.lives === 0 ? 'out of lives — the window won' : 'run ended on your terms'}
        </Text>
      </View>

      <Card style={styles.detailCard}>
        <StatRow label="Your best" value={String(bestScore)} mint={isNewBest} />
        <StatRow label="Rounds cleared" value={String(run.cleared)} />
        <StatRow
          label="Tightest landing"
          value={run.tightestAbsCs === null ? '—' : `±${formatSeconds(run.tightestAbsCs)}`}
          mint={run.tightestAbsCs !== null}
        />
      </Card>

      <View style={styles.spacerBottom} />
      <View style={styles.actions}>
        <PrimaryButton
          label="Play again"
          icon="retry"
          onPress={() => {
            useGauntletRun.getState().startRun();
            router.replace('/gauntlet/run');
          }}
        />
        <View style={styles.secondaryRow}>
          <SecondaryButton
            label="Share"
            icon="share"
            style={styles.secondaryHalf}
            onPress={() =>
              void Share.share({
                message: `I scored ${run.score} in the Off By Gauntlet — ${run.cleared} rounds survived. Think you can outlast me?`,
              })
            }
          />
          <SecondaryButton
            label="Home"
            tone="surface"
            style={styles.secondaryHalf}
            onPress={() => router.navigate('/')}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    alignItems: 'center',
    gap: theme.space[20],
  },
  glow: {
    position: 'absolute',
    alignSelf: 'center',
    top: '4%',
  },
  spacerTop: {
    flexGrow: 2,
    flexBasis: 0,
  },
  spacerBottom: {
    flexGrow: 3,
    flexBasis: 0,
  },
  hero: {
    alignItems: 'center',
    gap: theme.space[12],
  },
  overline: {
    ...theme.typography.overline,
    color: theme.colors.text.muted,
  },
  score: {
    ...theme.typography.displayScore,
    color: theme.colors.tier.great,
  },
  caption: {
    fontFamily: theme.fontFamily.regular,
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  detailCard: {
    paddingHorizontal: 18,
    paddingVertical: theme.space[16],
    gap: theme.space[12],
  },
  actions: {
    gap: theme.space[12],
    width: '100%',
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: theme.space[12],
    width: '100%',
  },
  secondaryHalf: {
    flex: 1,
    width: 'auto',
  },
}));
