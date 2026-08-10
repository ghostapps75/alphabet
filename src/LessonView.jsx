// ─────────────────────────────────────────────────────────────────────────────
// LessonView.jsx — Core letter learning experience for Crash Course & Deep Study
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Volume2, CheckCircle2, RefreshCw,
  Sparkles, Info, ChevronLeft, ChevronRight, Mic,
} from 'lucide-react'
import useStore, { VIEWS, LEARNING_MODES } from './store'
import { ALPHABETS } from './alphabetData'
import useAudio from './useAudio'
import { generateWordExamples, generateLetterNote, generateGreekBridgeNote } from './aiService'

// ── Audio trigger button used on the card back ────────────────────────────────
function AudioBtn({ label, phonetic, onClick, active, color, icon }) {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-left transition-all"
      style={{
        background: active ? `${color}22` : 'rgba(255,255,255,0.04)',
        border: `1px solid ${active ? color : 'rgba(255,255,255,0.08)'}`,
      }}
    >
      {/* Icon */}
      <div className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
           style={{ background: `${color}25`, color }}>
        {active
          ? <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.55 }}>
              <Volume2 size={13} />
            </motion.span>
          : icon
        }
      </div>
      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold leading-tight" style={{ color: active ? color : 'var(--c-text)' }}>
          {label}
        </p>
        {phonetic && (
          <p className="text-xs font-mono mt-0.5 truncate" style={{ color: 'var(--c-sub)' }}>
            {phonetic}
          </p>
        )}
      </div>
    </motion.button>
  )
}

// ── Letter Card (flip-reveal) ────────────────────────────────────────────────
function LetterCard({ letter, alphabet, onNameAudio, onSoundAudio, onWordAudio, playingKey }) {
  const [flipped, setFlipped] = useState(false)
  const { showIpa } = useStore()

  // Reset flip when letter changes
  useEffect(() => setFlipped(false), [letter.id])

  // Split example string into native word + English gloss for display
  // e.g. "Apple (Tapuakh — apple)" → "Apple" + "Tapuakh — apple"
  const exampleRaw = letter.example ?? ''
  const exampleParenMatch = exampleRaw.match(/^(.+?)\s*\((.+)\)$/)
  const exampleWord = exampleParenMatch ? exampleParenMatch[1].trim() : exampleRaw
  const exampleGloss = exampleParenMatch ? exampleParenMatch[2].trim() : ''

  return (
    <div
      className={`letter-card w-72 mx-auto ${flipped ? 'flipped' : ''}`}
      style={{ height: '22rem' }}
      onClick={() => setFlipped(f => !f)}
    >
      <div className="letter-card-inner w-full h-full">
        {/* ── Front: the letter character ── */}
        <div
          className="letter-card-front w-full h-full glass rounded-3xl flex flex-col items-center justify-center gap-4 select-none"
          style={{ border: `2px solid ${alphabet.color}30`, boxShadow: `0 0 40px ${alphabet.color}20` }}
        >
          <motion.div
            key={letter.id}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="text-9xl font-black leading-none"
            style={{ color: alphabet.color, textShadow: `0 0 60px ${alphabet.color}50` }}
          >
            {letter.char}
          </motion.div>
          <div className="text-center">
            <p className="text-lg font-bold" style={{ color: 'var(--c-text)' }}>{letter.name}</p>
            {showIpa && (
              <p className="text-sm font-mono mt-0.5" style={{ color: 'var(--c-sub)' }}>{letter.ipa}</p>
            )}
          </div>
          <p className="text-xs" style={{ color: 'var(--c-muted)' }}>Tap to hear pronunciation</p>
        </div>

        {/* ── Back: three audio controls ── */}
        <div
          className="letter-card-back w-full h-full glass rounded-3xl flex flex-col justify-center gap-2 px-5 select-none"
          style={{ border: `2px solid ${alphabet.color}40`, background: `${alphabet.color}06` }}
        >
          {/* Letter glyph mini-header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl font-black" style={{ color: alphabet.color }}>{letter.char}</span>
            <div>
              <p className="text-xs font-bold" style={{ color: 'var(--c-text)' }}>{letter.name}</p>
              {showIpa && <p className="text-xs font-mono" style={{ color: 'var(--c-sub)' }}>{letter.ipa}</p>}
            </div>
          </div>

          {/* 1 — Letter name */}
          <AudioBtn
            label="Letter name"
            phonetic={letter.name}
            onClick={onNameAudio}
            active={playingKey === `${letter.id}-name`}
            color={alphabet.color}
            icon={<Mic size={13} />}
          />

          {/* 2 — Phoneme sound */}
          <AudioBtn
            label="Sound it makes"
            phonetic={letter.ipa ? `IPA: ${letter.ipa}` : letter.sound}
            onClick={onSoundAudio}
            active={playingKey === `${letter.id}-sound`}
            color={alphabet.color}
            icon={<Volume2 size={13} />}
          />

          {/* 3 — Word example */}
          <AudioBtn
            label={exampleWord || 'Word example'}
            phonetic={[
              exampleGloss,
              letter.examplePhonetic,
            ].filter(Boolean).join('  ·  ')}
            onClick={onWordAudio}
            active={playingKey === `${letter.id}-word`}
            color={alphabet.color}
            icon={<Volume2 size={13} />}
          />

          <p className="text-xs text-center mt-1" style={{ color: 'var(--c-muted)' }}>Tap card to flip back</p>
        </div>
      </div>
    </div>
  )
}

