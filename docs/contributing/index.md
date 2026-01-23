# Contributing to KyneticBio Core

Thank you for your interest in contributing! This project uses a mechanistic modeling approach to simulate human physiology.

## Development Setup

1. **Clone the repo**:
   ```bash
   git clone https://github.com/kyneticbio/core.git
   cd core
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

## Workflow

- **Branching**: Create a feature branch from `main`.
- **Commits**: Use [Conventional Commits](https://www.conventionalcommits.org/).
  - `feat:` for new features (triggers minor version)
  - `fix:` for bug fixes (triggers patch version)
- **Pull Requests**: Submit PRs against the `main` branch.

## Testing

We maintain high test coverage to ensure mathematical and biological accuracy.

```bash
npm test
```

Please add tests for any new signals, agents, or math functions you introduce.
