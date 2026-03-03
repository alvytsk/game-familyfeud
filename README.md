# Family Feud ("100 to 1") Game

A client-server Family Feud-like game system with an Admin control panel and a projected Screen display.

## Architecture

- **Server** (`apps/server`) — Fastify + WebSocket, manages game state with Immer, serves REST API for packs
- **Screen UI** (`apps/screen`) — React display for the audience with card-flip animations, projected on a big screen
- **Admin UI** (`apps/admin`) — React control panel for the game operator
- **Shared** (`packages/shared`) — Types, Zod schemas, protocol definitions

## Quick Start (Development)

```bash
# Prerequisites: Node.js 20+, pnpm 9+
pnpm install
pnpm build:shared

# Run all in parallel (server + both UIs):
pnpm dev

# Or run individually:
pnpm dev:server   # http://localhost:3000 (API + WS)
pnpm dev:admin    # http://localhost:5175/admin/
pnpm dev:screen   # http://localhost:5174
```

Default admin PIN: `1234` (set via `ADMIN_PIN` env var)

## Docker

```bash
# Build and run
docker compose up --build

# With custom PIN
ADMIN_PIN=5678 docker compose up --build
```

Opens on port 3000:
- Screen UI: `http://localhost:3000/`
- Admin UI: `http://localhost:3000/admin/`
- Health: `http://localhost:3000/health`
- Packs API: `http://localhost:3000/api/packs`

## Правила игры

### Общий ход

1. **Лобби** — ведущий входит в админ-панель по PIN-коду, задает названия команд, выбирает пак вопросов и нажимает «Начать игру».
2. **Раунды** — на каждый вопрос из пака отводится отдельный раунд. Команды по очереди угадывают популярные ответы.
3. **Конец игры** — после прохождения всех раундов (или по решению ведущего) побеждает команда с наибольшим количеством очков.

### Фазы игры

```
lobby → playing → game-over
```

- `lobby` — выбор пака и настройка команд
- `playing` — активная игра (раунды идут последовательно)
- `game-over` — игра завершена, показан итоговый счет

### Раунд

Каждый раунд — один вопрос с несколькими ответами. У каждого ответа есть очки, отражающие его популярность.

1. На экране появляется вопрос со скрытыми ответами.
2. Ведущий открывает угаданные ответы кнопками в админ-панели.
3. За неправильный ответ ведущий назначает страйк текущей команде.
4. После 3 страйков ход автоматически переходит к другой команде, страйки обнуляются.
5. Ведущий может переключить активную команду вручную в любой момент.
6. Когда раунд сыгран, ведущий нажимает «Следующий раунд».

### Начисление очков

| Событие | Что происходит |
|---|---|
| Открытие ответа | Очки ответа добавляются в **банк раунда** (`roundPoints`) |
| Следующий раунд | Банк раунда автоматически начисляется **активной команде** в общий счет |
| Завершение игры | Банк текущего раунда автоматически начисляется активной команде |
| Ручное начисление | Ведущий может начислить произвольные очки любой команде |
| Корректировка счета | Ведущий может увеличить или уменьшить счет любой команды |

**Важно:** очки не начисляются в общий счет автоматически при открытии ответа — они только накапливаются в банке раунда. Банк зачисляется целиком той команде, которая является активной в момент перехода к следующему раунду.

### Страйки

- Максимум **3 страйка** на команду за ход.
- При достижении 3 страйков ход автоматически переходит к другой команде, страйки **обеих** команд сбрасываются.
- При переходе к следующему раунду страйки обнуляются.

### Таймер

- Серверный таймер на **30 секунд** (по умолчанию).
- Ведущий запускает, ставит на паузу и сбрасывает таймер вручную.
- При переходе к следующему раунду таймер автоматически сбрасывается.

### Отмена действий

Ведущий может отменять последние действия кнопкой «Отменить» (undo). Хранится до 20 последних состояний.

## Question Packs

Packs are JSON files stored in `data/packs/`. Use the Pack Editor in the Admin UI to create, edit, import, and export packs.

Pack format:
```json
{
  "id": "my-pack",
  "name": "My Questions",
  "description": "Optional description",
  "questions": [
    {
      "question": "Name something people eat for breakfast",
      "answers": [
        { "text": "Eggs", "points": 35 },
        { "text": "Cereal", "points": 25 },
        { "text": "Toast", "points": 20 }
      ]
    }
  ]
}
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Server port |
| `HOST` | `0.0.0.0` | Server host |
| `ADMIN_PIN` | `1234` | Admin authentication PIN |
| `DATA_PATH` | `./data/packs` | Path to question pack JSON files |
