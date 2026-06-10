import { Modal, Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, SlideInDown, useReducedMotion } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { FlameIcon } from '@/components/icons';
import { Divider } from '@/components/list-row';
import { goalProgress, useGoals } from '@/features/goals/store';
import { useStreak } from '@/features/streak/store';

/**
 * Goals & streak sheet (Figma 178:150, F-11/F-11b): a Home panel, not a
 * screen — DESIGN §5's IA call. Streak + freeze status up top, the day's
 * dealt goals with progress bars below.
 */
export function GoalsSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { theme } = useUnistyles();
  const reduceMotion = useReducedMotion();
  const days = useStreak((s) => s.days);
  const freezes = useStreak((s) => s.freezes);
  const goalsState = useGoals();
  const goals = goalProgress(goalsState);

  return (
    <Modal visible={visible} transparent statusBarTranslucent onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(reduceMotion ? 0 : 180)} style={styles.scrim}>
        <Pressable
          style={styles.scrimTap}
          accessibilityRole="button"
          accessibilityLabel="Close goals"
          onPress={onClose}
        />
        <Animated.View
          entering={
            reduceMotion ? FadeIn.duration(0) : SlideInDown.duration(280).springify().damping(18)
          }
          style={styles.sheet}
        >
          <Pressable style={styles.grabber} onPress={onClose} accessibilityRole="button">
            <View style={styles.handle} />
          </Pressable>
          <Text style={styles.title}>Goals & streak</Text>

          <View style={styles.streakBlock}>
            <View style={styles.streakRow}>
              <View style={styles.streakLeft}>
                <FlameIcon color={theme.colors.tier.bullseye} />
                <Text style={styles.streakValue}>
                  {days === 0 ? 'No streak yet' : `${days}-day streak`}
                </Text>
              </View>
              <View style={styles.freezePill}>
                <Text style={styles.freezeLabel}>
                  {freezes} freeze{freezes === 1 ? '' : 's'} left
                </Text>
              </View>
            </View>
            <Text style={styles.streakCopy}>
              One forgiven miss per week — an off-day won’t break it.
            </Text>
          </View>

          <Divider />
          <Text style={styles.goalsLabel}>GOALS</Text>

          {goals.map(({ def, progress, done }) => (
            <View key={def.id} style={styles.goal}>
              <View style={styles.goalRow}>
                <Text style={styles.goalName}>{def.label}</Text>
                <Text style={[styles.goalProgress, done && styles.goalDone]}>
                  {done ? 'Done' : `${progress}/${def.target}`}
                </Text>
              </View>
              <View style={styles.goalTrack}>
                <View
                  style={[styles.goalFill, { width: `${(progress / def.target) * 100}%` }]}
                />
              </View>
            </View>
          ))}

          <Text style={styles.caption}>Goals refresh at midnight.</Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  scrimTap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheet: {
    width: '100%',
    gap: theme.space[16],
    paddingTop: 10,
    paddingBottom: theme.space[32],
    paddingHorizontal: theme.space[24],
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.stroke.subtle,
    backgroundColor: theme.colors.bg.surface,
  },
  grabber: {
    alignItems: 'center',
    paddingTop: theme.space[4],
    paddingBottom: theme.space[8],
    width: '100%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.stroke.subtle,
  },
  title: {
    fontFamily: theme.fontFamily.extraBold,
    fontSize: 20,
    letterSpacing: -0.2,
    color: theme.colors.text.primary,
  },
  streakBlock: {
    gap: theme.space[8],
    width: '100%',
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[8],
  },
  streakValue: {
    fontFamily: theme.fontFamily.extraBold,
    fontSize: 24,
    letterSpacing: -0.24,
    color: theme.colors.tier.great,
  },
  freezePill: {
    paddingHorizontal: theme.space[12],
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.stroke.subtle,
    backgroundColor: theme.colors.bg.base,
  },
  freezeLabel: {
    fontFamily: theme.fontFamily.semiBold,
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  streakCopy: {
    fontFamily: theme.fontFamily.regular,
    fontSize: 13,
    lineHeight: 17.55,
    color: theme.colors.text.secondary,
  },
  goalsLabel: {
    ...theme.typography.overline,
    color: theme.colors.text.muted,
  },
  goal: {
    gap: theme.space[8],
    width: '100%',
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  goalName: {
    fontFamily: theme.fontFamily.semiBold,
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  goalProgress: {
    fontFamily: theme.fontFamily.semiBold,
    fontSize: 13,
    color: theme.colors.text.muted,
  },
  goalDone: {
    color: theme.colors.tier.great,
  },
  goalTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.stroke.subtle,
    overflow: 'hidden',
  },
  goalFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.tier.great,
  },
  caption: {
    fontFamily: theme.fontFamily.regular,
    fontSize: 12,
    color: theme.colors.text.muted,
  },
}));
