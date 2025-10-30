"use client";

import type React from "react";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RecipeSearchProps {
  onSearch: (query: string) => void;
  onCategoryChange: (category: string) => void;
  categories: string[];
}

export function RecipeSearch({
  onSearch,
  onCategoryChange,
  categories,
}: RecipeSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    onCategoryChange(category);
  };

  return (
    <div className="space-y-4">
      <div>
        <Input
          type="text"
          placeholder="Cari resep..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full"
        />
      </div>
      <div
        className="flex overflow-x-scroll gap-2"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <Button
          variant={selectedCategory === "All" ? "default" : "outline"}
          onClick={() => handleCategoryChange("All")}
          size="sm"
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => handleCategoryChange(category)}
            size="sm"
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
}
