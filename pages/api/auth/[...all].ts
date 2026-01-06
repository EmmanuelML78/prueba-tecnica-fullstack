import { toNodeHandler } from 'better-auth/node';
import { auth } from '@/lib/auth';

// Disallow body parsing, Better Auth handles it
export const config = { api: { bodyParser: false } };

export default toNodeHandler(auth);
