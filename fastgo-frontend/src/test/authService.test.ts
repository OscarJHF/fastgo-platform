import { describe, it, expect, beforeEach } from 'vitest';
import { authService } from '../services/authService';
import { TOKEN_STORAGE_KEY } from '../api/apiClient';

describe('Auth Service Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null when no token exists in localStorage', () => {
    expect(authService.getToken()).toBeNull();
  });

  it('retrieves token when set in localStorage', () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, 'fake-jwt-token-123');
    expect(authService.getToken()).toBe('fake-jwt-token-123');
  });

  it('removes token upon logout', () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, 'fake-jwt-token-123');
    authService.logout();
    expect(authService.getToken()).toBeNull();
  });
});
