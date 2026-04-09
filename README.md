# Tic Tac Toe

A fast, accessible, client-side Tic Tac Toe game built with Preact + TypeScript + Vite.

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install dependencies

```bash
npm install
```

### Development server

```bash
npm run dev
```

Opens a local dev server at `http://localhost:5173` with hot module replacement.

### Production build

```bash
npm run build
```

Outputs a content-hashed production bundle to the `dist/` directory.

### Preview production build locally

```bash
npm run preview
```

## Testing

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Linting

```bash
npm run lint
```

## Project Structure

```
tictactoe/
├── src/
│   ├── main.tsx          # Application entry point
│   ├── App.tsx           # Root app component
│   ├── style.css         # Global styles
│   └── vite-env.d.ts     # Vite type declarations
├── index.html            # HTML entry point
├── vite.config.ts        # Vite + Vitest configuration
├── tsconfig.json         # TypeScript project references
├── tsconfig.app.json     # App TypeScript config
├── tsconfig.node.json    # Node/config TypeScript config
└── package.json
```

## Technology Stack

| Layer        | Technology         |
| ------------ | ------------------ |
| Language     | TypeScript 5.x     |
| UI Framework | Preact 10.x        |
| Build Tool   | Vite 6.x           |
| Test Runner  | Vitest 3.x         |
| Linter       | ESLint 9.x         |
| Hosting      | Azure Blob Storage |
| CI/CD        | GitHub Actions     |

## CI/CD Pipeline

### How it works

| Trigger                | Workflow     | Steps                                           |
| ---------------------- | ------------ | ----------------------------------------------- |
| Pull Request to `main` | `ci.yml`     | Install → Lint → Build → Test                   |
| Push to `main`         | `deploy.yml` | Install → Lint → Test → Build → Azure Blob sync |

### Required GitHub Secrets

Configure these in **Settings → Secrets and variables → Actions** before the deploy workflow will run:

| Secret                  | Description                                                                    |
| ----------------------- | ------------------------------------------------------------------------------ |
| `AZURE_CLIENT_ID`       | Client ID of the Azure AD app registration used for OIDC federated credentials |
| `AZURE_TENANT_ID`       | Azure Active Directory tenant ID                                               |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID                                                          |
| `AZURE_STORAGE_ACCOUNT` | Name of the Azure Storage account (e.g. `tictactoeprod`)                       |
| `PRODUCTION_DOMAIN`     | Public domain name (e.g. `tictactoe.app`)                                      |

### Azure Setup

1. **Storage account** — enable _Static website_ hosting; the `$web` container is created automatically.
2. **App registration** — create a federated credential for the GitHub repository (`repo:<org>/<repo>:ref:refs/heads/main`).
3. **Role assignment** — grant the app registration the **Storage Blob Data Contributor** role on the storage account.

### Rollback

Re-run the deploy workflow on the previous commit to restore the last known-good build. Target rollback time: <60 seconds.

## Architecture

All game logic runs client-side with zero backend requirements. The production bundle is served directly from Azure Blob Storage static website hosting.
