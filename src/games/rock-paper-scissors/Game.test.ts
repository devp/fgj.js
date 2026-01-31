import { describe, it, expect } from 'vitest';
import { getWinner, Move } from './Game';

describe('getWinner', () => {
  describe('returns null for incomplete moves', () => {
    it('returns null when first player has not moved', () => {
      expect(getWinner(null, 'rock')).toBe(null);
    });

    it('returns null when second player has not moved', () => {
      expect(getWinner('rock', null)).toBe(null);
    });

    it('returns null when neither player has moved', () => {
      expect(getWinner(null, null)).toBe(null);
    });
  });

  describe('returns tie for matching moves', () => {
    it.each<Move>(['rock', 'paper', 'scissors'])(
      'returns tie when both players choose %s',
      (move) => {
        expect(getWinner(move, move)).toBe('tie');
      }
    );
  });

  describe('player 0 wins', () => {
    it('rock beats scissors', () => {
      expect(getWinner('rock', 'scissors')).toBe('0');
    });

    it('paper beats rock', () => {
      expect(getWinner('paper', 'rock')).toBe('0');
    });

    it('scissors beats paper', () => {
      expect(getWinner('scissors', 'paper')).toBe('0');
    });
  });

  describe('player 1 wins', () => {
    it('rock beats scissors', () => {
      expect(getWinner('scissors', 'rock')).toBe('1');
    });

    it('paper beats rock', () => {
      expect(getWinner('rock', 'paper')).toBe('1');
    });

    it('scissors beats paper', () => {
      expect(getWinner('paper', 'scissors')).toBe('1');
    });
  });
});
