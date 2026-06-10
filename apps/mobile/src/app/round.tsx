import { formatSeconds, formatSignedDelta, type StopResult } from '@offby/core';
import { useRouter } from 'expo-router';
import { Share, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { PrimaryButton } from '@/components/primary-button';
import { Screen } from '@/components/screen';
import { SecondaryButton } from '@/components/secondary-button';
import { RoundSurface } from '@/features/round/round-surface';
import { useRound } from '@/features/round/store';
import { logEvent } from '@/lib/analytics';
import { hexAlpha } from '@/theme/color';

/**
 * Classic (Figma 219:180 → 82:2 → 9:2): the default round config — random
 * re-rolled targets, coins + lifetime stats, the full Reveal showpiece.
 */
export default function RoundScreen() {
  const router = useRouter();
  return (
    <RoundSurface
      useStore={useRound}
      renderReveal={({ result, targetCs, coinsEarned }) => (
        <Reveal
          result={result}
          targetCs={targetCs}
          coinsEarned={coinsEarned}
          onMenu={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        />
      )}
    />
  );
}

/** Reveal — Great (Figma 9:2), tinted by the earned tier. The showpiece. */
function Reveal({
  result,
  targetCs,
  coinsEarned,
  onMenu,
}: {
  result: StopResult;
  targetCs: number;
  coinsEarned: number;
  onMenu: () => void;
}) {
  const { theme } = useUnistyles();
  const tier = result.kind === 'scored' ? result.tier : 'miss';
  const tierColor = theme.colors.tier[tier];

  return (
    <Screen>
      <View
        style={[
          styles.tierBadge,
          { backgroundColor: hexAlpha(tierColor, 0.12), borderColor: hexAlpha(tierColor, 0.35) },
        ]}
      >
        <Text style={[styles.tierLabel, { color: tierColor }]}>{tier.toUpperCase()}</Text>
      </View>

      <View style={styles.revealHero}>
        <Text style={styles.overline}>{result.kind === 'scored' ? 'OFF BY' : 'ROUND OVER'}</Text>
        <Text style={styles.delta}>
          {result.kind === 'scored' ? formatSignedDelta(result.deltaCs) : '30s+'}
        </Text>
        <View style={styles.statsCard}>
          <View style={styles.statsCol}>
            <Text style={styles.statsLabel}>YOUR TIME</Text>
            <Text style={styles.statsValuePrimary}>
              {result.kind === 'scored' ? formatSeconds(result.elapsedCs) : '30s+'}
            </Text>
          </View>
          <View style={styles.statsDivider} />
          <View style={styles.statsCol}>
            <Text style={styles.statsLabel}>TARGET</Text>
            <Text style={styles.statsValueSecondary}>{formatSeconds(targetCs)}</Text>
          </View>
        </View>
        <View style={styles.coinsChip}>
          <View style={styles.coinDot} />
          <Text style={styles.coinsValue}>+{coinsEarned}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <PrimaryButton label="Retry" icon="retry" onPress={() => useRound.getState().retry()} />
        {result.kind === 'scored' && (
          <SecondaryButton
            label="Share"
            icon="share"
            onPress={() => {
              logEvent('share_tapped');
              void Share.share({
                message: `Off by ${formatSignedDelta(result.deltaCs)} on a ${formatSeconds(targetCs)} target. Can you get closer?`,
              });
            }}
          />
        )}
        <Text style={styles.menuLink} accessibilityRole="button" onPress={onMenu}>
          Menu
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  tierBadge: {
    alignSelf: 'center',
    paddingHorizontal: theme.space[16],
    paddingVertical: theme.space[8],
    borderRadius: theme.radius.pill,
    borderWidth: 1,
  },
  tierLabel: {
    ...theme.typography.tierLabel,
  },
  revealHero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  overline: {
    ...theme.typography.overline,
    color: theme.colors.text.secondary,
  },
  delta: {
    ...theme.typography.heroDelta,
    color: theme.colors.text.primary,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[20],
    paddingHorizontal: theme.space[24],
    paddingVertical: theme.space[16],
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.stroke.subtle,
    backgroundColor: theme.colors.bg.surface,
  },
  statsCol: {
    alignItems: 'center',
    gap: 6,
  },
  statsLabel: {
    ...theme.typography.timeLabel,
    color: theme.colors.text.muted,
  },
  statsValuePrimary: {
    ...theme.typography.timeValue,
    color: theme.colors.text.primary,
  },
  statsValueSecondary: {
    ...theme.typography.timeValue,
    color: theme.colors.text.secondary,
  },
  statsDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.stroke.subtle,
  },
  coinsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[8],
    paddingHorizontal: theme.space[16],
    paddingVertical: theme.space[8],
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: hexAlpha(theme.colors.coin, 0.35),
    backgroundColor: hexAlpha(theme.colors.coin, 0.12),
  },
  coinDot: {
    width: 14,
    height: 14,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.coin,
  },
  coinsValue: {
    ...theme.typography.coinValue,
    color: theme.colors.coin,
  },
  actions: {
    alignItems: 'center',
    gap: theme.space[12],
  },
  menuLink: {
    ...theme.typography.buttonSecondary,
    color: theme.colors.text.muted,
    paddingHorizontal: theme.space[16],
    paddingVertical: 10,
  },
}));
