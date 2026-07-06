import Anthropic from "@anthropic-ai/sdk";

export type AiConditieResultaat = {
  conditie: "UITSTEKEND" | "GOED" | "MATIG" | "SLECHT";
  beschrijving: string;
};

const client = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

function mediaTypeFromFilename(filename: string): "image/jpeg" | "image/png" | "image/webp" {
  const ext = filename.toLowerCase().split(".").pop();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

export async function beschrijfElementFoto(
  elementNaam: string,
  imageBase64: string,
  filename: string
): Promise<AiConditieResultaat> {
  if (!client) {
    return {
      conditie: "GOED",
      beschrijving:
        "AI-analyse niet beschikbaar (geen ANTHROPIC_API_KEY geconfigureerd). Vul de conditie en beschrijving manueel in.",
    };
  }

  const message = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaTypeFromFilename(filename),
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: `Je bent een expert in plaatsbeschrijvingen voor Belgische verhuurpanden. Bekijk deze foto van het element "${elementNaam}" en beoordeel de staat.

Antwoord UITSLUITEND met geldige JSON in dit formaat, zonder markdown-codeblok:
{"conditie": "UITSTEKEND" | "GOED" | "MATIG" | "SLECHT", "beschrijving": "korte, feitelijke beschrijving in het Nederlands van zichtbare slijtage, schade of bijzonderheden, geschikt voor een juridisch document"}`,
          },
        ],
      },
    ],
  });

  const block = message.content[0];
  const text = block.type === "text" ? block.text : "{}";

  try {
    const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```$/, "");
    const parsed = JSON.parse(cleaned);
    if (
      parsed &&
      typeof parsed.beschrijving === "string" &&
      ["UITSTEKEND", "GOED", "MATIG", "SLECHT"].includes(parsed.conditie)
    ) {
      return parsed;
    }
  } catch {
    // val terug op onderstaande default
  }

  return {
    conditie: "GOED",
    beschrijving: text.trim() || "Geen automatische beschrijving beschikbaar.",
  };
}
