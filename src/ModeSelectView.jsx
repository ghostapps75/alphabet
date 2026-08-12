// ─────────────────────────────────────────────────────────────────────────────
// ModeSelectView.jsx — Learning mode selection for the chosen alphabet
// ─────────────────────────────────────────────────────────────────────────────
import { motion } from 'framer-motion'
import { ArrowLeft, Zap, BookOpen, Brain, ChevronRight } from 'lucide-react'
import useStore, { VIEWS, LEARNING_MODES } from './store'
import { ALPHABETS } from './alphabetData'

const modes = [
  {
    id: LEARNING_MODES.CRASH_COURSE,
    icon: <Zap size={28} />,
    title: 'Crash Course',
    tagline: 'Learn all letters fast',
    color: '#c85b2a',
    description: 'Rapid-fire flashcard mode. See each letter, hear its sound, and move on. Perfect for getting a quick feel for a new script in under 10 minutes.',
    bullets: ['Flashcard-style navigation', 'Instant audio pronunciation', 'Letter → Sound focus', 'Progress-tracked'],
    time: '~10 min',
  },
  {
    id: LEARNING_MODES.DEEP_STUDY,
    icon: <BookOpen size={28} />,
    title: 'Deep Study',
    tagline: 'Master every nuance',
    color: '#3a7a7a',
    description: 'Structured, in-depth lessons. Each letter comes with full IPA phonetics, contextual word examples, cultural notes, and AI-generated usage sentences.',
    bullets: ['Full IPA transcription', 'AI word examples', 'Historical & cultural notes', 'Ancient/Modern Greek bridge'],
    time: '20–40 min',
  },
  {
    id: LEARNING_MODES.QUIZ,
    icon: <Brain size={28} />,
    title: 'Quiz Mode',
    tagline: 'Test your knowledge',
    color: '#c9941a',
    description: 'Dynamic AI-generated multiple-choice quizzes testing letter recognition, sounds, word examples, and cultural knowledge at your chosen depth.',
    bullets: ['AI-generated questions', 'Multiple-choice format', 'Instant explanations', 'Score tracking'],
    time: 'Your pace',
  },
]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}
const cardVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
}

export default function ModeSelectView() {
  const { selectedAlphabetId, setView, setLearningMode } = useStore()
  const alphabet = ALPHABETS[selectedAlphabetId]

  if (!alphabet) { setView(VIEWS.ALPHABET_SELECT); return null }

  const handleModeSelect = (modeId) => {
    setLearningMode(modeId)
    if (modeId === LEARNING_MODES.QUIZ) {
      setView(VIEWS.QUIZ)
    } else {
      setView(VIEWS.LESSON)
    }
  }

  return (
    <div className="flex flex-col items-center px-5 py-10 max-w-3xl mx-auto w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full mb-8"
      >
        <button onClick={() => setView(VIEWS.ALPHABET_SELECT)}
                className="flex items-center gap-2 text-sm mb-6 transition-colors hover:text-white btn-ghost rounded-lg px-3 py-2"
                style={{ color: 'var(--c-sub)' }}>
          <ArrowLeft size={15} />
          Back to Scripts
        </button>

        {/* Alphabet identity */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl font-bold"
               style={{ background: `${alphabet.color}18`, color: alphabet.color,
                        boxShadow: `0 0 30px ${alphabet.color}30` }}>
            {alphabet.letters[0]?.char}
          </div>
          <div>
            <h2 className="text-2xl font-black" style={{ color: 'var(--c-text)', fontFamily: 'var(--font-display)' }}>{alphabet.name}</h2>
            <p className="text-lg" style={{ color: alphabet.color }}>{alphabet.nativeName}</p>
          </div>
        </div>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--c-sub)' }}>
          {alphabet.historicalNote}
        </p>
      </motion.div>

      {/* Mode cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-4 w-full"
      >
        {modes.map((mode) => (
          <motion.button
            key={mode.id}
            variants={cardVariants}
            whileHover={{ x: 4, scale: 1.005 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => handleModeSelect(mode.id)}
            className="glass rounded-2xl p-5 text-left flex items-center gap-5 group relative overflow-hidden"
            style={{ border: `1px solid ${mode.color}20` }}
          >
            {/* Hover glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                 style={{ background: `radial-gradient(ellipse at left center, ${mode.color}10, transparent 60%)` }} />

            {/* Icon */}
            <div className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
                 style={{ background: `${mode.color}18`, color: mode.color }}>
              {mode.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-base font-bold" style={{ color: 'var(--c-text)' }}>{mode.title}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: `${mode.color}20`, color: mode.color }}>
                  {mode.time}
                </span>
              </div>
              <p className="text-xs mb-2" style={{ color: mode.color }}>{mode.tagline}</p>
              <p className="text-xs leading-relaxed mb-3 hidden sm:block" style={{ color: 'var(--c-sub)' }}>
                {mode.description}
              </p>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {mode.bullets.map((b, i) => (
                  <span key={i} className="text-xs flex items-center gap-1" style={{ color: 'var(--c-muted)' }}>
                    <span className="w-1 h-1 rounded-full inline-block" style={{ background: mode.color }} />
                    {b}
                  </span>
                ))}
              </div>
            </div>

            {/* Arrow */}
            <ChevronRight size={18} className="shrink-0 transition-transform group-hover:translate-x-1"
                          style={{ color: mode.color }} />
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}
