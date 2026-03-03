import fs from 'node:fs/promises';
import path from 'node:path';
import type { QuestionPack } from '@familyfeud/shared';
import { config } from '../config.js';

async function ensureDir(): Promise<void> {
  await fs.mkdir(config.dataPath, { recursive: true });
}

function packPath(id: string): string {
  return path.join(config.dataPath, `${id}.json`);
}

export async function listPacks(): Promise<Pick<QuestionPack, 'id' | 'name' | 'description'>[]> {
  await ensureDir();
  const files = await fs.readdir(config.dataPath);
  const packs: Pick<QuestionPack, 'id' | 'name' | 'description'>[] = [];

  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    try {
      const raw = await fs.readFile(path.join(config.dataPath, file), 'utf-8');
      const pack = JSON.parse(raw) as QuestionPack;
      packs.push({ id: pack.id, name: pack.name, description: pack.description });
    } catch {
      // skip malformed files
    }
  }

  return packs;
}

export async function getPack(id: string): Promise<QuestionPack | null> {
  try {
    const raw = await fs.readFile(packPath(id), 'utf-8');
    return JSON.parse(raw) as QuestionPack;
  } catch {
    return null;
  }
}

export async function savePack(pack: QuestionPack): Promise<void> {
  await ensureDir();
  await fs.writeFile(packPath(pack.id), JSON.stringify(pack, null, 2), 'utf-8');
}

export async function deletePack(id: string): Promise<boolean> {
  try {
    await fs.unlink(packPath(id));
    return true;
  } catch {
    return false;
  }
}
