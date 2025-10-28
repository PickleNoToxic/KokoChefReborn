"use client"

import type { Recipe } from "@/context/recipe-context"
import { useRecipes } from "@/context/recipe-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"

interface RecipeCardProps {
  recipe: Recipe
}

export function RecipeCard({ recipe }: RecipeCardProps) {

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
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
        </div>
      </CardHeader>
      <CardContent className="pb-3 flex-1">
        <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
          <span>⏱️ {recipe.cookingTime} min</span>
          <span>🍴 {recipe.category}</span>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Link href={`/recipe/${recipe.id}`} className="flex-1">
          <Button variant="outline" className="w-full bg-transparent">
            View Recipe
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
