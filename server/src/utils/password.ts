/**
 * Password hashing with scrypt (built into Node.js — no native add-ons).
 *
 * Stored format:  scrypt$<N>$<r>$<p>$<saltBase64>$<hashBase64>
 * Parameters are stored with the hash so they can be raised later without
 * breaking existing accounts.
 */
import { randomBytes, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from 'node:crypto';

const scrypt = (password: string, salt: Buffer, keylen: number, options: ScryptOptions) =>
  new Promise<Buffer>((resolve, reject) => {
    scryptCb(password, salt, keylen, options, (err, key) => (err ? reject(err) : resolve(key)));
  });

const PARAMS = { N: 2 ** 15, r: 8, p: 1 };
const KEY_LENGTH = 64;
// scrypt needs ~128 * N * r bytes of memory; allow some headroom.
const maxmem = (N: number, r: number) => 256 * N * r;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const { N, r, p } = PARAMS;
  const key = await scrypt(password, salt, KEY_LENGTH, { N, r, p, maxmem: maxmem(N, r) });
  return ['scrypt', N, r, p, salt.toString('base64'), key.toString('base64')].join('$');
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [, nStr, rStr, pStr, saltB64, keyB64] = parts as [string, string, string, string, string, string];
  const N = Number(nStr);
  const r = Number(rStr);
  const p = Number(pStr);
  const expected = Buffer.from(keyB64, 'base64');
  const actual = await scrypt(password, Buffer.from(saltB64, 'base64'), expected.length, {
    N,
    r,
    p,
    maxmem: maxmem(N, r),
  });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/**
 * A pre-computed hash used when a login email does not exist, so that
 * "unknown email" and "wrong password" take the same time (prevents
 * discovering which emails are registered by measuring response time).
 */
let dummyHash: Promise<string> | undefined;
export function getDummyHash(): Promise<string> {
  dummyHash ??= hashPassword(randomBytes(16).toString('hex'));
  return dummyHash;
}
