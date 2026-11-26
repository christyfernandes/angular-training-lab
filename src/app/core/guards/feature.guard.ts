import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { FeatureName } from '../config/app-config.model';
import { AppConfigService } from '../config/app-config.service';

/**
 * Turns whole areas on or off from app-config.json, without a deployment.
 *   { path: 'lab', canMatch: [featureGuard('conceptsLab')], loadChildren: ... }
 * Returning false from canMatch makes the router try the next route – here the '**'
 * not-found route – so a disabled feature behaves as if it does not exist.
 */
export function featureGuard(feature: FeatureName): CanMatchFn {
  return () => inject(AppConfigService).isEnabled(feature);
}
