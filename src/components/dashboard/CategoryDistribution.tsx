'use client'

import { DonutChart, BarList } from '@tremor/react'

interface CategoryData {
  name: string
  value: number
  color: string
  icon: string
}

interface CategoryDistributionProps {
  categories: CategoryData[]
  total: number
}

// Tremor usually maps specific strings (like 'emerald') to tailwind classes, 
// but we can pass custom hex colors using standard CSS inside customTooltip or just pass the tailwind classes if mapped.
// Since we have hex colors in the database, we might need a custom mapping or just let Tremor use its default colors 
// and we use BarList for the custom icons/colors.

export default function CategoryDistribution({ categories, total }: CategoryDistributionProps) {
  if (categories.length === 0) return null

  // Format data for DonutChart
  const donutData = categories.map(c => ({
    name: c.name,
    amount: c.value,
  }))

  // Format data for BarList
  const barListData = categories.map(c => ({
    name: c.name,
    value: c.value,
    icon: () => <span className="mr-2 text-base">{c.icon}</span>,
  }))

  return (
    <div className="space-y-6 mt-4">
      <div className="flex items-center justify-center">
        <DonutChart
          data={donutData}
          category="amount"
          index="name"
          valueFormatter={(number) => `€${number.toFixed(2)}`}
          colors={['emerald', 'zinc', 'indigo', 'rose', 'cyan', 'amber', 'purple', 'fuchsia']}
          className="w-40 h-40"
          showAnimation={true}
        />
      </div>
      
      <div className="mt-6 px-2">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Desglose por Categoría</p>
        <BarList 
          data={barListData} 
          valueFormatter={(number) => `€${number.toFixed(2)}`}
          className="[&_.tremor-BarList-bar]:bg-emerald-500/20 [&_.tremor-BarList-bar]:border [&_.tremor-BarList-bar]:border-emerald-500/30"
        />
      </div>
    </div>
  )
}
