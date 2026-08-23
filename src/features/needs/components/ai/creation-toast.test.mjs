import assert from "node:assert/strict";
import { test } from "node:test";

import { getCreationToast } from "./creation-toast.ts";

test("returns a success toast when the first created item arrives", () => {
  assert.deepEqual(getCreationToast(0, 1), {
    message: "Insumo agregado correctamente.",
  });
});

test("uses the item count for batch creation", () => {
  assert.deepEqual(getCreationToast(0, 3), {
    message: "3 insumos agregados correctamente.",
  });
});

test("does not repeat the toast for the same creation result", () => {
  assert.equal(getCreationToast(2, 2), null);
});
