"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type { ClarificationOption, CreatedItemDetails } from "../../ai/types";
import { URGENCY_MAP } from "../../lib/constants";
import type {
  CampaignOption,
  CollectionPointOption,
  UrgencyLevel,
} from "../../types";

interface NeedItemAIAssistantProps {
  campaigns: CampaignOption[];
  collectionPoints: CollectionPointOption[];
  onSuccess?: (items: CreatedItemDetails[]) => void;
}

const EXAMPLE_PROMPTS = [
  "500 bidones de agua 5L y 200 frazadas térmicas urgente 4h para la campaña activa.",
  "150 cajas de leche larga vida y 80 kits de higiene para todas las sedes.",
  "50 cajas de paracetamol 500mg para asistencia médica inmediata.",
];

function extractCreatedItems(messages: UIMessage[]): CreatedItemDetails[] {
  const items: CreatedItemDetails[] = [];
  for (const msg of messages) {
    if (msg.role !== "assistant") {
      continue;
    }

    if (Array.isArray(msg.parts)) {
      for (const part of msg.parts as unknown as Record<string, unknown>[]) {
        if (
          part.type === "tool-result" &&
          part.toolName === "create_need_items"
        ) {
          const res = (part.result as { items?: CreatedItemDetails[] }) || {};
          if (Array.isArray(res.items)) {
            items.push(...res.items);
          }
        }
        if (
          part.type === "tool-invocation" &&
          (
            part.toolInvocation as {
              toolName?: string;
              state?: string;
              result?: { items?: CreatedItemDetails[] };
            }
          )?.toolName === "create_need_items"
        ) {
          const ti = part.toolInvocation as {
            state?: string;
            result?: { items?: CreatedItemDetails[] };
          };
          const resultItems = ti.result?.items;
          if (ti.state === "result" && Array.isArray(resultItems)) {
            items.push(...resultItems);
          }
        }
      }
    }

    const { toolInvocations } = msg as unknown as {
      toolInvocations?: {
        toolName?: string;
        state?: string;
        result?: { items?: CreatedItemDetails[] };
      }[];
    };
    if (Array.isArray(toolInvocations)) {
      for (const ti of toolInvocations) {
        const resultItems = ti.result?.items;
        if (
          ti.toolName === "create_need_items" &&
          ti.state === "result" &&
          Array.isArray(resultItems)
        ) {
          items.push(...resultItems);
        }
      }
    }
  }
  return items;
}

function extractPendingClarification(messages: UIMessage[]): {
  question: string;
  options: ClarificationOption[];
  contextKey: string;
} | null {
  const reversedMessages = [...messages].toReversed();
  const lastAssistant = reversedMessages.find((m) => m.role === "assistant");
  if (!lastAssistant) {
    return null;
  }

  if (Array.isArray(lastAssistant.parts)) {
    for (const part of lastAssistant.parts as unknown as Record<
      string,
      unknown
    >[]) {
      if (
        part.type === "tool-call" &&
        part.toolName === "request_clarification" &&
        part.args
      ) {
        return part.args as {
          question: string;
          options: ClarificationOption[];
          contextKey: string;
        };
      }
      if (
        part.type === "tool-invocation" &&
        (part.toolInvocation as { toolName?: string; args?: unknown })
          ?.toolName === "request_clarification"
      ) {
        const ti = part.toolInvocation as {
          args?: {
            question: string;
            options: ClarificationOption[];
            contextKey: string;
          };
        };
        if (ti.args) {
          return ti.args;
        }
      }
    }
  }

  const { toolInvocations } = lastAssistant as unknown as {
    toolInvocations?: {
      toolName?: string;
      args?: {
        question: string;
        options: ClarificationOption[];
        contextKey: string;
      };
    }[];
  };
  if (Array.isArray(toolInvocations)) {
    for (const ti of toolInvocations) {
      if (ti.toolName === "request_clarification" && ti.args) {
        return ti.args;
      }
    }
  }

  return null;
}

