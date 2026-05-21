'use client'

import { useState } from 'react'
import { updateProfile } from './actions'
import { toast } from 'sonner'

export default function ProfileForm({ initialName }: { initialName: string }) {
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    try {
      await updateProfile(formData)
      toast.success('Perfil actualizado correctamente')
      // Reset password field
      const form = document.getElementById('profile-form') as HTMLFormElement
      if (form) {
        const passwordInput = form.elements.namedItem('password') as HTMLInputElement
        if (passwordInput) passwordInput.value = ''
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar el perfil')
    } finally {
      setPending(false)
    }
  }

  return (
    <form id="profile-form" action={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1">Tu nombre en la app</label>
        <input
          type="text"
          name="name"
          defaultValue={initialName}
          placeholder="Ej: Laura"
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          required
        />
      </div>
      
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1">Nueva contraseña (opcional)</label>
        <input
          type="password"
          name="password"
          placeholder="Mínimo 6 caracteres"
          minLength={6}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl py-3 font-semibold transition-colors mt-2"
      >
        {pending ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}
