"use client";

import { useAuth } from "@/context/auth-context"
import { useRecipes } from "@/context/recipe-context"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"
import { Trash2,AlarmClock, Tags } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import { useToast } from "@/context/toast-context"
import { supabase } from "@/lib/supabaseClient";


export default function MyRecipesPage() {
  const { user, isLoading } = useAuth()
  const { recipes, getRecipesByCreator } = useRecipes()
  const router = useRouter()
  const [userRecipes, setUserRecipes] = useState<any[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { addToast } = useToast()

  // Redirect jika belum login
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Ambil resep milik user
  useEffect(() => {
    if (user) {
      const myRecipes = getRecipesByCreator(user.id);
      setUserRecipes(myRecipes);
    }
  }, [user, recipes, getRecipesByCreator]);

  // Fungsi delete Supabase
  const handleDelete = async (recipeId: string) => {
    setIsDeleting(true)
    try {
      const { error } = await supabase.from("recipes").delete().eq("id", recipeId)
      if (error) throw error

      setUserRecipes((prev) => prev.filter((r) => r.id !== recipeId))
      addToast("Resep berhasil dihapus")
    } catch (err) {
      console.error("Delete error:", err)
      addToast("Gagal menghapus resep", true)
    } finally {
      setIsDeleting(false)
      setSelectedRecipe(null)
    }
  }

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
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Resep Saya
            </h1>
            <p className="text-muted-foreground">Kelola resep milikmu</p>
          </div>
          <Link
            href="/add-recipe"
            className="flex justify-end md:justify-normal mt-4 md:mt-0"
          >
            <Button className="bg-primary hover:bg-primary/90">
              + Tambahkan Resep
            </Button>
          </Link>
        </div>

        {userRecipes.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-muted-foreground text-lg mb-4">
                Belum ada resep.
              </p>
              <Link href="/add-recipe">
                <Button className="bg-primary hover:bg-primary/90">
                  Bagikan Resep Pertamamu
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userRecipes.map((recipe) => (
              <Card
                key={recipe.id}
                className="overflow-hidden hover:shadow-lg pt-0 transition-shadow flex flex-col"
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
                  <h3 className="font-semibold text-lg line-clamp-2">{recipe.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">oleh {recipe.creatorName}</p>
                </CardHeader>
                <CardContent className="pb-3 flex-1">
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
                      Lihat
                    </Button>
                  </Link>
                  <Link href={`/edit-recipe/${recipe.id}`} className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h2 className="text-lg font-semibold mb-3">
              Hapus Resep "{selectedRecipe.title}"?
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedRecipe(null)}
                disabled={isDeleting}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(selectedRecipe.id)}
                disabled={isDeleting}
              >
                {isDeleting ? "Menghapus..." : "Hapus"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
