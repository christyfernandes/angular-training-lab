import { isVisible, VisibilityContext } from './visibility';

describe('isVisible', () => {
  const ctx = (overrides: Partial<VisibilityContext> = {}): VisibilityContext => ({
    now: new Date('2026-12-01T10:00:00Z'),
    isAuthenticated: false,
    isFeatureEnabled: () => true,
    ...overrides,
  });

  it('shows sections without rules', () => {
    expect(isVisible(undefined, ctx())).toBe(true);
  });

  it('respects the schedule window', () => {
    expect(isVisible({ from: '2026-12-02T00:00:00Z' }, ctx())).toBe(false);
    expect(isVisible({ until: '2026-11-30T00:00:00Z' }, ctx())).toBe(false);
    expect(isVisible({ from: '2026-11-01T00:00:00Z', until: '2027-01-01T00:00:00Z' }, ctx())).toBe(true);
  });

  it('targets guests or signed-in users', () => {
    expect(isVisible({ audience: 'authenticated' }, ctx())).toBe(false);
    expect(isVisible({ audience: 'guest' }, ctx({ isAuthenticated: true }))).toBe(false);
  });

  it('hides sections behind a disabled feature flag', () => {
    expect(isVisible({ feature: 'campaignPages' }, ctx({ isFeatureEnabled: () => false }))).toBe(false);
  });
});
