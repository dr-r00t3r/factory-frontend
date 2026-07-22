"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function ProcessesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/sessions");
  }, [router]);

  return <LoadingSpinner className="min-h-[60vh]" size="lg" />;
}
