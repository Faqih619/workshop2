"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditPublishedOpportunity() {
  const router = useRouter();
  const params = useParams();

  const id = params.id as string;

  useEffect(() => {
    if (id) {
      router.replace(
        `/employer/opportunities/create?id=${encodeURIComponent(id)}&mode=published`
      );
    }
  }, [id, router]);

  return (
    <div className="p-8 text-sm text-slate-500">
      Opening opportunity editor...
    </div>
  );
}

/* 
  [Ponytail Log: Kept the redirect trampoline pristine; reuses the create form with query params to eliminate code duplication entirely.]
*/