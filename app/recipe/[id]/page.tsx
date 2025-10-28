"use client"

import { useAuth } from "@/context/auth-context"
import { useRecipes } from "@/context/recipe-context"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { use, useEffect, useState } from "react"
import Image from "next/image"

export default function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user, isLoading } = useAuth()
  const { recipes, bookmarks, toggleBookmark } = useRecipes()
  const router = useRouter()
  const [recipe, setRecipe] = useState<any>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const foundRecipe = recipes.find((r) => r.id === id)
    setRecipe(foundRecipe)
  }, [recipes, id])

  if (isLoading || !recipe) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    return null
  }

  const isBookmarked = bookmarks.includes(recipe.id)

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            ← Kembali
          </Button>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Recipe Image */}
          <div className="relative h-96 w-full overflow-hidden rounded-lg bg-muted">
            <Image src={recipe.image || "/placeholder.svg"} alt={recipe.title} fill className="object-cover" />
          </div>

          {/* Recipe Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-4xl font-bold text-foreground">{recipe.title}</h1>
                <Button
                  variant={isBookmarked ? "default" : "outline"}
                  size="lg"
                  onClick={() => toggleBookmark(recipe.id)}
                  className="whitespace-nowrap"
                >
                  {isBookmarked ? "Bookmarked" : "Bookmark"}
                </Button>
              </div>
              <p className="text-muted-foreground">oleh {recipe.creatorName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Durasi Memasak</p>
                    <p className="text-2xl font-bold text-primary">{recipe.cookingTime} menit</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Kategori</p>
                    <p className="text-2xl font-bold text-primary">{recipe.category}</p>
                  </div>
                </CardContent>
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
                  <li key={index} className="flex items-start gap-3 list-disc">
                    <p className="text-foreground">
                      • {ingredient}
                    </p>
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
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
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
  )
}
