/**
 * Standard RFC 6238 TOTP (Time-based One-Time Password) implementation
 * and RFC 4648 Base32 utilities using Web Crypto API.
 */

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Decode Base32 string to Uint8Array
 */
export function base32Decode(str: string): Uint8Array {
  const cleaned = str.toUpperCase().replace(/=+$/, '').replace(/[\s-]/g, '');
  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(cleaned[i]);
    if (idx === -1) {
      throw new Error(`Ký tự Base32 không hợp lệ: "${cleaned[i]}"`);
    }
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return new Uint8Array(output);
}

/**
 * Encode Uint8Array to Base32 string
 */
export function base32Encode(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Generate a random Base32 secret key (default 20 bytes = 32 Base32 chars, or 16 chars)
 */
export function generateSecret(byteLength: number = 20): string {
  const randomBytes = new Uint8Array(byteLength);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(randomBytes);
  } else if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    globalThis.crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < byteLength; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return base32Encode(randomBytes);
}

/**
 * Format secret with spaces for better readability (e.g. ABCD EFGH 1234 5678)
 */
export function formatSecret(secret: string): string {
  const cleaned = secret.replace(/\s+/g, '').toUpperCase();
  return cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
}

/**
 * Generate TOTP 6-digit code for a given timestamp
 * @param secretBase32 Base32 secret key
 * @param timeSec Unix timestamp in seconds (default: current time)
 * @param period Time step in seconds (default: 30)
 * @param digits Number of digits in OTP (default: 6)
 */
export async function generateTOTP(
  secretBase32: string,
  timeSec: number = Math.floor(Date.now() / 1000),
  period: number = 30,
  digits: number = 6
): Promise<string> {
  const keyBytes = base32Decode(secretBase32);
  const counter = Math.floor(timeSec / period);

  // 8-byte big-endian counter
  const counterBuffer = new ArrayBuffer(8);
  const counterView = new DataView(counterBuffer);
  counterView.setBigUint64(0, BigInt(counter), false);

  const subtle = (typeof window !== 'undefined' ? window.crypto?.subtle : undefined) ||
                 (typeof globalThis !== 'undefined' ? globalThis.crypto?.subtle : undefined);

  if (!subtle) {
    throw new Error('Web Crypto API không được hỗ trợ trong môi trường này.');
  }

  const cryptoKey = await subtle.importKey(
    'raw',
    keyBytes as unknown as BufferSource,
    { name: 'HMAC', hash: { name: 'SHA-1' } },
    false,
    ['sign']
  );

  const signature = await subtle.sign('HMAC', cryptoKey, counterBuffer);
  const hmac = new Uint8Array(signature);

  // Dynamic Truncation (RFC 4226)
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = binary % Math.pow(10, digits);
  return otp.toString().padStart(digits, '0');
}

/**
 * Verify a TOTP code with time drift window (default ±1 period = ±30s)
 */
export async function verifyTOTP(
  token: string,
  secretBase32: string,
  window: number = 1,
  period: number = 30,
  digits: number = 6
): Promise<boolean> {
  const cleanToken = token.trim();
  if (cleanToken.length !== digits || !/^\d+$/.test(cleanToken)) {
    return false;
  }

  const currentTime = Math.floor(Date.now() / 1000);

  // Check window [-window, +window]
  for (let drift = -window; drift <= window; drift++) {
    const testTime = currentTime + drift * period;
    try {
      const expected = await generateTOTP(secretBase32, testTime, period, digits);
      if (expected === cleanToken) {
        return true;
      }
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Get remaining seconds in current 30-second window
 */
export function getRemainingSeconds(period: number = 30): { remaining: number; percentage: number } {
  const currentSec = Math.floor(Date.now() / 1000);
  const remaining = period - (currentSec % period);
  const percentage = Math.round((remaining / period) * 100);
  return { remaining, percentage };
}

/**
 * Build otpauth:// URI for QR code generation
 */
export function buildOtpAuthUri({
  secret,
  account,
  issuer = 'RegisterForm',
  period = 30,
  digits = 6,
}: {
  secret: string;
  account: string;
  issuer?: string;
  period?: number;
  digits?: number;
}): string {
  const cleanSecret = secret.replace(/\s+/g, '').toUpperCase();
  const label = `${encodeURIComponent(issuer)}:${encodeURIComponent(account || 'user@example.com')}`;
  return `otpauth://totp/${label}?secret=${cleanSecret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=${digits}&period=${period}`;
}
