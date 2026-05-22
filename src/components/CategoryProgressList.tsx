import React from 'react'

type Category = {
  name: string
  amount: number
  color: string
  icon: string
}

type Props = {
  categories: Category[]
  total: number
}

export default function CategoryProgressList({ categories, total }: Props) {
  const visible = categories.filter((c) => c.amount > 0)
  const isEmpty = total <= 0 || visible.length === 0

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-zinc-100 mb-4">Por Categorías</h2>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
        {isEmpty ? (
          <p className="text-center text-sm text-zinc-500 py-4">Aún no hay gastos este mes.</p>
        ) : (
          <div className="space-y-5">
            {visible.map((cat) => {
              const percent = (cat.amount / total) * 100
              return (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cat.icon}</span>
                      <span className="font-medium text-zinc-200">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-zinc-100">€{cat.amount.toFixed(2)}</span>
                      <span className="text-zinc-500 text-xs ml-2">{percent.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${percent}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
