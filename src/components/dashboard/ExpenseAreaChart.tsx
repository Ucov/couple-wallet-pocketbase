'use client'

import { AreaChart } from '@tremor/react'

interface DailyData {
  day: string
  [key: string]: string | number
}

interface ExpenseAreaChartProps {
  data: DailyData[]
  myName: string
  partnerName: string
}

const customTooltip = (props: any) => {
  const { payload, active, label } = props
  if (!active || !payload) return null
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/90 backdrop-blur-md p-3 shadow-xl">
      <p className="text-zinc-400 text-xs font-semibold mb-2 uppercase tracking-widest">Día {label}</p>
      <div className="space-y-2">
        {payload.map((category: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between gap-6">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full`} style={{ backgroundColor: category.color }} />
              <p className="text-sm text-zinc-300 font-medium">{category.dataKey}</p>
            </div>
            <p className="text-sm font-bold text-white">€{Number(category.value).toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ExpenseAreaChart({ data, myName, partnerName }: ExpenseAreaChartProps) {
  return (
    <div className="h-64 mt-4">
      <AreaChart
        className="h-full w-full"
        data={data}
        index="day"
        categories={[myName, partnerName]}
        colors={['emerald-500', 'zinc-500']}
        yAxisWidth={40}
        showAnimation={true}
        curveType="monotone"
        showGradient={true}
        customTooltip={customTooltip}
      />
    </div>
  )
}
