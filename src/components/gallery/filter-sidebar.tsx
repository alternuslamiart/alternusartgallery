"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

// Collapsible Section Component
interface CollapsibleSectionProps {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

function CollapsibleSection({ title, defaultOpen = true, children }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <div className="border-b border-gray-200 pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-3 text-left"
      >
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
          {title}
        </h3>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"
        )}
      >
        {children}
      </div>
    </div>
  )
}

// Sort Select Component
interface SortSelectProps {
  value: string
  onChange: (value: string) => void
}

function SortSelect({ value, onChange }: SortSelectProps) {
  const sortOptions = [
    { value: 'date-desc', label: 'Newest First' },
    { value: 'date-asc', label: 'Oldest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A-Z' },
    { value: 'name-desc', label: 'Name: Z-A' },
  ]

  return (
    <CollapsibleSection title="SORT" defaultOpen={true}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select sorting" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </CollapsibleSection>
  )
}

// Category Filter Component
interface CategoryFilterProps {
  value: string | null
  onChange: (value: string | null) => void
  categories: string[]
}

function CategoryFilter({ value, onChange, categories }: CategoryFilterProps) {
  const handleValueChange = (val: string) => {
    onChange(val === 'all' ? null : val)
  }

  return (
    <CollapsibleSection title="CATEGORY" defaultOpen={true}>
      <RadioGroup
        value={value || 'all'}
        onValueChange={handleValueChange}
      >
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="all" id="category-all" />
            <Label
              htmlFor="category-all"
              className="text-sm font-normal cursor-pointer"
            >
              All
            </Label>
          </div>
          {categories.map(category => (
            <div key={category} className="flex items-center space-x-3">
              <RadioGroupItem value={category} id={`category-${category}`} />
              <Label
                htmlFor={`category-${category}`}
                className="text-sm font-normal cursor-pointer"
              >
                {category}
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </CollapsibleSection>
  )
}

// Style Filter Component
interface StyleFilterProps {
  values: string[]
  onChange: (values: string[]) => void
  styles: string[]
}

function StyleFilter({ values, onChange, styles }: StyleFilterProps) {
  const [showAll, setShowAll] = React.useState(false)
  const INITIAL_DISPLAY_COUNT = 5

  const displayedStyles = showAll ? styles : styles.slice(0, INITIAL_DISPLAY_COUNT)
  const hasMore = styles.length > INITIAL_DISPLAY_COUNT

  const handleToggle = (style: string, checked: boolean) => {
    if (checked) {
      onChange([...values, style])
    } else {
      onChange(values.filter(s => s !== style))
    }
  }

  return (
    <CollapsibleSection title="STYLE" defaultOpen={true}>
      <div className="space-y-3">
        {displayedStyles.map(style => (
          <div key={style} className="flex items-center space-x-3">
            <Checkbox
              id={`style-${style}`}
              checked={values.includes(style)}
              onCheckedChange={(checked) => handleToggle(style, checked as boolean)}
            />
            <Label
              htmlFor={`style-${style}`}
              className="text-sm font-normal cursor-pointer"
            >
              {style}
            </Label>
          </div>
        ))}

        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium mt-2 uppercase tracking-wider"
          >
            {showAll ? 'Show Less' : 'Show More'}
          </button>
        )}
      </div>
    </CollapsibleSection>
  )
}

// Main Filter Sidebar Component
interface FilterSidebarProps {
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

export function FilterSidebar({
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
}: FilterSidebarProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Clear All
          </button>
        )}
      </div>

      <SortSelect value={sortBy} onChange={onSortChange} />
      <CategoryFilter
        value={selectedCategory}
        onChange={onCategoryChange}
        categories={categories}
      />
      <StyleFilter
        values={selectedStyles}
        onChange={onStylesChange}
        styles={styles}
      />
    </div>
  )
}
