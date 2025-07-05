import type { AppRouter } from "@/lib/trpc/routers/_app";
import {inferRouterOutputs} from "@trpc/server"


export type AgentGetOne = inferRouterOutputs<AppRouter>['agents']["getOne"];
export type MeetingGetOne = inferRouterOutputs<AppRouter>['meetings']["getOne"];
export type MeetingsGetMany = inferRouterOutputs<AppRouter>['meetings']["getMany"]["items"];
export type AgentsGetMany = inferRouterOutputs<AppRouter>['agents']["getMany"]["items"];
