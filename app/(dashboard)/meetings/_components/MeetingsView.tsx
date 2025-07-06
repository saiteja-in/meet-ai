"use client";
import { DataTable } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { useTRPC } from "@/lib/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { columns } from "./columns";
import { useMeetingsFilters } from "@/hooks/use-meetings-filter";
import { Files, FileText, Link } from "lucide-react";
import { useRouter } from "next/navigation";
import { DataPagination } from "@/components/data-pagination";

export const MeetingsView = () => {
  const trpc = useTRPC();
  const router = useRouter();
  const [filters, setFilters] = useMeetingsFilters();
  const { data } = useSuspenseQuery(
    trpc.meetings.getMany.queryOptions({
      ...filters,
    })
  );
  return (
    <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
      <DataTable
        data={data.items}
        columns={columns}
        onRowClick={(row) => router.push(`/meetings/${row.id}`)}
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
  );
};

export const MeetingsViewError = () => {
  return (
    <ErrorState
      title="Error loading Meetings"
      description="Something went wrong"
    />
  );
};
