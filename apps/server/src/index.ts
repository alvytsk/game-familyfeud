import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import { registerHealthRoute } from './routes/health.js';
import { registerPackRoutes } from './routes/packs.js';
import { registerWsGateway } from './ws/gateway.js';
import { startTimerLoop } from './ws/timer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const app = Fastify({ logger: true });

  await app.register(fastifyWebsocket);

  // Register routes
  registerHealthRoute(app);
  registerPackRoutes(app);
  registerWsGateway(app);

  // In production, serve built frontend assets
  const screenDist = path.resolve(__dirname, '../../screen/dist');
  const adminDist = path.resolve(__dirname, '../../admin/dist');

  const hasScreenDist = fs.existsSync(screenDist);
  const hasAdminDist = fs.existsSync(adminDist);

  if (hasScreenDist || hasAdminDist) {
    let firstRegistration = true;
    if (hasScreenDist) {
      await app.register(fastifyStatic, {
        root: screenDist,
        prefix: '/',
        decorateReply: firstRegistration,
        wildcard: false,
      });
      firstRegistration = false;
    }

    if (hasAdminDist) {
      await app.register(fastifyStatic, {
        root: adminDist,
        prefix: '/admin/',
        decorateReply: firstRegistration,
        wildcard: false,
      });
      firstRegistration = false;
    }

    // SPA fallbacks
    app.setNotFoundHandler((request, reply) => {
      if (request.url.startsWith('/admin') && hasAdminDist) {
        return reply.sendFile('index.html', adminDist);
      }
      if (request.url.startsWith('/api') || request.url.startsWith('/ws')) {
        return reply.code(404).send({ error: 'Not found' });
      }
      if (hasScreenDist) {
        return reply.sendFile('index.html', screenDist);
      }
      return reply.code(404).send({ error: 'Not found' });
    });
  } else {
    app.log.info('Static assets not found, running in API-only mode');
  }

  // Start timer loop
  startTimerLoop();

  await app.listen({ port: config.port, host: config.host });
  console.log(`Server listening on http://${config.host}:${config.port}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
