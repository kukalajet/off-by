import { fireEvent, render, screen } from '@testing-library/react-native';

import { ListRow } from '@/components/list-row';

describe('ListRow', () => {
  it('link rows fire onPress', async () => {
    const onPress = jest.fn();
    await render(<ListRow type="link" label="Notifications" onPress={onPress} />);
    fireEvent.press(screen.getByText('Notifications'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('toggle rows expose a switch that flips the value', async () => {
    const onValueChange = jest.fn();
    await render(
      <ListRow type="toggle" label="Haptics" value={true} onValueChange={onValueChange} />,
    );
    const toggle = screen.getByRole('switch');
    expect(toggle.props.accessibilityState).toMatchObject({ checked: true });
    fireEvent.press(toggle);
    expect(onValueChange).toHaveBeenCalledWith(false);
  });

  it('renders the subtitle line when given', async () => {
    await render(
      <ListRow
        type="toggle"
        label="Distraction mode"
        subtitle="Visual noise during the run"
        value={false}
        onValueChange={() => {}}
      />,
    );
    expect(screen.getByText('Visual noise during the run')).toBeOnTheScreen();
  });
});
