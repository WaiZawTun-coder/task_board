"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/UI/button";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-lg text-center">
        <h1 className="text-6xl font-bold tracking-tight">Page Not Found</h1>

        <p className="mt-6 text-muted-foreground">
          Sorry, the page you&apos;re looking for doesn&apos;t exist, may have
          been moved, or the URL is incorrect.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Button onClick={() => router.push("/")}>
            <Home className="h-4 w-4" /> Home
          </Button>
          <Button variant="ghost" onClick={() => history.back()}>
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </main>
  );
}
