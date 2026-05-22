import {
  Sparkles, Droplets, Shirt, Wind, Trash2, UtensilsCrossed,
  Bed, ShowerHead, Brush, Dog, Baby, Flower2, Wrench,
  Package, Warehouse, ClipboardCheck
} from 'lucide-react'

export const getChoreIcon = (choreName: string) => {
  const name = choreName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")

  if (name.includes('fregar') || name.includes('fregona') || name.includes('suelo')) return Droplets
  if (name.includes('plato') || name.includes('vajilla') || name.includes('cocin')) return UtensilsCrossed
  if (name.includes('lavadora') || name.includes('ropa') || name.includes('tender') || name.includes('planch')) return Shirt
  if (name.includes('barr') || name.includes('aspira') || name.includes('polvo')) return Wind
  if (name.includes('basura') || name.includes('recicl')) return Trash2
  if (name.includes('cama') || name.includes('sabana') || name.includes('dormi')) return Bed
  if (name.includes('bano') || name.includes('ducha') || name.includes('inodoro') || name.includes('water')) return ShowerHead
  if (name.includes('cristal') || name.includes('ventana') || name.includes('espejo')) return Sparkles
  if (name.includes('limpi') || name.includes('lejia') || name.includes('desinfect')) return Brush
  if (name.includes('perro') || name.includes('gato') || name.includes('mascota') || name.includes('pasear')) return Dog
  if (name.includes('nino') || name.includes('bebe') || name.includes('cole') || name.includes('deberes')) return Baby
  if (name.includes('jardin') || name.includes('planta') || name.includes('regar') || name.includes('maceta')) return Flower2
  if (name.includes('arregl') || name.includes('bombilla') || name.includes('repar')) return Wrench
  if (name.includes('compra') || name.includes('super') || name.includes('mercado')) return Package
  if (name.includes('orden') || name.includes('guar') || name.includes('almacen') || name.includes('armario')) return Warehouse

  return ClipboardCheck
}
