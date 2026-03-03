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
  questions: z.array(PackQuestionSchema).min(1),
});
