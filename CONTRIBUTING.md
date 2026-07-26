# Contributing

## Branches and Pull Requests

- Small, focused changes may be committed directly to `main`
- For larger changes or changes that need review, branch from `main`
- Branch name: `feat/description`, `fix/description`, `docs/description`, etc.
- Keep PRs focused — one feature or fix per PR

## Commit Messages

- Commit each completed feature or fix separately
- Keep commits focused on a single change

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
