import { Game } from 'boardgame.io';

export type Move = 'rock' | 'paper' | 'scissors' | null;

export interface RPSState {
  moves: { '0': Move; '1': Move };
  scores: { '0': number; '1': number };
  round: number;
  lastResult: string | null;
}

function getWinner(move0: Move, move1: Move): '0' | '1' | 'tie' | null {
  if (!move0 || !move1) return null;
  if (move0 === move1) return 'tie';
  if (
    (move0 === 'rock' && move1 === 'scissors') ||
    (move0 === 'paper' && move1 === 'rock') ||
    (move0 === 'scissors' && move1 === 'paper')
  ) {
    return '0';
  }
  return '1';
}

export const RPS: Game<RPSState> = {
  name: 'rock-paper-scissors',

  setup: () => ({
    moves: { '0': null, '1': null },
    scores: { '0': 0, '1': 0 },
    round: 1,
    lastResult: null,
  }),

  turn: {
    activePlayers: { all: 'play' },
  },

  phases: {
    play: {
      start: true,
      turn: {
        activePlayers: { all: 'play' },
      },
      moves: {
        choose: ({ G, playerID }, move: Move) => {
          if (!playerID) return;
          G.moves[playerID as '0' | '1'] = move;
        },
      },
      endIf: ({ G }) => {
        return G.moves['0'] !== null && G.moves['1'] !== null;
      },
      onEnd: ({ G }) => {
        const winner = getWinner(G.moves['0'], G.moves['1']);
        if (winner === '0') {
          G.scores['0']++;
          G.lastResult = `Player 1 wins with ${G.moves['0']} vs ${G.moves['1']}`;
        } else if (winner === '1') {
          G.scores['1']++;
          G.lastResult = `Player 2 wins with ${G.moves['1']} vs ${G.moves['0']}`;
        } else {
          G.lastResult = `Tie! Both chose ${G.moves['0']}`;
        }
        G.moves = { '0': null, '1': null };
        G.round++;
      },
      next: 'play',
    },
  },

  endIf: ({ G }) => {
    if (G.scores['0'] >= 2) return { winner: '0' };
    if (G.scores['1'] >= 2) return { winner: '1' };
  },
};
