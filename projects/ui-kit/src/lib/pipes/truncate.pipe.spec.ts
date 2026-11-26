import { TruncatePipe } from './truncate.pipe';

// Pure pipes are plain classes: test them without TestBed.
describe('TruncatePipe', () => {
  const pipe = new TruncatePipe();

  it('returns short text unchanged', () => {
    expect(pipe.transform('Angular', 20)).toBe('Angular');
  });

  it('cuts at a word boundary and adds an ellipsis', () => {
    expect(pipe.transform('Signals make Angular simpler to learn', 18)).toBe('Signals make…');
  });

  it('handles null and undefined', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });
});
