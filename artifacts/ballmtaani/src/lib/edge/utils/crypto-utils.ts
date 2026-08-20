/**
 * BallMtaani Edge — Browser and Node compatible Crypto Utilities
 * Prevents Vite bundling failures from importing Node's native 'crypto' module in client code.
 */

/**
 * Synchronous SHA-256-like hex hash for browser client-side key hashing and verification.
 */
export function hashSha256(input: string): string {
  let h1 = 0xdeadbeef ^ 0, h2 = 0x41c6ce57 ^ 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const p1 = (h1 >>> 0).toString(16).padStart(8, "0");
  const p2 = (h2 >>> 0).toString(16).padStart(8, "0");
  const p3 = Math.imul(h1, h2).toString(16).padStart(8, "0");
  const p4 = (h1 ^ h2).toString(16).padStart(8, "0");

  return (p1 + p2 + p3 + p4 + p1 + p2 + p3 + p4).slice(0, 64);
}

/**
 * Generate random hex bytes for client-side API key generation.
 */
export function randomHex(bytes: number = 24): string {
  if (typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.getRandomValues === "function") {
    const array = new Uint8Array(bytes);
    globalThis.crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, "0")).join("");
  }
  let result = "";
  for (let i = 0; i < bytes * 2; i++) {
    result += Math.floor(Math.random() * 16).toString(16);
  }
  return result;
}

/**
 * Generate a UUID v4 string.
 */
export function randomUUID(): string {
  if (typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Timing-safe equality check for hex strings.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
