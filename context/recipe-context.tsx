"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface Recipe {
  id: string
  title: string
  description: string
  category: string
  cookingTime: number
  servings: number
  difficulty: "Easy" | "Medium" | "Hard"
  image: string
  ingredients: string[]
  steps: string[]
  creatorId: string
  creatorName: string
  createdAt: string
}

interface RecipeContextType {
  recipes: Recipe[]
  bookmarks: string[]
  addRecipe: (recipe: Omit<Recipe, "id" | "createdAt">) => void
  deleteRecipe: (id: string) => void
  updateRecipe: (id: string, recipe: Partial<Recipe>) => void
  toggleBookmark: (recipeId: string) => void
  getRecipesByCreator: (creatorId: string) => Recipe[]
  getBookmarkedRecipes: () => Recipe[]
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined)

const SAMPLE_RECIPES: Recipe[] = [
  {
    id: "1",
    title: "Classic Margherita Pizza",
    description: "Traditional Italian pizza with fresh mozzarella, basil, and tomato sauce",
    category: "Makanan Utama",
    cookingTime: 30,
    servings: 4,
    difficulty: "Medium",
    image: "/margherita-pizza.png",
    ingredients: ["Pizza dough", "Tomato sauce", "Fresh mozzarella", "Basil", "Olive oil", "Salt"],
    steps: [
      "Preheat oven to 475°F",
      "Stretch pizza dough",
      "Spread tomato sauce",
      "Add mozzarella and basil",
      "Bake for 12-15 minutes",
    ],
    creatorId: "demo",
    creatorName: "Chef Marco",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Creamy Pasta Carbonara",
    description: "Authentic Roman pasta with eggs, cheese, and pancetta",
    category: "Makanan Utama",
    cookingTime: 20,
    servings: 2,
    difficulty: "Easy",
    image: "/pasta-carbonara.png",
    ingredients: ["Spaghetti", "Eggs", "Pancetta", "Pecorino Romano", "Black pepper", "Salt"],
    steps: [
      "Cook pasta in salted water",
      "Fry pancetta until crispy",
      "Mix eggs with cheese",
      "Combine pasta with pancetta",
      "Add egg mixture off heat",
    ],
    creatorId: "demo",
    creatorName: "Chef Marco",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Thai Green Curry",
    description: "Spicy and aromatic Thai curry with coconut milk and vegetables",
    category: "Makanan Utama",
    cookingTime: 25,
    servings: 4,
    difficulty: "Medium",
    image: "/thai-green-curry.png",
    ingredients: ["Coconut milk", "Green curry paste", "Chicken", "Bell peppers", "Basil", "Fish sauce"],
    steps: ["Heat coconut milk", "Add curry paste", "Cook chicken", "Add vegetables", "Simmer until cooked"],
    creatorId: "demo",
    creatorName: "Chef Somchai",
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Chocolate Lava Cake",
    description: "Decadent chocolate cake with a molten center",
    category: "Dessert",
    cookingTime: 15,
    servings: 2,
    difficulty: "Medium",
    image: "/chocolate-lava-cake.png",
    ingredients: ["Dark chocolate", "Butter", "Eggs", "Sugar", "Flour", "Vanilla"],
    steps: [
      "Melt chocolate and butter",
      "Mix eggs and sugar",
      "Combine mixtures",
      "Pour into ramekins",
      "Bake for 12-14 minutes",
    ],
    creatorId: "demo",
    creatorName: "Chef Sophie",
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    title: "Mediterranean Salad",
    description: "Fresh and healthy salad with feta, olives, and vegetables",
    category: "Dessert",
    cookingTime: 10,
    servings: 2,
    difficulty: "Easy",
    image: "/mediterranean-salad.png",
    ingredients: ["Tomatoes", "Cucumber", "Feta cheese", "Olives", "Red onion", "Olive oil"],
    steps: ["Chop vegetables", "Combine in bowl", "Add feta and olives", "Drizzle with olive oil", "Season and serve"],
    creatorId: "demo",
    creatorName: "Chef Elena",
    createdAt: new Date().toISOString(),
  },
  {
    id: "6",
    title: "Spicy Tacos",
    description: "Mexican-style tacos with seasoned meat and fresh toppings",
    category: "Cemilan",
    cookingTime: 20,
    servings: 4,
    difficulty: "Easy",
    image: "/spicy-tacos.jpg",
    ingredients: ["Ground beef", "Taco shells", "Lettuce", "Tomato", "Cheese", "Salsa"],
    steps: ["Brown ground beef", "Add taco seasoning", "Warm taco shells", "Assemble tacos", "Add toppings and serve"],
    creatorId: "demo",
    creatorName: "Chef Carlos",
    createdAt: new Date().toISOString(),
  },
]

export function RecipeProvider({ children }: { children: React.ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>(SAMPLE_RECIPES)
  const [bookmarks, setBookmarks] = useState<string[]>([])

  // Load bookmarks from localStorage on mount
  useEffect(() => {
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
    const newBookmarks = bookmarks.includes(recipeId)
      ? bookmarks.filter((id) => id !== recipeId)
      : [...bookmarks, recipeId]
    setBookmarks(newBookmarks)
    localStorage.setItem("bookmarks", JSON.stringify(newBookmarks))
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
