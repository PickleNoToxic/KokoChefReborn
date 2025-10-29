"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useRecipes } from "@/context/recipe-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Recipe } from "@/context/recipe-context";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/context/toast-context";

interface RecipeFormProps {
  initialRecipe?: Recipe;
  isEditing?: boolean;
}

const CATEGORIES = [
  "Makanan Utama",
  "Minuman",
  "Cemilan",
  "Dessert",
  "Lainnya",
];

type FormState = {
  title: string;
  category: string;
  cookingTime: number | "";
  image: string;
  ingredients: string[];
  steps: string[];
};

export function RecipeForm({
  initialRecipe,
  isEditing = false,
}: RecipeFormProps) {
  const { user } = useAuth();
  const { addRecipe, updateRecipe, fetchRecipes } = useRecipes();
  const router = useRouter();
  const { addToast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<FormState>({
    title: initialRecipe?.title || "",
    category: initialRecipe?.category || "Makanan Utama",
    cookingTime: initialRecipe?.cookingTime ?? 30,
    image: initialRecipe?.image || "/placeholder.svg",
    ingredients: initialRecipe?.ingredients || [""],
    steps: initialRecipe?.steps || [""],
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "cookingTime"
          ? value === ""
            ? ""
            : Number.isNaN(Number.parseInt(value))
            ? prev.cookingTime
            : Number.parseInt(value)
          : value,
    }));
  };

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData((prev) => ({
      ...prev,
      ingredients: newIngredients,
    }));
  };

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...formData.steps];
    newSteps[index] = value;
    setFormData((prev) => ({
      ...prev,
      steps: newSteps,
    }));
  };

  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, ""],
    }));
  };

  const removeIngredient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const addStep = () => {
    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, ""],
    }));
  };

  const removeStep = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // clear previous error state if any (toast handles messaging)

    if (!formData.title.trim()) {
      addToast("Nama resep harus diisi", true);
      return;
    }

    if (formData.ingredients.some((ing) => !ing.trim())) {
      addToast("Semua bahan harus diisi", true);
      return;
    }

    if (formData.steps.some((step) => !step.trim())) {
      addToast("Semua langkah harus diisi", true);
      return;
    }

    // Validate cooking time to avoid NaN
    if (formData.cookingTime === "" || Number(formData.cookingTime) <= 0) {
      addToast("Durasi memasak harus diisi dengan benar", true);
      return;
    }

    setIsLoading(true);

    try {
      if (isEditing && initialRecipe) {
        // Editing flow (belum dihubungkan ke Supabase)
        updateRecipe(initialRecipe.id, {
          ...formData,
          cookingTime: Number(formData.cookingTime) || 0,
          ingredients: formData.ingredients.filter((ing) => ing.trim()),
          steps: formData.steps.filter((step) => step.trim()),
        });
        addToast("Resep diperbarui");
        router.push(`/recipe/${initialRecipe?.id}`);
      } else {
        // Add flow: upload gambar (jika ada) ke Supabase Storage, lalu insert ke tabel recipes
        let publicUrl: string | null = null;

        if (imageFile) {
          const fileName = `${user!.id}_${Date.now()}.jpg`;
          const filePath = fileName; // Simpan langsung di root bucket

          const { error: uploadError } = await supabase.storage
            .from("recipes-images")
            .upload(filePath, imageFile, {
              cacheControl: "3600",
              upsert: false,
              contentType: imageFile.type,
            });

          if (uploadError) throw uploadError;

          const { data: publicData } = supabase.storage
            .from("recipes-images")
            .getPublicUrl(filePath);

          publicUrl =
            publicData.publicUrl ||
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipes-images/${filePath}`;
        }

        const payload = {
          user_id: user!.id,
          title: formData.title.trim(),
          image_url: publicUrl,
          ingredients: formData.ingredients.filter((ing) => ing.trim()),
          steps: formData.steps.filter((step) => step.trim()),
          likes: 0,
          category: formData.category,
          duration: Number(formData.cookingTime),
        } as const;

        const { error: insertError } = await supabase
          .from("recipes")
          .insert(payload);

        if (insertError) throw insertError;

        await fetchRecipes();
        addToast("Resep berhasil ditambahkan!");
        router.push("/my-recipes");
      }
    } catch (err: any) {
      console.error(err);
      addToast("Gagal menyimpan resep", true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Resep</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="title" className="text-sm font-medium">
              Nama *
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="text-sm font-medium">
                Kategori *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 min-w-44 border border-input rounded-md bg-background text-foreground"
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
                Durasi (menit) *
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
              Upload Photo
            </label>
            <div className="flex items-stretch h-9">
              {" "}
              {/* give a fixed height */}
              <label
                htmlFor="image"
                className="cursor-pointer px-4 bg-[#f8f8f8] text-black border border-e-0 border-input text-sm rounded-l-md hover:bg-[#f8f8f8]/90 flex items-center"
              >
                Choose File
              </label>
              <p className="text-xs text-muted-foreground truncate border border-input flex-1 rounded-r-md px-2 flex items-center">
                {imageFile ? imageFile.name : "No file chosen"}
              </p>
              <input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImageFile(file);
                    setFormData((prev) => ({
                      ...prev,
                      image: URL.createObjectURL(file),
                    }));
                  }
                }}
              />
            </div>
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
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                {index + 1}
              </div>
              <Input
                value={ingredient}
                onChange={(e) => handleIngredientChange(index, e.target.value)}
                placeholder={`Bahan ${index + 1}`}
              />
              {formData.ingredients.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removeIngredient(index)}
                  className="px-3"
                >
                  Hapus
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addIngredient}
            className="w-full bg-transparent"
          >
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
            <div key={index} className="flex gap-2 items-center">
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removeStep(index)}
                  className="px-3"
                >
                  Hapus
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addStep}
            className="w-full bg-transparent"
          >
            + Tambah Langkah
          </Button>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-4">
        <Button
          type="submit"
          className="flex-1 bg-primary hover:bg-primary/90"
          disabled={isLoading}
        >
          {isLoading
            ? "Loading..."
            : isEditing
            ? "Perbarui Resep"
            : "Tambahkan Resep"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="flex-1"
        >
          Batal
        </Button>
      </div>
    </form>
  );
}
