'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/pocketbase/server'
import { cookies } from 'next/headers'

async function setAuthCookie(cookieStr: string) {
  // PocketBase devuelve un string largo de cookie, tenemos que setearlo en Next
  const cookieStore = await cookies()
  const parts = cookieStr.split(';')
  const firstPart = parts[0].split('=')
  
  if (firstPart.length === 2) {
    // Para simplificar, confiamos en PocketBase exportToCookie pero lo seteamos con next
    // @ts-ignore
    cookieStore.set(firstPart[0], firstPart[1], {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        httpOnly: false
    })
  }
}

export async function login(formData: FormData) {
  const pb = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    await pb.collection('users').authWithPassword(email, password)
    await setAuthCookie(pb.authStore.exportToCookie())
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
    await setAuthCookie(pb.authStore.exportToCookie())
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
