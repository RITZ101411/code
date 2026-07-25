# Contributing

## Pull Requests

- Branch from `main`
- Branch name: `feat/description`, `fix/description`, `docs/description`, etc.
- Keep PRs focused — one feature or fix per PR
- Direct pushes to `main` are blocked; all changes go through PRs

## Commit Messages

```
prefix: content
```

### Prefix

- `feat` — New feature
- `fix` — Bug fix
- `refactor` — Code restructuring without behavior change
- `docs` — Documentation
- `chore` — Build, config, and other maintenance

### Examples

```
feat: add collapse animation to file tree
fix: retry LSP connection on unexpected disconnect
refactor: extract shared error handling for IPC
docs: add supported languages list to SPECIFICATION.ja.md
chore: upgrade Tauri to v2.1
```