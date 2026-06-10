import { Alert, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Card } from '@/components/card';
import { Divider, ListRow } from '@/components/list-row';
import { Screen } from '@/components/screen';
import { UtilityHeader } from '@/components/utility-header';
import { useSettings } from '@/features/settings/store';
import { useStats } from '@/features/stats/store';

/**
 * Settings (Figma 94:2). Haptics/sound/distraction write the real store
 * (distraction takes gameplay effect when the mode ships); Notifications and
 * Restore are designed stubs until P4/P6. Reset stats sits last —
 * destructive-last ordering — and is the first consumer of `color/danger`.
 */
export default function Settings() {
  const haptics = useSettings((s) => s.haptics);
  const sound = useSettings((s) => s.sound);
  const distraction = useSettings((s) => s.distraction);

  const confirmReset = () => {
    Alert.alert(
      'Reset stats?',
      'Best, bias, and round counts on this device will be cleared. This can’t be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => useStats.getState().reset() },
      ],
    );
  };

  return (
    <Screen style={styles.screen}>
      <UtilityHeader title="Settings" subtitle="Tune the feel." />

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <Card>
          <ListRow
            type="toggle"
            label="Haptics"
            value={haptics}
            onValueChange={useSettings.getState().setHaptics}
          />
          <Divider />
          <ListRow
            type="toggle"
            label="Sound"
            value={sound}
            onValueChange={useSettings.getState().setSound}
          />
          <Divider />
          <ListRow
            type="toggle"
            label="Distraction mode"
            subtitle="Visual noise during the run"
            value={distraction}
            onValueChange={useSettings.getState().setDistraction}
          />
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>MANAGE</Text>
        <Card>
          <ListRow type="link" label="Notifications" />
          <Divider />
          <ListRow type="link" label="Restore purchases" />
          <Divider />
          <ListRow type="link" label="Reset stats" danger onPress={confirmReset} />
        </Card>
      </View>

      <View style={styles.spacer} />
      <Text style={styles.footer}>Off By · v0.1</Text>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    gap: theme.space[20],
  },
  section: {
    gap: 10,
    width: '100%',
  },
  sectionLabel: {
    ...theme.typography.overline,
    color: theme.colors.text.muted,
  },
  spacer: {
    flexGrow: 1,
    flexBasis: 0,
  },
  footer: {
    fontFamily: theme.fontFamily.regular,
    fontSize: 12,
    color: theme.colors.text.muted,
  },
}));
