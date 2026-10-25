import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '@/infrastructure/auth/password';

describe('Account Registration & Password Hashing (Argon2id/scrypt)', () => {
  it('hashes passwords with a random salt and verifies correctly', () => {
    const rawPassword = 'SecurePassword123!';
    const hash = hashPassword(rawPassword);

    expect(hash).toContain(':');
    const [salt, key] = hash.split(':');
    expect(salt).toHaveLength(32); // 16 bytes hex
    expect(key).toHaveLength(128); // 64 bytes hex

    expect(verifyPassword(rawPassword, hash)).toBe(true);
    expect(verifyPassword('WrongPassword', hash)).toBe(false);
  });

  it('generates distinct salt and hash for the same password', () => {
    const p = 'SameSecretPassword';
    const hash1 = hashPassword(p);
    const hash2 = hashPassword(p);

    expect(hash1).not.toBe(hash2);
    expect(verifyPassword(p, hash1)).toBe(true);
    expect(verifyPassword(p, hash2)).toBe(true);
  });

  it('returns false safely for invalid or empty passwords and hashes', () => {
    expect(verifyPassword('', 'dummy:hash')).toBe(false);
    expect(verifyPassword('pass', '')).toBe(false);
    expect(verifyPassword('pass', null)).toBe(false);
    expect(verifyPassword('pass', 'malformed_hash_without_delimiter')).toBe(false);
  });
});
