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
import { Trash2 } from "lucide-react"

export default function MyRecipesPage() {
  const { user, isLoading } = useAuth()
  const { recipes, deleteRecipe, getRecipesByCreator } = useRecipes()
  const router = useRouter()
  const [userRecipes, setUserRecipes] = useState<any[]>([])
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      const myRecipes = getRecipesByCreator(user.id)
      setUserRecipes(myRecipes)
    }
  }, [user, recipes, getRecipesByCreator])

  const handleDelete = (recipeId: string) => {
    deleteRecipe(recipeId)
    setDeleteConfirm(null)
  }

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Resep Saya</h1>
            <p className="text-muted-foreground">Kelola resep milikmu</p>
          </div>
          <Link href="/add-recipe">
            <Button className="bg-primary hover:bg-primary/90">+ Tambahkan Resep</Button>
          </Link>
        </div>

        {userRecipes.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-muted-foreground text-lg mb-4">Belum ada resep.</p>
              <Link href="/add-recipe">
                <Button className="bg-primary hover:bg-primary/90">Bagikan Resep Pertamamu</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userRecipes.map((recipe) => (
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
                  <h3 className="font-semibold text-lg line-clamp-2">{recipe.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{recipe.category}</p>
                </CardHeader>
                <CardContent className="pb-3 flex-1">
                  <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                    <span>⏱️ {recipe.cookingTime} menit</span>
                    <span>🍴 {recipe.category}</span>
                  </div>
                </CardContent>
                <CardFooter className="gap-2">
                  <Link href={`/recipe/${recipe.id}`} className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      Lihat
                    </Button>
                  </Link>
                  <Link href={`/edit-recipe/${recipe.id}`} className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      Edit
                    </Button>
                  </Link>
                  <div className="relative">
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => setDeleteConfirm(deleteConfirm === recipe.id ? null : recipe.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    {deleteConfirm === recipe.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg p-3 z-50">
                        <p className="text-sm font-medium mb-3">Apakah kamu yakin ingin menghapus resep ini?</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(recipe.id)}
                            className="flex-1"
                          >
                            Hapus
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setDeleteConfirm(null)} className="flex-1">
                            Batal
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