// ── Deep Study extras (AI-powered) ────────────────────────────────────────────
function DeepStudyPanel({ letter, alphabet }) {
  const [examples, setExamples] = useState([])
  const [note, setNote] = useState(null)
  const [bridgeNote, setBridgeNote] = useState(null)
  const [loading, setLoading] = useState(false)
  const { aiProvider, openAiKey, geminiKey } = useStore()

  const isGreek = alphabet.id === 'greekAncient'

  const loadAI = useCallback(async () => {
    if (!openAiKey && !geminiKey) return
    setLoading(true)
    try {
      const [exs, n, bn] = await Promise.all([
        generateWordExamples({ letter, alphabetName: alphabet.name, provider: aiProvider, openAiKey, geminiKey }),
        generateLetterNote({ letter, alphabetName: alphabet.name, provider: aiProvider, openAiKey, geminiKey }),
        isGreek ? generateGreekBridgeNote({ letter, provider: aiProvider, openAiKey, geminiKey }) : Promise.resolve(null),
      ])
      setExamples(exs)
      setNote(n)
      setBridgeNote(bn)
    } catch { /* silently fail */ }
    setLoading(false)
  }, [letter.id, aiProvider, openAiKey, geminiKey])

  useEffect(() => { loadAI() }, [letter.id])

  return (
    <div className="space-y-4 mt-6">
      {/* Cultural note */}
      {note && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-xl p-4 flex gap-3">
          <Info size={16} className="shrink-0 mt-0.5" style={{ color: alphabet.color }} />
          <p className="text-sm leading-relaxed" style={{ color: 'var(--c-sub)' }}>{note}</p>
        </motion.div>
      )}

      {/* Ancient/Modern Greek bridge */}
      {bridgeNote && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-xl p-4 flex gap-3"
                    style={{ border: '1px solid rgba(167,139,250,0.2)' }}>
          <Sparkles size={16} className="shrink-0 mt-0.5" style={{ color: '#a78bfa' }} />
          <div>
            <p className="text-xs font-bold mb-1" style={{ color: '#a78bfa' }}>Ancient → Modern</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--c-sub)' }}>{bridgeNote}</p>
          </div>
        </motion.div>
      )}

      {/* Word examples */}
      {examples.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-xl p-4">
          <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--c-muted)' }}>
            Word Examples
          </h4>
          <div className="space-y-3">
            {examples.map((ex, i) => (
              <div key={i} className="border-l-2 pl-3" style={{ borderColor: alphabet.color }}>
                <p className="text-lg font-bold" style={{ color: alphabet.color }}>{ex.word}</p>
                <p className="text-xs font-mono" style={{ color: 'var(--c-sub)' }}>{ex.transliteration} · {ex.meaning}</p>
                {ex.sentence && (
                  <p className="text-xs mt-1 italic" style={{ color: 'var(--c-muted)' }}>
                    "{ex.sentence}" — {ex.sentenceTranslation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--c-sub)' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <RefreshCw size={12} />
          </motion.div>
          Generating AI examples…
        </div>
      )}

      {!openAiKey && !geminiKey && (
        <p className="text-xs" style={{ color: 'var(--c-muted)' }}>
          ⚙️ Add an OpenAI or Gemini API key in Settings to enable AI-generated examples.
        </p>
      )}
    </div>
  )
}

// ── Main LessonView ───────────────────────────────────────────────────────────
export default function LessonView() {
  const {
    selectedAlphabetId, learningMode, currentLetterIndex,
    nextLetter, prevLetter, setView, markLetterMastered, masteredLetters, resetLesson,
    isPlaying, playingLetterId,
  } = useStore()
  const { speak } = useAudio()

  // Track which of the three audio slots is active, e.g. "en-a-name" | "en-a-sound" | "en-a-word"
  const [playingKey, setPlayingKey] = useState(null)

  const alphabet = ALPHABETS[selectedAlphabetId]
  if (!alphabet) { setView(VIEWS.ALPHABET_SELECT); return null }

  const letters = alphabet.letters
  const letter = letters[currentLetterIndex]
  const isCrash = learningMode === LEARNING_MODES.CRASH_COURSE
  const mastered = masteredLetters[alphabet.id] ?? []
  const isCurrentMastered = mastered.includes(letter?.id)
  const progress = ((currentLetterIndex + 1) / letters.length) * 100

  if (!letter) return null

  // Reset active key when letter changes
  useEffect(() => setPlayingKey(null), [letter.id])

  // Helper: speak text and mark the right slot as active
  const handleSlotAudio = async (slot, text) => {
    const key = `${letter.id}-${slot}`
    setPlayingKey(key)
    await speak(text, key)
    setPlayingKey(null)
  }

  // Extract the native word from the example string like "Apple (tapuakh — apple)"
  const exampleRaw = letter.example ?? ''
  const exampleWordOnly = exampleRaw.replace(/\s*\(.+\)$/, '').trim() || exampleRaw

  const handleNameAudio  = () => handleSlotAudio('name',  letter.name)
  const handleSoundAudio = () => handleSlotAudio('sound', `The sound is: ${letter.sound}`)
  const handleWordAudio  = () => handleSlotAudio('word',  exampleWordOnly)

  const handleMastered = () => {
    markLetterMastered(alphabet.id, letter.id)
    if (currentLetterIndex < letters.length - 1) nextLetter()
  }

  const handleNext = () => {
    if (currentLetterIndex < letters.length - 1) nextLetter()
  }

  const handlePrev = () => {
    if (currentLetterIndex > 0) prevLetter()
  }

  return (
    <div className="flex flex-col items-center px-5 py-8 max-w-2xl mx-auto w-full">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full mb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setView(VIEWS.MODE_SELECT)}
                  className="flex items-center gap-1.5 text-sm btn-ghost rounded-lg px-3 py-1.5"
                  style={{ color: 'var(--c-sub)' }}>
            <ArrowLeft size={14} />
            Exit
          </button>
          <div className="text-xs font-medium" style={{ color: 'var(--c-sub)' }}>
            {currentLetterIndex + 1} / {letters.length}
          </div>
          <button onClick={resetLesson}
                  className="flex items-center gap-1.5 text-xs btn-ghost rounded-lg px-3 py-1.5"
                  style={{ color: 'var(--c-sub)' }}>
            <RefreshCw size={12} />
            Restart
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--c-border)' }}>
          <motion.div
            className="progress-bar h-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>

        {/* Mode badge */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs" style={{ color: 'var(--c-muted)' }}>
            {isCrash ? '⚡ Crash Course' : '📖 Deep Study'} · {alphabet.name}
          </span>
          <span className="text-xs" style={{ color: 'var(--c-muted)' }}>
            {mastered.length} mastered
          </span>
        </div>
      </motion.div>

      {/* Letter card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={letter.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
          className="w-full flex flex-col items-center"
        >
          <LetterCard
            letter={letter}
            alphabet={alphabet}
            onNameAudio={handleNameAudio}
            onSoundAudio={handleSoundAudio}
            onWordAudio={handleWordAudio}
            playingKey={playingKey}
          />

          {/* Position label */}
          <div className="mt-3 text-xs" style={{ color: 'var(--c-muted)' }}>
            Letter #{letter.position} in {alphabet.nativeName}
            {alphabet.direction === 'rtl' && ' · Right-to-Left script'}
          </div>

          {/* Deep study AI panel */}
          {!isCrash && <DeepStudyPanel letter={letter} alphabet={alphabet} />}
        </motion.div>
      </AnimatePresence>

      {/* Navigation controls */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mt-8 w-full max-w-xs"
      >
        {/* Prev */}
        <button
          onClick={handlePrev}
          disabled={currentLetterIndex === 0}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium btn-ghost disabled:opacity-30"
          style={{ color: 'var(--c-text)' }}
        >
          <ChevronLeft size={16} />
          Prev
        </button>

        {/* Mark mastered */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleMastered}
          className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all"
          style={{
            background: isCurrentMastered ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${isCurrentMastered ? '#34d399' : 'var(--c-border)'}`,
            color: isCurrentMastered ? '#34d399' : 'var(--c-muted)',
          }}
          title="Mark as mastered"
        >
          <CheckCircle2 size={18} />
        </motion.button>

        {/* Next */}
        <button
          onClick={handleNext}
          disabled={currentLetterIndex === letters.length - 1}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium btn-primary text-white disabled:opacity-40"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </motion.div>

      {/* Keyboard hint */}
      <p className="mt-4 text-xs" style={{ color: 'var(--c-muted)' }}>
        ← → to navigate · tap card to flip
      </p>

      {/* Keyboard navigation */}
      <KeyboardNav onNext={handleNext} onPrev={handlePrev} onAudio={handleNameAudio} />
    </div>
  )
}

function KeyboardNav({ onNext, onPrev, onAudio }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') onNext()
      if (e.key === 'ArrowLeft')  onPrev()
      if (e.key === ' ')          { e.preventDefault(); onAudio() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onNext, onPrev, onAudio])
  return null
}
