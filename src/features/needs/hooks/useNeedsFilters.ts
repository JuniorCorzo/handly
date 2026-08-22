import { useState } from "react";

import type { PublicNeedItem } from "@/components/NeedItemCard";

export interface UseNeedsFiltersOptions {
  items: PublicNeedItem[];
}

export function useNeedsFilters({ items }: UseNeedsFiltersOptions) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUrgency, setSelectedUrgency] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCoverage, setSelectedCoverage] = useState<string>("all");

  const categorySet = new Set<string>();
  for (const item of items) {
    if (item.category) {
      categorySet.add(item.category);
    }
  }
  const availableCategories = [...categorySet].toSorted();

  const filteredItems = items.filter((item) => {
    // 1. Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchName = item.item_name.toLowerCase().includes(query);
      const matchCat = item.category.toLowerCase().includes(query);
      const matchOrg = (item.org_name || "").toLowerCase().includes(query);
      const matchCamp = (item.campaign_name || "")
        .toLowerCase()
        .includes(query);
      if (!matchName && !matchCat && !matchOrg && !matchCamp) {
        return false;
      }
    }

    // 2. Urgency filter
    if (selectedUrgency !== "all" && item.urgency !== selectedUrgency) {
      return false;
    }

    // 3. Category filter
    if (selectedCategory !== "all" && item.category !== selectedCategory) {
      return false;
    }

    // 4. Coverage filter
    if (
      selectedCoverage === "urgent_uncovered" &&
      item.progress_percentage >= 50
    ) {
      return false;
    }
    if (
      selectedCoverage === "in_progress" &&
      (item.progress_percentage < 50 || item.progress_percentage >= 100)
    ) {
      return false;
    }
    if (selectedCoverage === "fulfilled" && !item.is_fulfilled) {
      return false;
    }

    return true;
  });

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedUrgency !== "all" ||
    selectedCategory !== "all" ||
    selectedCoverage !== "all";

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedUrgency("all");
    setSelectedCategory("all");
    setSelectedCoverage("all");
  };

  return {
    searchQuery,
    setSearchQuery,
    selectedUrgency,
    setSelectedUrgency,
    selectedCategory,
    setSelectedCategory,
    selectedCoverage,
    setSelectedCoverage,
    availableCategories,
    filteredItems,
    hasActiveFilters,
    resetFilters,
  };
}
