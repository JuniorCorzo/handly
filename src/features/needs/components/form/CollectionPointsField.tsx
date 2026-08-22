import type { CollectionPointOption } from "../../types";

interface CollectionPointsFieldProps {
  collectionPoints: CollectionPointOption[];
  defaultIds?: string[];
  error?: string;
}

export function CollectionPointsField({
  collectionPoints,
  defaultIds = [],
  error,
}: CollectionPointsFieldProps) {
  const selectedSet = new Set(defaultIds);

  return (
    <div className="flex flex-col gap-1">
      <fieldset className="flex flex-col gap-3 rounded-[var(--radius-sm)] border border-[var(--border)] p-4">
        <legend className="px-1 text-sm font-semibold text-[var(--ink)]">
          Centros de Acopio <span aria-hidden="true">*</span>
        </legend>
        {collectionPoints.length === 0 ? (
          <p className="text-xs text-[var(--muted)]">
            No hay centros de acopio registrados para tu organización.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {collectionPoints.map((cp) => (
              <label
                key={cp.id}
                className="flex cursor-pointer items-start gap-2 text-sm text-[var(--ink)]"
              >
                <input
                  type="checkbox"
                  name="collection_point_ids"
                  value={cp.id}
                  defaultChecked={selectedSet.has(cp.id)}
                  className="mt-1 rounded-[var(--radius-xs)] border-[var(--border)] text-[var(--primary)] focus:ring-[var(--focus)]"
                />
                <span>{cp.location_adress}</span>
              </label>
            ))}
          </div>
        )}
      </fieldset>
      {error && (
        <p aria-live="polite" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
