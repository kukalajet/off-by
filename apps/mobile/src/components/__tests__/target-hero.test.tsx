import { render, screen } from '@testing-library/react-native';

import { TargetHero } from '@/components/target-hero';

describe('TargetHero', () => {
  it('renders the mystery placeholder when no target is rolled', async () => {
    await render(<TargetHero cs={null} />);
    expect(screen.getByText('?.??s')).toBeOnTheScreen();
  });

  it('renders a rolled target to two decimals', async () => {
    await render(<TargetHero cs={730} />);
    expect(screen.getByText('7.30s')).toBeOnTheScreen();
  });

  it('renders the same glyphs in the ghost state (the recede animates opacity, not content)', async () => {
    await render(<TargetHero cs={205} ghost />);
    expect(screen.getByText('2.05s')).toBeOnTheScreen();
  });
});
