import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/init";
import { z } from "zod";
import { db } from "@/lib/db";
import { TRPCError } from "@trpc/server";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/prisma/types/constants";
import { Prisma } from "@/lib/generated/prisma";
import {
  meetingsInsertSchema,
  meetingsUpdateSchema,
} from "@/prisma/schema/meetings";
import { MeetingStatus } from "@/prisma/types/types";

export const meetingsRouter = createTRPCRouter({
  update: protectedProcedure
    .input(meetingsUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if the meeting exists and belongs to the user
      const existingMeeting = await db.meeting.findFirst({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });

      if (!existingMeeting) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meeting not found",
        });
      }

      // Update the meeting
      const updatedMeeting = await db.meeting.update({
        where: { id: input.id },
        data: input,
        include: {
          agent: true,
        },
      });

      // Add duration field (in seconds), like: duration = endedAt - startedAt
      const duration =
        updatedMeeting.endedAt && updatedMeeting.startedAt
          ? Math.floor(
              (updatedMeeting.endedAt.getTime() -
                updatedMeeting.startedAt.getTime()) /
                1000
            )
          : null;

      return { ...updatedMeeting, duration };
    }),

  create: protectedProcedure
    .input(meetingsInsertSchema)
    .mutation(async ({ input, ctx }) => {
      const createdMeeting = await db.meeting.create({
        data: { ...input, userId: ctx.auth.user.id },
        include: { agent: true },
      });

      // Add duration field
      const duration =
        createdMeeting.endedAt && createdMeeting.startedAt
          ? Math.floor(
              (createdMeeting.endedAt.getTime() -
                createdMeeting.startedAt.getTime()) /
                1000
            )
          : null;

      // TODO: Create Stream call, Upsert Stream Users

      return { ...createdMeeting, duration };
    }),

  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(MIN_PAGE_SIZE)
          .max(MAX_PAGE_SIZE)
          .default(DEFAULT_PAGE_SIZE),
        search: z.string().nullish(),
        agentId: z.string().nullish(),
        status: z
          .enum([
            MeetingStatus.Upcoming,
            MeetingStatus.Active,
            MeetingStatus.Completed,
            MeetingStatus.Processing,
            MeetingStatus.Cancelled,
          ])
          .nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search, status, agentId } = input;

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
        ...(status ? { status } : {}),
        ...(agentId ? { agentId } : {}),
      };

      const [items, total] = await Promise.all([
        db.meeting.findMany({
          where,
          include: { agent: true },
          orderBy: [
            { createdAt: "desc" },
            { id: "desc" },
          ],
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        db.meeting.count({ where }),
      ]);

      // Add duration field to each item (in seconds)
      const itemsWithDuration = items.map((meeting) => ({
        ...meeting,
        duration:
          meeting.endedAt && meeting.startedAt
            ? Math.floor(
                (meeting.endedAt.getTime() - meeting.startedAt.getTime()) / 1000
              )
            : null,
      }));

      const totalPages = Math.ceil(total / pageSize);

      return {
        items: itemsWithDuration,
        total,
        totalPages,
      };
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const existingMeeting = await db.meeting.findFirst({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
        include: { agent: true },
      });

      if (!existingMeeting) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meeting not found",
        });
      }

      // Add duration field (in seconds)
      const duration =
        existingMeeting.endedAt && existingMeeting.startedAt
          ? Math.floor(
              (existingMeeting.endedAt.getTime() -
                existingMeeting.startedAt.getTime()) /
                1000
            )
          : null;

      return { ...existingMeeting, duration };
    }),
});
