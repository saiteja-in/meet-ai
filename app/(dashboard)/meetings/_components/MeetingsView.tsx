"use client"
import { ErrorState } from "@/components/error-state";
import { useTRPC } from "@/lib/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export const MeetingsView = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.meetings.getMany.queryOptions({}));
  return <div>{JSON.stringify(data)}</div>;
};

export const MeetingsViewError = () => {
  return (
    <ErrorState title="Error loading Meetings" description="Something went wrong" />
  );
};
