/**
 * Remove Gateway is_default Migration
 *
 * Removes the `is_default` column and the unique index `idx_gateways_default_per_org`
 * from the `gateways` table. The default gateway concept is now replaced by
 * the well-known Decopilot agent that's defined in code.
 */

import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  // Drop the unique index first
  await sql`DROP INDEX IF EXISTS idx_gateways_default_per_org`.execute(db);

  // Drop the is_default column
  await db.schema.alterTable("gateways").dropColumn("is_default").execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Re-add the is_default column
  await db.schema
    .alterTable("gateways")
    .addColumn("is_default", "integer", (col) => col.notNull().defaultTo(0))
    .execute();

  // Re-create the unique index
  await sql`CREATE UNIQUE INDEX idx_gateways_default_per_org ON gateways (organization_id) WHERE is_default = 1`.execute(
    db,
  );
}
