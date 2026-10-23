import Redis from "ioredis";
// @ts-expect-error The runtime export is the documented default Redlock class.
import Redlock from "redlock";
import type { SeatLockProvider } from "@/lib/bookingEngine";

export class RedisSeatLockProvider implements SeatLockProvider {
  private readonly redis: Redis;
  private readonly redlock: Redlock;
  private readonly activeLocks = new Map<
    string,
    { release(): Promise<void> }
  >();

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });
    this.redlock = new Redlock([this.redis], {
      retryCount: 0,
      driftFactor: 0.01,
    });
  }

  async acquire(resource: string, ttlMs: number): Promise<string | null> {
    try {
      const lock = await this.redlock.acquire([resource], ttlMs);
      this.activeLocks.set(lock.value, lock);
      return lock.value;
    } catch {
      return null;
    }
  }

  async release(resource: string, token: string): Promise<void> {
    try {
      const lock = this.activeLocks.get(token);
      if (lock) await lock.release();
      this.activeLocks.delete(token);
    } catch {
      // TTL expiry is the recovery path when a process disappears.
    }
  }
}

let provider: SeatLockProvider | undefined;

export function getSeatLockProvider(
  fallback: SeatLockProvider,
): SeatLockProvider {
  if (!process.env.REDIS_URL) return fallback;
  provider ??= new RedisSeatLockProvider(process.env.REDIS_URL);
  return provider;
}
