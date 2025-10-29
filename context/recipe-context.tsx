"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/context/toast-context"
export interface Recipe {
  id: string
  title: string
  category: string
  cookingTime: number
  image: string
  ingredients: string[]
  steps: string[]
  creatorId: string
  creatorName: string
  createdAt: string
}

interface RecipeContextType {
  recipes: Recipe[]
  fetchRecipes: () => Promise<void>
  bookmarks: string[]
  addRecipe: (recipe: Omit<Recipe, "id" | "createdAt">) => void
  deleteRecipe: (id: string) => void
  updateRecipe: (id: string, recipe: Partial<Recipe>) => void
  toggleBookmark: (recipeId: string) => void
  getRecipesByCreator: (creatorId: string) => Recipe[]
  getBookmarkedRecipes: () => Recipe[]
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined)

export function RecipeProvider({ children }: { children: React.ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [bookmarks, setBookmarks] = useState<string[]>([])
  const { addToast } = useToast()
  // Fetch recipes from Supabase
  const fetchRecipes = async () => {
    const { data, error } = await supabase
      .from("recipes")
      .select(`
        *,
        profiles:profiles!inner(username)
      `)
      .order("created_at", { ascending: false }) 
    if (error) {
      console.error("Error fetching recipes:", error)
      return
    }

    if (data) {
      const formatted: Recipe[] = data.map((r: any) => ({
        id: r.id,
        title: r.title,
        category: r.category,
        cookingTime: r.duration,
        image: r.image_url,
        ingredients: r.ingredients,
        steps: r.steps,
        creatorId: r.user_id,
        creatorName: r.profiles?.username || "Unknown",
        createdAt: r.created_at,
      }))
      setRecipes(formatted)
    }
  }

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    fetchRecipes()
    const storedBookmarks = localStorage.getItem("bookmarks")
    if (storedBookmarks) {
      setBookmarks(JSON.parse(storedBookmarks))
    }
  }, [])

  const addRecipe = (recipe: Omit<Recipe, "id" | "createdAt">) => {
    const newRecipe: Recipe = {
      ...recipe,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    }
    setRecipes([newRecipe, ...recipes])
  }

  const deleteRecipe = (id: string) => {
    setRecipes(recipes.filter((r) => r.id !== id))
  }

  const updateRecipe = (id: string, updates: Partial<Recipe>) => {
    setRecipes(recipes.map((r) => (r.id === id ? { ...r, ...updates } : r)))
  }


  const toggleBookmark = (recipeId: string) => {
  try {
    const isBookmarked = bookmarks.includes(recipeId)
    const newBookmarks = isBookmarked
      ? bookmarks.filter((id) => id !== recipeId)
      : [...bookmarks, recipeId]

    setBookmarks(newBookmarks)
    localStorage.setItem("bookmarks", JSON.stringify(newBookmarks))

    addToast(
      isBookmarked
        ? "Resep dihapus dari bookmark!"
        : "Resep berhasil ditambahkan ke bookmark!",
      false
    )
  } catch (error) {
    console.error("Gagal memperbarui bookmark:", error)
    addToast("Terjadi kesalahan saat memperbarui bookmark.", true)
  }
}

  const getRecipesByCreator = (creatorId: string) => {
    return recipes.filter((r) => r.creatorId === creatorId)
  }

  const getBookmarkedRecipes = () => {
    return recipes.filter((r) => bookmarks.includes(r.id))
  }

  return (
    <RecipeContext.Provider
      value={{
        recipes,
        bookmarks,
        fetchRecipes,
        addRecipe,
        deleteRecipe,
        updateRecipe,
        toggleBookmark,
        getRecipesByCreator,
        getBookmarkedRecipes,
      }}
    >
      {children}
    </RecipeContext.Provider>
  )
}

export function useRecipes() {
  const context = useContext(RecipeContext)
  if (context === undefined) {
    throw new Error("useRecipes must be used within a RecipeProvider")
  }
  return context
}
