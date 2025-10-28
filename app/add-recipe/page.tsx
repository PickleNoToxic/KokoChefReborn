"use client";

import { useAuth } from "@/context/auth-context";
import { Navbar } from "@/components/navbar";
import { RecipeForm } from "@/components/recipe-form";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AddRecipePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Buat Resep Baru
          </h1>
          <p className="text-muted-foreground">
            Bagikan resepmu dengan pengguna lainnya
          </p>
        </div>
        <RecipeForm />
      </main>
    </>
  );
}
