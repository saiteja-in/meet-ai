"use client";
import { ErrorState } from "@/components/error-state";
import { Loader } from "@/components/loading-state";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/lib/trpc/client";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

export const AgentsView = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.agents.getMany.queryOptions());
  return <div>
    {JSON.stringify(data, null, 2)}
    </div>;
};

export const AgentsViewLoading = () => {
  return (
    <div className="flex justify-center items-center h-full w-full">
      <Loader />
    </div>
  );
};
