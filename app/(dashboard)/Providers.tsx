import { SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import { AppSidebar } from "./_components/app-sidebar";
import { AppSidebarInset } from "./_components/app-sidebar-inset";
import { currentUser } from "@/lib/user";

type ProviderProps = {
  children: React.ReactNode;
};

export async function Providers({ children }: ProviderProps) {
  const cookieStore = await cookies();
  const user = await currentUser();

  const sidebarState = cookieStore.get("sidebar:state")?.value;
  //* get sidebar width from cookie
  const sidebarWidth = cookieStore.get("sidebar:width")?.value;

  let defaultOpen = true;

  if (sidebarState) {
    defaultOpen = sidebarState === "true";
  }

  return (
    <SidebarProvider defaultOpen={defaultOpen} defaultWidth={sidebarWidth}>
      <AppSidebar user={user}>
        <AppSidebarInset>{children}</AppSidebarInset>
      </AppSidebar>
    </SidebarProvider>
  );
}