function extractLatestAssistantText(messages: UIMessage[]): string | null {
  const reversedMessages = [...messages].toReversed();
  const lastAssistant = reversedMessages.find((m) => m.role === "assistant");
  if (!lastAssistant || !Array.isArray(lastAssistant.parts)) {
    return null;
  }

  const textParts: string[] = [];
  for (const p of lastAssistant.parts as unknown as Record<string, unknown>[]) {
    if (p.type === "text" && typeof p.text === "string") {
      textParts.push(p.text);
    }
  }

  return textParts.join(" ") || null;
}

export function NeedItemAIAssistant({
  campaigns,
  collectionPoints,
  onSuccess,
}: NeedItemAIAssistantProps) {
  const router = useRouter();
  const [inputPrompt, setInputPrompt] = useState("");
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [otherText, setOtherText] = useState("");
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [transport] = useState(
    () =>
      new DefaultChatTransport({
        api: "/api/needs/chat",
        body: {
          campaigns,
          collectionPoints,
        },
      })
  );

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport,
  });

  const isLoading = status === "submitted" || status === "streaming";

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const createdItems = extractCreatedItems(messages);
  const pendingClarification =
    createdItems.length === 0 ? extractPendingClarification(messages) : null;
  const latestAssistantText = extractLatestAssistantText(messages);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (!inputPrompt.trim() || isLoading) {
      return;
    }

    const textToSend = inputPrompt.trim();
    setInputPrompt("");
    setSelectedOptionId(null);
    setIsOtherSelected(false);
    setOtherText("");

    sendMessage({ text: textToSend });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleConfirmClarification = () => {
    if (isLoading) {
      return;
    }

    let responseText = "";
    if (isOtherSelected) {
      if (!otherText.trim()) {
        return;
      }
      responseText = otherText.trim();
    } else if (selectedOptionId) {
      const selectedOption = pendingClarification?.options.find(
        (o) => o.id === selectedOptionId
      );
      responseText = selectedOption ? selectedOption.label : selectedOptionId;
    }

    if (!responseText) {
      return;
    }

    setSelectedOptionId(null);
    setIsOtherSelected(false);
    setOtherText("");

    sendMessage({ text: `Asignar a la campaña: ${responseText}` });
  };

  const handleReset = () => {
    setMessages([]);
    setInputPrompt("");
    setSelectedOptionId(null);
    setIsOtherSelected(false);
    setOtherText("");
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="flex flex-col gap-5 pt-1">
      {/* Top Status & Recommendation */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[var(--success)]" />
            <span className="text-xs font-semibold text-[var(--ink)]">
              Asistente de Insumos (NVIDIA Nemotron)
            </span>
          </div>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleReset}
              disabled={isLoading}
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--muted)] transition-colors hover:text-[var(--ink)] focus:outline-none disabled:opacity-50"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M8 16H3v5" />
              </svg>
              Nueva conversación
            </button>
          )}
        </div>

        {messages.length === 0 && (
          <p className="text-xs leading-relaxed text-[var(--muted)]">
            Escribí uno o varios insumos en lenguaje natural (cantidad, unidad,
            insumo y campaña). La IA consultará las categorías existentes y
            validará la información antes de registrarlos.
          </p>
        )}
      </div>

      {/* Message Stream */}
      {messages.length > 0 && createdItems.length === 0 && (
        <div className="flex max-h-80 flex-col gap-3 overflow-y-auto rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] p-4 text-xs">
          {messages.map((m) => {
            const isUser = m.role === "user";
            let textContent = "";
            if (Array.isArray(m.parts)) {
              const partsText: string[] = [];
              for (const p of m.parts as unknown as Record<string, unknown>[]) {
                if (p.type === "text" && typeof p.text === "string") {
                  partsText.push(p.text);
                }
              }
              textContent = partsText.join(" ");
            }

            if (!textContent) {
              return null;
            }

            return (
              <div
                key={m.id}
                className={`flex flex-col gap-1 ${isUser ? "items-end pl-8" : "items-start pr-8"}`}
              >
                <span className="text-xs font-semibold tracking-wider text-[var(--muted)] uppercase">
                  {isUser ? "Tú" : "Asistente Handly"}
                </span>
                <div
                  className={`rounded-[var(--radius-sm)] px-3.5 py-2.5 text-xs leading-relaxed ${
                    isUser
                      ? "bg-[var(--primary)] text-white shadow-2xs"
                      : "border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)]"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{textContent}</p>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 py-1 text-xs text-[var(--muted)]">
              <span className="flex h-2 w-2 animate-ping rounded-full bg-[var(--primary)]" />
              <span>Analizando insumos y consultando categorías...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Interactive Clarification Selector */}
      {pendingClarification && createdItems.length === 0 && (
        <div className="flex flex-col gap-3 rounded-[var(--radius-sm)] border border-[var(--primary)] bg-[var(--background)] p-4 text-xs text-[var(--ink)]">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-bold text-[var(--ink)]">
              {pendingClarification.question}
            </p>
            <p className="text-xs text-[var(--muted)]">
              Seleccioná una de las opciones o escribí tu respuesta:
            </p>
          </div>

          {/* Options list */}
          <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2">
            {pendingClarification.options.map((opt) => {
              const isSelected =
                selectedOptionId === opt.id && !isOtherSelected;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setSelectedOptionId(opt.id);
                    setIsOtherSelected(false);
                  }}
                  className={`flex items-center justify-between rounded-[var(--radius-xs)] border p-2.5 text-left text-xs transition-colors focus:outline-none ${
                    isSelected
                      ? "border-[var(--primary)] bg-[var(--surface)] font-bold text-[var(--primary)] shadow-2xs ring-1 ring-[var(--primary)]"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--background)]"
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                      isSelected
                        ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                        : "border-[var(--border)] bg-[var(--background)]"
                    }`}
                  >
                    {isSelected && (
                      <svg
                        className="h-2.5 w-2.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        aria-hidden="true"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Other option disclosure */}
          <div className="flex flex-col gap-2 border-t border-[var(--border)] pt-1">
            <button
              type="button"
              onClick={() => {
                setIsOtherSelected(true);
                setSelectedOptionId(null);
              }}
              className={`flex items-center justify-between rounded-[var(--radius-xs)] border p-2.5 text-left text-xs transition-colors focus:outline-none ${
                isOtherSelected
                  ? "border-[var(--primary)] bg-[var(--surface)] font-bold text-[var(--primary)] shadow-2xs ring-1 ring-[var(--primary)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--background)]"
              }`}
            >
              <span>Otro (escribir texto libre)</span>
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                  isOtherSelected
                    ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                    : "border-[var(--border)] bg-[var(--background)]"
                }`}
              >
                {isOtherSelected && (
                  <svg
                    className="h-2.5 w-2.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </span>
            </button>

            {isOtherSelected && (
              <input
                type="text"
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                placeholder="Escribí aquí el nombre o detalle..."
                className="w-full rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:outline-none"
                autoFocus
              />
            )}
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="button"
              disabled={
                isLoading ||
                (!selectedOptionId && (!isOtherSelected || !otherText.trim()))
              }
              onClick={handleConfirmClarification}
              className="inline-flex items-center justify-center rounded-[var(--radius-xs)] bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Confirmando…" : "Confirmar y continuar"}
            </button>
          </div>
        </div>
      )}

      {/* Input Composer */}
      {createdItems.length === 0 && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="relative flex flex-col overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] transition-colors focus-within:border-[var(--primary)] focus-within:ring-1 focus-within:ring-[var(--primary)]">
            <textarea
              ref={textareaRef}
              id="ai_prompt"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ej: Necesitamos 500 bidones de agua 5L y 200 frazadas con urgencia crítica para la campaña Inundaciones..."
              rows={3}
              disabled={isLoading}
              className="w-full resize-none border-none bg-transparent p-3 text-xs text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:ring-0 focus:outline-none disabled:opacity-50"
            />

            <div className="flex items-center justify-between border-t border-[var(--border)]/60 bg-[var(--surface)] px-3 py-2">
              <span className="text-xs text-[var(--muted)]">
                Presioná{" "}
                <kbd className="rounded border border-[var(--border)] bg-[var(--background)] px-1 py-0.5 font-mono text-xs">
                  Enter
                </kbd>{" "}
                para enviar
              </span>

              <button
                type="submit"
                disabled={isLoading || !inputPrompt.trim()}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-xs)] bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span>{isLoading ? "Enviando…" : "Enviar"}</span>
                <svg
                  className="h-3 w-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>

          {/* Quick action chips */}
          {messages.length === 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-[var(--muted)]">
                Sugerencias:
              </span>
              {EXAMPLE_PROMPTS.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  disabled={isLoading}
                  onClick={() => setInputPrompt(ex)}
                  className="rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--background)] px-2.5 py-1 text-xs text-[var(--ink)] transition-colors hover:border-[var(--primary)] hover:bg-[var(--surface)] focus:outline-none disabled:opacity-50"
                >
                  {ex.slice(0, 38)}...
                </button>
              ))}
            </div>
          )}
        </form>
      )}

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-[var(--radius-sm)] border border-[var(--critical)]/30 bg-[var(--critical)]/10 p-3 text-xs text-[var(--ink)]"
        >
          <svg
            className="mt-0.5 h-4 w-4 shrink-0 text-[var(--critical)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div className="flex flex-col gap-0.5">
            <p className="font-bold text-[var(--ink)]">Atención:</p>
            <p className="text-[var(--muted)]">
              {error.message ||
                "No se pudo conectar con el asistente. Intentá de nuevo."}
            </p>
          </div>
        </div>
      )}

      {/* High-Contrast Success Ticket (Dispatch Receipt) using CSS tokens */}
      {createdItems.length > 0 && (
        <div className="flex flex-col gap-3.5 rounded-[var(--radius-sm)] border border-[var(--success)]/40 bg-[var(--success)]/10 p-4.5 text-[var(--ink)] shadow-xs">
          <div className="flex items-center justify-between border-b border-[var(--success)]/30 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--success)] text-white">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--ink)]">
                  {createdItems.length === 1
                    ? "Insumo registrado en el catálogo"
                    : `${createdItems.length} insumos registrados en el catálogo`}
                </h4>
                <p className="text-xs font-medium text-[var(--muted)]">
                  {latestAssistantText ||
                    "Los ítems ya están disponibles en el panel operativo."}
                </p>
              </div>
            </div>

            <span className="rounded-full border border-[var(--success)]/40 bg-[var(--surface)] px-2.5 py-0.5 font-mono text-xs font-bold text-[var(--ink)]">
              {createdItems.length}{" "}
              {createdItems.length === 1 ? "ítem" : "ítems"}
            </span>
          </div>

          {/* Insumos table cards */}
          <div className="flex flex-col gap-2 pt-1">
            {createdItems.map((item) => {
              const urgencyConfig = URGENCY_MAP[
                item.urgency as UrgencyLevel
              ] ?? {
                label: item.urgency,
                className:
                  "bg-[var(--background)] text-[var(--ink)] border-[var(--border)]",
              };

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-2 gap-2 rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--surface)] p-3 shadow-2xs sm:grid-cols-4"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold tracking-wider text-[var(--muted)] uppercase">
                      Insumo
                    </span>
                    <p className="text-xs font-bold text-[var(--ink)]">
                      {item.item_name}
                    </p>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold tracking-wider text-[var(--muted)] uppercase">
                      Categoría
                    </span>
                    <p className="text-xs font-semibold text-[var(--ink)]">
                      {item.category}
                    </p>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold tracking-wider text-[var(--muted)] uppercase">
                      Cantidad
                    </span>
                    <p className="font-mono text-xs font-bold text-[var(--ink)]">
                      {item.target_quantity} {item.unit}
                    </p>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold tracking-wider text-[var(--muted)] uppercase">
                      Urgencia
                    </span>
                    <div>
                      <span
                        className={`inline-flex items-center rounded-[var(--radius-xs)] border px-2 py-0.5 text-xs font-bold ${urgencyConfig.className}`}
                      >
                        {urgencyConfig.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions footer */}
          <div className="flex items-center justify-between border-t border-[var(--success)]/30 pt-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="text-xs font-semibold text-[var(--ink)] underline underline-offset-2 hover:text-[var(--muted)] focus:outline-none"
            >
              ← Ir al panel de necesidades
            </button>

            <button
              type="button"
              onClick={() => {
                handleReset();
                if (onSuccess) {
                  onSuccess(createdItems);
                }
                router.refresh();
              }}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-xs)] bg-[var(--primary)] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:opacity-90 focus:outline-none"
            >
              <span>Cargar más insumos</span>
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
