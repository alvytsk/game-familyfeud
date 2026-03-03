import type { FastifyInstance } from 'fastify';
import { QuestionPackSchema } from '@familyfeud/shared';
import { listPacks, getPack, savePack, deletePack } from '../persistence/packs.js';
import { v4 as uuidv4 } from 'uuid';

export function registerPackRoutes(app: FastifyInstance): void {
  // List all packs
  app.get('/api/packs', async () => {
    return listPacks();
  });

  // Get single pack
  app.get<{ Params: { id: string } }>('/api/packs/:id', async (request, reply) => {
    const pack = await getPack(request.params.id);
    if (!pack) {
      return reply.code(404).send({ error: 'Pack not found' });
    }
    return pack;
  });

  // Create pack
  app.post('/api/packs', async (request, reply) => {
    const body = request.body as Record<string, unknown>;
    const data = { ...body, id: (body.id as string) || uuidv4() };
    const parsed = QuestionPackSchema.safeParse(data);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.issues });
    }
    await savePack(parsed.data);
    return reply.code(201).send(parsed.data);
  });

  // Update pack
  app.put<{ Params: { id: string } }>('/api/packs/:id', async (request, reply) => {
    const body = request.body as Record<string, unknown>;
    const data = { ...body, id: request.params.id };
    const parsed = QuestionPackSchema.safeParse(data);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.issues });
    }
    await savePack(parsed.data);
    return parsed.data;
  });

  // Delete pack
  app.delete<{ Params: { id: string } }>('/api/packs/:id', async (request, reply) => {
    const deleted = await deletePack(request.params.id);
    if (!deleted) {
      return reply.code(404).send({ error: 'Pack not found' });
    }
    return { ok: true };
  });
}
