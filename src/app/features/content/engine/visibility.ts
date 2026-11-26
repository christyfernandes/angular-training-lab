import { FeatureName } from '../../../core/config/app-config.model';
import { VisibilityRule } from './content.model';

export interface VisibilityContext {
  now: Date;
  isAuthenticated: boolean;
  isFeatureEnabled: (feature: FeatureName) => boolean;
}

/**
 * Pure function: no Angular, no DI, trivial to unit test.
 * Content editors schedule and target sections without a developer.
 */
export function isVisible(rule: VisibilityRule | undefined, ctx: VisibilityContext): boolean {
  if (!rule) return true;
  if (rule.from && ctx.now < new Date(rule.from)) return false;
  if (rule.until && ctx.now >= new Date(rule.until)) return false;
  if (rule.audience === 'guest' && ctx.isAuthenticated) return false;
  if (rule.audience === 'authenticated' && !ctx.isAuthenticated) return false;
  if (rule.feature && !ctx.isFeatureEnabled(rule.feature)) return false;
  return true;
}
