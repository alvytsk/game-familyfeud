import fs from 'node:fs/promises';
import path from 'node:path';
import type { QuestionPack, PackQuestion } from '@familyfeud/shared';
import { SIMPLE_ROUND_COUNT, BIG_GAME_QUESTIONS } from '@familyfeud/shared';
import { config } from '../config.js';

async function ensureDir(): Promise<void> {
  await fs.mkdir(config.dataPath, { recursive: true });
}

/** Validate pack ID to prevent path traversal attacks. */
function validatePackId(id: string): void {
  if (!id || /[\/\\]/.test(id) || id === '.' || id === '..' || id.includes('..')) {
    throw new Error(`Invalid pack ID: ${id}`);
  }
}

function packPath(id: string): string {
  validatePackId(id);
  const resolved = path.join(config.dataPath, `${id}.json`);
  // Double-check the resolved path is within the data directory
  if (!resolved.startsWith(config.dataPath + path.sep) && resolved !== config.dataPath) {
    throw new Error(`Invalid pack ID: ${id}`);
  }
  return resolved;
}

/**
 * Normalize a legacy flat pack (with only `questions[]`) to the new structured format.
 * If the pack already has `simpleRounds`, returns as-is.
 */
export function normalizePack(pack: QuestionPack): QuestionPack {
  if (pack.simpleRounds && pack.simpleRounds.length > 0) {
    return pack;
  }

  // Legacy format: distribute questions into sections
  const questions = pack.questions ?? [];
  const simpleRounds: PackQuestion[] = questions.slice(0, SIMPLE_ROUND_COUNT);
  const reverseRound: PackQuestion | undefined = questions[SIMPLE_ROUND_COUNT];
  const bigGame: PackQuestion[] = questions.slice(SIMPLE_ROUND_COUNT + 1, SIMPLE_ROUND_COUNT + 1 + BIG_GAME_QUESTIONS);

  // If we don't have enough questions for all sections, fill with what we have
  // At minimum we need simpleRounds
  if (simpleRounds.length === 0 && questions.length > 0) {
    return { ...pack, simpleRounds: questions.slice(0, Math.min(questions.length, SIMPLE_ROUND_COUNT)) };
  }

  return {
    ...pack,
    simpleRounds,
    reverseRound,
    bigGame: bigGame.length > 0 ? bigGame : undefined,
  };
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
    } catch (err) {
      console.warn(`Skipping malformed pack file ${file}:`, err instanceof Error ? err.message : err);
    }
  }

  return packs;
}

export async function getPack(id: string): Promise<QuestionPack | null> {
  try {
    const raw = await fs.readFile(packPath(id), 'utf-8');
    const pack = JSON.parse(raw) as QuestionPack;
    return normalizePack(pack);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
    console.error(`Failed to read pack ${id}:`, err instanceof Error ? err.message : err);
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
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return false;
    throw err;
  }
}
