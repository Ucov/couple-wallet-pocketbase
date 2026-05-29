'use client'

import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DailyData {
  day: string
  [key: string]: string | number
}

interface ExpenseAreaChartProps {
  data: DailyData[]
  myName: string
  partnerName: string
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/90 backdrop-blur-md p-3 shadow-xl">
        <p className="text-zinc-400 text-xs font-semibold mb-2 uppercase tracking-widest">Día {label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-6">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <p className="text-sm text-zinc-300 font-medium">{entry.name}</p>
              </div>
              <p className="text-sm font-bold text-white">€{Number(entry.value).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export default function ExpenseAreaChart({ data, myName, partnerName }: ExpenseAreaChartProps) {
  return (
    <div className="h-64 mt-4 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
          margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorMyName" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorPartnerName" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#71717a" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#71717a" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="day" 
            stroke="#52525b" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#a1a1aa' }}
            dy={10}
          />
          <YAxis 
            stroke="#52525b" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#a1a1aa' }}
            tickFormatter={(value) => `€${value}`}
          />
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#52525b', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Area type="monotone" dataKey={myName} stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorMyName)" />
          <Area type="monotone" dataKey={partnerName} stroke="#71717a" strokeWidth={3} fillOpacity={1} fill="url(#colorPartnerName)" />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  )
}
