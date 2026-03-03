import { z } from 'zod';

const TeamIdSchema = z.enum(['team-a', 'team-b']);

export const AdminCommandSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('auth'), pin: z.string() }),
  z.object({ type: z.literal('set-team-name'), teamId: TeamIdSchema, name: z.string().min(1).max(30) }),
  z.object({ type: z.literal('load-pack'), packId: z.string() }),
  z.object({ type: z.literal('start-game') }),
  z.object({ type: z.literal('next-round') }),
  z.object({ type: z.literal('reveal-answer'), rank: z.number().int().min(1) }),
  z.object({ type: z.literal('add-strike'), teamId: TeamIdSchema }),
  z.object({ type: z.literal('award-points'), teamId: TeamIdSchema, points: z.number().int().min(0) }),
  z.object({ type: z.literal('adjust-score'), teamId: TeamIdSchema, delta: z.number().int() }),
  z.object({ type: z.literal('switch-active-team') }),
  z.object({ type: z.literal('timer-start') }),
  z.object({ type: z.literal('timer-pause') }),
  z.object({ type: z.literal('timer-reset'), seconds: z.number().int().min(1).optional() }),
  z.object({ type: z.literal('undo') }),
  z.object({ type: z.literal('end-game') }),
  z.object({ type: z.literal('reset-game') }),
  // New: simple round commands
  z.object({ type: z.literal('set-playing-team'), teamId: TeamIdSchema }),
  z.object({ type: z.literal('steal-success') }),
  z.object({ type: z.literal('steal-fail') }),
  // New: reverse round commands
  z.object({ type: z.literal('start-reverse') }),
  z.object({ type: z.literal('set-reverse-choice'), teamId: TeamIdSchema, rank: z.number().int().min(0).max(6) }),
  z.object({ type: z.literal('reveal-reverse-answer'), rank: z.number().int().min(1).max(6) }),
  z.object({ type: z.literal('reveal-reverse') }),
  // New: big game commands
  z.object({ type: z.literal('start-big-game') }),
  z.object({ type: z.literal('big-game-select-match'), questionIndex: z.number().int().min(0), rank: z.number().int().min(0) }),
  z.object({ type: z.literal('big-game-next') }),
  z.object({ type: z.literal('end-big-game') }),
]);

export const ScreenCommandSchema = z.object({ type: z.literal('subscribe') });

export const PackQuestionSchema = z.object({
  question: z.string().min(1),
  answers: z.array(z.object({
    text: z.string().min(1),
    points: z.number().int().min(1),
  })).min(1).max(10),
});

export const QuestionPackSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  questions: z.array(PackQuestionSchema).optional(),
  simpleRounds: z.array(PackQuestionSchema).optional(),
  reverseRound: PackQuestionSchema.optional(),
  bigGame: z.array(PackQuestionSchema).optional(),
}).refine(
  (pack) => {
    // Must have either legacy questions or new structured format
    const hasLegacy = pack.questions && pack.questions.length > 0;
    const hasNew = pack.simpleRounds && pack.simpleRounds.length > 0;
    return hasLegacy || hasNew;
  },
  { message: 'Pack must have either questions (legacy) or simpleRounds (new format)' },
);
