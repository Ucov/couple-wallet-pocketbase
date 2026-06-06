import { createClient } from '@/utils/pocketbase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const pb = await createClient()
    if (!pb.authStore.isValid) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    
    const user = pb.authStore.model
    if (!user) return NextResponse.json({ error: 'No user' }, { status: 401 })
      
    const userProfile = await pb.collection('users').getOne(user.id).catch(() => null)
    
    const allExpensesFilter = userProfile?.couple_id 
      ? `couple_id="${userProfile.couple_id}"` 
      : `paid_by="${user.id}"`
      
    const allExpenses = await pb.collection('expenses').getFullList({
        filter: allExpensesFilter,
        sort: '-date',
        expand: 'category_id'
    }).catch(e => {
      console.error(e)
      return []
    })

    const results = [];
    // Test for May and June
    for (const month of [4, 5]) { // May is 4, June is 5 (0-indexed)
      const currentYear = new Date().getFullYear();
      const endOfMonth = new Date(currentYear, month + 1, 0, 23, 59, 59);
      const viewedExpenses = allExpenses.filter((e: any) => new Date(e.date) <= endOfMonth);
      
      let myNorm = 0, partNorm = 0, myRef = 0, partRef = 0, myTrans = 0, partTrans = 0
      viewedExpenses.forEach(exp => {
        const amount = Number(exp.amount)
        if (exp.is_transfer) {
          if (exp.paid_by === user.id) myTrans += amount
          else partTrans += amount
        } else if (exp.is_refundable) {
          if (exp.paid_by === user.id) myRef += amount
          else partRef += amount
        } else {
          if (exp.paid_by === user.id) myNorm += amount
          else partNorm += amount
        }
      })
      
      const mySplitPercentage = userProfile?.split_percentage ?? 50
      const normalTotal = myNorm + partNorm
      let myBalance = (normalTotal * (mySplitPercentage / 100)) - myNorm
      myBalance += partRef - myRef - myTrans + partTrans
      
      results.push({
        monthIndex: month,
        endOfMonth: endOfMonth.toISOString(),
        viewedExpensesCount: viewedExpenses.length,
        myNorm,
        partNorm,
        myTrans,
        partTrans,
        myBalance,
      })
    }

    return NextResponse.json({
      user: user.id,
      couple_id: userProfile?.couple_id,
      totalExpensesFound: allExpenses.length,
      results,
      allExpenses: allExpenses.map(e => ({
        id: e.id,
        date: e.date,
        amount: e.amount,
        paid_by: e.paid_by,
        is_transfer: e.is_transfer
      }))
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
