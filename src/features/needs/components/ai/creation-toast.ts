export interface CreationToast {
  message: string;
}

/**
 * Pure helper deciding whether a creation toast should be shown.
 * Success is detected only when the created-item count transitions
 * from 0 to a positive value; later renders with the same result
 * return null so the toast never repeats.
 */
export function getCreationToast(
  previousCount: number,
  currentCount: number
): CreationToast | null {
  if (previousCount !== 0 || currentCount <= 0) {
    return null;
  }

  return {
    message:
      currentCount === 1
        ? "Insumo agregado correctamente."
        : `${currentCount} insumos agregados correctamente.`,
  };
}
