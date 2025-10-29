"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { useRecipes } from "@/context/recipe-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Recipe } from "@/context/recipe-context"

interface RecipeFormProps {
  initialRecipe?: Recipe
  isEditing?: boolean
}

const CATEGORIES = ["Makanan Utama", "Minuman", "Cemilan", "Dessert", "Lainnya"]

export function RecipeForm({ initialRecipe, isEditing = false }: RecipeFormProps) {
  const { user } = useAuth()
  const { addRecipe, updateRecipe } = useRecipes()
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: initialRecipe?.title || "",
    category: initialRecipe?.category || "Makanan Utama",
    cookingTime: initialRecipe?.cookingTime || 30,
    image: initialRecipe?.image || "/placeholder.svg",
    ingredients: initialRecipe?.ingredients || [""],
    steps: initialRecipe?.steps || [""],
  })

  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "cookingTime" ? Number.parseInt(value) : value,
    }))
  }

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...formData.ingredients]
    newIngredients[index] = value
    setFormData((prev) => ({
      ...prev,
      ingredients: newIngredients,
    }))
  }

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...formData.steps]
    newSteps[index] = value
    setFormData((prev) => ({
      ...prev,
      steps: newSteps,
    }))
  }

  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, ""],
    }))
  }

  const removeIngredient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }))
  }

  const addStep = () => {
    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, ""],
    }))
  }

  const removeStep = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.title.trim()) {
      setError("Nama resep harus diisi")
      return
    }

    if (formData.ingredients.some((ing) => !ing.trim())) {
      setError("Semua bahan harus diisi")
      return
    }

    if (formData.steps.some((step) => !step.trim())) {
      setError("Semua langkah harus diisi")
      return
    }

    setIsLoading(true)

    try {
      if (isEditing && initialRecipe) {
        updateRecipe(initialRecipe.id, {
          ...formData,
          ingredients: formData.ingredients.filter((ing) => ing.trim()),
          steps: formData.steps.filter((step) => step.trim()),
        })
      } else {
        addRecipe({
          ...formData,
          ingredients: formData.ingredients.filter((ing) => ing.trim()),
          steps: formData.steps.filter((step) => step.trim()),
          creatorId: user!.id,
          creatorName: user!.username,
        })
      }
      router.push(isEditing ? `/recipe/${initialRecipe?.id}` : "/my-recipes")
    } catch (err) {
      setError("Failed to save recipe. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Resep</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="title" className="text-sm font-medium">
              Nama Resep *
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Classic Margherita Pizza"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="text-sm font-medium">
                Kategori *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="cookingTime" className="text-sm font-medium">
                Durasi Memasak (menit) *
              </label>
              <Input
                id="cookingTime"
                name="cookingTime"
                type="number"
                value={formData.cookingTime}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="image" className="text-sm font-medium">
              Image URL
            </label>
            <Input
              id="image"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Ingredients */}
      <Card>
        <CardHeader>
          <CardTitle>Bahan-bahan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {formData.ingredients.map((ingredient, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={ingredient}
                onChange={(e) => handleIngredientChange(index, e.target.value)}
                placeholder={`Bahan ${index + 1}`}
              />
              {formData.ingredients.length > 1 && (
                <Button type="button" variant="outline" onClick={() => removeIngredient(index)} className="px-3">
                  Hapus
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addIngredient} className="w-full bg-transparent">
            + Tambah Bahan
          </Button>
        </CardContent>
      </Card>

      {/* Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Langkah-langkah</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {formData.steps.map((step, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                {index + 1}
              </div>
              <textarea
                value={step}
                onChange={(e) => handleStepChange(index, e.target.value)}
                placeholder={`Langkah ${index + 1}`}
                className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-foreground"
                rows={2}
              />
              {formData.steps.length > 1 && (
                <Button type="button" variant="outline" onClick={() => removeStep(index)} className="px-3">
                  Hapus
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addStep} className="w-full bg-transparent">
            + Tambah Langkah
          </Button>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-4">
        <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={isLoading}>
          {isLoading ? "Loading..." : isEditing ? "Perbarui Resep" : "Tambahkan Resep"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
          Batal
        </Button>
      </div>
    </form>
  )
}
