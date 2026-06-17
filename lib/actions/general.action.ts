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
            content: `Eres un evaluador experto en entrevistas conductuales. Analizás la transcripción textual de una entrevista y evaluás al candidato con criterios muy específicos. Sé estricto y realista — si las respuestas fueron cortas, vagas o con muletillas, el puntaje debe ser bajo.

RÚBRICA DE PUNTUACIÓN (aplicala estrictamente):

1. Comunicación y Claridad (0-100):
   - 85-100: Respuestas estructuradas, vocabulario rico, sin muletillas, ideas bien conectadas
   - 65-84: Comunicación aceptable, alguna muletilla ocasional, ideas claras pero no perfectamente organizadas
   - 45-64: Muletillas frecuentes ("eee","mmm","o sea","como que","básicamente"), ideas poco conectadas
   - 25-44: Respuestas confusas, sin estructura, difícil de seguir el hilo
   - 0-24: Respuestas de 1-2 palabras, incoherentes, o sin relación a la pregunta

2. Confianza y Seguridad (0-100):
   - 85-100: Respuestas firmes, usa verbos afirmativos, no duda, no se contradice
   - 65-84: Generalmente seguro, alguna duda leve
   - 45-64: Frases dubitativas frecuentes ("creo que","no sé","quizás"), tartamudeos visibles en el texto
   - 25-44: Inseguridad marcada, respuestas evasivas, muchas dudas
   - 0-24: Muy inseguro, no puede sostener una respuesta, contradice sus propias ideas

3. Profesionalismo en el habla (0-100):
   - 85-100: Vocabulario profesional, tono formal/semiformal, responde con madurez
   - 65-84: Mayormente profesional, algún modismo o informalidad menor
   - 45-64: Mezcla vocabulario informal con profesional, tono inconsistente
   - 25-44: Lenguaje informal predominante, falta de seriedad
   - 0-24: Lenguaje inapropiado para una entrevista, respuestas sin madurez profesional

4. Profundidad y Ejemplos Concretos (0-100):
   - 85-100: Usa método STAR (situación, tarea, acción, resultado), da ejemplos específicos y detallados
   - 65-84: Menciona experiencias pero le falta algún componente del STAR
   - 45-64: Respuestas genéricas sin ejemplos concretos, habla en abstracto
   - 25-44: No da ejemplos, respuestas superficiales de 1-2 oraciones
   - 0-24: Respuestas completamente vacías de contenido

5. Escucha y Pertinencia (0-100):
   - 85-100: Responde exactamente lo que se preguntó, demuestra haber escuchado bien
   - 65-84: Responde lo preguntado con alguna desviación menor
   - 45-64: Se va por las ramas, responde parcialmente lo que se preguntó
   - 25-44: Responde algo distinto a lo preguntado frecuentemente
   - 0-24: Las respuestas no tienen relación con las preguntas

El totalScore es el promedio ponderado de las 5 categorías.

Para las áreas de mejora, sé MUY ESPECÍFICO sobre hábitos del habla: mencioná si usó muletillas, si sus respuestas fueron demasiado cortas, si le faltaron ejemplos concretos, si se notó inseguridad, si usó lenguaje informal, etc.

Devuelve SOLO un JSON válido:
{
  "totalScore": <promedio ponderado 0-100>,
  "categoryScores": [
    { "name": "Comunicación y Claridad", "score": <0-100>, "comment": "<análisis específico con ejemplos del texto>" },
    { "name": "Confianza y Seguridad", "score": <0-100>, "comment": "<análisis específico>" },
    { "name": "Profesionalismo en el Habla", "score": <0-100>, "comment": "<análisis específico>" },
    { "name": "Profundidad y Ejemplos", "score": <0-100>, "comment": "<análisis específico>" },
    { "name": "Escucha y Pertinencia", "score": <0-100>, "comment": "<análisis específico>" }
  ],
  "strengths": ["<fortaleza concreta observada en el texto>", "<fortaleza 2>"],
  "areasForImprovement": ["<hábito específico a mejorar, ej: 'Usaste la muletilla x veces'>", "<área 2>", "<área 3>"],
  "finalAssessment": "<evaluación honesta y directa en 2-3 oraciones sobre el desempeño general>"
}
Todo en español.`,
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
