import { NextResponse, type NextRequest } from 'next/server'
import PocketBase from 'pocketbase'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Exclude auth routes
  if (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/api/webhook')) {
    return response;
  }

  const pbCookie = request.cookies.get('pb_auth');
  
  if (!pbCookie) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  try {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://192.168.1.11:8090')
    pb.authStore.loadFromCookie(pbCookie.name + '=' + pbCookie.value);
    
    // Si el token es válido, continuamos
    if (!pb.authStore.isValid) {
      throw new Error("Invalid token")
    }
  } catch (e) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    response = NextResponse.redirect(url)
    // Borrar cookie en response
    response.cookies.delete('pb_auth')
  }

  return response
}
