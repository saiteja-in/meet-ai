"use client";
import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GithubIcon, Loader, Loader2, Send } from "lucide-react";
import GoogleSVG from "@/public/svgs/GoogleSVG";
import GithubSVG from "@/public/svgs/GithubSVG";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
export function LoginForm() {
  const router = useRouter();
  const [emailPending, startEmailTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [githubPending, startGithubTransition] = useTransition();
  const [googlePending, startGoogleTransition] = useTransition();
  
  async function signInWithGithub() {
    startGithubTransition(async () => {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Singed in with Github, you will be redirected...");
          },
          onError: () => {
            toast.error("Internal Server Error");
          },
        },
      });
    });
  }

  async function signInWithGoogle() {
    startGoogleTransition(async () => {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed in with Google, you will be redirected...");
          },
          onError: () => {
            toast.error("Internal Server Error");
          },
        },
      });
    });
  }
  function signInWithEmail() {
    startEmailTransition(async () => {
      await authClient.emailOtp.sendVerificationOtp({
        email: email,
        type: "sign-in",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Email sent");
            router.push(`/verify-request?email=${email}`);
          },
          onError: () => {
            toast.error("Erorr sending email");
          },
        },
      });
    });
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Welcome Back!</CardTitle>
        <CardDescription>
          Login with your Github or Email Account
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <Button 
          disabled={googlePending}
          onClick={signInWithGoogle}
          className="w-full" 
          variant="outline"
        >
          {googlePending ? (
            <>
              <Loader className="size-4 animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            <>
              <GoogleSVG />
              Sign in with Google
            </>
          )}
        </Button>
        <Button
          disabled={githubPending}
          onClick={signInWithGithub}
          className="w-full"
          variant="outline"
        >
          {githubPending ? (
            <>
              <Loader className="size-4 animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            <>
              <GithubSVG />
              Sign in with GitHub
            </>
          )}
        </Button>

        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="john@example.com"
              required
            />
          </div>

          <Button onClick={signInWithEmail} disabled={emailPending}>
            {emailPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <Send className="size-4" />
                <span>Continue with Email</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}