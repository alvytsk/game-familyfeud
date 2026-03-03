import type { WebSocket } from 'ws';
import type { GameState, ServerToAdmin, ServerToScreen } from '@familyfeud/shared';

const adminClients = new Set<WebSocket>();
const screenClients = new Set<WebSocket>();

function removeClient(ws: WebSocket): void {
  adminClients.delete(ws);
  screenClients.delete(ws);
}

export function addAdmin(ws: WebSocket): void {
  adminClients.add(ws);
  ws.on('close', () => removeClient(ws));
  ws.on('error', () => removeClient(ws));
}

export function addScreen(ws: WebSocket): void {
  screenClients.add(ws);
  ws.on('close', () => removeClient(ws));
  ws.on('error', () => removeClient(ws));
}

function send(ws: WebSocket, data: unknown): void {
  if (ws.readyState === ws.OPEN) {
    try {
      ws.send(JSON.stringify(data));
    } catch {
      // Client likely disconnected mid-send; clean up
      removeClient(ws);
    }
  }
}

export function sendToAdmin(ws: WebSocket, msg: ServerToAdmin): void {
  send(ws, msg);
}

export function broadcastStateToAll(state: GameState): void {
  const snapshot: ServerToAdmin = { type: 'state-snapshot', state };
  for (const ws of adminClients) send(ws, snapshot);
  const screenSnapshot: ServerToScreen = { type: 'state-snapshot', state };
  for (const ws of screenClients) send(ws, screenSnapshot);
}

export function broadcastToScreens(events: ServerToScreen[]): void {
  for (const event of events) {
    for (const ws of screenClients) {
      send(ws, event);
    }
  }
}

export function broadcastToAdmins(msg: ServerToAdmin): void {
  for (const ws of adminClients) send(ws, msg);
}
