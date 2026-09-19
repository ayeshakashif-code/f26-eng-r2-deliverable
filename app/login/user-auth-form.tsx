"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type BaseSyntheticEvent } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Template: https://github.com/shadcn/taxonomy/blob/main/components/user-auth-form.tsx

// Create Zod object schema with validations
const userAuthSchema = z.object({
  email: z.string().email(),
});

// Use Zod to extract inferred type from schema
type FormData = z.infer<typeof userAuthSchema>;

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  nextPath: string;
}

export default function UserAuthForm({ nextPath, className, ...props }: UserAuthFormProps) {
  // Create form with react-hook-form and use Zod schema to validate the form submission (with resolver)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(userAuthSchema),
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState(false);

  // Obtain supabase client from context provider
  const supabaseClient = createBrowserSupabaseClient();

  const onSubmit = async (input: FormData) => {
    setIsLoading(true);
    const callbackUrl = new URL("/auth/callback", location.origin);
    callbackUrl.searchParams.set("next", nextPath);

    // Supabase magic link sign-in
    const { error } = await supabaseClient.auth.signInWithOtp({
      email: input.email.toLowerCase(),
      options: {
        emailRedirectTo: callbackUrl.toString(),
      },
    });

    setIsLoading(false);

    if (error) {
      const isEmailRateLimited = error.status === 429 || error.message.toLowerCase().includes("email rate limit");
      return toast({
        title: isEmailRateLimited ? "Email limit reached" : "Unable to send sign-in link",
        description: isEmailRateLimited
          ? "Supabase's temporary email quota is full. Wait for it to reset or configure custom SMTP before trying again."
          : error.message,
        variant: "destructive",
      });
    }

    setEmailSent(true);
    return toast({
      title: "Check your email",
      description: "We sent you a login link. Be sure to check your spam too.",
    });
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={(e: BaseSyntheticEvent) => void handleSubmit(onSubmit)(e)}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              className="h-12"
              {...register("email")}
            />
            {errors?.email && <p className="px-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>
          <Button className="h-12" disabled={isLoading || emailSent}>
            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            {emailSent ? "Sign-in link sent" : "Sign in with email"}
          </Button>
          {emailSent && (
            <p className="text-center text-xs text-muted-foreground" role="status">
              Use the newest email link in this browser. Sending another link can invalidate the first one.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
