import test from "node:test";
import assert from "node:assert/strict";
import { developmentSeatLocks, withSeatLock } from "@/lib/bookingEngine";

test("only one simultaneous request can hold a seat", async () => {
  const request = {
    trainId: 1,
    journeyDate: "2026-09-20",
    classCode: "SL",
    seatId: 7,
    paymentTransactionId: "pay_test_1",
  };
  let entered = 0;
  const hold = () =>
    withSeatLock(developmentSeatLocks, request, async () => {
      entered += 1;
      await new Promise((resolve) => setTimeout(resolve, 20));
      return "confirmed";
    });

  const results = await Promise.all([hold(), hold()]);
  assert.equal(entered, 1);
  assert.equal(results.filter(Boolean).length, 1);
});
