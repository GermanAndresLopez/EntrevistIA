"use server";

import { createClient } from "@/lib/supabase/server";
import { interviewTemplates } from "@/constants";
import { getRandomInterviewCover } from "@/lib/utils";

export async function getInterviewsByUserId(userId: string): Promise<Interview[] | null> {
  if (!userId) return [];
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("interviews")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data.map((r) => ({ ...r, id: r.id, userId: r.user_id, coverImage: r.cover_image, createdAt: r.created_at, techstack: r.techstack ?? [] })) as Interview[];
}

export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("interviews")
    .select("*")
    .eq("finalized", true)
    .neq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return data.map((r) => ({ ...r, id: r.id, userId: r.user_id, coverImage: r.cover_image, createdAt: r.created_at, techstack: r.techstack ?? [] })) as Interview[];
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("interviews")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return { ...data, userId: data.user_id, coverImage: data.cover_image, createdAt: data.created_at } as Interview;
}

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript } = params;
  const supabase = await createClient();

  try {
    const formattedTranscript = transcript
      .map((s: { role: string; content: string }) => `- ${s.role}: ${s.content}\n`)
      .join("");

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `Eres un evaluador experto en entrevistas conductuales y competencias blandas. Analizás la entrevista y evaluás al candidato en base a cómo se expresa, cómo maneja situaciones, su nivel de profesionalismo y su actitud general.
Devuelve SOLO un JSON válido con esta estructura exacta:
{
  "totalScore": <número 0-100>,
  "categoryScores": [
    { "name": "Comunicación y Claridad", "score": <0-100>, "comment": "<cómo se expresó, si fue claro y estructurado>" },
    { "name": "Confianza y Seguridad", "score": <0-100>, "comment": "<nivel de seguridad al responder, si dudó o fue firme>" },
    { "name": "Profesionalismo", "score": <0-100>, "comment": "<actitud, vocabulario, respeto, madurez profesional>" },
    { "name": "Pensamiento Crítico", "score": <0-100>, "comment": "<capacidad de analizar situaciones y tomar decisiones>" },
    { "name": "Trabajo en Equipo y Adaptabilidad", "score": <0-100>, "comment": "<cómo maneja el trabajo con otros y los cambios>" }
  ],
  "strengths": ["<fortaleza concreta 1>", "<fortaleza concreta 2>", "<fortaleza concreta 3>"],
  "areasForImprovement": ["<área de mejora 1>", "<área de mejora 2>"],
  "finalAssessment": "<evaluación general honesta en 2-3 oraciones sobre el desempeño del candidato>"
}
Todo en español. Sé objetivo y constructivo. Si las respuestas fueron cortas o incompletas, reflejalo en el puntaje.`,
          },
          {
            role: "user",
            content: `Analizá esta entrevista conductual y evaluá al candidato:\n${formattedTranscript}`,
          },
        ],
        max_tokens: 1024,
      }),
    });

    if (!groqRes.ok) throw new Error("Groq API error");

    const groqData = await groqRes.json();
    const parsed = JSON.parse(groqData.choices[0].message.content);
    const { totalScore, categoryScores, strengths, areasForImprovement, finalAssessment } = parsed;

    const { data, error } = await supabase.from("feedback").insert({
      interview_id: interviewId,
      user_id: userId,
      total_score: totalScore,
      category_scores: categoryScores,
      strengths,
      areas_for_improvement: areasForImprovement,
      final_assessment: finalAssessment,
      transcript,
      created_at: new Date().toISOString(),
    }).select("id").single();

    if (error) throw error;

    return { success: true, feedbackId: data.id };
  } catch (e: any) {
    console.error("Error saving feedback:", e?.message || e);
    return { success: false };
  }
}

export async function getFeedbackByInterviewId(params: GetFeedbackByInterviewIdParams): Promise<Feedback | null> {
  const { interviewId, userId } = params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("feedback")
    .select("*")
    .eq("interview_id", interviewId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    interviewId: data.interview_id,
    totalScore: data.total_score,
    categoryScores: data.category_scores,
    strengths: data.strengths,
    areasForImprovement: data.areas_for_improvement,
    finalAssessment: data.final_assessment,
    transcript: data.transcript ?? [],
    createdAt: data.created_at,
  } as Feedback;
}

export async function createInterviewFromTemplate(templateId: string, userId: string): Promise<string | null> {
  const supabase = await createClient();

  try {
    const template = interviewTemplates.find((t) => t.id === templateId);
    if (!template) throw new Error("Template not found");

    const { data, error } = await supabase.from("interviews").insert({
      role: template.role,
      level: template.level,
      type: template.type,
      techstack: template.techstack,
      questions: template.questions,
      user_id: userId,
      finalized: true,
      cover_image: getRandomInterviewCover(),
      created_at: new Date().toISOString(),
    }).select("id").single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error("Error creating interview from template:", error);
    return null;
  }
}
