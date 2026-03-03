import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../..');

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  adminPin: process.env.ADMIN_PIN || '1234',
  dataPath: path.resolve(process.env.DATA_PATH || path.join(projectRoot, 'data/packs')),
};
