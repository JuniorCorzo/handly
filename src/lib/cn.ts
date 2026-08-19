type ClassValue = string | boolean | null | undefined | Record<string, boolean>

export function cn(...inputs: ClassValue[]): string {
  return inputs
    .flatMap((input) => {
      if (!input) return []
      if (typeof input === 'string') return [input]
      if (typeof input === 'object' && !Array.isArray(input)) {
        return Object.entries(input)
          .filter(([, v]) => Boolean(v))
          .map(([k]) => k)
      }
      return []
    })
    .join(' ')
}
