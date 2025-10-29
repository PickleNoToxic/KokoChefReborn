"use client";

import { useAuth } from "@/context/auth-context";
import { useRecipes } from "@/context/recipe-context";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { AlarmClock, Tags } from "lucide-react";

export default function BookmarksPage() {
  const { user, isLoading } = useAuth();
  const { bookmarks, toggleBookmark, getBookmarkedRecipes } = useRecipes();
  const router = useRouter();
  const [bookmarkedRecipes, setBookmarkedRecipes] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const recipes = getBookmarkedRecipes();
    setBookmarkedRecipes(recipes);
  }, [bookmarks, getBookmarkedRecipes]);

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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Resep yang Disimpan
          </h1>
          <p className="text-muted-foreground">
            Kumpulan resep favoritmu untuk dilihat nanti
          </p>
        </div>

        {bookmarkedRecipes.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-muted-foreground text-lg mb-4">
                Belum ada resep yang disimpan.
              </p>
              <Link href="/">
                <Button className="bg-primary hover:bg-primary/90">
                  Cari Resep
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarkedRecipes.map((recipe) => (
              <Card
                key={recipe.id}
                className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
              >
                <div className="relative h-48 w-full overflow-hidden bg-muted">
                  <Image
                    src={recipe.image || "/placeholder.svg"}
                    alt={recipe.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform"
                  />
                </div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg line-clamp-2">
                        {recipe.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        oleh {recipe.creatorName}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3 flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {recipe.description}
                  </p>
                  <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <AlarmClock size={20} /> {recipe.cookingTime} menit
                    </span>
                    <span className="flex items-center gap-2">
                      <Tags size={20} /> {recipe.category}{" "}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="gap-2">
                  <Link href={`/recipe/${recipe.id}`} className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      Lihat Resep
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
