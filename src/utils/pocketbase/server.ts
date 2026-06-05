import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';

export async function createClient() {
  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://192.168.1.11:8090');
  
  // Load auth state from cookie
  const cookieStore = await cookies();
  const pbCookie = cookieStore.get('pb_auth');
  
  if (pbCookie) {
    try {
      const parsed = JSON.parse(pbCookie.value);
      pb.authStore.save(parsed.token, parsed.model);
    } catch(e) {}
  }
  
  try {
    // get an up-to-date auth store state by verifying and refreshing the loaded auth model (if any)
    pb.authStore.isValid && await pb.collection('users').authRefresh();
  } catch (_) {
    // clear the auth store on failed refresh
    pb.authStore.clear();
  }
  
  return pb;
}
