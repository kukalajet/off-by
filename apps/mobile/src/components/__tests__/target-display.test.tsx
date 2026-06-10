import { render, screen } from '@testing-library/react-native';

import { TargetDisplay } from '../target-display';

describe('TargetDisplay', () => {
  it('renders a rolled target at two decimals', async () => {
    await render(<TargetDisplay cs={730} />);
    expect(screen.getByText('7.30s')).toBeOnTheScreen();
  });

  it('renders the mystery placeholder before a roll', async () => {
    await render(<TargetDisplay cs={null} />);
    expect(screen.getByText('?.??s')).toBeOnTheScreen();
  });
});
