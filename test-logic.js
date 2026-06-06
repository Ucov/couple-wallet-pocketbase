const allExpenses = [
  // March: Partner owes User 16.99
  // If User pays 33.98, and Partner pays 0
  // normalTotal = 33.98
  // Expected = 16.99
  // User balance = 16.99 - 33.98 = -16.99
  { date: '2026-03-15T10:00:00Z', amount: 33.98, paid_by: 'User', is_transfer: false, is_refundable: false },
  
  // June: User owes Partner 17.50
  // If User pays 0, Partner pays 35.00
  // normalTotal = 35.00
  // Expected = 17.50
  // User balance = 17.50 - 0 = +17.50
  { date: '2026-06-15T10:00:00Z', amount: 35.00, paid_by: 'Partner', is_transfer: false, is_refundable: false },
  
  // User clicks "Saldar" in March. A transfer is created in June where Partner pays User 16.99.
  // { date: '2026-06-06T18:00:00Z', amount: 16.99, paid_by: 'Partner', is_transfer: true, is_refundable: false }
];

function calculate(viewedMonthIndex) {
  const endOfMonths = [
    new Date(2026, 3, 0, 23, 59, 59), // March 31
    new Date(2026, 4, 0, 23, 59, 59), // April 30
    new Date(2026, 5, 0, 23, 59, 59), // May 31
    new Date(2026, 6, 0, 23, 59, 59)  // June 30
  ];
  const endOfMonth = endOfMonths[viewedMonthIndex - 3]; // index 0 = March

  const viewedExpenses = allExpenses.filter((e) => new Date(e.date) <= endOfMonth)
  
  let myNorm = 0, partNorm = 0, myRef = 0, partRef = 0, myTrans = 0, partTrans = 0
  viewedExpenses.forEach(exp => {
    const amount = Number(exp.amount)
    if (exp.is_transfer) {
      if (exp.paid_by === 'User') myTrans += amount
      else partTrans += amount
    } else if (exp.is_refundable) {
      if (exp.paid_by === 'User') myRef += amount
      else partRef += amount
    } else {
      if (exp.paid_by === 'User') myNorm += amount
      else partNorm += amount
    }
  })
  
  const mySplitPercentage = 50
  const normalTotal = myNorm + partNorm
  let myBalance = (normalTotal * (mySplitPercentage / 100)) - myNorm
  myBalance += partRef - myRef - myTrans + partTrans
  
  let debtAmount = Math.abs(myBalance)
  let isOwed = false
  if (myBalance < -0.01) {
    isOwed = true
  } else if (myBalance > 0.01) {
    isOwed = false
  }

  console.log(`Month ${viewedMonthIndex}: myBalance = ${myBalance.toFixed(2)}, isOwed = ${isOwed}, debtAmount = ${debtAmount.toFixed(2)}`);

  // isSettled logic
  let currMyNorm = 0, currPartNorm = 0, currMyRef = 0, currPartRef = 0, currMyTrans = 0, currPartTrans = 0
  allExpenses.forEach(exp => {
    const amount = Number(exp.amount)
    if (exp.is_transfer) {
      if (exp.paid_by === 'User') currMyTrans += amount
      else currPartTrans += amount
    } else if (exp.is_refundable) {
      if (exp.paid_by === 'User') currMyRef += amount
      else currPartRef += amount
    } else {
      if (exp.paid_by === 'User') currMyNorm += amount
      else currPartNorm += amount
    }
  })
  
  let currBalance = (currMyNorm + currPartNorm) * (mySplitPercentage / 100) - currMyNorm
  currBalance += currPartRef - currMyRef - currMyTrans + currPartTrans
  const currDebtAmount = Math.abs(currBalance)
  
  const isSettled = currDebtAmount < 0.01 || (isOwed ? currBalance > -0.01 : currBalance < 0.01)
  console.log(`Month ${viewedMonthIndex}: isSettled = ${isSettled} (currBalance = ${currBalance.toFixed(2)})`);
}

calculate(3); // March
calculate(6); // June
