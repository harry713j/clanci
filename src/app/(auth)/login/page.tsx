"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Input,
  Button,
  Link as NextUILink,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
} from "@nextui-org/react";
import * as z from "zod";
import { loginSchema } from "@/schemas/loginSchema";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      redirect: false,
      identifier: data.identifier,
      password: data.password,
    });

    setIsSubmitting(false);

    if (result?.error) {
      if (result.error === "CredentialsSignin") {
        toast.error("Invalid Credentials");
      } else {
        toast.error(result.error);
      }
    }

    if (result?.url) {
      router.replace("/");
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <Card className="w-2/5 px-16 py-12 flex flex-col items-center space-y-6">
        <CardHeader className="flex items-center justify-center mb-2">
          <h2 className="text-4xl text-default-600 ">Welcome to Clanci</h2>
        </CardHeader>
        <CardBody className="">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col space-y-3"
          >
            <div>
              <Input
                label="Username / Email"
                variant="bordered"
                isInvalid={!!form.formState.errors.identifier}
                color={form.formState.errors.identifier ? "danger" : "success"}
                errorMessage={form.formState.errors.identifier?.message}
                radius="sm"
                {...form.register("identifier", {
                  required: "Username or Email is required",
                })}
              />
            </div>
            <div>
              <Input
                type={isPasswordVisible ? "text" : "password"}
                label="Password"
                variant="bordered"
                isInvalid={!!form.formState.errors.password}
                color={form.formState.errors.password ? "danger" : "success"}
                errorMessage={form.formState.errors.password?.message}
                radius="sm"
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    aria-label={
                      isPasswordVisible ? "Hide password" : "Show password"
                    }
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    {isPasswordVisible ? (
                      <EyeOff className="text-default-400" />
                    ) : (
                      <Eye className="text-default-400" />
                    )}
                  </button>
                }
                {...form.register("password", {
                  required: "Password is required",
                })}
              />
            </div>
            <div>
              <Button
                type="submit"
                color="primary"
                radius="sm"
                isLoading={isSubmitting}
                size="md"
                className=""
              >
                Log in
              </Button>
            </div>
          </form>
        </CardBody>
        <CardFooter className="flex flex-col items-center space-y-3">
          <Divider />
          <p className="text-center text-default-400">
            Don&apos;t have an account? Click here to&nbsp;
            <NextUILink href="/signup" color="primary" isBlock>
              Create
            </NextUILink>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
