import { createClient } from '@/utils/pocketbase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PlusCircle, LogOut, Pencil, ChevronLeft, ChevronRight, Repeat, CheckCircle, UserCog, AlertCircle } from 'lucide-react'
import { logout } from './login/actions'
import DeleteExpenseButton from '@/components/DeleteExpenseButton'
import DailyBarChart from '@/components/DailyBarChart'
import CategoryProgressList from '@/components/CategoryProgressList'
import { applyRecurringExpenses } from './recurring-actions'
import { settleMonth } from './settlement-actions'
import MonthNavigator from '@/components/MonthNavigator'
import { leaveCouple } from './setup-couple/actions'
import { getCategoryIcon } from '@/lib/utils'

import HeroBalanceCard from '@/components/dashboard/HeroBalanceCard'
import ExpenseAreaChart from '@/components/dashboard/ExpenseAreaChart'
import CategoryDistribution from '@/components/dashboard/CategoryDistribution'
import ExpenseItem from '@/components/dashboard/ExpenseItem'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
  is_transfer?: boolean
  type?: string
  status?: string
  categories: Category | Category[] | null
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>
}) {
  const pb = await createClient()
  const { month, year } = await searchParams

  // 1. Verificar auth
  if (!pb.authStore.isValid) {
    redirect('/login')
  }
  const user = pb.authStore.model
  if (!user) {
    redirect('/login')
  }

  // 2. Obtener perfil del usuario
  let userProfile: any = null
  try {
    userProfile = await pb.collection('users').getOne(user.id)
  } catch (profileError) {
    console.error('Error fetching profile:', profileError)
  }

  if (!userProfile?.couple_id) {
    redirect('/setup-couple')
  }

  const myName = userProfile?.name || user.email?.split('@')[0] || 'Usuario'
  let partnerName = 'Pareja'

  const now = new Date()
  const currentMonth = month ? parseInt(month) : now.getMonth()
  const currentYear = year ? parseInt(year) : now.getFullYear()
  const startOfMonth = new Date(currentYear, currentMonth, 1)
  const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59)
  const prevMonthStart = new Date(currentYear, currentMonth - 1, 1)
  const prevMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59)

  let partnerData: any = null
  if (userProfile?.couple_id) {
    try {
      partnerData = await pb.collection('users').getFirstListItem(`couple_id="${userProfile.couple_id}" && id!="${user.id}"`)
    } catch(e) {}
  }

  const applyRecurring = userProfile?.couple_id 
    ? applyRecurringExpenses(userProfile.couple_id, now.getMonth(), now.getFullYear(), false).catch(e => console.error(e))
    : Promise.resolve()

  await applyRecurring

  let allExpensesFilter = userProfile?.couple_id 
    ? `couple_id="${userProfile.couple_id}"` 
    : `paid_by="${user.id}"`

  let allExpenses: any[] = []
  try {
    allExpenses = await pb.collection('expenses').getFullList({
        filter: allExpensesFilter,
        sort: '-date',
        expand: 'category_id'
    })
  } catch(e) { console.error('Error fetching all expenses:', e) }

  const expenses = allExpenses.filter((e: any) => {
    const d = new Date(e.date)
    return d >= startOfMonth && d <= endOfMonth
  })

  // Extract pending expenses from all time (or current month) that need review
  const pendingExpenses = allExpenses.filter((e: any) => e.status === 'MISSING_RECEIPT')

  const prevExpenses = allExpenses.filter((e: any) => {
    const d = new Date(e.date)
    return d >= prevMonthStart && d <= prevMonthEnd && !e.is_transfer
  })

  if (partnerData?.name) partnerName = partnerData.name

  // 5. Cálculos del mes actual
  let myNormalTotal = 0
  let partnerNormalTotal = 0
  let myRefundableTotal = 0
  let partnerRefundableTotal = 0
  let myTransfersSent = 0
  let partnerTransfersSent = 0
  const categoryTotals: Record<string, { name: string; amount: number; color: string; icon: string }> = {}
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const dailyData: any[] = Array.from({ length: daysInMonth }, (_, i) => ({
    day: String(i + 1),
    [myName]: 0,
    [partnerName]: 0,
    isToday: currentMonth === now.getMonth() && currentYear === now.getFullYear() && i + 1 === now.getDate()
  }))

  const refundableExpenses: Expense[] = []

  // Accumulativo para el AreaChart
  let myCumulative = 0
  let partnerCumulative = 0

  // Aseguramos que los gastos están ordenados del más antiguo al más reciente para la suma acumulativa
  const sortedExpensesAsc = [...(expenses || [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  sortedExpensesAsc?.forEach(exp => {
    const amount = Number(exp.amount)
    
    if (exp.is_transfer) {
      if (exp.paid_by === user.id) myTransfersSent += amount
      else partnerTransfersSent += amount
      return // No sumarlo a totales normales ni a gráficas
    }

    if (exp.is_refundable) {
      refundableExpenses.push(exp)
      if (exp.paid_by === user.id) myRefundableTotal += amount
      else partnerRefundableTotal += amount
    } else if (exp.type === 'INCOME') {
      if (exp.paid_by === user.id) {
        myNormalTotal -= amount
        myCumulative -= amount
      } else {
        partnerNormalTotal -= amount
        partnerCumulative -= amount
      }
      // Update daily graph with lower cumulative
      const day = new Date(exp.date).getDate()
      dailyData[day - 1][myName] = myCumulative
      dailyData[day - 1][partnerName] = partnerCumulative
    } else {
      if (exp.paid_by === user.id) {
        myNormalTotal += amount
        myCumulative += amount
      } else {
        partnerNormalTotal += amount
        partnerCumulative += amount
      }

      const day = new Date(exp.date).getDate()
      dailyData[day - 1][myName] = myCumulative
      dailyData[day - 1][partnerName] = partnerCumulative

      const category = exp.expand?.category_id

      const catId = exp.category_id || 'no-category'
      if (!categoryTotals[catId]) {
        categoryTotals[catId] = {
          name: category?.name || 'Sin categoría',
          amount: 0,
          color: category?.color || '#6b7280',
          icon: getCategoryIcon(category?.icon, category?.name)
        }
      }
      categoryTotals[catId].amount += amount
    }
  })

  // Rellenar días sin gastos para el gráfico acumulativo
  for (let i = 1; i < dailyData.length; i++) {
    if (dailyData[i][myName] === 0 && dailyData[i - 1][myName] > 0) {
      dailyData[i][myName] = dailyData[i - 1][myName]
    }
    if (dailyData[i][partnerName] === 0 && dailyData[i - 1][partnerName] > 0) {
      dailyData[i][partnerName] = dailyData[i - 1][partnerName]
    }
  }

  const myTotal = myNormalTotal
  const partnerTotal = partnerNormalTotal
  const totalMonth = myTotal + partnerTotal
  const sortedCategories = Object.values(categoryTotals).sort((a, b) => b.amount - a.amount)

  const prevTotal = prevExpenses?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0
  
  let trendPercent = 0
  if (prevTotal > 0) {
    trendPercent = ((totalMonth - prevTotal) / prevTotal) * 100
  } else if (totalMonth > 0) {
    trendPercent = 100
  }

  // 7. Balance y Deudas
  let settlementMessage = 'Sin gastos este mes'
  let settlementSubMessage = ''
  let showSettleButton = false
  let debtAmount = 0
  let isOwed = false
  let prevDebtAmount = 0
  let prevIsOwed = false
  let currMonthDebtAmount = 0
  let currMonthIsOwed = false

  if (userProfile?.couple_id) {
    const mySplitPercentage = userProfile?.split_percentage ?? 50

    // Calcular balance acumulado HASTA el final del mes anterior (deuda arrastrada)
    const prevAccumExpenses = allExpenses.filter((e: any) => new Date(e.date) < startOfMonth)
    let prevMyNorm = 0, prevPartNorm = 0, prevMyRef = 0, prevPartRef = 0, prevMyTrans = 0, prevPartTrans = 0
    prevAccumExpenses.forEach(exp => {
      const amount = Number(exp.amount)
      if (exp.is_transfer) {
        if (exp.paid_by === user.id) prevMyTrans += amount
        else prevPartTrans += amount
      } else if (exp.is_refundable) {
        if (exp.paid_by === user.id) prevMyRef += amount
        else prevPartRef += amount
      } else if (exp.type === 'INCOME') {
        if (exp.paid_by === user.id) prevMyNorm -= amount
        else prevPartNorm -= amount
      } else {
        if (exp.paid_by === user.id) prevMyNorm += amount
        else prevPartNorm += amount
      }
    })
    const prevNormalTotal = prevMyNorm + prevPartNorm
    let prevMyBalance = (prevNormalTotal * (mySplitPercentage / 100)) - prevMyNorm
    prevMyBalance += prevPartRef - prevMyRef - prevMyTrans + prevPartTrans
    prevDebtAmount = Math.abs(prevMyBalance)
    prevIsOwed = prevMyBalance < -0.01

    // Calcular balance acumulado HASTA el final del mes actual (deuda total)
    const viewedExpenses = allExpenses.filter((e: any) => new Date(e.date) <= endOfMonth)
    
    let myNorm = 0, partNorm = 0, myRef = 0, partRef = 0, myTrans = 0, partTrans = 0
    viewedExpenses.forEach(exp => {
      const amount = Number(exp.amount)
      if (exp.is_transfer) {
        if (exp.paid_by === user.id) myTrans += amount
        else partTrans += amount
      } else if (exp.is_refundable) {
        if (exp.paid_by === user.id) myRef += amount
        else partRef += amount
      } else if (exp.type === 'INCOME') {
        if (exp.paid_by === user.id) myNorm -= amount
        else partNorm -= amount
      } else {
        if (exp.paid_by === user.id) myNorm += amount
        else partNorm += amount
      }
    })
    
    const normalTotal = myNorm + partNorm
    let myBalance = (normalTotal * (mySplitPercentage / 100)) - myNorm
    myBalance += partRef - myRef - myTrans + partTrans
    
    // Calcular balance SOLO del mes actual (para mostrar el desglose)
    const currentMonthExpenses = expenses
    let currMyNorm = 0, currPartNorm = 0, currMyRef = 0, currPartRef = 0, currMyTrans = 0, currPartTrans = 0
    currentMonthExpenses.forEach((exp: any) => {
      const amount = Number(exp.amount)
      if (exp.is_transfer) {
        if (exp.paid_by === user.id) currMyTrans += amount
        else currPartTrans += amount
      } else if (exp.is_refundable) {
        if (exp.paid_by === user.id) currMyRef += amount
        else currPartRef += amount
      } else if (exp.type === 'INCOME') {
        if (exp.paid_by === user.id) currMyNorm -= amount
        else currPartNorm -= amount
      } else {
        if (exp.paid_by === user.id) currMyNorm += amount
        else currPartNorm += amount
      }
    })
    const currNormalTotal = currMyNorm + currPartNorm
    let currMyBalance = (currNormalTotal * (mySplitPercentage / 100)) - currMyNorm
    currMyBalance += currPartRef - currMyRef - currMyTrans + currPartTrans
    currMonthDebtAmount = Math.abs(currMyBalance)
    currMonthIsOwed = currMyBalance < -0.01

    // Comprobar si la deuda de este mes fue compensada en meses posteriores
    let futureGlobalBalance = myBalance
    let isSettled = false
    let settledMonthName = ''
    
    // Solo comprobamos si hay una deuda real (> 0.01€)
    if (Math.abs(myBalance) > 0.01) {
      const initialSign = Math.sign(myBalance)
      
      // Filtramos solo los gastos que ocurrieron DESPUÉS del mes que estamos mirando
      // y los ordenamos de más antiguo a más nuevo (cronológicamente)
      const futureExpenses = (allExpenses || [])
        .filter((e: any) => new Date(e.date) > endOfMonth)
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
        
      for (const exp of futureExpenses) {
        const amount = Number(exp.amount)
        if (exp.is_transfer) {
          if (exp.paid_by === user.id) futureGlobalBalance -= amount
          else futureGlobalBalance += amount
        } else if (exp.is_refundable) {
          if (exp.paid_by === user.id) futureGlobalBalance -= amount
          else futureGlobalBalance += amount
        } else if (exp.type === 'INCOME') {
          const myShare = amount * (mySplitPercentage / 100)
          if (exp.paid_by === user.id) futureGlobalBalance -= (myShare - amount)
          else futureGlobalBalance -= myShare
        } else {
          const myShare = amount * (mySplitPercentage / 100)
          if (exp.paid_by === user.id) futureGlobalBalance += (myShare - amount)
          else futureGlobalBalance += myShare
        }
        
        // Si el balance cruza el cero o se queda muy cerca (margen de error), la deuda se saldó
        if (Math.abs(futureGlobalBalance) < 0.5 || Math.sign(futureGlobalBalance) !== initialSign) {
          isSettled = true
          settledMonthName = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date(exp.date))
          settledMonthName = settledMonthName.charAt(0).toUpperCase() + settledMonthName.slice(1)
          break // Rompemos el bucle porque ya se ha saldado
        }
      }
    }

    // Inicialmente el número gigante que mostraremos es el balance real del mes
    debtAmount = Math.abs(myBalance)

    // ¡CRÍTICO! Si se detecta que se ha saldado, ponemos debtAmount a 0 
    // para que la UI muestre el Check Verde en vez del número rojo.
    if (isSettled) {
      settlementMessage = `Deuda saldada en ${settledMonthName} 🍻`
      settlementSubMessage = ''
      isOwed = false
      showSettleButton = false
      debtAmount = 0 // <-- MUY IMPORTANTE
    } else {
      if (myBalance < -0.01) { // Yo he pagado de más
        settlementMessage = 'Te deben un Bizum de:'
        settlementSubMessage = partnerName
        isOwed = true
        showSettleButton = debtAmount > 0.01
      } else if (myBalance > 0.01) { // Yo debo dinero
        settlementMessage = 'Tienes que hacer un Bizum de:'
        settlementSubMessage = `a ${partnerName}`
        isOwed = false
        showSettleButton = debtAmount > 0.01
      } else if (totalMonth > 0 || currMonthDebtAmount > 0 || myTransfersSent > 0 || partnerTransfersSent > 0) {
        settlementMessage = 'Estáis completamente en paz 🍻'
      }
    }
  }


  const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(startOfMonth)

  return (
    <main className="w-full max-w-md mx-auto p-4 flex flex-col min-h-screen pb-24">
      <header className="flex justify-between items-center py-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shadow-inner border border-emerald-500/30">
            {myName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">CoupleWallet</h1>
            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest mt-0.5">
              Hola, {myName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-zinc-900/50 p-1.5 rounded-full border border-zinc-800">
          <Link href="/recurring" className="p-2 rounded-full text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 transition-all" title="Gastos Fijos">
            <Repeat size={18} />
          </Link>
          <form action={logout}>
            <button className="p-2 rounded-full text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-all" title="Cerrar sesión">
              <LogOut size={18} />
            </button>
          </form>
        </div>
      </header>

      <div className="mb-4">
        <MonthNavigator currentMonth={currentMonth} currentYear={currentYear} monthName={monthName} />
      </div>

      {pendingExpenses.length > 0 && (
        <section className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <Link href={`/edit/${pendingExpenses[0].id}`}>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between shadow-[0_0_15px_rgba(245,158,11,0.1)] transition-transform active:scale-95">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h3 className="text-amber-500 font-bold text-sm">Bandeja de Revisión</h3>
                  <p className="text-zinc-400 text-xs">
                    Tienes {pendingExpenses.length} {pendingExpenses.length === 1 ? 'gasto automático' : 'gastos automáticos'} sin ticket o categoría.
                  </p>
                </div>
              </div>
              <ChevronRight className="text-amber-500/50" size={20} />
            </div>
          </Link>
        </section>
      )}

      <section className="mb-6">
        <HeroBalanceCard 
          debtAmount={debtAmount}
          isOwed={isOwed}
          settlementMessage={settlementMessage}
          settlementSubMessage={settlementSubMessage}
          showSettleButton={showSettleButton}
          myTotal={myTotal}
          partnerTotal={partnerTotal}
          partnerName={partnerName}
          prevDebtAmount={prevDebtAmount}
          prevIsOwed={prevIsOwed}
          currMonthDebtAmount={currMonthDebtAmount}
          currMonthIsOwed={currMonthIsOwed}
          settleAction={userProfile?.couple_id && partnerData?.id ? settleMonth.bind(null, userProfile.couple_id, currentMonth, currentYear, debtAmount, isOwed ? partnerData.id : user.id) : undefined}
        />
      </section>

      <section className="mb-6">
        <Tabs defaultValue="evolucion" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-900/50 border border-zinc-800 p-1 mb-4 rounded-xl">
            <TabsTrigger value="evolucion" className="rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400">Evolución</TabsTrigger>
            <TabsTrigger value="categorias" className="rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400">Categorías</TabsTrigger>
          </TabsList>
          
          <TabsContent value="evolucion" className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-4 shadow-lg backdrop-blur-sm">
            <div className="flex items-end justify-between px-2 mb-2">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Total Gastado</p>
                <h3 className="text-2xl font-bold text-zinc-100 mt-1">€{totalMonth.toFixed(2)}</h3>
              </div>
              <div className={`text-sm font-semibold flex items-center px-2 py-1 rounded-full ${trendPercent <= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {trendPercent <= 0 ? '↓' : '↑'} {Math.abs(trendPercent).toFixed(0)}%
              </div>
            </div>
            <ExpenseAreaChart data={dailyData} myName={myName} partnerName={partnerName} />
          </TabsContent>
          
          <TabsContent value="categorias" className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-4 shadow-lg backdrop-blur-sm">
            <CategoryDistribution categories={sortedCategories} total={totalMonth} />
          </TabsContent>
        </Tabs>
      </section>

      <section className="flex-1">
        <div className="flex justify-between items-center mb-5 px-1">
          <h2 className="text-lg font-bold text-zinc-100 tracking-tight">Últimos Movimientos</h2>
          <Link
            href="/add"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-zinc-950 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-transform active:scale-95"
          >
            <PlusCircle size={18} />
            <span className="text-sm">Añadir</span>
          </Link>
        </div>

        <div className="space-y-0 relative">
          {(!expenses || expenses.length === 0) && (
            <div className="text-center py-12 border-2 border-dashed border-zinc-800/60 rounded-3xl bg-zinc-900/20">
              <p className="text-zinc-500 font-medium">No hay movimientos.</p>
            </div>
          )}
          
          {expenses?.map((expense: any) => {
            const category = expense.expand?.category_id
            return (
              <ExpenseItem
                key={expense.id}
                id={expense.id}
                concept={expense.concept}
                amount={Number(expense.amount)}
                date={expense.date}
                paidByStr={expense.paid_by === user.id ? 'Tú' : partnerName}
                categoryName={category?.name || 'General'}
                categoryIcon={getCategoryIcon(category?.icon, category?.name)}
                isRefundable={expense.is_refundable}
                isTransfer={expense.is_transfer}
                status={expense.status}
              />
            )
          })}
        </div>
      </section>
    </main>
  )
}
