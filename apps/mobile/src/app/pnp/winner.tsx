import { formatSignedDelta } from '@offby/core';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Card } from '@/components/card';
import { Glow } from '@/components/glow';
import { PrimaryButton } from '@/components/primary-button';
import { Screen } from '@/components/screen';
import { SecondaryButton } from '@/components/secondary-button';
import { logPnpCompleted, standings, usePnp } from '@/features/pnp/store';
import { tierHaptic } from '@/lib/haptics';

/** PnP — Winner (Figma 163:129): the reveal the whole game was sealed for. */
export default function PnpWinner() {
  const router = useRouter();
  const { theme } = useUnistyles();
  const players = usePnp((s) => s.players);
  const results = usePnp((s) => s.results);
  const board = standings({ players, results });
  const winner = board[0]?.result ? board[0] : null;

  // Once, on arrival.
  useEffect(() => {
    logPnpCompleted();
    tierHaptic('great'); // the standings land with a thump
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
        <Text style={styles.overline}>RESULTS</Text>
        <Text style={styles.winnerName}>{winner ? winner.name : 'No winner'}</Text>
        <Text style={styles.caption}>
          {winner ? 'closest to the target takes it' : 'nobody locked one in'}
        </Text>
      </View>

      <Card style={styles.standingsCard}>
        <Text style={styles.cardLabel}>STANDINGS</Text>
        {board.map((s, i) => (
          <View key={s.name + String(i)} style={styles.standingRow}>
            <Text style={styles.standingRank}>{s.rank ?? '·'}</Text>
            <Text style={styles.standingName}>{s.name}</Text>
            <Text style={[styles.standingValue, i === 0 && s.result && styles.standingValueMint]}>
              {s.result === null
                ? '—'
                : s.result.kind === 'scored'
                  ? formatSignedDelta(s.result.deltaCs)
                  : '30s+'}
            </Text>
          </View>
        ))}
      </Card>

      <View style={styles.spacerBottom} />
      <View style={styles.actions}>
        <PrimaryButton
          label="Play again"
          icon="retry"
          onPress={() => {
            usePnp.getState().rematch();
            router.replace('/pnp/handoff');
          }}
        />
        <SecondaryButton label="Home" tone="surface" onPress={() => router.navigate('/')} />
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
  winnerName: {
    ...theme.typography.displayHero,
    color: theme.colors.tier.great,
  },
  caption: {
    fontFamily: theme.fontFamily.regular,
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  standingsCard: {
    paddingHorizontal: 18,
    paddingVertical: theme.space[16],
    gap: theme.space[12],
  },
  cardLabel: {
    ...theme.typography.overline,
    color: theme.colors.text.muted,
  },
  standingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[12],
    width: '100%',
  },
  standingRank: {
    fontFamily: theme.fontFamily.semiBold,
    fontSize: 14,
    color: theme.colors.text.muted,
    width: 18,
  },
  standingName: {
    fontFamily: theme.fontFamily.semiBold,
    fontSize: 15,
    color: theme.colors.text.primary,
    flex: 1,
  },
  standingValue: {
    fontFamily: theme.fontFamily.semiBold,
    fontSize: 15,
    color: theme.colors.text.secondary,
  },
  standingValueMint: {
    color: theme.colors.tier.great,
  },
  actions: {
    gap: theme.space[12],
    width: '100%',
  },
}));
