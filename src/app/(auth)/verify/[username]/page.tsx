"use client";
import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Input,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from "@nextui-org/react";
import * as z from "zod";
import { verifyEmailSchema } from "@/schemas/verifyEmailSchema";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function VerificationPage({
  params,
}: {
  params: { username: string };
}) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof verifyEmailSchema>>({
    resolver: zodResolver(verifyEmailSchema),
    mode: "onBlur",
    defaultValues: {
      verificationCode: "",
    },
  });

  const onSubmitCode = async (data: z.infer<typeof verifyEmailSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>(`/api/verify-code`, {
        username: params.username,
        code: data.verificationCode,
      });

      toast.success(response.data.message);

      router.replace("/login");
    } catch (error) {
      console.log("Error in verify code", error);
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ?? "Email verification failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <Card className="w-2/5 px-16 py-12 flex flex-col items-center space-y-6">
        <CardHeader className="flex flex-col items-start mb-2">
          <h2 className="text-4xl text-default-600 ">Verify Yourself</h2>
        </CardHeader>
        <CardBody>
          <form
            onSubmit={form.handleSubmit(onSubmitCode)}
            className="flex flex-col space-y-3"
          >
            <div>
              <Input
                label="Verification Code"
                variant="bordered"
                isInvalid={!!form.formState.errors.verificationCode}
                color={
                  form.formState.errors.verificationCode ? "danger" : "success"
                }
                errorMessage={form.formState.errors.verificationCode?.message}
                radius="sm"
                {...form.register("verificationCode", {
                  required: "Verification code is required",
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
                Verify
              </Button>
            </div>
          </form>
        </CardBody>
        <CardFooter>
          <p className="text-center text-sm text-default-400">
            We have send you a verification code to your registered email.
            Please check your email and enter the code.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
