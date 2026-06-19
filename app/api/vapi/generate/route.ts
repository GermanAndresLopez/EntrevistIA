import { getRandomInterviewCover } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { GENERAL_BEHAVIORAL_QUESTIONS } from "@/constants";

export async function GET() {
  return Response.json({ success: true, data: "THANK YOU!" }, { status: 200 });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { interviewType, role, experience, amount, userid, userId } = body;
  const finalUserId = userid || userId || "";

  try {
    let questions: string[];
    let dbType: string;
    let dbRole: string;

    if (interviewType === "conductual") {
      // Preguntas fijas de competencias generales
      questions = GENERAL_BEHAVIORAL_QUESTIONS.slice(0, amount);
      dbType = "Conductual";
      dbRole = "Competencias Generales";
    } else {
      // Generar preguntas específicas para el cargo con Groq
      dbType = "Conductual + Cargo";
      dbRole = role;

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
              content: `Eres un experto en selección de personal especializado en entrevistas conductuales por competencias.

Tu tarea es generar preguntas ESPECÍFICAS para un cargo determinado, que evalúen las competencias necesarias para ese puesto en situaciones reales del día a día.

FORMATO OBLIGATORIO para cada pregunta:
- Cada pregunta debe ser situacional y específica a las funciones del cargo.
- Incluir 1-3 sub-preguntas de seguimiento (ejemplo: "¿Qué hiciste? ¿Qué herramientas usaste? ¿Cómo resultó?").
- VARÍA los inicios obligatoriamente entre: "Cuéntame sobre una vez que...", "Relátame una situación en la que...", "Háblame de una ocasión en la que...", "Describe cómo...", "¿Cómo actuarías si...?".
- NUNCA uses el mismo inicio para dos preguntas.
- Las preguntas deben reflejar situaciones REALES que se viven en ese cargo.
- NO hagas preguntas genéricas tipo "Cuéntame sobre ti" o "¿Cuál es tu debilidad?". Esas son de competencias generales, no de cargo.

EJEMPLOS DE ESTILO (NO los copies, son solo referencia del formato):
- "Cuéntame sobre una vez que organizaste una actividad o agenda para otra persona o grupo. ¿Qué hiciste? ¿Qué herramientas usaste? ¿Cómo resultó?"
- "Relátame una situación en la que tuviste que manejar información importante o delicada. ¿Qué tipo de información era? ¿Cómo actuaste para mantenerla segura?"
- "Háblame de una ocasión en la que tuviste que entregar algo con urgencia. ¿Cómo actuaste?"
- "Describe cómo garantizarías la limpieza y seguridad en una zona de almacenamiento."
- "Relata un caso en el que propusiste una mejora para hacer algo más rápido o eficiente. ¿Qué observaste? ¿Cómo lo comunicaste?"

Responde SOLO con un array JSON de strings, sin texto adicional ni markdown.`,
            },
            {
              role: "user",
              content: `Genera ${amount} preguntas conductuales específicas para el cargo de "${role}" con nivel de experiencia "${experience}".
Seed: ${Date.now()}.
${experience === "sin-experiencia" || experience === "novato" ? "Orienta las preguntas a situaciones académicas, prácticas, voluntariado o hipotéticas relacionadas con el cargo. No asumas experiencia laboral formal." : "Las preguntas deben requerir ejemplos de experiencia laboral real en funciones similares al cargo."}
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
      questions = JSON.parse(jsonMatch ? jsonMatch[0] : "[]");
    }

    const supabase = await createClient();

    const { data: created, error } = await supabase
      .from("interviews")
      .insert({
        role: dbRole,
        type: dbType,
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
