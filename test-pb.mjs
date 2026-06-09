async function run() {
  const authRes = await fetch('http://192.168.1.11:8090/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'unasev48@gmail.com', password: 'uVVcOMgRKfr1Rbj2' })
  })
  const authData = await authRes.json()
  const token = authData.token
  const user = authData.admin

  const formData = new FormData()
  formData.append('amount', '0.01')
  formData.append('concept', 'Procesando IA...')
  formData.append('status', 'PENDING_AI')
  // Use user.id from the admin token or skip paid_by to see what fails
  // Since we are testing amount, let's use valid user id by getting one user
  const userRes = await fetch('http://192.168.1.11:8090/api/collections/users/records?perPage=1', {
    headers: { 'Authorization': 'Bearer ' + token }
  })
  const usersData = await userRes.json()
  const realUserId = usersData.items[0].id
  const realCoupleId = usersData.items[0].couple_id

  formData.append('paid_by', realUserId)
  formData.append('type', 'EXPENSE')
  formData.append('is_refundable', 'false')
  formData.append('date', new Date().toISOString())
  if (realCoupleId) formData.append('couple_id', realCoupleId)
  
  formData.append('receipt', new Blob(['hello']), 'test.png')

  const res = await fetch('http://192.168.1.11:8090/api/collections/expenses/records', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token
    },
    body: formData
  })

  if (!res.ok) {
    const err = await res.json()
    console.error('Failed!', JSON.stringify(err, null, 2))
  } else {
    console.log('Success!')
  }
}
run()
