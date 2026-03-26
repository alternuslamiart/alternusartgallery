"use client"

import * as React from "react"
import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { FilterSidebar } from "./filter-sidebar"

interface MobileFilterDrawerProps {
  sortBy: string
  onSortChange: (value: string) => void
  selectedCategory: string | null
  onCategoryChange: (value: string | null) => void
  selectedStyles: string[]
  onStylesChange: (values: string[]) => void
  categories: string[]
  styles: string[]
  onClearAll: () => void
  hasActiveFilters: boolean
}

export function MobileFilterDrawer({
  sortBy,
  onSortChange,
  selectedCategory,
  onCategoryChange,
  selectedStyles,
  onStylesChange,
  categories,
  styles,
  onClearAll,
  hasActiveFilters,
}: MobileFilterDrawerProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full lg:hidden">
          <Filter className="w-4 h-4 mr-2" />
          Filters & Sort
          {hasActiveFilters && (
            <span className="ml-2 bg-gray-900 text-white text-xs px-2 py-0.5 rounded-full">
              {(selectedCategory ? 1 : 0) + selectedStyles.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <FilterSidebar
            sortBy={sortBy}
            onSortChange={onSortChange}
            selectedCategory={selectedCategory}
            onCategoryChange={onCategoryChange}
            selectedStyles={selectedStyles}
            onStylesChange={onStylesChange}
            categories={categories}
            styles={styles}
            onClearAll={onClearAll}
            hasActiveFilters={hasActiveFilters}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
