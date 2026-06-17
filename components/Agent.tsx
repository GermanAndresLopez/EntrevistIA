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

// Muestra sólo las últimas oraciones que quepan en maxChars
const tailText = (text: string, maxChars = 200): string => {
  if (text.length <= maxChars) return text;
  const chunk = text.slice(-maxChars);
  const firstSpace = chunk.indexOf(" ");
  return firstSpace > 0 ? chunk.slice(firstSpace + 1) : chunk;
};

const Bubble = ({ text, side }: { text: string; side: "left" | "right" }) => (
  <div
    key={text}
    className={cn(
      "max-w-[260px] px-4 py-3 rounded-2xl text-sm leading-relaxed animate-fadeIn",
      side === "left"
        ? "bg-dark-200 text-light-100 rounded-tl-none self-start"
        : "bg-primary-200 text-dark-100 rounded-tr-none self-end",
    )}
  >
    {tailText(text)}
  </div>
);

const Agent = ({ userName, userId, type, interviewId, questions = [] }: AgentProps) => {
  const router = useRouter();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [interviewerBubble, setInterviewerBubble] = useState("");
  const [userBubble, setUserBubble] = useState("");
  const [liveText, setLiveText] = useState("");

  const transcriptRef = useRef<SavedMessage[]>([]);
  const recognitionRef = useRef<any>(null);
  const shouldStop = useRef(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    const loadVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      voiceRef.current =
        voices.find((v) => v.name.toLowerCase().includes("google") && v.lang.startsWith("es")) ||
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
      utterance.rate = 0.88;
      utterance.pitch = 1.05;
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
        silenceTimer = setTimeout(finish, 4500); // 4.5s sin hablar = terminó
      };

      const startRecognition = () => {
        if (resolved || shouldStop.current) return;

        const r = new SpeechRecognition();
        recognitionRef.current = r;
        r.lang = "es-ES";
        r.continuous = true;   // sin gaps entre frases
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
          resetSilenceTimer(); // reinicia cada vez que habla
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
          // Chrome paró solo (límite ~60s o silencio largo) → reiniciar
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
        silenceTimer = setTimeout(finish, 12000); // 12s para empezar a hablar
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

    const intro = "¡Hola! Gracias por tu tiempo. Comenzamos la entrevista.";
    setInterviewerBubble(intro);
    await speak(intro);

    for (let i = 0; i < questions.length; i++) {
      if (shouldStop.current) break;

      const question = questions[i];
      addMessage({ role: "assistant", content: question });
      await speak(question);

      if (shouldStop.current) break;

      const answer = await listenForAnswer();

      if (answer) {
        addMessage({ role: "user", content: answer });

        if (i < questions.length - 1 && !shouldStop.current) {
          const ack = await getInterviewerAck(answer);
          if (ack && !shouldStop.current) {
            addMessage({ role: "assistant", content: ack });
            await speak(ack);
          }
        }
      }
    }

    if (!shouldStop.current) {
      const outro = "Muchas gracias. Ha sido un placer. Pronto recibirás tu retroalimentación.";
      setInterviewerBubble(outro);
      setUserBubble("");
      await speak(outro);
    }

    setCallStatus(CallStatus.FINISHED);
  }, [questions, speak, listenForAnswer]);

  useEffect(() => {
    if (callStatus === CallStatus.FINISHED && type === "interview") {
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
              <Image
                src="/user-avatar.png"
                alt="usuario"
                width={540}
                height={540}
                className="rounded-full object-cover size-[120px]"
              />
              <h3>{userName}</h3>
            </div>
          </div>

          {isActive && (
            <>
              {isListening && (
                <div className="max-w-[260px] px-4 py-3 rounded-2xl rounded-tr-none bg-primary-200/40 text-light-100 text-sm leading-relaxed italic self-end animate-pulse">
                  {liveText ? tailText(liveText) : "Escuchando..."}
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
