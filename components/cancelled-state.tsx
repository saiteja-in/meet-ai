import { EmptyState } from "./Empty-state-meetings"

export const CancelledState = () => {
  return (
    <div className="bg-background rounded-lg px-4 py-5 flex flex-col gap-y-8 items-center justify-center">
      <EmptyState
        image="/svgs/cancelled.svg"
        title="Meeting cancelled"
        description="This meeting was cancelled"
      />
    </div>
  )
}
