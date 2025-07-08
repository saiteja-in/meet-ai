"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, Suspense } from "react";
import { toast } from "sonner";

function VerifyRequestContent() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState<"otp" | "name">("otp");
  const [otpPending, startOtpTransition] = useTransition();
  const [namePending, startNameTransition] = useTransition();
  const params = useSearchParams();
  const email = params.get("email") as string;
  const isOtpCompleted = otp.length === 6;

  function verifyOtp() {
    startOtpTransition(async () => {
      await authClient.signIn.emailOtp({
        email: email,
        otp: otp,
        fetchOptions: {
          onSuccess: async () => {
            toast.success("Email verified");
            
            // Check if user already has a name by getting the current session
            try {
              const session = await authClient.getSession();
              
              // If user has a name, redirect to home
              if (session?.data?.user?.name) {
                toast.success("Welcome back!");
                router.push("/");
              } else {
                // If user doesn't have a name, go to name collection step
                setStep("name");
              }
            } catch (error) {
              toast.error(`Error in verifying ${error}`)
              // Fallback: if we can't get session, assume new user and ask for name
              setStep("name");
            }
          },
          onError: () => {
            toast.error("Error verifying Email/OTP");
          },
        },
      });
    });
  }

  function updateUserName() {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    startNameTransition(async () => {
      await authClient.updateUser({
        name: name.trim(),
        fetchOptions: {
          onSuccess: () => {
            toast.success("Profile completed successfully!");
            router.push("/");
          },
          onError: () => {
            toast.error("Error updating profile");
          },
        },
      });
    });
  }

  if (step === "name") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-xl mb-1">Complete your profile</CardTitle>
          <CardDescription>
            We&apos;d love to know your name to personalize your experience!
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
              onKeyDown={(e) => {
                if (e.key === "Enter" && name.trim()) {
                  updateUserName();
                }
              }}
            />
          </div>
          <Button
            onClick={updateUserName}
            disabled={namePending || !name.trim()}
            className="w-full"
          >
            {namePending ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                <span>Saving...</span>
              </>
            ) : (
              "Complete Setup"
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-xl mb-1">Please check your email</CardTitle>
        <CardDescription>
          We have sent a verification code to{" "}
          <span className="font-medium">{email}</span>. Please enter the 6-digit code below.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <InputOTP
            value={otp}
            onChange={(value) => setOtp(value)}
            maxLength={6}
            className="gap-3"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <p className="text-sm text-muted-foreground mt-2">
            Enter the 6-digit code sent to your email
          </p>
        </div>
        <Button
          onClick={verifyOtp}
          disabled={otpPending || !isOtpCompleted}
          className="w-full mt-2"
        >
          {otpPending ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              <span>Verifying...</span>
            </>
          ) : (
            "Verify & Continue"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function VerifyRequest() {
  return (
    <Suspense fallback={
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="size-6 animate-spin" />
        </CardContent>
      </Card>
    }>
      <VerifyRequestContent />
    </Suspense>
  );
}