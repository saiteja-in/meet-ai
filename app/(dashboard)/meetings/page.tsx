import React, { Suspense } from "react";
import { AgentsViewLoading } from "../agents/_components/agents-view";
import { MeetingsView, MeetingsViewError } from "./_components/MeetingsView";
import { getQueryClient, trpc } from "@/lib/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { MeetingsListHeader } from "@/components/meetings-list-header";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SearchParams } from "nuqs";
import { ErrorBoundary } from "react-error-boundary";
import { loadSearchParams } from "@/prisma/types/params-meetings";
interface Props {
  searchParams: Promise<SearchParams>;
}
const MeetingsPage = async ({ searchParams }: Props) => {
  const filters = await loadSearchParams(searchParams);
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) redirect("/sign-in");
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.meetings.getMany.queryOptions({
      ...filters,
    }),
  )
  return (
    <>
    <MeetingsListHeader/>
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<AgentsViewLoading />}>
        <ErrorBoundary fallback={<MeetingsViewError />}>
          <MeetingsView />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
    </>
  );
};

export default MeetingsPage;
