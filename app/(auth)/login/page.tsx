import {LoginForm}  from "./_components/LoginForm";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/user";

export default async function LoginPage() {
  const user=await currentUser();

  if (user) {
    return redirect("/");
  }
  return <LoginForm />;
}
