'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/pocketbase/server'
import { cookies } from 'next/headers'

async function setAuthCookie(pb: any) {
  const cookieStore = await cookies()
  const authData = JSON.stringify({ token: pb.authStore.token, model: pb.authStore.model })
  
  cookieStore.set('pb_auth', authData, {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7 // 7 dias de sesion
  })
}

export async function login(formData: FormData) {
  const pb = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    await pb.collection('users').authWithPassword(email, password)
    await setAuthCookie(pb)
  } catch (error: any) {
    console.error('Login error:', error)
    redirect('/login?message=Could not authenticate user')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const pb = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    await pb.collection('users').create({
        email,
        password,
        passwordConfirm: password
    })
    // Auto login
    await pb.collection('users').authWithPassword(email, password)
    await setAuthCookie(pb)
  } catch (error: any) {
    redirect(`/login?message=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logout() {
  const pb = await createClient()
  pb.authStore.clear()
  const cookieStore = await cookies()
  cookieStore.delete('pb_auth')
  redirect('/login')
}
