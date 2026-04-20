import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildAnalysisPrompt } from "@/lib/prompts";
import { countFillerWords, estimateWPM } from "@/lib/utils";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, transcript, context, durationSeconds = 300, input_type = "ki_gespraech", scenario_title } = body;

    const fillerWords = countFillerWords(transcript);
    const avgWPM = estimateWPM(transcript, durationSeconds);

    const prompt = buildAnalysisPrompt(
      mode,
      context?.jobPosting || context?.topic || context?.product || "Allgemeines Szenario",
      transcript,
      durationSeconds,
      fillerWords,
      avgWPM
    );

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";
    let analysis;

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      analysis = null;
    }

    if (!analysis) {
      analysis = {
        gesamtscore: 7.0,
        zusammenfassung: "Deine Session wurde analysiert. Die KI konnte das Feedback im gewünschten Format nicht vollständig generieren – bitte versuche es erneut.",
        scores: { relevanz: 7, struktur: 7, ueberzeugung: 7, klarheit: 7, stimmwirkung: 6.5, ausstrahlung: 7 },
        staerken: ["Gute Grundstruktur", "Klare Ausdrucksweise", "Engagierte Antworten"],
        verbesserungen: ["Stimmvarianz ausbauen", "Weniger Füllwörter", "Mehr konkrete Beispiele"],
        pro_frage: [],
        naechster_tipp: "Übe mit mehr Vorbereitung für noch bessere Ergebnisse.",
      };
    }

    // Save to Supabase
    let sessionId = "demo";
    try {
      const supabase = await createSupabaseServerClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const derivedTitle = scenario_title
          || context?.jobPosting?.split("\n")[0]?.replace(/[<>]/g, "").trim().slice(0, 80)
          || (mode === "bewerbung" ? "Bewerbungsgespräch" : mode === "praesentation" ? "Präsentation" : "Verkaufsgespräch");

        const { data: session } = await supabase
          .from("sessions")
          .insert({
            user_id: user.id,
            mode,
            input_type,
            scenario_title: derivedTitle,
            overall_score: analysis.gesamtscore,
            scores: analysis.scores,
            summary: analysis.zusammenfassung,
            strengths: analysis.staerken,
            improvements: analysis.verbesserungen,
            next_tip: analysis.naechster_tipp,
            duration_seconds: durationSeconds,
            avg_speaking_speed: avgWPM,
            total_filler_words: fillerWords,
          })
          .select("id")
          .single();

        if (session) {
          sessionId = session.id;

          if (analysis.pro_frage?.length) {
            await supabase.from("session_answers").insert(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              analysis.pro_frage.map((q: any, i: number) => ({
                session_id: sessionId,
                question_text: q.frage,
                answer_transcription: q.transkription,
                score: q.score,
                feedback: q.feedback,
                optimized_answer: q.optimiert,
                sort_order: i,
              }))
            );
          }
        }
      }
    } catch (dbErr) {
      console.error("DB save error:", dbErr);
      // Fall through — return analysis even if DB save fails
    }

    return NextResponse.json({
      sessionId,
      analysis,
      metadata: { fillerWords, avgWPM, durationSeconds, mode },
    });
  } catch (error) {
    console.error("Analyze API error:", error);
    return NextResponse.json({ error: "Analyse fehlgeschlagen. Bitte versuche es erneut." }, { status: 500 });
  }
}

// Handle audio file transcription via Whisper
export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("audio") as File;

    if (!file) {
      return NextResponse.json({ error: "Keine Audiodatei gefunden." }, { status: 400 });
    }

    const { OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      language: "de",
      response_format: "verbose_json",
      timestamp_granularities: ["segment"],
    });

    return NextResponse.json({ transcript: transcription.text, segments: transcription.segments });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json({ error: "Transkription fehlgeschlagen." }, { status: 500 });
  }
}
