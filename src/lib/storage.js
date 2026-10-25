// Safe localStorage helpers (private mode / blocked storage must never crash the app)
export const storage = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key)
      return raw == null ? fallback : JSON.parse(raw)
    } catch {
      return fallback
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* ignore */
    }
  },
}
