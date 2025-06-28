 // Make sure your Prisma client import is correct
import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/init";
import { z } from "zod";
import { db } from "@/lib/db";
import { agentsInsertSchema } from "@/prisma/schema/agents";

export const agentsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const existingAgent = await db.agent.findUnique({
        where: { id: input.id },
      });
      return existingAgent
        ? { meetingCount: 5, ...existingAgent }
        : null;
    }),

  getMany: protectedProcedure.query(async () => {
    const data = await db.agent.findMany();
    return data;
  }),

  create: protectedProcedure
    .input(agentsInsertSchema)
    .mutation(async ({ input, ctx }) => {
      const createdAgent = await db.agent.create({
        data: {
          ...input,
          userId: ctx.auth.user.id,
        },
      });
      return createdAgent;
    }),
});