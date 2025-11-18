"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import useAxios, { ApiError, ApiResponse } from "@/hooks/use-axios";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { ShieldCheck, AlertCircle } from "lucide-react";

const LoginPage = () => {
  const api = useAxios();
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const formSchema = z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(8),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate, isPending, error } = useMutation<
    ApiResponse<{
      admin: {
        _id: string;
        name: string;
        email: string;
      };
      token: string;
    }>,
    ApiError,
    z.infer<typeof formSchema>
  >({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return (await api.post("/admin/login", data)).data;
    },
    onSuccess: ({ data }) => {
      toast.success("Login successful");
      const { admin, token } = data;
      if (admin && token) {
        login(admin, token);
        router.push("/");
      } else {
        toast.error("Login failed");
      }
    },
    onError: (error: ApiError) => {
      console.log("Error", error.response.data.message);
      form.setError("root", {
        message: error.response?.data?.message || "An error occurred",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    mutate(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            Brokwise Admin
          </CardTitle>
          <CardDescription className="text-base">
            Sign in to access your admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {form.formState.errors.root && (
                <Alert variant="destructive" className="animate-in fade-in-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {form.formState.errors.root.message}
                  </AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="admin@example.com"
                        type="email"
                        autoComplete="email"
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter your password"
                        type="password"
                        autoComplete="current-password"
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-11 text-base font-semibold"
              >
                {isPending ? (
                  <>
                    <span className="mr-2">Signing in</span>
                    <span className="animate-pulse">...</span>
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
