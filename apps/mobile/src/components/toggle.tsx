import { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

/**
 * Figma `Toggle` (103:6): 48×28 pill track. ON = mint with white knob,
 * OFF = neutral track with muted knob.
 */
export function Toggle({ value, onValueChange }: { value: boolean; onValueChange: (v: boolean) => void }) {
  const knobX = useSharedValue(value ? 20 : 0);

  useEffect(() => {
    knobX.set(withTiming(value ? 20 : 0, { duration: 140 }));
  }, [value, knobX]);

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      hitSlop={8}
      onPress={() => onValueChange(!value)}
      style={[styles.track, value && styles.trackOn]}
    >
      <Animated.View style={[styles.knob, value && styles.knobOn, { transform: [{ translateX: knobX }] }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  track: {
    width: 48,
    height: 28,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.stroke.subtle,
    padding: 3,
  },
  trackOn: {
    backgroundColor: theme.colors.tier.great,
  },
  knob: {
    width: 22,
    height: 22,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.text.muted,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    shadowOpacity: 0.35,
    elevation: 2,
  },
  knobOn: {
    backgroundColor: '#ffffff',
  },
}));
