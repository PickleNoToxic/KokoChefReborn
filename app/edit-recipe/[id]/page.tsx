"use client"

import { useAuth } from "@/context/auth-context"
import { useRecipes } from "@/context/recipe-context"
import { Navbar } from "@/components/navbar"
import { RecipeForm } from "@/components/recipe-form"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function EditRecipePage({ params }: { params: { id: string } }) {
  const { user, isLoading } = useAuth()
  const { recipes } = useRecipes()
  const router = useRouter()
  const [recipe, setRecipe] = useState<any>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const foundRecipe = recipes.find((r) => r.id === params.id)
    if (foundRecipe) {
      if (foundRecipe.creatorId !== user?.id) {
        router.push("/")
      } else {
        setRecipe(foundRecipe)
      }
    }
  }, [recipes, params.id, user, router])

  if (isLoading || !recipe) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Edit Recipe</h1>
          <p className="text-muted-foreground">Update your recipe details</p>
        </div>
        <RecipeForm initialRecipe={recipe} isEditing={true} />
      </main>
    </>
  )
}
