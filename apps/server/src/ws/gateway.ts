import type { FastifyInstance } from 'fastify';
import type { WebSocket } from 'ws';
import { AdminCommandSchema, ScreenCommandSchema } from '@familyfeud/shared';
import { config } from '../config.js';
import { gameState } from '../state/gameState.js';
import { handleCommand } from '../commands/index.js';
import { listPacks } from '../persistence/packs.js';
import {
  addAdmin,
  addScreen,
  sendToAdmin,
  broadcastStateToAll,
  broadcastToScreens,
  broadcastToAdmins,
} from './broadcast.js';

export function registerWsGateway(app: FastifyInstance): void {
  app.get('/ws', { websocket: true }, (socket) => {
    const ws = socket as unknown as WebSocket;
    let authenticated = false;
    let role: 'admin' | 'screen' | null = null;

    ws.on('message', async (raw: Buffer | string) => {
      let data: unknown;
      try {
        data = JSON.parse(raw.toString());
      } catch {
        sendToAdmin(ws, { type: 'error', message: 'Invalid JSON' });
        return;
      }

      // Check if it's a screen subscribe command
      const screenParse = ScreenCommandSchema.safeParse(data);
      if (screenParse.success) {
        role = 'screen';
        addScreen(ws);
        // Send current state
        sendToAdmin(ws, { type: 'state-snapshot', state: gameState.getState() });
        return;
      }

      // Try admin command
      const adminParse = AdminCommandSchema.safeParse(data);
      if (!adminParse.success) {
        sendToAdmin(ws, { type: 'error', message: 'Unknown command' });
        return;
      }

      const cmd = adminParse.data;

      // Handle auth
      if (cmd.type === 'auth') {
        if (cmd.pin === config.adminPin) {
          authenticated = true;
          role = 'admin';
          addAdmin(ws);
          sendToAdmin(ws, { type: 'auth-ok' });
          // Send current state and pack list
          sendToAdmin(ws, { type: 'state-snapshot', state: gameState.getState() });
          const packs = await listPacks();
          sendToAdmin(ws, { type: 'pack-list', packs });
        } else {
          sendToAdmin(ws, { type: 'auth-fail', reason: 'Invalid PIN' });
        }
        return;
      }

      // All other commands require auth
      if (!authenticated) {
        sendToAdmin(ws, { type: 'error', message: 'Not authenticated' });
        return;
      }

      try {
        const result = await handleCommand(cmd);

        const currentState = gameState.getState();
        if (cmd.type === 'next-round' || cmd.type === 'start-game') {
          console.log(`[SERVER] ${cmd.type} → round answers:`, currentState.round?.answers.map(a => ({ rank: a.rank, revealed: a.revealed })));
        }

        // Broadcast state to all
        broadcastStateToAll(currentState);

        // Send granular events to screens
        if (result.screenEvents?.length) {
          broadcastToScreens(result.screenEvents);
        }

        // Send pack list if requested
        if (result.sendPackList) {
          const packs = await listPacks();
          broadcastToAdmins({ type: 'pack-list', packs });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        sendToAdmin(ws, { type: 'error', message });
      }
    });
  });
}
