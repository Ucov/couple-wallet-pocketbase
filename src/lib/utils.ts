import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCategoryIcon(icon: string | null | undefined, name: string | null | undefined): string {
  if (icon && icon !== '💰') return icon
  
  if (!name) return '💰'
  
  const n = name.toLowerCase()
  if (n.includes('aliment') || n.includes('comida') || n.includes('super') || n.includes('compra')) return '🛒'
  if (n.includes('ocio') || n.includes('diversi') || n.includes('cena') || n.includes('restaurante')) return '🎉'
  if (n.includes('hogar') || n.includes('casa') || n.includes('mueble')) return '🏠'
  if (n.includes('transporte') || n.includes('coche') || n.includes('gasolina') || n.includes('viaje')) return '🚗'
  if (n.includes('salud') || n.includes('farmacia') || n.includes('medic')) return '💊'
  if (n.includes('mascota') || n.includes('perro') || n.includes('gato')) return '🐶'
  if (n.includes('regalo') || n.includes('cumple')) return '🎁'
  if (n.includes('ropa') || n.includes('moda') || n.includes('zapato')) return '👕'
  
  return '💰'
}
