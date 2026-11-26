import { Pipe, PipeTransform } from '@angular/core';

/**
 * Shortens text to `limit` characters without cutting a word in half.
 *
 * Concepts: a pure pipe (the default). Angular only re-runs it when its inputs change,
 * so it is cheap to use in lists.
 *
 * @example {{ product.description | truncate: 90 }}
 */
@Pipe({ name: 'truncate' })
export class TruncatePipe implements PipeTransform {
  transform(value: string | null | undefined, limit = 80, suffix = '…'): string {
    if (!value) return '';
    if (value.length <= limit) return value;
    const cut = value.slice(0, limit);
    const lastSpace = cut.lastIndexOf(' ');
    return `${(lastSpace > limit * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}${suffix}`;
  }
}
