import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PlusCircle, LogOut, Pencil, ChevronLeft, ChevronRight, Repeat, CheckCircle, UserCog } from 'lucide-react'
import { logout } from './login/actions'
import DeleteExpenseButton from '@/components/DeleteExpenseButton'
import DailyBarChart from '@/components/DailyBarChart'
import CategoryProgressList from '@/components/CategoryProgressList'
import { applyRecurringExpenses } from './recurring-actions'
import { settleMonth } from './settlement-actions'
import MonthNavigator from '@/components/MonthNavigator'
import { leaveCouple } from './setup-couple/actions'
import FloatingAddButton from '@/components/FloatingAddButton'

// Forzamos que la página sea siempre dinámica y no se guarde en caché
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Category {
  name: string
  icon: string
  color: string
}

interface Expense {
  id: string
  amount: number
  concept: string
  date: string
  created_at: string
  paid_by: string
  category_id?: string
  is_refundable?: boolean
  categories: Category | Category[] | null
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>
}) {
  const supabase = await createClient()
  const { month, year } = await searchParams

  // 1. Verificar auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Obtener perfil del usuario
  const { data: userProfile, error: profileError } = await supabase
    .from('profiles')
    .select(`
      couple_id, 
      name
    `)
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('Error fetching profile:', profileError)
  }

  if (!userProfile?.couple_id) {
    redirect('/setup-couple')
  }

  const myName = userProfile?.name || user.email?.split('@')[0] || 'Usuario'
  let partnerName = 'Pareja'
  
  const { data: partnerData } = await supabase
    .from('profiles')
    .select('name')
    .eq('couple_id', userProfile.couple_id)
    .neq('id', user.id)
    .maybeSingle()
  
  if (partnerData?.name) {
    partnerName = partnerData.name;
  }

  // 3. Manejo de fechas y gastos recurrentes
  const now = new Date()
  
  if (userProfile?.couple_id) {
    try {
      await applyRecurringExpenses(userProfile.couple_id, now.getMonth(), now.getFullYear(), false)
    } catch (e) {
      console.error('Error applying recurring expenses:', e)
    }
  }

  const currentMonth = month ? parseInt(month) : now.getMonth()
  const currentYear = year ? parseInt(year) : now.getFullYear()
  
  const startOfMonth = new Date(currentYear, currentMonth, 1)
  const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59)

  // 4. Obtener gastos del mes seleccionado
  let expensesQuery = supabase
    .from('expenses')
    .select(`
      id, 
      amount, 
      concept, 
      date, 
      created_at, 
      paid_by,
      category_id,
      is_refundable,
      categories ( name, icon, color )
    `)
    .gte('date', startOfMonth.toISOString())
    .lte('date', endOfMonth.toISOString())
    .order('date', { ascending: false })

  if (userProfile?.couple_id) {
    expensesQuery = expensesQuery.eq('couple_id', userProfile.couple_id)
  } else {
    expensesQuery = expensesQuery.eq('paid_by', user.id)
  }

  const { data: expenses } = await expensesQuery

  // 5. Cálculos del mes actual
  let myNormalTotal = 0
  let partnerNormalTotal = 0
  let myRefundableTotal = 0
  let partnerRefundableTotal = 0
  const categoryTotals: Record<string, { name: string; amount: number; color: string; icon: string }> = {}
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
    day: String(i + 1),
    amount: 0,
    isToday: currentMonth === now.getMonth() && currentYear === now.getFullYear() && i + 1 === now.getDate()
  }))

  const refundableExpenses: Expense[] = []

  expenses?.forEach(exp => {
    const amount = Number(exp.amount)
    
    if (exp.is_refundable) {
      refundableExpenses.push(exp)
      if (exp.paid_by === user.id) myRefundableTotal += amount
      else partnerRefundableTotal += amount
    } else {
      if (exp.paid_by === user.id) myNormalTotal += amount
      else partnerNormalTotal += amount
    }

    const day = new Date(exp.date).getDate()
    dailyData[day - 1].amount += amount

    const categories = exp.categories
    const category = Array.isArray(categories) ? categories[0] : categories
    const catId = exp.category_id || 'no-category'
    if (!categoryTotals[catId]) {
      categoryTotals[catId] = {
        name: category?.name || 'Sin categoría',
        amount: 0,
        color: category?.color || '#6b7280',
        icon: category?.icon || '💰'
      }
    }
    categoryTotals[catId].amount += amount
  })

  const totalMonth = myTotal + partnerTotal
  const sortedCategories = Object.values(categoryTotals).sort((a, b) => b.amount - a.amount)

  // 6. Obtener gastos del mes anterior para comparativa
  const prevMonthStart = new Date(currentYear, currentMonth - 1, 1)
  const prevMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59)
  
  let prevExpensesQuery = supabase
    .from('expenses')
    .select('amount')
    .gte('date', prevMonthStart.toISOString())
    .lte('date', prevMonthEnd.toISOString())
    
  if (userProfile?.couple_id) {
    prevExpensesQuery = prevExpensesQuery.eq('couple_id', userProfile.couple_id)
  } else {
    prevExpensesQuery = prevExpensesQuery.eq('paid_by', user.id)
  }
  
  const { data: prevExpenses } = await prevExpensesQuery
  const prevTotal = prevExpenses?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0
  
  let trendPercent = 0
  if (prevTotal > 0) {
    trendPercent = ((totalMonth - prevTotal) / prevTotal) * 100
  } else if (totalMonth > 0) {
    trendPercent = 100
  }

  // 7. Verificar si el mes está saldado
  let isSettled = false
  if (userProfile?.couple_id) {
    const { data: settlement } = await supabase
      .from('settlements')
      .select('id')
      .eq('couple_id', userProfile.couple_id)
      .eq('month', currentMonth)
      .eq('year', currentYear)
      .maybeSingle()
    
    if (settlement) {
      isSettled = true
    }
  }

  let settlementMessage = 'Sin gastos este mes'
  let settlementSubMessage = ''
  let showSettleButton = false
  let debtAmount = 0
  let isOwed = false

  const myTotal = myNormalTotal + myRefundableTotal
  const partnerTotal = partnerNormalTotal + partnerRefundableTotal
  const totalMonth = myTotal + partnerTotal

  if (userProfile?.couple_id) {
    if (isSettled) {
      settlementMessage = 'Mes saldado. Todo al día ✅'
    } else {
      const mySplitPercentage = userProfile?.split_percentage ?? 50
      
      const normalTotal = myNormalTotal + partnerNormalTotal
      const myExpectedNormalShare = normalTotal * (mySplitPercentage / 100)
      
      let myBalance = myExpectedNormalShare - myNormalTotal // >0 = I underpaid normal expenses
      myBalance += partnerRefundableTotal // I owe 100% of their refundable expenses
      myBalance -= myRefundableTotal // They owe 100% of my refundable expenses
      
      debtAmount = Math.abs(myBalance)
      if (myBalance < 0) { // I overpaid overall
        settlementMessage = 'Te deben un Bizum de:'
        settlementSubMessage = partnerName
        isOwed = true
        showSettleButton = debtAmount > 0
      } else if (myBalance > 0) { // I underpaid overall
        settlementMessage = 'Tienes que hacer un Bizum de:'
        settlementSubMessage = `a ${partnerName}`
        isOwed = false
        showSettleButton = debtAmount > 0
      } else if (totalMonth > 0) {
        settlementMessage = 'Estáis completamente en paz 🍻'
      }
    }
  }

  const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(startOfMonth)

  return (
    <main className="w-full max-w-md mx-auto p-4 flex flex-col min-h-screen">
      <header className="flex justify-between items-center py-6 mb-2">
        <div>
          <h1 className="text-2xl font-bold">CoupleWallet</h1>
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-1">
            Hola, {myName}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/recurring" className="text-zinc-400 hover:text-emerald-400 transition-colors" title="Gastos Fijos">
            <Repeat size={20} />
          </Link>
          <form action={logout}>
            <button className="text-zinc-400 hover:text-red-400 transition-colors" title="Cerrar sesión">
              <LogOut size={20} />
            </button>
          </form>
        </div>
      </header>

      <MonthNavigator currentMonth={currentMonth} currentYear={currentYear} monthName={monthName} />

      {/* Gráfico de Barras Diario */}
      <DailyBarChart data={dailyData} total={totalMonth} trendPercent={trendPercent} />

      {/* Ajuste de Cuentas (Premium Card) */}
      <section className="mb-8">
        <div className={`relative overflow-hidden rounded-3xl p-6 shadow-xl border ${debtAmount > 0 && !isOwed && !isSettled ? 'bg-gradient-to-br from-red-950 to-zinc-900 border-red-900/50' : debtAmount > 0 && isOwed && !isSettled ? 'bg-gradient-to-br from-emerald-950 to-zinc-900 border-emerald-900/50' : 'bg-zinc-900 border-zinc-800'}`}>
          <div className="relative z-10 flex flex-col justify-center items-center text-center">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-2">Balance Mensual</h2>
            <p className="text-zinc-300 font-medium mb-1">{settlementMessage}</p>
            {debtAmount > 0 && !isSettled && (
              <div className="flex flex-col items-center justify-center mt-2 mb-4">
                <span className={`text-5xl font-black ${isOwed ? 'text-emerald-400' : 'text-red-400'} tracking-tighter`}>
                  €{debtAmount.toFixed(2)}
                </span>
                <span className="text-zinc-500 mt-1">{settlementSubMessage}</span>
              </div>
            )}
            
            {showSettleButton && userProfile?.couple_id && (
              <form action={settleMonth.bind(null, userProfile.couple_id, currentMonth, currentYear)} className="mt-4 w-full">
                <button 
                  type="submit" 
                  className={`w-full py-3 rounded-xl font-bold shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 ${isOwed ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/50' : 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/50'}`}
                >
                  <CheckCircle size={20} /> 
                  Saldar Mes
                </button>
              </form>
            )}
            
            <div className="flex justify-between w-full mt-6 pt-6 border-t border-zinc-800/50 text-sm">
              <div className="flex flex-col items-start">
                <span className="text-zinc-500">Tú pagaste</span>
                <span className="text-lg font-semibold text-zinc-200">€{myTotal.toFixed(2)}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-zinc-500">{partnerName} pagó</span>
                <span className="text-lg font-semibold text-zinc-200">€{partnerTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resumen por Categorías (Progreso) */}
      <CategoryProgressList categories={sortedCategories} total={totalMonth} />

      {/* Lista de Gastos */}
      <section className="flex-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-zinc-100">Últimos Gastos</h2>
        </div>

        {refundableExpenses.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Reembolsos Pendientes</h3>
            <div className="space-y-3">
              {refundableExpenses.map((expense) => {
                const categories = expense.categories
                const category = Array.isArray(categories) ? categories[0] : categories
                return (
                  <div key={expense.id} className="bg-zinc-900/50 p-4 rounded-xl flex justify-between items-center border border-zinc-800 hover:bg-zinc-800/50 transition-colors group">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-xl shadow-inner border border-zinc-700">
                        {category?.icon || '📦'}
                      </div>
                      <div>
                        <p className="font-medium text-white flex items-center gap-2">
                          {expense.concept}
                          <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full uppercase font-bold tracking-widest border border-zinc-700">Reembolsable</span>
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {new Date(expense.date).toLocaleDateString('es-ES')} • Pendiente de devolución
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div className="mr-2">
                        <p className="font-bold text-zinc-300">€{Number(expense.amount).toFixed(2)}</p>
                        <p className="text-[10px] uppercase tracking-wider text-zinc-500 mt-0.5 font-semibold">
                          {expense.paid_by === user.id ? 'Tú pagaste' : `${partnerName} pagó`}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity gap-1">
                        <Link href={`/edit/${expense.id}`} className="text-zinc-600 hover:text-emerald-400 transition-colors p-1 bg-zinc-900 rounded-lg border border-zinc-800">
                          <Pencil size={16} />
                        </Link>
                        <DeleteExpenseButton 
                          id={expense.id} 
                          concept={expense.concept} 
                          amount={Number(expense.amount)} 
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="space-y-3 pb-32">
          {expenses?.filter(e => !e.is_refundable).map((expense: Expense) => {
            const categories = expense.categories
            const category = Array.isArray(categories) ? categories[0] : categories
            return (
              <div key={expense.id} className="bg-zinc-900/50 p-4 rounded-xl flex justify-between items-center border border-zinc-800/50 hover:bg-zinc-800/50 transition-colors group">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-xl shadow-inner">
                    {category?.icon || '💰'}
                  </div>
                  <div>
                    <p className="font-medium text-zinc-200">{expense.concept}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {new Date(expense.date).toLocaleDateString('es-ES')} • {category?.name || 'General'}
                    </p>
                  </div>
                </div>
              <div className="text-right flex items-center gap-2">
                <div className="mr-2">
                  <p className="font-bold text-zinc-100">€{Number(expense.amount).toFixed(2)}</p>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 mt-0.5 font-semibold">
                    {expense.paid_by === user.id ? 'Tú' : partnerName}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity gap-1">
                  <Link href={`/edit/${expense.id}`} className="text-zinc-600 hover:text-emerald-400 transition-colors p-1 bg-zinc-900 rounded-lg border border-zinc-800">
                    <Pencil size={16} />
                  </Link>
                  <DeleteExpenseButton 
                    id={expense.id} 
                    concept={expense.concept} 
                    amount={Number(expense.amount)} 
                  />
                </div>
              </div>
            </div>
          )
        })}
          {(!expenses || expenses.length === 0) && (
            <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
              <p className="text-zinc-500 font-medium">Aún no hay gastos en este mes.</p>
              <p className="text-sm text-zinc-600 mt-1">Pulsa el botón + abajo para añadir el primero.</p>
            </div>
          )}
        </div>
      </section>

      <FloatingAddButton />
    </main>
  )
}
