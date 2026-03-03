# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
pnpm install              # Install all dependencies
pnpm build:shared         # Build shared package (required before app builds)
pnpm build                # Build everything: shared → server → admin → screen
pnpm dev                  # Run all services in parallel
pnpm dev:server           # Server only (http://localhost:3000)
pnpm dev:admin            # Admin UI only (http://localhost:5175/admin/)
pnpm dev:screen           # Screen UI only (http://localhost:5174)
pnpm typecheck            # TypeScript strict check across all packages
pnpm --filter @familyfeud/server typecheck   # Typecheck a single package
```

Requires Node.js >= 20 and pnpm >= 9. Default admin PIN: `1234`.

## Architecture

pnpm monorepo with four packages:

- **`packages/shared`** — Types, Zod schemas, WS protocol definitions, constants. Built with tsup. All other packages depend on this.
- **`apps/server`** — Fastify server with `@fastify/websocket`. Manages game state, serves REST API for packs, broadcasts WS events. In production also serves the built frontend assets (Screen at `/`, Admin at `/admin/`).
- **`apps/screen`** — React (Vite + Tailwind) audience display. Connects via WS with `{ type: 'subscribe' }`. Uses `useReducer` for state. Has CSS 3D card-flip and strike-pop animations.
- **`apps/admin`** — React (Vite + Tailwind) operator control panel. Connects via WS with PIN auth. Uses Zustand for state. Pages: LobbyPage, GamePage, PackEditorPage.

## Server Data Flow

1. Admin WS client sends a command (e.g. `{ type: 'reveal-answer', rank: 2 }`)
2. `ws/gateway.ts` validates with Zod schema → dispatches to `commands/index.ts`
3. Command handler calls pure mutation functions in `commands/handlers.ts` via Immer `produce()`
4. `gameState.update()` pushes previous state onto undo stack, applies mutation, notifies listeners
5. Gateway broadcasts full `state-snapshot` to all clients + granular events (e.g. `answer-revealed`) to screens only (animation triggers)

## Key Design Patterns

- **Protocol:** All WS messages are discriminated unions (`{ type: string, ... }`), validated with `z.discriminatedUnion()` in `schemas.ts`
- **Immutable state:** Immer `produce()` for all mutations. `update()` tracks undo history; `updateSilent()` skips it (used for timer ticks)
- **Two-tier broadcast:** Full state snapshots for correctness + granular events for screen animations
- **Timer:** Server-authoritative `setInterval` in `ws/timer.ts`, broadcasts `timer-tick` to screens every second
- **Persistence:** Question packs are plain JSON files in `data/packs/`, CRUD via REST routes at `/api/packs`

## Game Phases

`lobby` → `playing` → `round-end` (implicit, same as playing) → `game-over`

Strikes reset per round. Active team is manually switched by admin. Points are awarded explicitly (not automatically on reveal).

## Environment Variables

`PORT` (3000), `HOST` (0.0.0.0), `ADMIN_PIN` (1234), `DATA_PATH` (auto-resolved to `data/packs/` from project root).

## Frontend Dev Proxying

Both Vite configs proxy `/ws` (WebSocket) and `/api` to `http://localhost:3000`, so run the server alongside the UI in dev mode.
