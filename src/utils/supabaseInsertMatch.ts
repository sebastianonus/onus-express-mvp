type InsertResult = { error: unknown | null };

export async function insertWithSchemaMatch(
  table: string,
  variants: Record<string, unknown>[],
  inserter: (table: string, payload: Record<string, unknown>) => Promise<InsertResult>
): Promise<void> {
  let lastError: unknown = null;

  for (const payload of variants) {
    const filtered = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined)
    );

    if (Object.keys(filtered).length === 0) continue;

    const { error } = await inserter(table, filtered);
    if (!error) return;
    lastError = error;
  }

  throw lastError ?? new Error(`No se pudo insertar en ${table}`);
}
