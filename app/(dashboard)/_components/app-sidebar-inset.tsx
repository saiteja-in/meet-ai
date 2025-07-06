"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  ArrowUpRight,
  CircleFadingPlus,
  FileInput,
  FolderPlus,
  Search,
  Home,
  Settings,
  User,
  Mic,
  Bot,
} from "lucide-react";
import { useId, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function AppSidebarInset({ children }: { children: React.ReactNode }) {
  const searchId = useId();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+K (Windows/Linux) or Cmd+K (Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        setOpen((open) => !open);
      }
    };
              
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNavigation = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <>
      <SidebarInset className="overflow-x-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 justify-between">
          <div className="flex items-center gap-2 px-4 flex-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarTrigger className="-ml-1" />
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start">
                Toggle Sidebar <kbd className="ml-2">⌘+b</kbd>
              </TooltipContent>
            </Tooltip>
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
            <button
              className="inline-flex h-8 w-80 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow hover:bg-accent/50 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20"
              onClick={() => setOpen(true)}
            >
              <span className="flex grow items-center">
                <Search
                  className="-ms-1 me-3 text-muted-foreground/80"
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <span className="font-normal text-muted-foreground/70">
                  Search...
                </span>
              </span>
              <kbd className="-me-1 ms-3 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                ⌘K
              </kbd>
            </button>
          </div>
        </header>
        {children}
      </SidebarInset>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => handleNavigation("/voice-generation")}>
              <Mic
                size={16}
                strokeWidth={2}
                className="opacity-60"
                aria-hidden="true"
              />
              <span>Generate Voice</span>
              <CommandShortcut className="justify-center">⌘G</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => handleNavigation("/new-project")}>
              <FolderPlus
                size={16}
                strokeWidth={2}
                className="opacity-60"
                aria-hidden="true"
              />
              <span>New Project</span>
              <CommandShortcut className="justify-center">⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => handleNavigation("/import")}>
              <FileInput
                size={16}
                strokeWidth={2}
                className="opacity-60"
                aria-hidden="true"
              />
              <span>Import Audio</span>
              <CommandShortcut className="justify-center">⌘I</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => handleNavigation("/ai-assistant")}>
              <Bot
                size={16}
                strokeWidth={2}
                className="opacity-60"
                aria-hidden="true"
              />
              <span>AI Assistant</span>
              <CommandShortcut className="justify-center">⌘A</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => handleNavigation("/")}>
              <Home
                size={16}
                strokeWidth={2}
                className="opacity-60"
                aria-hidden="true"
              />
              <span>Go to Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => handleNavigation("/playground")}>
              <ArrowUpRight
                size={16}
                strokeWidth={2}
                className="opacity-60"
                aria-hidden="true"
              />
              <span>Go to Playground</span>
            </CommandItem>
            <CommandItem onSelect={() => handleNavigation("/models")}>
              <ArrowUpRight
                size={16}
                strokeWidth={2}
                className="opacity-60"
                aria-hidden="true"
              />
              <span>Go to Models</span>
            </CommandItem>
            <CommandItem onSelect={() => handleNavigation("/settings")}>
              <Settings
                size={16}
                strokeWidth={2}
                className="opacity-60"
                aria-hidden="true"
              />
              <span>Go to Settings</span>
            </CommandItem>
            <CommandItem onSelect={() => handleNavigation("/profile")}>
              <User
                size={16}
                strokeWidth={2}
                className="opacity-60"
                aria-hidden="true"
              />
              <span>Go to Profile</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
