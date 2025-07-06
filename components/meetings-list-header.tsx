"use client";

import { useState } from "react";
import { PlusIcon, XCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { NewMeetingDialog } from "./new-meeting-dialog";
import { MeetingsSearchFilter } from "./meetings-search-filter";
import { useMeetingsFilters } from "@/hooks/use-meetings-filter";
import { DEFAULT_PAGE } from "@/prisma/types/constants";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { StatusFilter } from "./status-filter";
import { AgentIdFilter } from "./agent-id-filter";

export const MeetingsListHeader = () => {
  const [filter, setFilters] = useMeetingsFilters();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isAnyFilterModified = !!filter.search || !!filter.status || !!filter.agentId;

  const onClearFilter = () => {
    setFilters({
      agentId: "",
      search: "",
      status: null,
      page: DEFAULT_PAGE,
    })
  }

  return (
    <>
      <NewMeetingDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      <div className="px-4 py-4 md:px-8 flex flex-col gap-y-4">
        <div className="flex justify-between items-center">
          <h5 className="font-medium text-xl">My Meetings</h5>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusIcon />
            New Meeting
          </Button>
        </div>
        <ScrollArea>
          <div className="flex items-center p-1 gap-x-2">
            <MeetingsSearchFilter />
            <StatusFilter />
            <AgentIdFilter />
            {isAnyFilterModified && (
              <Button variant={"outline"} onClick={onClearFilter}>
                <XCircleIcon className="size-4" />
                Clear
              </Button>
            )}
          </div>
          <ScrollBar orientation="horizontal"/>
        </ScrollArea>
      </div>
    </>
  );
};
