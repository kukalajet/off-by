import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { ChevronRightIcon } from '@/components/icons';
import { Toggle } from '@/components/toggle';

interface BaseProps {
  label: string;
  subtitle?: string;
  /** Figma reserves `color/danger` for destructive rows (Reset stats). */
  danger?: boolean;
}

type ListRowProps = BaseProps &
  (
    | { type: 'link'; onPress?: () => void }
    | { type: 'toggle'; value: boolean; onValueChange: (v: boolean) => void }
  );

/**
 * Figma `List Row` (107:9): row for settings/list cards. Link shows a
 * disclosure chevron; Toggle hosts the switch. Compose inside a `Card`
 * with `Divider`s between rows.
 */
export function ListRow(props: ListRowProps) {
  const { theme } = useUnistyles();
  const { label, subtitle, danger } = props;

  const text = (
    <View style={styles.text}>
      <Text style={[styles.label, danger && styles.labelDanger]}>{label}</Text>
      {subtitle !== undefined && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );

  if (props.type === 'toggle') {
    return (
      <View style={[styles.row, styles.rowToggle]}>
        {text}
        <Toggle value={props.value} onValueChange={props.onValueChange} />
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      disabled={props.onPress === undefined}
      onPress={props.onPress}
      style={({ pressed }) => [styles.row, pressed && props.onPress !== undefined && styles.pressed]}
    >
      {text}
      <ChevronRightIcon color={theme.colors.text.muted} />
    </Pressable>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[12],
    paddingHorizontal: 18,
    paddingVertical: theme.space[16],
    width: '100%',
  },
  rowToggle: {
    paddingVertical: 14,
  },
  pressed: {
    backgroundColor: theme.colors.bg.base,
  },
  text: {
    flex: 1,
    gap: 3,
  },
  label: {
    fontFamily: theme.fontFamily.semiBold,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  labelDanger: {
    color: theme.colors.danger,
  },
  subtitle: {
    fontFamily: theme.fontFamily.regular,
    fontSize: 13,
    color: theme.colors.text.muted,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: theme.colors.stroke.subtle,
  },
}));
