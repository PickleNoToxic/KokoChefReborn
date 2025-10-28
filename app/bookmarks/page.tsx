"use client"

import { useAuth } from "@/context/auth-context"
import { useRecipes } from "@/context/recipe-context"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"

export default function BookmarksPage() {
  const { user, isLoading } = useAuth()
  const { bookmarks, toggleBookmark, getBookmarkedRecipes } = useRecipes()
  const router = useRouter()
  const [bookmarkedRecipes, setBookmarkedRecipes] = useState<any[]>([])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const recipes = getBookmarkedRecipes()
    setBookmarkedRecipes(recipes)
  }, [bookmarks, getBookmarkedRecipes])

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Bookmarked Recipes</h1>
          <p className="text-muted-foreground">Your saved recipes for later</p>
        </div>

        {bookmarkedRecipes.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-muted-foreground text-lg mb-4">You haven't bookmarked any recipes yet.</p>
              <Link href="/">
                <Button className="bg-primary hover:bg-primary/90">Explore Recipes</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarkedRecipes.map((recipe) => (
              <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
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
                      <h3 className="font-semibold text-lg line-clamp-2">{recipe.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">by {recipe.creatorName}</p>
                    </div>
                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full whitespace-nowrap">
                      {recipe.category}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pb-3 flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
                  <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                    <span>⏱️ {recipe.cookingTime} min</span>
                    <span>👥 {recipe.servings} servings</span>
                    <span>{recipe.difficulty}</span>
                  </div>
                </CardContent>
                <CardFooter className="gap-2">
                  <Link href={`/recipe/${recipe.id}`} className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      View Recipe
                    </Button>
                  </Link>
                  <Button
                    variant="default"
                    size="icon"
                    onClick={() => toggleBookmark(recipe.id)}
                    title="Remove bookmark"
                  >
                    ❤️
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
