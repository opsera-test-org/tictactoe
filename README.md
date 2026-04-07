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

## Architecture

All game logic runs client-side with zero backend requirements. See the [architecture documentation](docs/architecture.md) for detailed system design.
