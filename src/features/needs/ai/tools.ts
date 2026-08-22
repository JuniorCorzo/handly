import { tool, zodSchema } from "ai";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getUserOrganizations } from "@/lib/organizations";
import { createAdminClient, createClient } from "@/lib/supabase/server";

import { getDistinctCategories } from "../lib/queries";
import type { UrgencyLevel } from "../types";
import type { ClarificationRequest, CreatedItemDetails } from "./types";

/**
 * Creates the AI tools for need items supporting batch creation, category lookup, and UI clarification requests.
 */
export function createNeedItemAITools(options?: {
  onItemsCreated?: (items: CreatedItemDetails[]) => void;
  onClarificationRequested?: (clarification: ClarificationRequest) => void;
}) {
  return {
    get_existing_categories: tool({
      description:
        "Obtiene la lista de todas las categorías preexistentes registradas en el sistema. " +
        "DEBE consultarse obligatoriamente antes de crear ítems para reusar categorías afines y evitar duplicados o sinónimos innecesarios.",
      inputSchema: zodSchema(z.object({})),
      execute: async () => {
        const categories = await getDistinctCategories();
        return {
          categories,
          message:
            categories.length > 0
              ? `Se encontraron ${categories.length} categorías preexistentes: ${categories.join(", ")}. Debes usar una de estas si coincide semánticamente con cada ítem solicitado.`
              : "No hay categorías preexistentes registradas todavía. Podés proponer nuevas categorías representativas.",
        };
      },
    }),

    request_clarification: tool({
      description:
        "Solicita al usuario una selección interactiva en la interfaz cuando falten datos indispensables (como definir la campaña objetivo) o haya varias opciones posibles. " +
        "La interfaz renderizará automáticamente las opciones interactivas más un campo libre 'Otro'.",
      inputSchema: zodSchema(
        z.object({
          question: z
            .string()
            .describe("Pregunta clara y concisa para el usuario"),
          contextKey: z.enum(["campaign_id", "urgency", "category", "general"]),
          options: z.array(
            z.object({
              id: z.string().describe("ID o valor técnico de la opción"),
              label: z.string().describe("Texto legible para el usuario"),
              description: z.string().optional(),
            })
          ),
        })
      ),
      execute: async ({ question, contextKey, options: optList }) => {
        const clarification: ClarificationRequest = {
          question,
          contextKey,
          options: optList,
          allowOther: true,
        };

        if (options?.onClarificationRequested) {
          options.onClarificationRequested(clarification);
        }

        return {
          status: "clarification_requested",
          question,
          contextKey,
          optionsCount: optList.length,
        };
      },
    }),

    create_need_items: tool({
      description:
        "Registra y publica uno o múltiples ítems de necesidad en la base de datos asociados a una campaña y sus centros de acopio.",
      inputSchema: zodSchema(
        z.object({
          campaign_id: z
            .string()
            .uuid("El campaign_id debe ser un UUID válido"),
          items: z
            .array(
              z.object({
                category: z
                  .string()
                  .min(1, "La categoría es requerida")
                  .max(100, "La categoría no puede superar 100 caracteres"),
                item_name: z
                  .string()
                  .min(1, "El nombre del ítem es requerido")
                  .max(255, "El nombre no puede superar 255 caracteres"),
                target_quantity: z
                  .number()
                  .int()
                  .positive("La cantidad objetivo debe ser un entero positivo"),
                unit: z
                  .string()
                  .min(1, "La unidad es requerida")
                  .max(50, "La unidad no puede superar 50 caracteres"),
                urgency: z.enum(["critical_4h", "urgent_12h", "standard_24h"], {
                  error: "Urgencia inválida",
                }),
                collection_point_ids: z
                  .array(
                    z
                      .string()
                      .uuid("Cada centro de acopio debe ser un UUID válido")
                  )
                  .min(1, "Debes asignar al menos un centro de acopio"),
              })
            )
            .min(1, "Debes enviar al menos un ítem para crear"),
        })
      ),
      execute: async ({
        campaign_id,
        items,
      }: {
        campaign_id: string;
        items: {
          category: string;
          item_name: string;
          target_quantity: number;
          unit: string;
          urgency: UrgencyLevel;
          collection_point_ids: string[];
        }[];
      }) => {
        const supabase = await createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("No autenticado.");
        }

        const memberships = await getUserOrganizations(user.id, user.email);
        const isAdmin = memberships.some((m) => m.role === "admin");
        if (!isAdmin) {
          throw new Error(
            "Permiso denegado: solo administradores pueden crear ítems de necesidad."
          );
        }

        const adminClient = createAdminClient();
        const db = adminClient ?? supabase;

        const createdResults: CreatedItemDetails[] = [];

        for (const item of items) {
          // 1. Insert need_item
          const { data: ni, error: niErr } = await db
            .from("need_items")
            .insert({
              campaign_id,
              category: item.category.trim(),
              item_name: item.item_name.trim(),
              target_quantity: item.target_quantity,
              unit: item.unit.trim(),
              urgency: item.urgency,
              status: "active",
            })
            .select("id")
            .single();

          if (niErr || !ni) {
            return {
              success: false,
              error: `Error al crear el ítem "${item.item_name}": ${niErr?.message || "Error desconocido"}`,
            };
          }

          // 2. Insert pivot relations
          const pivotRows = item.collection_point_ids.map((cpId: string) => ({
            need_item_id: ni.id,
            collection_point_id: cpId,
          }));

          const { error: pivotErr } = await db
            .from("need_items_collection_points")
            .insert(pivotRows);

          if (pivotErr) {
            await db.from("need_items").delete().eq("id", ni.id);
            return {
              success: false,
              error: `Error al asociar centros de acopio para "${item.item_name}": ${pivotErr.message}`,
            };
          }

          createdResults.push({
            id: ni.id,
            campaign_id,
            category: item.category.trim(),
            item_name: item.item_name.trim(),
            target_quantity: item.target_quantity,
            unit: item.unit.trim(),
            urgency: item.urgency,
            collection_point_ids: item.collection_point_ids,
          });
        }

        if (options?.onItemsCreated) {
          options.onItemsCreated(createdResults);
        }

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/needs");

        return {
          success: true,
          count: createdResults.length,
          items: createdResults,
          message: `Se registraron exitosamente ${createdResults.length} ítem(s) de necesidad en la campaña.`,
        };
      },
    }),
  };
}
