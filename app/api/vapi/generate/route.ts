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
Tu tarea es generar preguntas ÚNICAS y VARIADAS para evaluar competencias blandas: comunicación, liderazgo, manejo de conflictos, trabajo en equipo, toma de decisiones y profesionalismo.
REGLAS IMPORTANTES:
- VARÍA los formatos: algunas deben ser sobre experiencias pasadas ("Contame sobre una vez que..."), otras situacionales ("¿Qué harías si...?"), otras de valores ("¿Cómo definís el éxito?"), otras de autoevaluación ("¿Cuál es tu mayor debilidad profesional?").
- NUNCA uses el mismo comienzo para dos preguntas.
- NO hagas preguntas técnicas ni sobre herramientas.
- Las preguntas deben poder ser respondidas verbalmente en 1-3 minutos.
- Usá un tono conversacional y natural, como un entrevistador humano.
- Incluí variedad temática: no todas sobre conflictos, no todas sobre liderazgo.
Responde SOLO con un array JSON de strings, sin texto adicional ni markdown.`,
          },
          {
            role: "user",
            content: `Genera ${amount} preguntas conductuales distintas entre sí para el cargo de "${role}" con experiencia nivel "${experience}".
Seed de variación: ${Date.now()}.
Nivel de complejidad: ${experience === "sin-experiencia" || experience === "novato" ? "Orientá las preguntas a situaciones académicas, de voluntariado, trabajo en equipo escolar o hipotéticas. Evitá pedir experiencia laboral formal." : "Las preguntas deben requerir ejemplos de experiencia laboral real, con responsabilidades concretas y situaciones de presión."}
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
