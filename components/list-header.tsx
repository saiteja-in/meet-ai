"use client";
import { Button } from "@/components/ui/button";
import { PlusIcon, XCircleIcon } from "lucide-react";
import { NewAgentDialog } from "./new-agent-dialog";
import { useState } from "react";
import { useAgentsFilters } from "@/hooks/use-agents-filter";
import { DEFAULT_PAGE } from "@/prisma/types/constants";
import { AgentsSearchFilter } from "./agents-search-filter";

export const ListHeader = () => {
  const [filters, setFilters] = useAgentsFilters();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
const isAnyFilterModified = !!filters.search;
const onClearFilters = ()=>{
    setFilters({
        search:"",
        page:DEFAULT_PAGE
    })
}

  return (
    <>
      <NewAgentDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      <div className="py-4 px-4 md:px-8 flex flex-col gap-y-4">
        <div className="flex items-center justify-between">
          <h5 className="font-medium text-xl">My Agents</h5>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusIcon />
            New Agent
          </Button>
        </div>
        <div className="flex item-center gap-x-2 p-1">
          <AgentsSearchFilter />
          {isAnyFilterModified && (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
                <XCircleIcon />
            </Button>
          )}
        </div>
      </div>
    </>
  );
};
