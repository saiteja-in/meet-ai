"use client";

import { ErrorState } from "@/components/error-state";
import { useTRPC } from "@/lib/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CallProvider } from "./call-provider";
// import { CallProvider } from "../components/call-provider";

interface Props {
  meetingId: string;
};

export const CallView = ({ meetingId }: Props) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.meetings.getOne.queryOptions({ id: meetingId }));
  
  if (data.status === "completed") {
    return (
      <div className="h-screen flex justify-center items-center">
        <ErrorState 
        title="This meeting has ended"
        description="You can no longer join this meeting"
        />
      </div>
    )
  }
//   return(
//     <div>{data.name}{meetingId}</div>
//   )
  
  return <CallProvider meetingId={meetingId} meetingName={data.name} />
};