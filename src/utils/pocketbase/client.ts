import PocketBase from 'pocketbase';

// Singleton
let pb: PocketBase | null = null;

export function getPB() {
  if (pb) return pb;
  // TODO: Put the real homelab IP in .env or hardcode it for now.
  pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://192.168.1.11:8090');
  
  // Opcional: auto-cancellation off
  pb.autoCancellation(false);
  
  return pb;
}
