"use client";

import { ColumnDef } from "@tanstack/react-table";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { CornerDownRightIcon, VideoIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AgentGetOne } from "@/prisma/types/types";

export const columns: ColumnDef<AgentGetOne>[] = [
  {
    accessorKey: "name",
    header: "Agent Name",
    cell: ({ row }) => (
      <div className="flex flex-col gap-y-1">
        <div className="flex items-center gap-x-2">
          <GeneratedAvatar variant="botttsNeutral" seed={row.original.name} />
          <span className="font-semibold capitalize">{row.original.name}</span>
        </div>
        <div className="flex items-center gap-x-2">
          <div className="flex items-center gap-x-1">
            <CornerDownRightIcon className="size-3 text-foreground" />
            <span className="text-sm text-muted-foreground max-w-[200px truncate capitalize">
              {row.original.instructions}
            </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey:"meetingCount",
  header:"Meetings",
    cell:({row})=>(
      <Badge
     variant="outline"
     className="flex items-center gap-x-2 [&>svg]:size-4"
     >
        <VideoIcon className="text-blue-700"/>
      {row.original.meetingCount} {row.original.meetingCount === 1 ? "meeting" : "meetings"}
      </Badge>
    )
  }
];
