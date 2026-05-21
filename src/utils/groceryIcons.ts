import { 
  Apple, Carrot, Milk, Drumstick, Beef, Fish, Coffee, Croissant, 
  Pizza, Sandwich, Wine, Beer, CupSoda, Droplet, 
  ShoppingBag, Sparkles, Droplets, Wheat, Cake
} from 'lucide-react'

export const getGroceryIcon = (itemName: string) => {
  const name = itemName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quitar acentos

  if (name.includes('pollo') || name.includes('pavo')) return Drumstick
  if (name.includes('carne') || name.includes('ternera') || name.includes('cerdo') || name.includes('salchicha')) return Beef
  if (name.includes('leche') || name.includes('queso') || name.includes('yogur')) return Milk
  if (name.includes('manzana') || name.includes('fruta') || name.includes('platano') || name.includes('naranja')) return Apple
  if (name.includes('zanahoria') || name.includes('verdura') || name.includes('lechuga') || name.includes('tomate') || name.includes('cebolla')) return Carrot
  if (name.includes('cafe')) return Coffee
  if (name.includes('pescado') || name.includes('salmon') || name.includes('atun') || name.includes('merluza') || name.includes('gamba')) return Fish
  if (name.includes('pan') || name.includes('tostada')) return Croissant
  if (name.includes('pizza')) return Pizza
  if (name.includes('bocadillo') || name.includes('sandwich')) return Sandwich
  if (name.includes('vino')) return Wine
  if (name.includes('cerveza') || name.includes('birra')) return Beer
  if (name.includes('refresco') || name.includes('cola') || name.includes('fanta') || name.includes('zumo')) return CupSoda
  if (name.includes('agua')) return Droplets
  if (name.includes('aceite')) return Droplet
  if (name.includes('limpieza') || name.includes('fregasuelos') || name.includes('lejia') || name.includes('jabon') || name.includes('champu')) return Sparkles
  if (name.includes('pasta') || name.includes('arroz') || name.includes('harina')) return Wheat
  if (name.includes('dulce') || name.includes('chocolate') || name.includes('galleta') || name.includes('tarta')) return Cake

  // Icono por defecto
  return ShoppingBag
}
