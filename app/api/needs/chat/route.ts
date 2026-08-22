import { convertToModelMessages, isStepCount, streamText } from "ai";
import { NextResponse } from "next/server";

import { buildNeedItemSystemPrompt } from "@/features/needs/ai/prompts";
import { createNemotronModel } from "@/features/needs/ai/provider";
import { createNeedItemAITools } from "@/features/needs/ai/tools";
import type {
  CampaignOption,
  CollectionPointOption,
} from "@/features/needs/types";
import { getUserOrganizations } from "@/lib/organizations";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    const memberships = await getUserOrganizations(user.id, user.email);
    const isAdmin = memberships.some((m) => m.role === "admin");
    if (!isAdmin) {
      return NextResponse.json(
        {
          error:
            "Permiso denegado: solo administradores pueden registrar insumos.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      messages = [],
      campaigns = [] as CampaignOption[],
      collectionPoints = [] as CollectionPointOption[],
      selectedCampaignId,
    } = body;

    const model = createNemotronModel();
    const system = buildNeedItemSystemPrompt({
      campaigns,
      collectionPoints,
      selectedCampaignId,
    });

    const tools = createNeedItemAITools();
    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model,
      system,
      messages: modelMessages,
      tools,
      stopWhen: isStepCount(5),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al procesar la solicitud con IA";
    console.error("[API Needs Chat Error]:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
