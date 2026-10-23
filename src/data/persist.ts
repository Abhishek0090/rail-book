// In-memory store for the dummy data. Values live on globalThis so admin
// changes survive dev hot reloads; they reset when the server restarts.
// Replace with database queries when PostgreSQL is wired in.
const store = globalThis as typeof globalThis & {
  __railbook?: Record<string, unknown>;
};

export function persist<T>(key: string, initial: () => T): T {
  store.__railbook ??= {};
  if (!(key in store.__railbook)) store.__railbook[key] = initial();
  return store.__railbook[key] as T;
}
