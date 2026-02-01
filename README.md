# fgj.js
fgj = foundry for games via javascript

Goal:
- client-side-only web app, code in TS/JS
- set up to deploy on push from GitHub to Netlify
- prototype and iterate board games here
- modify code via both traditional IDE and via Claude Code

## https://devp-fgj-js.netlify.app/

## Documentation

- [How to Add New Games](doc/how_to_add_games.md) - Guide for implementing new games (written for LLM agents)

## Current Games

- **Tic-Tac-Toe** - Classic 3x3 grid game
- **Rock Paper Scissors** - Best of three
- **Mecha Duel** - Strategic mecha combat with committed attacks

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```