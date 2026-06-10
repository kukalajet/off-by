import { formatSeconds, formatSignedDelta, type StopResult } from '@offby/core';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { BiasScale } from '@/components/bias-scale';
import { Card } from '@/components/card';
import { Divider } from '@/components/list-row';
import { PrimaryButton } from '@/components/primary-button';
import { Screen } from '@/components/screen';
import { SecondaryButton } from '@/components/secondary-button';
import { practiceRead } from '@/features/practice/coach';
import { usePractice, usePracticeRound } from '@/features/practice/store';
import { RoundSurface } from '@/features/round/round-surface';

/**
 * Practice (Figma 170:136 → 171:136): the same round surface, unscored, with
 * the quiet anti-Reveal — no glow, no tier, no coins. The feedback is the
 * reward (PRD F-10b).
 */
export default function PracticeScreen() {
  return (
    <RoundSurface
      useStore={usePracticeRound}
      revealGlow={false}
      context={(t) => ({
        label: 'PRACTICE · UNSCORED',
        value: `aim for ${formatSeconds(t)}`,
        subline: 'just reps — nothing is scored',
      })}
      beginOnMount={() => {
        usePractice.getState().clear();
        usePracticeRound.getState().begin();
      }}
      renderReveal={({ result, targetCs }) => <Feedback result={result} targetCs={targetCs} />}
    />
  );
}

/** Practice · Feedback (Figma 171:136). */
function Feedback({ result, targetCs }: { result: StopResult; targetCs: number }) {
  const router = useRouter();
  const deltasCs = usePractice((s) => s.deltasCs);
  const read = practiceRead(deltasCs);

  const scored = result.kind === 'scored';
  const delta = scored ? result.deltaCs : null;

  return (
    <Screen style={styles.screen}>
      <Text style={styles.repLabel}>PRACTICE · REP {Math.max(read.repCount, 1)}</Text>
      <View style={styles.spacerTop} />

      <View style={styles.hero}>
        <Text style={styles.heroLabel}>{scored ? 'OFF BY' : 'ROUND OVER'}</Text>
        <Text style={styles.heroValue}>{delta !== null ? formatSignedDelta(delta) : '30s+'}</Text>
        <Text style={styles.heroRead}>
          {delta === null
            ? `the round caps at 30s — target was ${formatSeconds(targetCs)}`
            : delta === 0
              ? 'dead on. that happens about never'
              : `you stopped ${formatSeconds(Math.abs(delta))} ${delta < 0 ? 'early' : 'late'}`}
        </Text>
      </View>

      <Card style={styles.coachCard}>
        <Text style={styles.coachLabel}>COACH SAYS</Text>
        <Text style={styles.coachLine}>{read.coach}</Text>
      </Card>

      <Card style={styles.statsCard}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>RUNNING BIAS</Text>
          <Text style={styles.statValue}>
            {read.biasCs === null
              ? '—'
              : `${formatSignedDelta(Math.round(read.biasCs))} · ${read.biasCs < 0 ? 'early' : 'late'}`}
          </Text>
        </View>
        <BiasScale mean={read.biasCs} leanAlpha={0.45} />
        <Divider />
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>CONSISTENCY</Text>
          <Text style={styles.statValueMint}>
            {read.spreadCs === null
              ? 'need a few more reps'
              : `±${formatSeconds(Math.round(read.spreadCs))} spread${read.trend ? ` · ${read.trend}` : ''}`}
          </Text>
        </View>
      </Card>

      <View style={styles.spacerBottom} />

      <View style={styles.actions}>
        <PrimaryButton
          label="Go again"
          icon="retry"
          onPress={() => usePracticeRound.getState().retry()}
        />
        <SecondaryButton label="Done" tone="surface" onPress={() => router.navigate('/')} />
        <Text style={styles.caption}>Unscored · no coins — the feedback is the reward.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    alignItems: 'center',
    gap: theme.space[20],
  },
  repLabel: {
    ...theme.typography.overline,
    color: theme.colors.text.muted,
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
    gap: 10,
    width: '100%',
  },
  heroLabel: {
    ...theme.typography.overline,
    color: theme.colors.text.muted,
  },
  heroValue: {
    ...theme.typography.displayHero,
    color: theme.colors.text.primary,
  },
  heroRead: {
    fontFamily: theme.fontFamily.regular,
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  coachCard: {
    paddingHorizontal: 18,
    paddingVertical: theme.space[16],
    gap: 6,
    borderColor: theme.colors.tier.great,
  },
  coachLabel: {
    ...theme.typography.overline,
    color: theme.colors.tier.great,
  },
  coachLine: {
    fontFamily: theme.fontFamily.semiBold,
    fontSize: 15,
    lineHeight: 20.25,
    color: theme.colors.text.primary,
  },
  statsCard: {
    paddingHorizontal: 18,
    paddingVertical: theme.space[16],
    gap: theme.space[12],
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  statLabel: {
    ...theme.typography.timeLabel,
    color: theme.colors.text.muted,
  },
  statValue: {
    fontFamily: theme.fontFamily.semiBold,
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  statValueMint: {
    fontFamily: theme.fontFamily.semiBold,
    fontSize: 14,
    color: theme.colors.tier.great,
  },
  actions: {
    alignItems: 'center',
    gap: theme.space[12],
    width: '100%',
  },
  caption: {
    fontFamily: theme.fontFamily.regular,
    fontSize: 12,
    color: theme.colors.text.muted,
    textAlign: 'center',
  },
}));
