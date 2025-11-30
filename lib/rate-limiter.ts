// Rate limiting utility for API requests
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 5, windowMs: number = 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): { allowed: boolean; resetTime?: number; remaining?: number } {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      this.store.set(key, newEntry);

      return {
        allowed: true,
        resetTime: newEntry.resetTime,
        remaining: this.maxRequests - 1,
      };
    }

    // Update existing entry
    if (entry.count >= this.maxRequests) {
      return {
        allowed: false,
        resetTime: entry.resetTime,
        remaining: 0,
      };
    }

    entry.count++;
    return {
      allowed: true,
      resetTime: entry.resetTime,
      remaining: this.maxRequests - entry.count,
    };
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

// Singleton instances for different rate limits
export const invitationRateLimiter = new RateLimiter(3, 15 * 60 * 1000); // 3 requests per 15 minutes
export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 requests per 15 minutes

// Auto-cleanup expired entries every 5 minutes
setInterval(() => {
  invitationRateLimiter.cleanup();
  authRateLimiter.cleanup();
}, 5 * 60 * 1000);