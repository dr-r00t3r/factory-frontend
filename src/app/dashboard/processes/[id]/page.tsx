"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function ProcessDetailRedirect() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/dashboard/sessions/${params.id}`);
  }, [params.id, router]);

  return <LoadingSpinner className="min-h-[60vh]" size="lg" />;
}
