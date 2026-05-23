import { createClient } from '@/utils/supabase/server'

let isConfigured = false

function ensureConfigured() {
  if (isConfigured) return
  try {
    // Dynamic require to avoid module-level crash
    const webpush = require('web-push')
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const privateKey = process.env.VAPID_PRIVATE_KEY
    if (publicKey && privateKey) {
      webpush.setVapidDetails('mailto:your-email@example.com', publicKey, privateKey)
      isConfigured = true
    } else {
      console.warn('VAPID keys not configured — push notifications disabled')
    }
  } catch (err) {
    console.error('Error configuring web-push:', err)
  }
}

export async function sendPushToPartner(coupleId: string, currentUserId: string, title: string, body: string, url: string = '/') {
  try {
    ensureConfigured()
    if (!isConfigured) return

    const webpush = require('web-push')
    const supabase = await createClient()

    // Buscar a la pareja
    const { data: partnerProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('couple_id', coupleId)
      .neq('id', currentUserId)
      .single()

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
