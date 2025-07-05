import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { agentsRouter } from '@/actions/procedures';
import { meetingsRouter } from '@/actions/meetings';
export const appRouter = createTRPCRouter({
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
    agents:agentsRouter,
    meetings:meetingsRouter
});
// export type definition of API
export type AppRouter = typeof appRouter;