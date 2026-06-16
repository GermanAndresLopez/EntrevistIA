import { getRandomInterviewCover } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  return Response.json({ success: true, data: "THANK YOU!" }, { status: 200 });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { role, experience, amount, userid, userId } = body;
  const finalUserId = userid || userId || "";

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `Eres un experto en selección de personal y entrevistas conductuales.
Tu tarea es generar preguntas de entrevista enfocadas en evaluar competencias blandas, profesionalismo, comunicación, liderazgo, manejo de conflictos, trabajo en equipo y toma de decisiones.
Las preguntas deben seguir el método STAR (Situación, Tarea, Acción, Resultado) e invitar al candidato a contar experiencias concretas.
NO hagas preguntas técnicas ni sobre herramientas específicas.
Responde SOLO con un array JSON de strings, sin texto adicional ni markdown.`,
          },
          {
            role: "user",
            content: `Genera ${amount} preguntas conductuales para entrevistar a un candidato al cargo de "${role}" con nivel de experiencia "${experience}".
Ajustá la profundidad y complejidad de las preguntas según el nivel: si es "sin-experiencia" o "novato", preguntá por situaciones académicas, voluntariados o hipotéticas; si es "intermedio" o "avanzado", preguntá por experiencias laborales reales y de mayor responsabilidad.
Las preguntas deben evaluar: comunicación, manejo de situaciones reales, actitud ante los retos, liderazgo, trabajo en equipo y profesionalismo.
Formatea así: ["Pregunta 1", "Pregunta 2", ...]`,
          },
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.text();
      return Response.json({ success: false, message: err }, { status: 500 });
    }

    const groqData = await groqRes.json();
    const rawContent = groqData.choices?.[0]?.message?.content?.trim() || "[]";
    const jsonMatch = rawContent.match(/\[[\s\S]*\]/);
    const questions = JSON.parse(jsonMatch ? jsonMatch[0] : "[]");

    const supabase = await createClient();

    const { data: created, error } = await supabase
      .from("interviews")
      .insert({
        role,
        type: "Conductual",
        level: "",
        techstack: [],
        questions,
        user_id: finalUserId,
        finalized: true,
        cover_image: getRandomInterviewCover(),
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return Response.json({ success: false, message: error.message }, { status: 500 });
    }

    return Response.json({ success: true, interviewId: created.id }, { status: 200 });
  } catch (error: any) {
    console.error("Generate error:", error);
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}
