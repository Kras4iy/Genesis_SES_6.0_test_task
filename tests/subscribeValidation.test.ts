import { describe, it, expect } from 'vitest';
import subscribeValidation from '../src/utils/subscribeValidation';

describe('subscribeValidation', () => {
  it('accepts valid email and repo', () => {
    const res = subscribeValidation({ email: 'test@example.com', repo: 'owner/repo' });
    expect(res.valid).toBe(true);
  });

  it('rejects missing email', () => {
    const res = subscribeValidation({ email: null, repo: 'owner/repo' } as any);
    expect(res.valid).toBe(false);
  });

  it('rejects invalid email', () => {
    const res = subscribeValidation({ email: 'not-an-email', repo: null } as any);
    expect(res.valid).toBe(false);
  });
  it('reject email longer than 255 characters', () => {
    const longEmail = 'a'.repeat(256) + '@example.com';
    const res = subscribeValidation({ email: longEmail, repo: null } as any);
    expect(res.valid).toBe(false);
  })
  it('reject invalid email with repo', () => {
    const res = subscribeValidation({ email: 'not-an-email', repo: 'owner/repo' });
    expect(res.valid).toBe(false);
  })
});