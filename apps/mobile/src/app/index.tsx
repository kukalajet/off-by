import { useRouter } from 'expo-router';
import type { ComponentType } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Glow } from '@/components/glow';
import { FlameIcon, ModesIcon, SettingsIcon, ShopIcon, StatsIcon } from '@/components/icons';
import { PrimaryButton } from '@/components/primary-button';
import { Screen } from '@/components/screen';
import { StatusPill } from '@/components/status-pill';
import { TargetHero } from '@/components/target-hero';

/**
 * Home / Prompt (Figma 68:2): the launchpad. The hero is a mystery `?.??s` —
 * Home never shows a stale target; the roll happens at Ready (PRD §6). Status
 * pills render static until streak/Daily land (P3/P4); launcher destinations
 * arrive with their phases.
 */
export default function Home() {
  const router = useRouter();
  const { theme } = useUnistyles();

  return (
    <Screen paddingBottom={28}>
      <Glow
        size={380}
        height={300}
        blur={50}
        color={theme.colors.tier.great}
        opacity={0.14}
        style={styles.floorGlow}
      />
      <View style={styles.statusRow}>
        <StreakChip days={5} />
        <StatusPill label="Daily ready" />
      </View>
      <View style={styles.spacerTop} />
      <View style={styles.play}>
        <View style={styles.target}>
          <Text style={styles.overline}>TARGET TIME</Text>
          <TargetHero cs={null} />
          <Text style={styles.caption}>revealed when you start</Text>
        </View>
        <PrimaryButton label="START" icon="play" onPress={() => router.push('/round')} />
      </View>
      <View style={styles.spacerBottom} />
      <View style={styles.launcher}>
        <LauncherItem icon={ModesIcon} label="Modes" />
        <LauncherItem
          icon={StatsIcon}
          label="Stats"
          onLongPress={__DEV__ ? () => router.push('/spike') : undefined}
        />
        <LauncherItem icon={ShopIcon} label="Shop" />
        <LauncherItem
          icon={SettingsIcon}
          label="Settings"
          onLongPress={__DEV__ ? () => router.push('/tokens') : undefined}
        />
      </View>
    </Screen>
  );
}

/** The streak pill is a deliberate one-off in the file, not a `Pill` tone. */
function StreakChip({ days }: { days: number }) {
  const { theme } = useUnistyles();
  return (
    <View style={styles.streak}>
      <FlameIcon color={theme.colors.tier.bullseye} />
      <Text style={styles.streakLabel}>Streak {days}</Text>
    </View>
  );
}

/**
 * "Quiet affordances" (DESIGN §1) — Home-only, never a persistent nav bar.
 * Destinations are later phases; in dev, long-press Stats → /spike and
 * Settings → /tokens.
 */
function LauncherItem({
  icon: Icon,
  label,
  onLongPress,
}: {
  icon: ComponentType<{ size?: number; color: string }>;
  label: string;
  onLongPress?: () => void;
}) {
  const { theme } = useUnistyles();
  return (
    <Pressable style={styles.launcherItem} onLongPress={onLongPress}>
      <Icon color={theme.colors.text.muted} />
      <Text style={styles.launcherLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  floorGlow: {
    position: 'absolute',
    alignSelf: 'center',
    top: '47%',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: theme.space[12],
    paddingRight: 14,
    paddingVertical: theme.space[8],
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.stroke.subtle,
    backgroundColor: theme.colors.bg.surface,
  },
  streakLabel: {
    fontFamily: theme.fontFamily.semiBold,
    fontSize: 13,
    lineHeight: 15.6,
    color: theme.colors.text.primary,
  },
  spacerTop: {
    flexGrow: 10,
    flexBasis: 0,
  },
  spacerBottom: {
    flexGrow: 7,
    flexBasis: 0,
  },
  play: {
    alignItems: 'center',
    gap: 72,
    width: '100%',
  },
  target: {
    alignItems: 'center',
    gap: 10,
  },
  overline: {
    ...theme.typography.overline,
    color: theme.colors.text.secondary,
  },
  caption: {
    fontFamily: theme.fontFamily.medium,
    fontSize: 15,
    lineHeight: 19.5,
    color: theme.colors.text.secondary,
  },
  launcher: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.space[8],
  },
  launcherItem: {
    alignItems: 'center',
    gap: 7,
    paddingVertical: theme.space[4],
  },
  launcherLabel: {
    fontFamily: theme.fontFamily.medium,
    fontSize: 11,
    lineHeight: 13.2,
    color: theme.colors.text.muted,
  },
}));
