"use client";
import { NextUIProvider } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import React from "react";

function ProviderNextUI({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return <NextUIProvider navigate={router.push}>{children}</NextUIProvider>;
}

export default ProviderNextUI;
