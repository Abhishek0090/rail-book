import { randomInt } from "node:crypto";

export function generatePnr(): string {
  return String(randomInt(1000000000, 9999999999));
}
