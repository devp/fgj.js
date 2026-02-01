# Game Directory Structure

Each game has its own directory: `src/games/<game-name>`

Within that dir, `rules.md` is the written ruleset. Amend that doc with changes to the rules.

There may also be a `code_plan.md`. Populate and commit this for new projects, and amend it to contain useful information for subsequent projects.

# Unit tests

- add unit tests for: fundamental game logic implementing game rules, and non-trivial game-specific logic, and non-trivial shared/common logic
- otherwise, avoid unnecessary tests, avoid change detector tests, avoid over mocked tests