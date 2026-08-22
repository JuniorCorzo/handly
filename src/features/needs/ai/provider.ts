import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

import type { NemotronModelOptions } from "./types";

/**
 * Factory that creates an NVIDIA Nemotron LanguageModel instance using the OpenAI-compatible NIM endpoint.
 */
export function createNemotronModel(
  options?: NemotronModelOptions
): LanguageModel {
  const apiKey =
    options?.apiKey ||
    process.env.NVIDIA_API_KEY ||
    process.env.NVIDIA_NIM_API_KEY;

  if (!apiKey) {
    throw new Error(
      "No se encontró la clave de API de NVIDIA (NVIDIA_API_KEY). " +
        "Por favor configurala en tus variables de entorno."
    );
  }

  const nvidia = createOpenAI({
    baseURL:
      options?.baseURL ||
      process.env.NVIDIA_BASE_URL ||
      "https://integrate.api.nvidia.com/v1",
    apiKey,
  });

  const modelId =
    options?.modelName ||
    process.env.NVIDIA_NEMOTRON_MODEL_NAME ||
    "nvidia/llama-3.1-nemotron-70b-instruct";

  return nvidia(modelId);
}
