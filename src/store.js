// ─────────────────────────────────────────────────────────────────────────────
// store.js — Global Zustand state for the Alphabets application
// ─────────────────────────────────────────────────────────────────────────────
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── Default voice profiles ──────────────────────────────────────────────────
export const VOICE_PROFILES = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Clear, warm American English',  lang: 'en-US' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam',   description: 'Deep, authoritative English',    lang: 'en-US' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella',  description: 'Soft, expressive English',       lang: 'en-US' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', description: 'Well-rounded, calm English',     lang: 'en-US' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh',   description: 'Young, energetic English',       lang: 'en-US' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', description: 'Crisp, confident English',       lang: 'en-US' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi',   description: 'Strong, clear English',          lang: 'en-US' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli',   description: 'Emotional, conversational',      lang: 'en-US' },
]

// ── Learning modes ──────────────────────────────────────────────────────────
export const LEARNING_MODES = {
  CRASH_COURSE: 'crash_course',
  DEEP_STUDY: 'deep_study',
  QUIZ: 'quiz',
}

// ── View states ─────────────────────────────────────────────────────────────
export const VIEWS = {
  HOME: 'home',
  ALPHABET_SELECT: 'alphabet_select',
  MODE_SELECT: 'mode_select',
  LESSON: 'lesson',
  QUIZ: 'quiz',
  SETTINGS: 'settings',
}

const useStore = create(
  persist(
    (set) => ({
      // ── Navigation ─────────────────────────────────────────────────────
      currentView: VIEWS.HOME,
      setView: (view) => set({ currentView: view }),

      // ── Alphabet selection ─────────────────────────────────────────────
      selectedAlphabetId: null,
      setSelectedAlphabet: (id) => set({ selectedAlphabetId: id }),

      // ── Learning mode ──────────────────────────────────────────────────
      learningMode: null,
      setLearningMode: (mode) => set({ learningMode: mode }),

      // ── Current lesson state ───────────────────────────────────────────
      currentLetterIndex: 0,
      setCurrentLetterIndex: (idx) => set({ currentLetterIndex: idx }),
      nextLetter: () => set((s) => ({ currentLetterIndex: s.currentLetterIndex + 1 })),
      prevLetter: () => set((s) => ({ currentLetterIndex: Math.max(0, s.currentLetterIndex - 1) })),
      resetLesson: () => set({ currentLetterIndex: 0 }),

      // ── Progress tracking ──────────────────────────────────────────────
      // { [alphabetId]: Set<letterId> }
      masteredLetters: {},
      markLetterMastered: (alphabetId, letterId) =>
        set((s) => ({
          masteredLetters: {
            ...s.masteredLetters,
            [alphabetId]: [...(s.masteredLetters[alphabetId] ?? []), letterId],
          },
        })),

      // ── Quiz state ─────────────────────────────────────────────────────
      quizQuestions: [],
      quizAnswers: {},
      quizScore: null,
      setQuizQuestions: (qs) => set({ quizQuestions: qs, quizAnswers: {}, quizScore: null }),
      answerQuiz: (questionId, answer) =>
        set((s) => ({ quizAnswers: { ...s.quizAnswers, [questionId]: answer } })),
      setQuizScore: (score) => set({ quizScore: score }),

      // ── Voice / TTS settings ───────────────────────────────────────────
      selectedVoiceId: '21m00Tcm4TlvDq8ikWAM',
      ttsSpeed: 0.85,           // 0.5 – 1.5
      ttsStability: 0.55,
      ttsSimilarityBoost: 0.75,
      voiceSettingsOpen: false,
      setVoice: (voiceId) => set({ selectedVoiceId: voiceId }),
      setTtsSpeed: (speed) => set({ ttsSpeed: speed }),
      setTtsStability: (v) => set({ ttsStability: v }),
      setTtsSimilarityBoost: (v) => set({ ttsSimilarityBoost: v }),
      toggleVoiceSettings: () => set((s) => ({ voiceSettingsOpen: !s.voiceSettingsOpen })),
      closeVoiceSettings: () => set({ voiceSettingsOpen: false }),

      // ── UI theme / display prefs ───────────────────────────────────────
      showIpa: true,
      showExamples: true,
      autoPlayAudio: false,
      cardGroupSize: 6,
      toggleShowIpa: () => set((s) => ({ showIpa: !s.showIpa })),
      toggleShowExamples: () => set((s) => ({ showExamples: !s.showExamples })),
      toggleAutoPlay: () => set((s) => ({ autoPlayAudio: !s.autoPlayAudio })),
      setCardGroupSize: (n) => set({ cardGroupSize: n }),

      // ── Dynamic content cache ──────────────────────────────────────────
      dynamicExamples: {},  // { [letterId]: string }
      setDynamicExample: (letterId, text) =>
        set((s) => ({ dynamicExamples: { ...s.dynamicExamples, [letterId]: text } })),

      // ── Audio playback ─────────────────────────────────────────────────
      isPlaying: false,
      playingLetterId: null,
      setPlaying: (letterId) => set({ isPlaying: true, playingLetterId: letterId }),
      stopPlaying: () => set({ isPlaying: false, playingLetterId: null }),
    }),
    {
      name: 'alphabets-store',
      // Only persist settings and progress — not transient UI state
      partialize: (s) => ({
        masteredLetters: s.masteredLetters,
        selectedVoiceId: s.selectedVoiceId,
        ttsSpeed: s.ttsSpeed,
        ttsStability: s.ttsStability,
        ttsSimilarityBoost: s.ttsSimilarityBoost,
        showIpa: s.showIpa,
        showExamples: s.showExamples,
        autoPlayAudio: s.autoPlayAudio,
        cardGroupSize: s.cardGroupSize,
      }),
    }
  )
)

export default useStore
