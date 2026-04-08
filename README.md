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

| Layer         | Technology          |
|--------------|---------------------|
| Language      | TypeScript 5.x      |
| UI Framework  | Preact 10.x         |
| Build Tool    | Vite 6.x            |
| Test Runner   | Vitest 3.x          |
| Linter        | ESLint 9.x          |
| Hosting       | AWS S3 + CloudFront |
| CI/CD         | GitHub Actions      |

## CI/CD Pipeline

### How it works

| Trigger | Workflow | Steps |
|---------|----------|-------|
| Pull Request to `main` | `ci.yml` | Install → Lint → Build → Test |
| Push to `main` | `deploy.yml` | Install → Lint → Test → Build → S3 sync → CloudFront invalidation |

### Cache Strategy

- **Hashed assets** (`/assets/*.js`, `/assets/*.css`): `Cache-Control: max-age=31536000, immutable` — cached for 1 year, never need invalidation
- **`index.html`**: `Cache-Control: max-age=3600` — refreshed hourly, invalidated on every deploy

### Required GitHub Secrets

Configure these in **Settings → Secrets and variables → Actions** before the deploy workflow will run:

| Secret | Description |
|--------|-------------|
| `AWS_DEPLOY_ROLE_ARN` | ARN of the IAM role to assume via OIDC (e.g. `arn:aws:iam::123456789:role/github-deploy`) |
| `AWS_REGION` | AWS region of the S3 bucket and CloudFront distribution (e.g. `us-east-1`) |
| `S3_BUCKET` | S3 bucket name (e.g. `tictactoe-prod-assets`) |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution ID (e.g. `E1ABCDEF2GHIJ`) |
| `PRODUCTION_DOMAIN` | Public domain name (e.g. `tictactoe.app`) |

### AWS IAM Role Policy

The deploy role requires the following minimum permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::YOUR_BUCKET_NAME",
        "arn:aws:s3:::YOUR_BUCKET_NAME/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": ["cloudfront:CreateInvalidation"],
      "Resource": "arn:aws:cloudfront::ACCOUNT_ID:distribution/DISTRIBUTION_ID"
    }
  ]
}
```

### Rollback

Since all assets are content-hashed, rolling back is as simple as re-running the deploy workflow on the previous commit. S3 versioning should be enabled as an additional safety net. Target rollback time: <60 seconds.

## Architecture

All game logic runs client-side with zero backend requirements. The production bundle is served from a CloudFront CDN with 200+ global edge locations, targeting <100ms P99 asset delivery latency worldwide.
