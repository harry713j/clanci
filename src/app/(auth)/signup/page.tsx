"use client";
import React, { useCallback, useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Input,
  Button,
  Link as NextUILink,
  Spinner,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
} from "@nextui-org/react";
import * as z from "zod";
import { signUpSchema } from "@/schemas/signUpSchema";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { Eye, EyeOff } from "lucide-react";

export default function SignUpPage() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [username, setUsername] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState<boolean>(false);
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const router = useRouter();
  const debounced = useDebouncedCallback(setUsername, 500);
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const checkUniqueUsername = useCallback(async () => {
    if (username.trim().length === 0) {
      setUsernameMessage("");
      return;
    }

    if (username.trim().length >= 4) {
      setIsCheckingUsername(true);
      setUsernameMessage("");
      try {
        const response = await axios.get<ApiResponse>(
          `/api/unique-username?username=${username}`
        );

        if (response.data.message === "Username is available") {
          setUsernameMessage("");
        } else {
          setUsernameMessage(
            response.data.message || "Username is unavailable"
          );
        }
      } catch (error) {
        console.log("Error in checking unique username", error);
        const axiosError = error as AxiosError<ApiResponse>;
        setUsernameMessage(
          axiosError.response?.data.message ?? "Failed checking username"
        );
      } finally {
        setIsCheckingUsername(false);
      }
    } else {
      setUsernameMessage("Username must be at least 4 characters");
    }
  }, [username]);

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>(`/api/sign-up`, data);

      toast.success(response.data.message ?? "Successfully register user");
      router.replace(`/verify/${username}`);
    } catch (error) {
      console.log("Error registering user", error);
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ?? "Failed to register user"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    checkUniqueUsername();
  }, [username, checkUniqueUsername]);

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <Card className="w-2/5 px-16 py-12 flex flex-col items-center space-y-6">
        <CardHeader className="flex items-center justify-center mb-2">
          <h2 className="text-4xl text-default-600 ">Join Clanci</h2>
        </CardHeader>
        <CardBody className="">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col space-y-3"
          >
            <div>
              <Controller
                name="username"
                control={form.control}
                rules={{
                  required: "Username is required",
                  minLength: {
                    value: 4,
                    message: "Username must be at least 4 characters",
                  },
                }}
                render={({ field }) => (
                  <Input
                    label="Username"
                    variant="bordered"
                    isInvalid={
                      !!form.formState.errors.username ||
                      (!!usernameMessage && username.length >= 4)
                    }
                    color={
                      form.formState.errors.username || usernameMessage
                        ? "danger"
                        : "success"
                    }
                    errorMessage={
                      form.formState.errors.username?.message || usernameMessage
                    }
                    radius="sm"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      debounced(e.target.value);
                    }}
                    endContent={
                      isCheckingUsername && (
                        <Spinner size="sm" color="primary" />
                      )
                    }
                  />
                )}
              />
            </div>
            <div>
              <Input
                type="email"
                label="Email"
                variant="bordered"
                isInvalid={!!form.formState.errors.email}
                color={form.formState.errors.email ? "danger" : "success"}
                errorMessage={form.formState.errors.email?.message}
                radius="sm"
                {...form.register("email", {
                  required: "Email is required",
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
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
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
                Register
              </Button>
            </div>
          </form>
        </CardBody>
        <CardFooter className="flex flex-col items-center space-y-3">
          <Divider />
          <p className="text-center text-default-400">
            Already have an account? Click here to&nbsp;
            <NextUILink href="/login" color="primary" isBlock>
              Login
            </NextUILink>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
