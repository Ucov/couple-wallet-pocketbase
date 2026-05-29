import { createClient } from '@/utils/supabase/server'
import webpush from '@/lib/webpush'

export async function sendPushToPartner(coupleId: string, currentUserId: string, title: string, body: string, url: string = '/') {
  try {
    const supabase = await createClient()

    // Buscar a la pareja
    const { data: partnerProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('couple_id', coupleId)
      .neq('id', currentUserId)
      .maybeSingle()

    if (!partnerProfile) return

    // Buscar todas sus suscripciones
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('id, subscription_json')
      .eq('user_id', partnerProfile.id)

    if (!subscriptions || subscriptions.length === 0) return

    const payload = JSON.stringify({
      title,
      body,
      url,
      icon: '/icon-192x192.png'
    })

    // Enviar a todas las suscripciones de la pareja (ej: móvil y PC)
    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(sub.subscription_json as any, payload)
      } catch (error: any) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          await supabase.from('push_subscriptions').delete().eq('id', sub.id)
        } else {
          console.error('Error al enviar push:', error)
        }
      }
    }
  } catch (err) {
    // Never let push notifications crash the caller
    console.error('sendPushToPartner failed silently:', err)
  }
}
