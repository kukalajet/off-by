import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { BackButton } from '@/components/back-button';
import { Card } from '@/components/card';
import { PrimaryButton } from '@/components/primary-button';
import { Screen } from '@/components/screen';
import { useGauntletBest, useGauntletRun } from '@/features/gauntlet/store';

/** Gauntlet — Start (Figma 145:107). */
export default function GauntletStart() {
  const router = useRouter();
  const bestScore = useGauntletBest((s) => s.bestScore);

  return (
    <Screen style={styles.screen}>
      <View style={styles.topRow}>
        <BackButton />
        <Text style={styles.meta}>endless · escalating</Text>
      </View>
      <Text style={styles.title}>Gauntlet</Text>

      <Card style={styles.bestCard}>
        <Text style={styles.cardLabel}>YOUR BEST</Text>
        <Text style={[styles.bestValue, bestScore === 0 && styles.bestValueEmpty]}>
          {bestScore === 0 ? '—' : bestScore}
        </Text>
      </Card>

      <Card style={styles.howCard}>
        <Text style={styles.cardLabel}>HOW IT WORKS</Text>
        <Step n={1} text="Land inside the tolerance window to survive." />
        <Step n={2} text="The window tightens every round." />
        <Step n={3} text="Three lives — the closer you land, the more you score." />
      </Card>

      <View style={styles.spacer} />
      <PrimaryButton
        label="Start run"
        icon="play"
        onPress={() => {
          useGauntletRun.getState().startRun();
          router.push('/gauntlet/run');
        }}
      />
    </Screen>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <View style={styles.step}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepNumber}>{n}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    gap: theme.space[20],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  meta: {
    ...theme.typography.timeLabel,
    color: theme.colors.text.muted,
  },
  title: {
    ...theme.typography.titleScreen,
    color: theme.colors.text.primary,
  },
  bestCard: {
    padding: theme.space[20],
    gap: theme.space[8],
  },
  cardLabel: {
    ...theme.typography.overline,
    color: theme.colors.text.muted,
  },
  bestValue: {
    ...theme.typography.displayValue,
    color: theme.colors.tier.great,
  },
  bestValueEmpty: {
    color: theme.colors.text.muted,
  },
  howCard: {
    padding: theme.space[20],
    gap: theme.space[16],
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[12],
    width: '100%',
  },
  stepBadge: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.stroke.subtle,
  },
  stepNumber: {
    fontFamily: theme.fontFamily.semiBold,
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  stepText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  spacer: {
    flexGrow: 1,
    flexBasis: 0,
  },
}));
