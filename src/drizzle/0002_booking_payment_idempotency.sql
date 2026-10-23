ALTER TABLE "bookings" ADD COLUMN "payment_transaction_id" text;
UPDATE "bookings" SET "payment_transaction_id" = 'legacy-' || "id"::text;
ALTER TABLE "bookings" ALTER COLUMN "payment_transaction_id" SET NOT NULL;
CREATE UNIQUE INDEX "bookings_payment_transaction_id_unique" ON "bookings" USING btree ("payment_transaction_id");
