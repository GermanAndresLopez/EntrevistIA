"use server";

export async function getInterviewerAck(userAnswer: string): Promise<string> {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `Eres un entrevistador. Debes dar una respuesta MUY breve y natural, de máximo 6 palabras, que haga referencia directa a algo puntual que dijo el candidato (una palabra clave, una situación, un concepto). NO analices, NO evalúes, NO repitas la respuesta. Solo reaccioná de forma natural como lo haría un entrevistador humano. Ejemplos válidos:
- "Entendido, lo del equipo distribuido."
- "Claro, especialmente en ese contexto."
- "Interesante, esa situación con el cliente."
- "Bien, tomamos nota de eso."
Responde SOLO en español.`,
          },
          {
            role: "user",
            content: `El candidato dijo: "${userAnswer.slice(0, 300)}"`,
          },
        ],
        max_tokens: 25,
      }),
    });

    if (!res.ok) return "";
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || "";
  } catch {
    return "";
  }
}
