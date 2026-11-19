import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateProgressPercent,
  calculateSeekTime,
  formatTime,
  getNextTrackIndex,
  getPreviousTrackIndex,
} from './playerLogic';

test('formatTime formats seconds cleanly into MM:SS', () => {
  assert.equal(formatTime(0), '00:00');
  assert.equal(formatTime(39), '00:39');
  assert.equal(formatTime(143), '02:23');
  assert.equal(formatTime(195), '03:15');
  assert.equal(formatTime(225.9), '03:45');
  assert.equal(formatTime(-5), '00:00');
  assert.equal(formatTime(Number.NaN), '00:00');
  assert.equal(formatTime(Number.POSITIVE_INFINITY), '00:00');
});

test('calculateProgressPercent clamps between 0 and 100', () => {
  assert.equal(calculateProgressPercent(0, 195), 0);
  assert.equal(calculateProgressPercent(97.5, 195), 50);
  assert.equal(calculateProgressPercent(195, 195), 100);
  assert.equal(calculateProgressPercent(250, 195), 100);
  assert.equal(calculateProgressPercent(-10, 195), 0);
  assert.equal(calculateProgressPercent(10, 0), 0);
  assert.equal(calculateProgressPercent(10, Number.NaN), 0);
});

test('calculateSeekTime maps fraction to valid duration time', () => {
  assert.equal(calculateSeekTime(0, 200), 0);
  assert.equal(calculateSeekTime(0.5, 200), 100);
  assert.equal(calculateSeekTime(1, 200), 200);
  assert.equal(calculateSeekTime(1.5, 200), 200);
  assert.equal(calculateSeekTime(-0.2, 200), 0);
  assert.equal(calculateSeekTime(0.5, 0), 0);
});

test('getNextTrackIndex and getPreviousTrackIndex wrap around playlist bounds', () => {
  assert.equal(getNextTrackIndex(0, 2), 1);
  assert.equal(getNextTrackIndex(1, 2), 0);
  assert.equal(getPreviousTrackIndex(0, 2), 1);
  assert.equal(getPreviousTrackIndex(1, 2), 0);
  assert.equal(getNextTrackIndex(0, 1), 0);
  assert.equal(getPreviousTrackIndex(0, 1), 0);
});
