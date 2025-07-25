import React, { Suspense } from "react";
import { AgentsView, AgentsViewLoading } from "./_components/agents-view";
import { getQueryClient, trpc } from "@/lib/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ListHeader } from "@/components/list-header";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SearchParams } from "nuqs";
import { loadSearchParams } from "@/prisma/types/params";
interface Props {
  searchParams:Promise<SearchParams>;
}
const page = async ({searchParams}:Props) => {
  const filters = await loadSearchParams(searchParams)

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if(!session) redirect("/sign-in")
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.agents.getMany.queryOptions({
    ...filters
  }));
  return (
    <>
    <ListHeader/>
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<AgentsViewLoading/>}>
      <AgentsView />
      </Suspense>
    </HydrationBoundary>
    </>
  );
};

export default page;
