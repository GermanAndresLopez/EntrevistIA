"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { createFeedback } from "@/lib/actions/general.action";
import { getInterviewerAck } from "@/lib/actions/groq.action";
import { toast } from "sonner";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

type Phase = "idle" | "intro" | "asking" | "listening" | "processing" | "feedback" | "done";

interface SavedMessage {
  role: "user" | "assistant";
  content: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const tailText = (text: string, maxChars = 90): string => {
  if (text.length <= maxChars) return text;
  const chunk = text.slice(-maxChars);
  const firstSpace = chunk.indexOf(" ");
  return "…" + (firstSpace > 0 ? chunk.slice(firstSpace + 1) : chunk);
};

const Bubble = ({ text, side }: { text: string; side: "left" | "right" }) => (
  <div
    key={text}
    className={cn(
      "max-w-[280px] px-4 py-3 rounded-2xl text-sm leading-relaxed animate-fadeIn line-clamp-3",
      side === "left"
        ? "bg-white border border-light-800 text-light-100 rounded-tl-none self-start shadow-sm"
        : "bg-primary-200 text-white rounded-tr-none self-end shadow-sm",
    )}
  >
    {tailText(text)}
  </div>
);

const ProgressBar = ({
  current,
  total,
  phase,
}: {
  current: number;
  total: number;
  phase: Phase;
}) => {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  const label = (() => {
    switch (phase) {
      case "idle": return "Listo para comenzar";
      case "intro": return "Introducción";
      case "asking": return `Pregunta ${current + 1} de ${total}`;
      case "listening": return `Escuchando respuesta — Pregunta ${current + 1} de ${total}`;
      case "processing": return `Procesando — Pregunta ${current + 1} de ${total}`;
      case "feedback": return "Generando retroalimentación...";
      case "done": return "Entrevista completada";
    }
  })();

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm font-semibold">
        <span className="text-light-100">{label}</span>
        {phase !== "idle" && phase !== "intro" && phase !== "feedback" && (
          <span className="text-primary-200 tabular-nums">{pct}%</span>
        )}
      </div>
      <div className="w-full h-2 bg-light-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${phase === "feedback" || phase === "done" ? 100 : pct}%` }}
        />
      </div>
      {phase !== "idle" && (
        <div className="flex gap-1.5 justify-center">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                i < current
                  ? "bg-orange-500"
                  : i === current && phase !== "done" && phase !== "feedback"
                    ? "bg-orange-400 animate-pulse"
                    : "bg-light-800",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Agent = ({ userName, userId, userImage, type, interviewId, questions = [] }: AgentProps) => {
  const router = useRouter();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [interviewerBubble, setInterviewerBubble] = useState("");
  const [userBubble, setUserBubble] = useState("");
  const [liveText, setLiveText] = useState("");
  const [currentQ, setCurrentQ] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");

  const transcriptRef = useRef<SavedMessage[]>([]);
  const recognitionRef = useRef<any>(null);
  const shouldStop = useRef(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    const loadVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      voiceRef.current =
        voices.find((v) => /microsoft.*sabina/i.test(v.name)) ||
        voices.find((v) => /microsoft/i.test(v.name) && v.lang.startsWith("es")) ||
        voices.find((v) => /google.*español/i.test(v.name)) ||
        voices.find((v) => v.name.toLowerCase().includes("mónica")) ||
        voices.find((v) => v.name.toLowerCase().includes("paulina")) ||
        voices.find((v) => v.lang === "es-ES") ||
        voices.find((v) => v.lang.startsWith("es")) ||
        null;
    };
    loadVoice();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoice);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoice);
  }, []);

  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || shouldStop.current) return resolve();
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      if (voiceRef.current) utterance.voice = voiceRef.current;
      setIsSpeaking(true);
      utterance.onend = () => { setIsSpeaking(false); resolve(); };
      utterance.onerror = () => { setIsSpeaking(false); resolve(); };
      window.speechSynthesis.speak(utterance);
    });
  }, []);

  const listenForAnswer = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      if (shouldStop.current) return resolve("");

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast.error("Tu navegador no soporta reconocimiento de voz. Usa Chrome.");
        return resolve("");
      }

      let finalTranscript = "";
      let silenceTimer: ReturnType<typeof setTimeout> | null = null;
      let resolved = false;

      const finish = () => {
        if (resolved) return;
        resolved = true;
        if (silenceTimer) clearTimeout(silenceTimer);
        if ((finish as any)._restartRef) clearTimeout((finish as any)._restartRef);
        try { recognitionRef.current?.stop(); } catch {}
        setIsListening(false);
        setLiveText("");
        resolve(finalTranscript.trim());
      };

      let restartTimer: ReturnType<typeof setTimeout> | null = null;

      const resetSilenceTimer = () => {
        if (silenceTimer) clearTimeout(silenceTimer);
        silenceTimer = setTimeout(finish, 4500);
      };

      const startRecognition = () => {
        if (resolved || shouldStop.current) return;

        const r = new SpeechRecognition();
        recognitionRef.current = r;
        r.lang = "es-ES";
        r.continuous = true;
        r.interimResults = true;
        r.maxAlternatives = 1;

        r.onresult = (e: any) => {
          let interim = "";
          for (let i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isFinal) {
              finalTranscript += e.results[i][0].transcript + " ";
            } else {
              interim += e.results[i][0].transcript;
            }
          }
          setLiveText(finalTranscript + interim);
          resetSilenceTimer();
        };

        r.onerror = (e: any) => {
          if (resolved) return;
          if (e.error === "no-speech" || e.error === "network") {
            if (restartTimer) clearTimeout(restartTimer);
            restartTimer = setTimeout(startRecognition, 250);
            return;
          }
          if (e.error === "aborted") return;
          if (finalTranscript) finish();
        };

        r.onend = () => {
          if (!resolved && !shouldStop.current) {
            if (restartTimer) clearTimeout(restartTimer);
            restartTimer = setTimeout(startRecognition, 250);
          }
        };

        try { r.start(); } catch { finish(); }
      };

      setIsListening(true);
      setTimeout(() => {
        startRecognition();
        if (silenceTimer) clearTimeout(silenceTimer);
        silenceTimer = setTimeout(finish, 12000);
      }, 400);
    });
  }, []);

  const addMessage = (msg: SavedMessage) => {
    transcriptRef.current.push(msg);
    if (msg.role === "assistant") {
      setInterviewerBubble(msg.content);
      setUserBubble("");
    } else {
      setUserBubble(msg.content);
      setInterviewerBubble("");
    }
  };

  const runInterview = useCallback(async () => {
    setCallStatus(CallStatus.ACTIVE);
    shouldStop.current = false;

    setPhase("intro");
    const intro = "¡Hola! Gracias por tu tiempo. Comenzamos la entrevista.";
    setInterviewerBubble(intro);
    await speak(intro);

    for (let i = 0; i < questions.length; i++) {
      if (shouldStop.current) break;

      setCurrentQ(i);
      setPhase("asking");
      const question = questions[i];
      addMessage({ role: "assistant", content: question });
      await speak(question);

      if (shouldStop.current) break;

      setPhase("listening");
      const answer = await listenForAnswer();

      if (answer) {
        addMessage({ role: "user", content: answer });

        if (i < questions.length - 1 && !shouldStop.current) {
          setPhase("processing");
          const ack = await getInterviewerAck(answer);
          if (ack && !shouldStop.current) {
            addMessage({ role: "assistant", content: ack });
            await speak(ack);
          }
        }
      }
    }

    if (!shouldStop.current) {
      setCurrentQ(questions.length);
      setPhase("done");
      const outro = "Muchas gracias. Ha sido un placer. Pronto recibirás tu retroalimentación.";
      setInterviewerBubble(outro);
      setUserBubble("");
      await speak(outro);
    }

    setCallStatus(CallStatus.FINISHED);
  }, [questions, speak, listenForAnswer]);

  useEffect(() => {
    if (callStatus === CallStatus.FINISHED && type === "interview") {
      setPhase("feedback");
      handleGenerateFeedback();
    }
  }, [callStatus]);

  const handleGenerateFeedback = async () => {
    const { success, feedbackId } = await createFeedback({
      interviewId: interviewId!,
      userId: userId!,
      transcript: transcriptRef.current,
    });
    if (success && feedbackId) {
      router.push(`/interview/${interviewId}/feedback`);
    } else {
      router.push("/dashboard");
    }
  };

  const handleStart = () => {
    setCallStatus(CallStatus.CONNECTING);
    runInterview();
  };

  const handleStop = () => {
    shouldStop.current = true;
    if (recognitionRef.current) try { recognitionRef.current.stop(); } catch {}
    if (typeof window !== "undefined") window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsListening(false);
    setCallStatus(CallStatus.FINISHED);
  };

  const isInactive = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;
  const isActive = callStatus === CallStatus.ACTIVE;

  return (
    <>
      {/* Progress */}
      <ProgressBar current={currentQ} total={questions.length} phase={phase} />

      <div className="call-view">
        {/* Entrevistador */}
        <div className="flex flex-col items-start gap-3 flex-1">
          <div className="card-interviewer">
            <div className="avatar">
              <Image
                src="/ai-avatar_v3.png"
                alt="entrevistador"
                width={120}
                height={120}
                className="rounded-full object-cover size-[120px]"
              />
              {isSpeaking && <span className="animate-speak" />}
            </div>
            <h3>{isSpeaking ? "Hablando..." : "Entrevistador IA"}</h3>
          </div>

          {isActive && interviewerBubble && (
            <Bubble key={interviewerBubble} text={interviewerBubble} side="left" />
          )}
        </div>

        {/* Usuario */}
        <div className="flex flex-col items-end gap-3 flex-1">
          <div className="card-border">
            <div className="card-content">
              {userImage ? (
                <img
                  src={userImage}
                  alt={userName}
                  className="rounded-full object-cover size-[120px]"
                />
              ) : (
                <div className="size-[120px] rounded-full bg-primary-200 flex items-center justify-center text-white text-5xl font-bold select-none">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <h3>{userName}</h3>
            </div>
          </div>

          {isActive && (
            <>
              {isListening && (
                <div className="max-w-[280px] px-4 py-3 rounded-2xl rounded-tr-none bg-primary-200 text-white text-sm leading-relaxed self-end shadow-sm overflow-hidden" style={{ maxHeight: "4.5em" }}>
                  {liveText ? tailText(liveText, 80) : (
                    <span className="flex items-center gap-2 opacity-80 italic">
                      <span className="flex gap-0.5">
                        <span className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                      Escuchando...
                    </span>
                  )}
                </div>
              )}
              {!isListening && userBubble && (
                <Bubble key={userBubble} text={userBubble} side="right" />
              )}
            </>
          )}
        </div>
      </div>

      <div className="w-full flex justify-center mt-6">
        {callStatus !== CallStatus.ACTIVE ? (
          phase === "feedback" ? (
            <div className="flex flex-col items-center gap-3 mt-5">
              <div className="w-8 h-8 border-[3px] border-orange-200 border-t-orange-600 rounded-full animate-spin" />
              <p className="text-sm font-semibold text-light-400">Analizando tu entrevista...</p>
            </div>
          ) : (
            <button
              className="relative btn-call mt-5"
              onClick={handleStart}
              disabled={callStatus === CallStatus.CONNECTING}
            >
              <span
                className={cn(
                  "absolute animate-ping rounded-full opacity-75",
                  callStatus !== CallStatus.CONNECTING && "hidden",
                )}
              />
              <span>{isInactive ? "Iniciar entrevista" : ". . ."}</span>
            </button>
          )
        ) : (
          <button className="btn-disconnect" onClick={handleStop}>
            Finalizar
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
