import crypto from 'crypto';
import axios from 'axios';

let cachedKeys = null;
let lastFetched = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000; // Cache JWKS keys for 24 hours

async function getPublicKey(kid) {
  const now = Date.now();
  if (!cachedKeys || now - lastFetched > CACHE_TTL) {
    try {
      const response = await axios.get(process.env.JWKS_URL || 'https://ep-morning-sky-aozlbkmh.neonauth.c-2.ap-southeast-1.aws.neon.tech/neondb/auth/.well-known/jwks.json');
      cachedKeys = response.data.keys;
      lastFetched = now;
    } catch (err) {
      console.error('Failed to fetch JWKS keys:', err.message);
      // Safe fallback using your active static key properties
      cachedKeys = [
        {
          alg: 'EdDSA',
          crv: 'Ed25519',
          x: '1toP0F_3h7qW2lUfgsKFDrQF_Zn0E8K8-11fPgQ5jpk',
          kty: 'OKP',
          kid: '2206a993-7158-44d5-a854-6be3415f3055'
        }
      ];
    }
  }

  const key = cachedKeys.find(k => k.kid === kid);
  if (!key) return null;

  return crypto.createPublicKey({
    format: 'jwk',
    key: {
      kty: key.kty,
      crv: key.crv,
      x: key.x
    }
  });
}

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return res.status(401).json({ success: false, message: 'Invalid token format', data: null });
  }

  try {
    const [headerB64, payloadB64, signatureB64] = parts;
    const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString());
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());

    // 1. Check expiration claim
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return res.status(401).json({ success: false, message: 'Token has expired', data: null });
    }

    // 2. Fetch the correct public key based on the kid in the header
    const publicKey = await getPublicKey(header.kid);
    if (!publicKey) {
      return res.status(401).json({ success: false, message: 'Signing key not found', data: null });
    }

    // 3. Verify signature cryptographically using Ed25519 algorithm
    const data = Buffer.from(`${headerB64}.${payloadB64}`);
    const signature = Buffer.from(signatureB64, 'base64url');
    const isVerified = crypto.verify(null, data, publicKey, signature);

    if (!isVerified) {
      return res.status(401).json({ success: false, message: 'Invalid token signature', data: null });
    }

    // 4. Map OIDC claims to compatible req.user properties
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name || payload.email?.split('@')[0] || 'User',
      role: (payload.role || 'citizen').toLowerCase(),
    };

    next();
  } catch (error) {
    console.error('Token authentication failed:', error.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired token', data: null });
  }
}
