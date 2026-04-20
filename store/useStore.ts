import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Mode = "bewerbung" | "praesentation" | "verkauf";
export type InputType = "ki_gespraech" | "aufnahme" | "upload";

export type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

export type SessionSetup = {
  mode: Mode;
  inputType: InputType;
  scenarioTitle: string;
  scenarioDetails: Record<string, string>;
  difficulty: string;
};

export type AnalysisResult = {
  gesamtscore: number;
  zusammenfassung: string;
  scores: {
    relevanz: number;
    struktur: number;
    ueberzeugung: number;
    klarheit: number;
    stimmwirkung: number;
    ausstrahlung: number;
  };
  staerken: string[];
  verbesserungen: string[];
  pro_frage: Array<{
    frage: string;
    transkription: string;
    feedback: string;
    optimiert: string;
    score: number;
  }>;
  naechster_tipp: string;
};

type AppState = {
  user: { id: string; name: string; email: string } | null;
  sessionSetup: SessionSetup | null;
  messages: Message[];
  currentSessionId: string | null;
  analysisResult: AnalysisResult | null;
  isRecording: boolean;
  isAnalyzing: boolean;

  setUser: (user: AppState["user"]) => void;
  setSessionSetup: (setup: SessionSetup) => void;
  addMessage: (msg: Message) => void;
  setMessages: (msgs: Message[]) => void;
  setCurrentSessionId: (id: string) => void;
  setAnalysisResult: (result: AnalysisResult) => void;
  setIsRecording: (v: boolean) => void;
  setIsAnalyzing: (v: boolean) => void;
  resetSession: () => void;
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      sessionSetup: null,
      messages: [],
      currentSessionId: null,
      analysisResult: null,
      isRecording: false,
      isAnalyzing: false,

      setUser: (user) => set({ user }),
      setSessionSetup: (setup) => set({ sessionSetup: setup }),
      addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
      setMessages: (msgs) => set({ messages: msgs }),
      setCurrentSessionId: (id) => set({ currentSessionId: id }),
      setAnalysisResult: (result) => set({ analysisResult: result }),
      setIsRecording: (v) => set({ isRecording: v }),
      setIsAnalyzing: (v) => set({ isAnalyzing: v }),
      resetSession: () =>
        set({
          sessionSetup: null,
          messages: [],
          currentSessionId: null,
          analysisResult: null,
          isRecording: false,
          isAnalyzing: false,
        }),
    }),
    {
      name: "voyce-store",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
