// app/components/Navbar.tsx (or wherever your Navbar lives)
import { currentUser } from "@/lib/user";
import NavbarClient from "./navbar-client";

export default async function Navbar() {
  const user = await currentUser();

  // If you want, you can pass additional server-derived props here.
  return <NavbarClient user={user || null} />;
}
