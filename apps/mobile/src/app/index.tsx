import { type Centiseconds, generateTarget } from '@offby/core';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { TargetDisplay } from '@/components/target-display';

/**
 * Scaffold placeholder for Home — proves the loop's plumbing end to end
 * (packages/core roll → themed render). Phase 1 replaces this with the real
 * launchpad and the Ready → Run → Reveal surfaces.
 */
export default function Home() {
  const [target, setTarget] = useState<Centiseconds | null>(null);

  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.overline}>YOUR TARGET</Text>
        <TargetDisplay cs={target} />
        <Text style={styles.caption}>
          {target === null ? 'revealed when you start' : 'fresh roll — tap again'}
        </Text>
      </View>
      <Pressable style={styles.start} onPress={() => setTarget(generateTarget())}>
        <Text style={styles.startLabel}>START</Text>
      </Pressable>
      <View style={styles.links}>
        <Link href="/tokens" style={styles.link}>
          tokens gallery
        </Link>
        <Link href="/spike" style={styles.link}>
          timing spike
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.bg.base,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[48],
    paddingHorizontal: theme.space[24],
  },
  hero: {
    alignItems: 'center',
    gap: theme.space[12],
  },
  overline: {
    ...theme.typography.overline,
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
  },
  caption: {
    ...theme.typography.body,
    color: theme.colors.text.muted,
  },
  start: {
    backgroundColor: theme.colors.tier.great,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.space[48],
    paddingVertical: theme.space[16],
  },
  startLabel: {
    ...theme.typography.buttonPrimary,
    color: theme.colors.text.onAccent,
  },
  links: {
    flexDirection: 'row',
    gap: theme.space[24],
  },
  link: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textDecorationLine: 'underline',
  },
}));
