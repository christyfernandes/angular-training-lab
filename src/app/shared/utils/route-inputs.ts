import { numberAttribute } from '@angular/core';

/**
 * Input transforms for values coming from the URL.
 *
 * With withComponentInputBinding(), a query param that is missing from the URL sets the
 * input to `undefined`. These transforms turn that into a safe default.
 */
export const toText = (value: string | undefined): string => value?.trim() ?? '';

export const toPage = (value: string | number | undefined): number => Math.max(1, numberAttribute(value, 1));

export function toOneOf<T extends string>(allowed: readonly T[], fallback: T) {
  return (value: string | undefined): T => (allowed.includes(value as T) ? (value as T) : fallback);
}
