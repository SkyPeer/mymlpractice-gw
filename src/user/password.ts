import { createHmac } from 'crypto';
import { compare, hash } from 'bcrypt';
import { PASSWORD_PEPPER } from '@app/config';

// HMAC the password with the pepper before bcrypt. Base64 keeps the input at
// 44 bytes, under bcrypt's 72 byte limit and free of NUL bytes.
const pepper = (password: string): string =>
  createHmac('sha256', PASSWORD_PEPPER).update(password).digest('base64');

export const hashPassword = (password: string): Promise<string> =>
  hash(pepper(password), 10);

// needsRehash marks a hash stored before the pepper existed (plain bcrypt of
// the password). Login upgrades those, so the legacy branch can be dropped
// once every account has signed in again.
export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<{ success: boolean; needsRehash: boolean }> {
  if (await compare(pepper(password), storedHash)) {
    return { success: true, needsRehash: false };
  }
  if (await compare(password, storedHash)) {
    return { success: true, needsRehash: true };
  }
  return { success: false, needsRehash: false };
}
