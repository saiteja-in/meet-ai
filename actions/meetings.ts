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
import { streamVideo } from "@/lib/stream-video";
import { generateAvatarUri } from "@/lib/avatar";

export const meetingsRouter = createTRPCRouter({
  generateToken: protectedProcedure.mutation(async ({ ctx }) => {
    await streamVideo.upsertUsers([
      {
        id: ctx.auth.user.id,
        name: ctx.auth.user.name,
        role: "admin",
        image:
          ctx.auth.user.image ??
          generateAvatarUri({
            seed: ctx.auth.user.name,
            variant: "initials",
          }),
      },
    ]);

    const expirationTime = Math.floor(Date.now() / 1000) + 3600;
    const issuedAt = Math.floor(Date.now() / 1000) - 60;

    const token = streamVideo.generateUserToken({
      user_id: ctx.auth.user.id,
      exp: expirationTime,
      validity_in_seconds: issuedAt,
    });

    return token;
  }),

  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Delete a meeting that belongs to the user
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

      const removedMeeting = await db.meeting.delete({
        where: { id: input.id },
        include: { agent: true },
      });

      // Add duration field (in seconds)
      const duration =
        removedMeeting.endedAt && removedMeeting.startedAt
          ? Math.floor(
              (removedMeeting.endedAt.getTime() -
                removedMeeting.startedAt.getTime()) /
                1000
            )
          : null;

      return { ...removedMeeting, duration };
    }),

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

      // Stream call, Upsert Stream Users:
      const call = streamVideo.video.call("default", createdMeeting.id);
      await call.create({
        data: {
          created_by_id: ctx.auth.user.id,
          custom: {
            meetingId: createdMeeting.id,
            meetingName: createdMeeting.name,
          },
          settings_override: {
            transcription: {
              language: "en",
              mode: "auto-on",
              closed_caption_mode: "auto-on",
            },
            recording: {
              mode: "auto-on",
              quality: "1080p",
            },
          },
        },
      });

      // Make sure agent exists, upsert agent user for Stream
      const agent = await db.agent.findUnique({
        where: { id: createdMeeting.agentId },
      });

      if (!agent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent not found",
        });
      }

      await streamVideo.upsertUsers([
        {
          id: agent.id,
          name: agent.name,
          role: "user",
          image: generateAvatarUri({
            seed: agent.name,
            variant: "botttsNeutral",
          }),
        },
      ]);

      // Add duration field
      const duration =
        createdMeeting.endedAt && createdMeeting.startedAt
          ? Math.floor(
              (createdMeeting.endedAt.getTime() -
                createdMeeting.startedAt.getTime()) /
                1000
            )
          : null;

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