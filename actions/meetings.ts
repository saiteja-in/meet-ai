import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/init";
import { z } from "zod";
import { db } from "@/lib/db";
import { TRPCError } from "@trpc/server";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@/prisma/types/constants";
import { Prisma } from "@/lib/generated/prisma";

export const meetingsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const existingMeeting = await db.meeting.findFirst({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });
      if (!existingMeeting) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
      }
      return existingMeeting;
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

      const where: Prisma.MeetingWhereInput = {
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

      const [items, total] = await Promise.all([
        db.meeting.findMany({
          where,
          orderBy: [
            { createdAt: "desc" },
            { id: "desc" },
          ],
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        db.meeting.count({ where }),
      ]);

      const totalPages = Math.ceil(total / pageSize);

      return {
        items,
        total,
        totalPages,
      };
    }),
});