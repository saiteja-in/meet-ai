import { EmptyState } from "./Empty-state-meetings"

export const ProcessingState = () => {
  return (
    <div className="bg-background rounded-lg px-4 py-5 flex flex-col gap-y-8 items-center justify-center">
      <EmptyState
        image="/svgs/processing.svg"
        title="Meeting completed"
        description="This meeting was completed, a summary will appear soon"
      />
    </div>
  )
}
