"use client"

import { useAuth } from "@/context/auth-context"
import { useRecipes } from "@/context/recipe-context"
import { Navbar } from "@/components/navbar"
import { RecipeCard } from "@/components/recipe-card"
import { RecipeSearch } from "@/components/recipe-search"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const { recipes } = useRecipes()
  const router = useRouter()
  const [filteredRecipes, setFilteredRecipes] = useState(recipes)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    let filtered = recipes

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((recipe) => recipe.category === selectedCategory)
    }

    setFilteredRecipes(filtered)
  }, [recipes, searchQuery, selectedCategory])

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    return null
  }

  const categories = Array.from(new Set(recipes.map((r) => r.category)))

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Discover Recipes</h1>
            <p className="text-muted-foreground">Explore delicious recipes from our community</p>
          </div>
        </div>

        <div className="mb-8">
          <RecipeSearch onSearch={setSearchQuery} onCategoryChange={setSelectedCategory} categories={categories} />
        </div>

        {filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No recipes found. Try adjusting your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
