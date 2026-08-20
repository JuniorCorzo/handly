type ClassValue = string | boolean | null | undefined | Record<string, boolean>;

export function cn(...inputs: ClassValue[]): string {
  return inputs
    .flatMap((input) => {
      if (!input) {
        return [];
      }
      if (typeof input === "string") {
        return [input];
      }
      if (typeof input === "object" && !Array.isArray(input)) {
        const keys: string[] = [];
        for (const [k, v] of Object.entries(input)) {
          if (v) {
            keys.push(k);
          }
        }
        return keys;
      }
      return [];
    })
    .join(" ");
}
