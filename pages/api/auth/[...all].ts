import { toNodeHandler } from 'better-auth/node';
import { auth } from '@/lib/auth';

// Disallow body parsing, we will parse it manually
export const config = { api: { bodyParser: false } };

// Better Auth handler for all auth routes
const handler = toNodeHandler(auth);

export default handler;
