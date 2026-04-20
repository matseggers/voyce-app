import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildInterviewSystemPrompt, buildSalesSystemPrompt } from "@/lib/prompts";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, messages, context, action } = body;

    let systemPrompt = "";

    if (mode === "bewerbung" || mode === "interview") {
      const company = context.jobPosting?.match(/bei\s+([^\n,\.]+)/i)?.[1] || "dem Unternehmen";
      const position = context.jobPosting?.match(/([A-Za-z\s]+Manager|[A-Za-z\s]+Developer|[A-Za-z\s]+Designer|[A-Za-z\s]+Leiter)/i)?.[0] || "der ausgeschriebenen Stelle";
      systemPrompt = buildInterviewSystemPrompt(
        company,
        position,
        context.jobPosting || "Keine Stellenanzeige angegeben",
        context.background || "",
        context.difficulty || "realistisch"
      );
    } else if (mode === "verkauf" || mode === "sales") {
      systemPrompt = buildSalesSystemPrompt(
        context.product || "dem Produkt",
        context.targetCustomer || "einem potentiellen Kunden",
        context.conversationType || "Erstgespräch",
        context.difficulty || "Skeptisch"
      );
    } else {
      systemPrompt = `Du bist ein KI-Gesprächspartner für ein ${mode}-Training auf Deutsch. Führe ein realistisches Gespräch und stelle herausfordernde, aber faire Fragen.`;
    }

    if (action === "start") {
      const openingMessages: Record<string, string> = {
        bewerbung: "Guten Tag, ich bin Sarah Weber, Head of Talent Acquisition. Schön, dass Sie heute Zeit für uns gefunden haben. Bitte nehmen Sie Platz. Erzählen Sie mir zunächst kurz: Was hat Sie dazu bewogen, sich bei uns zu bewerben?",
        interview: "Guten Tag, ich bin Sarah Weber, Head of Talent Acquisition. Schön, dass Sie heute Zeit für uns gefunden haben. Erzählen Sie mir kurz über sich – was hat Sie dazu bewogen, sich bei uns zu bewerben?",
        verkauf: "Ja, hallo? Weber am Apparat.",
        sales: "Ja, Weber hier. Ich habe nicht viel Zeit, was kann ich für Sie tun?",
        praesentation: "Bitte beginnen Sie Ihre Präsentation. Das Publikum ist bereit.",
      };
      return NextResponse.json({ message: openingMessages[mode] || openingMessages.bewerbung });
    }

    const anthropicMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      system: systemPrompt,
      messages: anthropicMessages,
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ message: text });
  } catch (error) {
    console.error("Conversation API error:", error);
    return NextResponse.json(
      { message: "Entschuldigung, ich konnte keine Antwort generieren. Bitte versuche es erneut." },
      { status: 500 }
    );
  }
}
