import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Card } from '@/components/card';
import { ListRow } from '@/components/list-row';
import { Screen } from '@/components/screen';
import { UtilityHeader } from '@/components/utility-header';

/**
 * Modes hub (Figma 116:62): hub-and-spoke per DESIGN §1 — mode cards, never
 * a tab bar. Daily Challenge stays a designed stub until the backend lands
 * in Phase 4.
 */
export default function Modes() {
  const router = useRouter();

  return (
    <Screen style={styles.screen}>
      <UtilityHeader title="Modes" subtitle="Same tap, new stakes." />

      <View style={styles.list}>
        <Card>
          <ListRow
            type="link"
            label="Gauntlet"
            subtitle="Escalating rounds · run for score"
            onPress={() => router.push('/gauntlet')}
          />
        </Card>
        <Card>
          <ListRow
            type="link"
            label="Pass & Play"
            subtitle="Take turns on one phone"
            onPress={() => router.push('/pnp')}
          />
        </Card>
        <Card>
          <ListRow
            type="link"
            label="Practice"
            subtitle="Unscored reps · live coaching"
            onPress={() => router.push('/practice')}
          />
        </Card>
      </View>

      {/* Unbuilt modes live here until their phase ships (Daily = P4). */}
      <View style={styles.teaser}>
        <Text style={styles.teaserLabel}>COMING SOON</Text>
        <Text style={styles.teaserCopy}>Daily Challenge · Blindfold</Text>
      </View>

      <View style={styles.spacer} />
      <Text style={styles.footer}>Classic? That’s the big START on Home.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    gap: theme.space[20],
  },
  list: {
    gap: theme.space[12],
    width: '100%',
  },
  teaser: {
    width: '100%',
    gap: 5,
    paddingHorizontal: 18,
    paddingVertical: theme.space[16],
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.stroke.subtle,
  },
  teaserLabel: {
    ...theme.typography.overline,
    color: theme.colors.text.muted,
  },
  teaserCopy: {
    fontFamily: theme.fontFamily.medium,
    fontSize: 14,
    color: theme.colors.text.secondary,
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
