"use server";

import { generateText, isStepCount } from "ai";

import { buildNeedItemSystemPrompt } from "./prompts";
import { createNemotronModel } from "./provider";
import { createNeedItemAITools } from "./tools";
import type {
  ClarificationRequest,
  CreatedItemDetails,
  NeedItemAIContext,
  NeedItemAICreationResult,
} from "./types";

/**
 * Server Action to process a natural language request, inspect categories, request interactive UI clarifications if needed, and create need items via NVIDIA Nemotron AI.
 */
export async function createNeedItemWithAI(
  userPrompt: string,
  context: NeedItemAIContext
): Promise<NeedItemAICreationResult> {
  if (!userPrompt || !userPrompt.trim()) {
    return {
      success: false,
      message: "Por favor ingresá una descripción para el ítem.",
      createdItems: [],
      error: "El prompt del usuario está vacío.",
    };
  }

  const createdItems: CreatedItemDetails[] = [];
  let requestedClarification: ClarificationRequest | undefined;
  const executedTools: { toolName: string; result: unknown }[] = [];

  try {
    const model = createNemotronModel();
    const systemPrompt = buildNeedItemSystemPrompt(context);

    const tools = createNeedItemAITools({
      onItemsCreated: (items) => {
        createdItems.push(...items);
      },
      onClarificationRequested: (clarification) => {
        requestedClarification = clarification;
      },
    });

    const response = await generateText({
      model,
      system: systemPrompt,
      prompt: userPrompt,
      tools,
      stopWhen: isStepCount(5),
    });

    if (response.steps) {
      for (const step of response.steps) {
        if (step.toolCalls) {
          for (const tc of step.toolCalls) {
            executedTools.push({
              toolName: tc.toolName,
              result: (tc as { args?: unknown }).args,
            });
          }
        }
      }
    }

    // Fallback: If no items were created and no explicit clarification tool was invoked,
    // but the prompt is missing a campaign and multiple campaigns exist, construct clarification.
    if (
      createdItems.length === 0 &&
      !requestedClarification &&
      !context.selectedCampaignId &&
      context.campaigns.length > 1
    ) {
      requestedClarification = {
        question:
          "Por favor seleccioná para cuál de tus campañas corresponden estos insumos:",
        contextKey: "campaign_id",
        options: context.campaigns.map((c) => ({
          id: c.id,
          label: c.name,
        })),
        allowOther: true,
      };
    }

    let defaultMessage = "Operación procesada.";
    if (createdItems.length > 0) {
      defaultMessage = `Se registraron exitosamente ${createdItems.length} ítem(s) de necesidad.`;
    } else if (requestedClarification) {
      defaultMessage = requestedClarification.question;
    }

    return {
      success: createdItems.length > 0,
      message: response.text || defaultMessage,
      createdItems,
      clarification: requestedClarification,
      toolsExecuted: executedTools,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Error inesperado al invocar la IA";
    console.error("[AI NeedItem Error]:", error);

    return {
      success: false,
      message: `No se pudo procesar con IA: ${errorMessage}`,
      createdItems: [],
      error: errorMessage,
      toolsExecuted: executedTools,
    };
  }
}
