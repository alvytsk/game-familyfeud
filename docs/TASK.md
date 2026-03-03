You are a senior full-stack engineer and technical lead. Design and implement a client-server “100 to 1” (Family Feud-like) game system.

Core concept

Players answer verbally in the room (no player devices for answering).

The Admin/Operator listens to verbal answers and operates the game via an Admin UI.

A separate Screen UI is shown on a big display (TV/projector) for the audience.

Tech constraints

Node.js monorepo (TypeScript preferred).

Real-time updates via WebSockets.

Dockerized deployment (docker compose up runs everything).

Flexible content management: create/edit/import/export Question Packs.

Screen UI layout requirements (must match)

The Screen UI must be designed specifically for a big display and follow this layout:

Top (header): Question

The current question is displayed large and centered at the top.

It should truncate/wrap gracefully for long questions (TV-safe typography).

Center: Answer cards

In the center, show a grid/list of answer slots (e.g., 6–10, depending on the round pack).

Each slot is a card that can be:

hidden (shows only the slot number / placeholder)

revealed (shows answer text + points)

When revealed, the card must animate like a flip / card reveal (CSS transform animation is enough).

The reveal should be smooth and readable from a distance.

Left and right: Teams

Left side: Team A panel.

Right side: Team B panel.

Each panel shows:

Team name (large)

team total score (large)

optionally current-round points contribution

indicator of active team/turn (highlight/glow)

The Admin must be able to set and edit team names from the Admin UI at any time (with safe rules during an active round; document your choice).

Bottom: Penalties / strikes

Bottom area shows penalties for wrong answers.

Show strikes separately per team (recommended) or global (choose and document).

Strikes should be highly visible (e.g., “X” icons), and animate slightly when added.

Admin UI requirements (additions)

Admin can edit team names (Team A / Team B) before and during the game.

Admin actions:

start/pause/reset timer

reveal answer (select from canonical list)

add strike (choose team)

award/adjust points

switch active team

next round

undo last action (at least for reveal/strike/points if feasible)

Data model additions

Team must include:

id, name, scoreTotal, strikes (or strikes per round)

GameState must include:

activeTeamId

round: question, answer slots, revealed flags, round points

ui: optional layout metadata if needed, but keep UI mostly derived from state

WebSocket synchronization (important)

Screen UI is read-only: it subscribes to state snapshots + events.

Admin UI sends commands; server is authoritative.

The screen must recover perfectly after refresh by requesting a full state snapshot.

Docker / deployment

Must run via Docker Compose:

Persist question packs (JSON on disk mounted as a volume, or SQLite in a volume).

Provide sensible env vars: ports, admin PIN, data path.

Provide health checks.

Output expected from you

Architecture overview + library choices.

Monorepo tree.

Typed WS contracts (TypeScript) with runtime validation.

Key code files:

Server: state machine + WS gateway + command router + persistence for packs and team names.

Admin UI: lobby + pack editor + game controls + team name editor.

Screen UI: EXACT layout above, card flip reveal animation, team panels, strikes footer.

README with:

how to run (dev + docker)

how the operator runs a game

how to add/edit question packs and set team names.

Do not ask me questions unless absolutely necessary; make reasonable assumptions and document them.