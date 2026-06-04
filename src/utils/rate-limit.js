/**
 * @file rate-limit.js
 * @description Memory-based IP rate limiter for API endpoints to protect against malicious brute-force attempts.
 * @author Thabotharan Balachandran
 */
import { LRUCache } from 'lru-cache';

/**
 * Creates a rate limiter instance using LRUCache.
 * @param {Object} options 
 * @param {number} options.uniqueTokenPerInterval - Max number of unique tokens (IPs) to store
 * @param {number} options.interval - Time interval in ms
 */
export function rateLimit(options) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000,
  });

  return {
    check: (res, limit, token) =>
      new Promise((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) || [0])[0];
        if (tokenCount === 0) {
          tokenCache.set(token, [1]);
        } else {
          tokenCache.set(token, [tokenCount + 1]);
        }
        const currentUsage = tokenCount + 1;
        const isRateLimited = currentUsage >= limit;
        
        res.headers.set('X-RateLimit-Limit', limit.toString());
        res.headers.set('X-RateLimit-Remaining', isRateLimited ? '0' : (limit - currentUsage).toString());

        return isRateLimited ? reject() : resolve();
      }),
  };
}
