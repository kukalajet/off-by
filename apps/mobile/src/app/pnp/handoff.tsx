import { formatSeconds } from '@offby/core';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Glow } from '@/components/glow';
import { PrimaryButton } from '@/components/primary-button';
import { Screen } from '@/components/screen';
import { usePnp } from '@/features/pnp/store';

/**
 * PnP — Hand-off (Figma 158:125): the pass-the-phone beat. Serves as the
 * next player's Ready framing; the round itself still starts with their own
 * tap on the run surface.
 */
export default function PnpHandoff() {
  const router = useRouter();
  const { theme } = useUnistyles();
  const players = usePnp((s) => s.players);
  const turn = usePnp((s) => s.turn);
  const targetCs = usePnp((s) => s.targetCs);
  const results = usePnp((s) => s.results);

  const name = players[turn] ?? '';

  return (
    <Screen style={styles.screen}>
      <Text style={styles.overline}>
        TURN {Math.min(turn + 1, players.length)} OF {players.length}
      </Text>

      <View style={styles.tracker}>
        {players.map((p, i) => {
          const status = i < turn ? 'done' : i === turn ? 'now' : 'up';
          return (
            <View key={i} style={[styles.cell, status === 'now' && styles.cellActive]}>
              <Text style={[styles.cellName, status === 'now' && styles.cellNameActive]}>
                {p}
              </Text>
              <Text style={[styles.cellStatus, status === 'now' && styles.cellStatusActive]}>
                {status}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.spacerTop} />

      <View style={styles.hero}>
        <Glow
          size={300}
          height={200}
          blur={90}
          color={theme.colors.tier.great}
          opacity={0.1}
          style={styles.heroGlow}
        />
        <Text style={styles.heroLead}>Pass the phone to</Text>
        <Text style={styles.heroName}>{name}</Text>
        <View style={styles.aimPill}>
          <View style={styles.aimDot} />
          <Text style={styles.aimLabel}>AIM FOR</Text>
          <Text style={styles.aimValue}>{formatSeconds(targetCs)}</Text>
        </View>
      </View>

      <View style={styles.spacerBottom} />

      <View style={styles.noPeeking}>
        <Text style={styles.noPeekingTitle}>No peeking</Text>
        <Text style={styles.noPeekingCopy}>
          Previous players’ times stay hidden until the results screen.
        </Text>
      </View>

      <PrimaryButton
        label="Tap when ready"
        icon="play"
        onPress={() => router.replace('/pnp/run')}
      />
      {results.some(Boolean) && (
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => router.replace('/pnp/winner')}
        >
          <Text style={styles.endLink}>End game · see results</Text>
        </Pressable>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    alignItems: 'center',
    gap: theme.space[20],
  },
  overline: {
    ...theme.typography.overline,
    color: theme.colors.text.muted,
  },
  tracker: {
    flexDirection: 'row',
    gap: theme.space[8],
    width: '100%',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.stroke.subtle,
    backgroundColor: theme.colors.bg.surface,
  },
  cellActive: {
    borderColor: theme.colors.tier.great,
  },
  cellName: {
    fontFamily: theme.fontFamily.semiBold,
    fontSize: 14,
    color: theme.colors.text.muted,
  },
  cellNameActive: {
    color: theme.colors.text.primary,
  },
  cellStatus: {
    fontFamily: theme.fontFamily.medium,
    fontSize: 11,
    color: theme.colors.text.muted,
  },
  cellStatusActive: {
    color: theme.colors.tier.great,
  },
  spacerTop: {
    flexGrow: 3,
    flexBasis: 0,
  },
  spacerBottom: {
    flexGrow: 4,
    flexBasis: 0,
  },
  hero: {
    alignItems: 'center',
    gap: 14,
    width: '100%',
  },
  heroGlow: {
    position: 'absolute',
    alignSelf: 'center',
    top: -90,
  },
  heroLead: {
    fontFamily: theme.fontFamily.regular,
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  heroName: {
    ...theme.typography.displayHero,
    color: theme.colors.text.primary,
  },
  aimPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[8],
    paddingHorizontal: 14,
    paddingVertical: theme.space[8],
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.stroke.subtle,
    backgroundColor: theme.colors.bg.surface,
  },
  aimDot: {
    width: 7,
    height: 7,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.tier.great,
  },
  aimLabel: {
    ...theme.typography.timeLabel,
    color: theme.colors.text.muted,
  },
  aimValue: {
    fontFamily: theme.fontFamily.semiBold,
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  noPeeking: {
    width: '100%',
    gap: theme.space[4],
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.stroke.subtle,
    backgroundColor: theme.colors.bg.surface,
  },
  noPeekingTitle: {
    fontFamily: theme.fontFamily.semiBold,
    fontSize: 15,
    color: theme.colors.text.primary,
  },
  noPeekingCopy: {
    fontFamily: theme.fontFamily.regular,
    fontSize: 13,
    lineHeight: 18.2,
    color: theme.colors.text.secondary,
  },
  endLink: {
    fontFamily: theme.fontFamily.semiBold,
    fontSize: 14,
    color: theme.colors.text.muted,
    paddingHorizontal: theme.space[16],
    paddingVertical: 6,
  },
}));
