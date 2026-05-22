/** Firestore rejects `undefined` field values; omit them before writes. */
export function stripUndefinedDeep<T>(value: T): T {
  if (value === undefined) {
    return value
  }
  if (value === null) {
    return value
  }
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefinedDeep(item)) as T
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (val !== undefined) {
        out[key] = stripUndefinedDeep(val)
      }
    }
    return out as T
  }
  return value
}
