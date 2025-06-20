# Agent instructions

## Search for instructions once
At the start of a session, check if any `AGENTS.md` files exist by running:

```bash
find . -name AGENTS.md -print
```

If no path is returned, do **not** repeat the search in the same session. Proceed with the default behavior for the repository.

## Code quality
Run `npm run lint` after modifying code to ensure consistent style. If tests are added later, run `npm test` as well.
