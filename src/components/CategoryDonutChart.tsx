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

export default function CategoryDonutChart({ categories, total }: Props) {
  const visible = categories.filter((c) => c.amount > 0)
  const isEmpty = total <= 0 || visible.length === 0

  const radius = 40
  const strokeWidth = 14
  const circumference = 2 * Math.PI * radius

  let cumulativeOffset = 0
  const arcs = visible.map((cat) => {
    const fraction = cat.amount / total
    const arcLength = fraction * circumference
    const gap = Math.max(circumference - arcLength, 0.001)
    const arc = {
      color: cat.color,
      dasharray: `${arcLength} ${gap}`,
      dashoffset: -cumulativeOffset,
    }
    cumulativeOffset += arcLength
    return arc
  })

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-zinc-100 mb-4">Gastos por Categoría</h2>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg">
        <div className="relative w-48 h-48 mx-auto">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#27272a"
              strokeWidth={strokeWidth}
            />
            {!isEmpty &&
              arcs.map((arc, i) => (
                <circle
                  key={i}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={arc.dasharray}
                  strokeDashoffset={arc.dashoffset}
                  strokeLinecap="butt"
                />
              ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {isEmpty ? (
              <>
                <span className="text-2xl font-bold text-zinc-600 tabular-nums">€0.00</span>
                <span className="text-[10px] text-zinc-600 uppercase tracking-widest mt-1">Sin gastos</span>
              </>
            ) : (
              <>
                <span className="text-2xl font-bold text-zinc-100 tabular-nums">€{total.toFixed(2)}</span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Total del mes</span>
              </>
            )}
          </div>
        </div>

        {isEmpty ? (
          <p className="mt-6 text-center text-sm text-zinc-500">
            Aún no hay gastos este mes.
          </p>
        ) : (
          <ul className="mt-6 space-y-3">
            {visible.map((cat) => {
              const percent = (cat.amount / total) * 100
              return (
                <li key={cat.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-3 h-3 rounded-sm shrink-0"
                      style={{ backgroundColor: cat.color }}
                      aria-hidden
                    />
                    <span className="text-lg shrink-0">{cat.icon}</span>
                    <span className="text-zinc-300 truncate">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-medium text-zinc-100 tabular-nums">€{cat.amount.toFixed(2)}</span>
                    <span className="text-zinc-500 text-xs tabular-nums w-10 text-right">{percent.toFixed(0)}%</span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
