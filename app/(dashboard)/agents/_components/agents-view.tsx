"use client";
import { columns } from "@/components/columns";
import { DataPagination } from "@/components/data-pagination";
import { DataTable } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
// import { ErrorState } from "@/components/error-state";
import { Loader } from "@/components/loading-state";
// import { ResponsiveDialog } from "@/components/responsive-dialog";
// import { Button } from "@/components/ui/button";
import { useAgentsFilters } from "@/hooks/use-agents-filter";
import { useTRPC } from "@/lib/trpc/client";
import {  useSuspenseQuery } from "@tanstack/react-query";
import { Files, FileText, Link } from "lucide-react";
import { useRouter } from "next/navigation";

export const AgentsView = () => {
  const [filters, setFilters] = useAgentsFilters();
  const router = useRouter()
  const trpc = useTRPC();
   const { data } = useSuspenseQuery(
    trpc.agents.getMany.queryOptions({
      ...filters,
    })
  );
  return (
    <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
    <DataTable data={data.items} columns={columns}
    onRowClick={(row)=>router.push(`/agents/${row.id}`)}
    />
     <DataPagination
        page={filters.page}
        totalPages={data.totalPages}
        onPageChange={(page) => setFilters({ page })}
      />

      {data.items.length === 0 && (
        <div className="flex items-center justify-center w-full">
          <EmptyState
             icons={[FileText, Link, Files]}
            title="Create Your first agent"
            description="Create an agent to join your meetings. Each agents will follow your instructions and can interact with participants during the call. "
          />
        </div>
      )}
    </div>
  )
};

export const AgentsViewLoading = () => {
  return (
    <div className="flex justify-center items-center h-full w-full">
      <Loader />
    </div>
  );
};
