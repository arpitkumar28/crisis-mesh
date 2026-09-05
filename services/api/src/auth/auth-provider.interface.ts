/**
 * Authentication Provider Interface
 * This abstraction allows switching between different authentication providers
 * Current: JWT-based (Neon temporary)
 * Future: Supabase Auth
 */
export interface IAuthProvider {
  /**
   * Validate user credentials and return user data
   */
  validateCredentials(email: string, password: string): Promise<any>;

  /**
   * Generate authentication token for a user
   */
  generateToken(user: any, tokenType?: 'access' | 'refresh'): Promise<string>;

  /**
   * Validate authentication token and return user data
   */
  validateToken(token: string): Promise<any>;

  /**
   * Refresh authentication token
   */
  refreshToken(token: string): Promise<string>;

  /**
   * Revoke a specific refresh token (e.g. on logout) so it can never be
   * used again. Must be tolerant of an already-invalid/expired token.
   */
  revokeRefreshToken(token: string): Promise<void>;

  /**
   * Hash password for storage
   */
  hashPassword(password: string): Promise<string>;

  /**
   * Compare password with hash
   */
  comparePassword(password: string, hash: string): Promise<boolean>;
}
