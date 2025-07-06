import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { auth } from "@/lib/auth";
import { getQueryClient, trpc } from "@/lib/trpc/server";
import { Loader } from "@/components/loading-state";
import { MeetingIdView, MeetingIdViewError } from "../_components/meeting-id-view";
import { AgentsViewLoading } from "../../agents/_components/agents-view";


interface Props {
  params: Promise<{
    meetingId: string;
  }>
}

const MeetingIdPage = async ({ params }: Props) => {
  const { meetingId } = await params;
  
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  };
  
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.meetings.getOne.queryOptions({ id: meetingId }),
  );
  // TODO: prefetch meetings.getTranscript
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<AgentsViewLoading />}>
        <ErrorBoundary fallback={<MeetingIdViewError />}>
          <MeetingIdView meetingId={meetingId} />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  )
};

export default MeetingIdPage;