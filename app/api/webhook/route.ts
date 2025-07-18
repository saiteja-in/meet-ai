import { NextRequest, NextResponse } from "next/server";
import {
//   CallEndedEvent,
//   CallTranscriptionReadyEvent,
  CallSessionParticipantLeftEvent,
//   CallRecordingReadyEvent,
  CallSessionStartedEvent,
} from "@stream-io/node-sdk";
import { db } from "@/lib/db";
import { streamVideo } from "@/lib/stream-video";

function verifySignatureWithSDK(body: string, signature: string): boolean {
  return streamVideo.verifyWebhook(body, signature);
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-signature");
  const apiKey = req.headers.get("x-api-key");

  if (!signature || !apiKey) {
    return NextResponse.json(
      { error: "Missing signature or API key" },
      { status: 400 }
    );
  }

  const body = await req.text();

  if (!verifySignatureWithSDK(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body) as Record<string, unknown>;
  } catch (error) {
    return NextResponse.json({ error}, { status: 400 });
  }

  const eventType = (payload as Record<string, unknown>)?.type;

  if (eventType === "call.session_started") {
    const event = payload as CallSessionStartedEvent;
    const meetingId = event.call.custom?.meetingId;

    if (!meetingId) {
      return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
    }

    // Find the meeting that is not completed/active/processing/cancelled
    const meeting = await db.meeting.findFirst({
      where: {
        id: meetingId,
        NOT: [
          { status: "completed" },
          { status: "active" },
          { status: "processing" },
          { status: "cancelled" },
        ],
      },
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Update meeting status
    await db.meeting.update({
      where: { id: meeting.id },
      data: {
        status: "active",
        startedAt: new Date(),
      },
    });

    // Get the agent
    const agent = await db.agent.findUnique({
      where: { id: meeting.agentId },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const call = streamVideo.video.call("default", meetingId);

    console.log("before")
    const realtimeClient = await streamVideo.video.connectOpenAi({
      call,
      openAiApiKey: process.env.OPENAI_API_KEY!,
      agentUserId: agent.id,
    });
    console.log("real time client")

    realtimeClient.updateSession({
      instructions: agent.instructions,
    });
  } else if (eventType === "call.session_participant_left") {
    const event = payload as CallSessionParticipantLeftEvent;
    const meetingId = event.call_cid.split(":")[1];

    if (!meetingId) {
      return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
    }

    const call = streamVideo.video.call("default", meetingId);
    await call.end();
  }

  return NextResponse.json({ status: "ok" });
}