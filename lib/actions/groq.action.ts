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
            content:
              "Eres un entrevistador profesional y amable. Responde SOLO en español. Máximo 1 oración corta. Solo reconoce brevemente la respuesta del candidato, sin repetirla.",
          },
          {
            role: "user",
            content: `El candidato respondió: "${userAnswer}". Haz un breve reconocimiento.`,
          },
        ],
        max_tokens: 60,
      }),
    });

    if (!res.ok) return "";
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || "";
  } catch {
    return "";
  }
}
