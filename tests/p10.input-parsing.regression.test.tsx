/**
 * Practice #10 targeted regression tests for risk R-01 (input parsing).
 *
 * Finding: App.tsx used Number.parseInt, which silently truncates decimal or
 * exponent input ("600.5" -> 600, "7e2" -> 7). The browser number field
 * accepts these values, so the user could get a wrong availability decision.
 * These tests drive the real <App /> through the form (same helper as U01-U13).
 * Fixed demo clock: now = 540 (09:00); one existing booking 600-660.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import App from '../src/App';

afterEach(cleanup);

function check(start: string, end: string) {
  render(<App />);
  fireEvent.change(screen.getByLabelText('Start (minutes after midnight)'), { target: { value: start } });
  fireEvent.change(screen.getByLabelText('End (minutes after midnight)'), { target: { value: end } });
  fireEvent.click(screen.getByRole('button', { name: 'Check availability' }));
  return screen.getByRole('status').textContent ?? '';
}

const WHOLE = 'UnavailableStart and end must be whole-number minutes (integers).';

describe('P10 regression R-01: decimal and exponent input is not silently truncated', () => {
  it('P01 end 600.5 overlaps the 600-660 booking, so it must not be reported as available', () => {
    expect(check('599', '600.5')).toBe(WHOLE);
  });

  it('P02 start 660.9 is not a whole minute and must be rejected, not read as 660', () => {
    expect(check('660.9', '720')).toBe(WHOLE);
  });

  it('P03 exponent input 7e2 means 700, not 7', () => {
    expect(check('7e2', '720')).toBe('AvailableRoom B-204 is available for this time.');
  });

  it('P04 plain whole numbers keep the old behaviour (660-720 available)', () => {
    expect(check('660', '720')).toBe('AvailableRoom B-204 is available for this time.');
  });
});
