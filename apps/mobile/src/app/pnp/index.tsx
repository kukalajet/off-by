import { formatSeconds, generateTarget, systemRng } from '@offby/core';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { BackButton } from '@/components/back-button';
import { Card } from '@/components/card';
import { PrimaryButton } from '@/components/primary-button';
import { Screen } from '@/components/screen';
import { usePnp } from '@/features/pnp/store';

/**
 * PnP — Setup (Figma 154:118): player count, names, and the shared target —
 * rolled here, in the open, because everyone aims for the same number.
 */
export default function PnpSetup() {
  const router = useRouter();
  const { theme } = useUnistyles();
  const [count, setCount] = useState(3);
  const [names, setNames] = useState<string[]>(['', '', '', '']);
  const [focused, setFocused] = useState<number | null>(null);
  // One roll per setup visit — Start game carries it into the match.
  const [targetCs] = useState(() => generateTarget(systemRng));

  const startGame = () => {
    const players = Array.from(
      { length: count },
      (_, i) => names[i]?.trim() || `Player ${i + 1}`,
    );
    usePnp.getState().setup(players);
    usePnp.setState({ targetCs }); // keep the roll the setup screen promised
    router.push('/pnp/handoff');
  };

  return (
    <Screen style={styles.screen}>
      <View style={styles.topRow}>
        <BackButton />
        <Text style={styles.meta}>Local · offline</Text>
      </View>
      <View style={styles.header}>
        <Text style={styles.title}>Pass & Play</Text>
        <Text style={styles.subtitle}>Take turns on one phone. Closest to the target wins.</Text>
      </View>

      <Text style={styles.sectionLabel}>PLAYERS</Text>
      <View style={styles.segmented}>
        {[2, 3, 4].map((n) => (
          <Pressable
            key={n}
            accessibilityRole="button"
            accessibilityState={{ selected: count === n }}
            style={[styles.segment, count === n && styles.segmentActive]}
            onPress={() => setCount(n)}
          >
            <Text style={[styles.segmentLabel, count === n && styles.segmentLabelActive]}>
              {n}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionLabel}>NAMES</Text>
      <View style={styles.names}>
        {Array.from({ length: count }, (_, i) => (
          <TextInput
            key={i}
            style={[styles.input, focused === i && styles.inputFocused]}
            value={names[i]}
            onChangeText={(t) => {
              const next = [...names];
              next[i] = t;
              setNames(next);
            }}
            onFocus={() => setFocused(i)}
            onBlur={() => setFocused(null)}
            placeholder={`Player ${i + 1}`}
            placeholderTextColor={theme.colors.text.muted}
            maxLength={16}
            returnKeyType="done"
          />
        ))}
      </View>

      <Card style={styles.targetCard}>
        <Text style={styles.sectionLabel}>EVERYONE AIMS FOR</Text>
        <Text style={styles.targetValue}>{formatSeconds(targetCs)}</Text>
      </Card>

      <View style={styles.spacer} />
      <PrimaryButton label="Start game" icon="play" onPress={startGame} />
      <Text style={styles.footer}>You’ll pass the phone when prompted.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    gap: 18,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  meta: {
    fontFamily: theme.fontFamily.regular,
    fontSize: 13,
    color: theme.colors.text.muted,
  },
  header: {
    gap: 7,
    width: '100%',
  },
  title: {
    ...theme.typography.titleScreen,
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontFamily: theme.fontFamily.regular,
    fontSize: 15,
    lineHeight: 19.5,
    color: theme.colors.text.secondary,
  },
  sectionLabel: {
    ...theme.typography.overline,
    color: theme.colors.text.muted,
  },
  segmented: {
    flexDirection: 'row',
    gap: theme.space[4],
    padding: theme.space[4],
    width: '100%',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.stroke.subtle,
    backgroundColor: theme.colors.bg.surface,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 12,
  },
  segmentActive: {
    backgroundColor: theme.colors.stroke.subtle,
  },
  segmentLabel: {
    fontFamily: theme.fontFamily.semiBold,
    fontSize: 15,
    color: theme.colors.text.muted,
  },
  segmentLabelActive: {
    color: theme.colors.text.primary,
  },
  names: {
    gap: 10,
    width: '100%',
  },
  input: {
    width: '100%',
    paddingHorizontal: theme.space[16],
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.stroke.subtle,
    backgroundColor: theme.colors.bg.surface,
    fontFamily: theme.fontFamily.semiBold,
    fontSize: 15,
    color: theme.colors.text.primary,
  },
  inputFocused: {
    borderColor: theme.colors.tier.great,
  },
  targetCard: {
    paddingHorizontal: 18,
    paddingVertical: theme.space[16],
    gap: 7,
  },
  targetValue: {
    fontFamily: theme.fontFamily.extraBold,
    fontSize: 40,
    lineHeight: 40,
    letterSpacing: -0.8,
    color: theme.colors.text.primary,
  },
  spacer: {
    flexGrow: 1,
    flexBasis: 0,
  },
  footer: {
    fontFamily: theme.fontFamily.regular,
    fontSize: 12,
    color: theme.colors.text.muted,
    textAlign: 'center',
    width: '100%',
  },
}));
