// Make sure your Prisma client import is correct
import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/init";
import { z } from "zod";
import { db } from "@/lib/db";
import { agentsInsertSchema } from "@/prisma/schema/agents";
import { TRPCError } from "@trpc/server";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@/prisma/types/constants";
import { Prisma } from "@/lib/generated/prisma";

export const agentsRouter = createTRPCRouter({
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        instructions: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;

      // First check if the agent exists and belongs to the user
      const existingAgent = await db.agent.findFirst({
        where: {
          id,
          userId: ctx.auth.user.id,
        },
      });

      if (!existingAgent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent not found or you don't have permission",
        });
      }

      // Update the agent
      const updatedAgent = await db.agent.update({
        where: { id },
        data,
      });

      return updatedAgent;
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // First check if the agent exists and belongs to the user
      const existingAgent = await db.agent.findFirst({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });

      if (!existingAgent) {
        throw new TRPCError({ 
          code: "NOT_FOUND", 
          message: "Agent not found or you don't have permission" 
        });
      }

      // Delete the agent
      const deletedAgent = await db.agent.delete({
        where: { id: input.id },
      });

      return deletedAgent;
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const existingAgent = await db.agent.findFirst({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });
      if (!existingAgent) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
      }
      // meetingCount: 5 is hardcoded to match drizzle version
      return { meetingCount: 5, ...existingAgent };
    }),

  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(DEFAULT_PAGE_SIZE)
          .max(MAX_PAGE_SIZE)
          .default(DEFAULT_PAGE_SIZE),
        search: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { search, page, pageSize } = input;

      const where: Prisma.AgentWhereInput = {
        userId: ctx.auth.user.id,
        ...(search
          ? {
              name: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            }
          : {}),
      };

      // Query for paginated agents
      const [items, total] = await Promise.all([
        db.agent.findMany({
          where,
          orderBy: [
            { createdAt: "desc" },
            { id: "desc" },
          ],
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        db.agent.count({ where }),
      ]);

      // Add hardcoded meetingCount: 6 to each item (to match drizzle version)
      const itemsWithMeetingCount = items.map(agent => ({
        meetingCount: 6,
        ...agent,
      }));

      const totalPages = Math.ceil(total / pageSize);

      return {
        items: itemsWithMeetingCount,
        total,
        totalPages,
      };
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