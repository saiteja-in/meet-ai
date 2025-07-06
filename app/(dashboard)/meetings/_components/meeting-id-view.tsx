"use client";

import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";

import { ErrorState } from "@/components/error-state";
import { useTRPC } from "@/lib/trpc/client";
import { useConfirm } from "@/hooks/use-confirm";
import { UpdateMeetingDialog } from "@/components/update-meeting-dialog";
import { MeetingIdViewHeader } from "./meeting-id-view-header";
import { CancelledState } from "@/components/cancelled-state";
import { ProcessingState } from "@/components/processing-state";
import { ActiveState } from "@/components/active-state";
import { UpcomingState } from "@/components/upcoming-state";
import { Loader } from "@/components/loading-state";


interface Props {
  meetingId: string;
};

export const MeetingIdView = ({ meetingId }: Props) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [updateMeetingDialogOpen, setUpdateMeetingDialogOpen] = useState(false);

  const [RemoveConfirmation, confirmRemove] = useConfirm(
    "Are you sure?",
    "The following action will remove this meeting"
  )

  const { data } = useSuspenseQuery(
    trpc.meetings.getOne.queryOptions({ id: meetingId })
  );

  const removeMeeting = useMutation(
    trpc.meetings.remove.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}));
        // TODO: Invalidate free tier usage.
        router.push("/meetings");
      },
      onError: (error) => toast.error(error.message),
    })
  );

  const handleRemoveMeeting = async () => {
    const ok = await confirmRemove();

    if (!ok) return;

    await removeMeeting.mutateAsync({ id: meetingId });
  };

  const isActive = data.status === "active";
  const isUpcoming = data.status === "upcoming";
  const isCancelled = data.status === "cancelled";
  const isCompleted = data.status === "completed";
  const isProcessing = data.status === "processing";

  return (
    <>
      <RemoveConfirmation />
      <UpdateMeetingDialog
        open={updateMeetingDialogOpen}
        onOpenChange={setUpdateMeetingDialogOpen}
        initialValues={data}
      />
      <div className="flex flex-1 flex-col px-4 py-4 md:px-8 gap-y-4">
        <MeetingIdViewHeader
          meetingId={meetingId}
          meetingName={data.name}
          onEdit={() => setUpdateMeetingDialogOpen(true)}
          onRemove={handleRemoveMeeting}
        />
        {isCancelled && <CancelledState />}
        {isProcessing && <ProcessingState />}
        {isCompleted && <div>Completed</div>}
        {isActive && (
          <ActiveState
            meetingId={meetingId}
          />
        )}
        {isUpcoming && (
          <UpcomingState
            meetingId={meetingId}
            onCancelMeeting={() => { }}
            isCancelling={false}
          />)
        }
      </div>
    </>
  )
};

export const MeetingIdViewLoading = () => {
  return (
    <div className="flex justify-center items-center h-full w-full">
    <Loader />
  </div>
  );
};

export const MeetingIdViewError = () => {
  return (
    <ErrorState
      title="Error loading meeting"
      description="Please try again later"
    />
  );
};
