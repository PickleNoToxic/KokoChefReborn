"use client";

import { useAuth } from "@/context/auth-context";
import { useRecipes } from "@/context/recipe-context";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import Image from "next/image";
import { Tags, Timer, Bookmark, MoveLeft } from "lucide-react";

export default function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, isLoading } = useAuth();
  const { recipes, bookmarks, toggleBookmark } = useRecipes();
  const router = useRouter();
  const [recipe, setRecipe] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const foundRecipe = recipes.find((r) => r.id === id);
    setRecipe(foundRecipe);
  }, [recipes, id]);

  if (isLoading || !recipe) {
    return (
      <div className="min-h-screen flex items-center text-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isBookmarked = bookmarks.includes(recipe.id);

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <MoveLeft/>Kembali
          </Button>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Recipe Image */}
          <div className="relative h-96 w-full overflow-hidden rounded-lg bg-muted">
            <Image
              src={recipe.image || "/placeholder.svg"}
              alt={recipe.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Recipe Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-4xl font-bold text-foreground">
                  {recipe.title}
                </h1>
                <Button
                  variant={isBookmarked ? "default" : "outline"}
                  size="lg"
                  onClick={() => toggleBookmark(recipe.id)}
                  className="whitespace-nowrap md:min-w-[9rem]"
                >
                  {isBookmarked ? (
                    <Bookmark className="fill-current" />
                  ) : (
                    <Bookmark />
                  )}
                  <span className="hidden md:block">
                    {isBookmarked ? "Bookmarked" : "Bookmark"}
                  </span>
                </Button>
              </div>
              <p className="text-muted-foreground">oleh {recipe.creatorName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="flex flex-col items-center justify-between gap-2 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 text-center">
                <div className="space-y-4 flex flex-col w-fit items-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                    <Timer className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">Durasi</p>
                </div>
                <div className="text-2xl font-semibold text-primary flex flex-1 justify-center items-center">
                  <p>{recipe.cookingTime} menit</p>
                </div>
              </Card>

              <Card className="flex flex-col items-center justify-between gap-2 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 text-center">
                <div className="space-y-4 flex flex-col w-fit items-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                    <Tags className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">Kategori</p>
                </div>
                <div className="text-2xl font-semibold text-primary flex flex-1 justify-center items-center">
                  <p>{recipe.category} </p>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Ingredients and Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          {/* Ingredients */}
          <Card>
            <CardHeader>
              <CardTitle>Bahan-bahan</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient: string, index: number) => (
                  <li
                    key={index}
                    className="flex text-foreground items-center gap-3 list-disc"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center text-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    {ingredient}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Langkah-langkah</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {recipe.steps.map((step: string, index: number) => (
                  <li key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center text-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <p className="text-foreground pt-1">{step}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
