/**
 * Client-side salted SHA-256 password digest.
 *
 * This is deliberately NOT a substitute for server-side hashing: anything running
 * in the browser can be bypassed by editing localStorage directly. It exists so
 * passwords are not readable in plaintext by anyone opening devtools, a backup
 * file, or a shared screen.
 */

const encoder = new TextEncoder();

export function generateSalt(): string {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return bytesToHex(bytes);
}

function bytesToHex(bytes: Uint8Array): string {
  let out = '';
  for (const byte of bytes) {
    out += byte.toString(16).padStart(2, '0');
  }
  return out;
}

function toHex(buffer: ArrayBuffer): string {
  return bytesToHex(new Uint8Array(buffer));
}

/** FNV-1a fallback for insecure contexts where crypto.subtle is unavailable. */
function fallbackDigest(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < input.length; i += 1) {
    const code = input.charCodeAt(i);
    h1 ^= code;
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 ^= code + i;
    h2 = Math.imul(h2, 0x85ebca6b) >>> 0;
  }
  let out = '';
  for (let round = 0; round < 8; round += 1) {
    h1 = Math.imul(h1 ^ (h1 >>> 13), 0x5bd1e995) >>> 0;
    h2 = Math.imul(h2 ^ (h2 >>> 11), 0xc2b2ae35) >>> 0;
    out += h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
  }
  return out;
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const payload = `${salt}:${password}`;

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const digest = await crypto.subtle.digest('SHA-256', encoder.encode(payload));
      return toHex(digest);
    } catch {
      // Fall through to the non-cryptographic path below.
    }
  }

  return fallbackDigest(payload);
}

export async function verifyPassword(password: string, salt: string, expected: string): Promise<boolean> {
  const actual = await hashPassword(password, salt);
  return timingSafeEqual(actual, expected);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
