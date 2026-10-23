import { randomUUID } from "node:crypto";

export const BOOKING_HOLD_TTL_MS = 10 * 60 * 1000;

type LockRecord = { token: string; expiresAt: number };

export interface SeatLockProvider {
  acquire(resource: string, ttlMs: number): Promise<string | null>;
  release(resource: string, token: string): Promise<void>;
}

/** Local fallback for development. Production should provide a Redis-backed provider. */
export class InMemorySeatLockProvider implements SeatLockProvider {
  private readonly locks = new Map<string, LockRecord>();

  async acquire(resource: string, ttlMs: number): Promise<string | null> {
    const current = this.locks.get(resource);
    if (current && current.expiresAt > Date.now()) return null;

    const token = randomUUID();
    this.locks.set(resource, { token, expiresAt: Date.now() + ttlMs });
    return token;
  }

  async release(resource: string, token: string): Promise<void> {
    if (this.locks.get(resource)?.token === token) this.locks.delete(resource);
  }
}

export type BookingRequest = {
  trainId: number;
  journeyDate: string;
  classCode: string;
  seatId: number;
  paymentTransactionId: string;
};

export async function withSeatLock<T>(
  provider: SeatLockProvider,
  request: BookingRequest,
  operation: () => Promise<T>,
): Promise<T | null> {
  const resource = `seat:${request.trainId}:${request.journeyDate}:${request.classCode}:${request.seatId}`;
  const token = await provider.acquire(resource, BOOKING_HOLD_TTL_MS);
  if (!token) return null;

  try {
    return await operation();
  } finally {
    await provider.release(resource, token);
  }
}

export const developmentSeatLocks = new InMemorySeatLockProvider();
