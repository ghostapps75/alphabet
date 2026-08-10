// ─────────────────────────────────────────────────────────────────────────────
// HomeView.jsx — Animated hero landing screen
// ─────────────────────────────────────────────────────────────────────────────
import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, Zap, Star } from 'lucide-react'
import useStore, { VIEWS } from './store'

const FLOATING_CHARS = ['Α', 'ב', 'А', 'Б', 'Ε', 'Ω', 'Λ', 'Σ', 'И', 'ג', 'Γ', 'Ψ']

const featureCards = [
  {
    icon: <Zap size={20} />,
    title: 'Crash Course',
    desc: 'Rapid flashcard-style learning for fast familiarity with any script',
    color: '#6366f1',
  },
  {
    icon: <BookOpen size={20} />,
    title: 'Deep Study',
    desc: 'Structured, progressive lessons with IPA phonetics and cultural context',
    color: '#34d399',
  },
  {
    icon: <Star size={20} />,
    title: 'Dynamic Quizzes',
    desc: 'AI-generated assessments adapting to your learning mode and progress',
    color: '#f59e0b',
  },
]

export default function HomeView() {
  const { setView } = useStore()

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-5 py-12 overflow-hidden">
      {/* Floating background letters */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {FLOATING_CHARS.map((char, i) => (
          <motion.div
            key={i}
            className="absolute text-6xl font-bold select-none"
            style={{
              color: `rgba(99,102,241,${0.03 + (i % 3) * 0.02})`,
              left: `${(i * 8.5) % 95}%`,
              top: `${(i * 13 + 5) % 90}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.6, 0.3],
              rotate: [-3, 3, -3],
            }}
            transition={{
              duration: 4 + (i % 3),
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.4,
            }}
          >
            {char}
          </motion.div>
        ))}
      </div>

      {/* Hero content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        className="relative text-center max-w-2xl"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6 glass border"
          style={{ color: 'var(--c-indigo)', borderColor: 'rgba(99,102,241,0.25)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse-ring" style={{ background: 'var(--c-indigo)' }} />
          6 World Scripts · AI-Powered · Premium TTS
        </motion.div>

        {/* Main headline */}
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-4 leading-[0.95]">
          <span className="gradient-text">Master</span>
          <br />
          <span style={{ color: 'var(--c-text)' }}>World Alphabets</span>
        </h1>

        <p className="text-lg sm:text-xl mb-10 leading-relaxed max-w-lg mx-auto" style={{ color: 'var(--c-sub)' }}>
          Learn to read, pronounce, and use{' '}
          <span style={{ color: 'var(--c-text)' }}>Hebrew, Bulgarian, Russian,</span>{' '}
          <span style={{ color: 'var(--c-text)' }}>Ancient &amp; Modern Greek</span>, and more —
          with AI-driven examples and studio-quality audio.
        </p>

        {/* CTA button */}
        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setView(VIEWS.ALPHABET_SELECT)}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold text-white btn-primary"
        >
          Start Learning
          <ArrowRight size={18} />
        </motion.button>
      </motion.div>

      {/* Feature cards */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="relative grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 max-w-3xl w-full"
      >
        {featureCards.map((card, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="glass rounded-2xl p-5 flex flex-col gap-3"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ background: `${card.color}20`, color: card.color }}>
              {card.icon}
            </div>
            <h3 className="font-bold text-sm" style={{ color: 'var(--c-text)' }}>{card.title}</h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--c-sub)' }}>{card.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Alphabet preview row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative flex gap-3 mt-10 flex-wrap justify-center"
      >
        {[
          { label: 'A', name: 'English', color: '#6366f1' },
          { label: 'א', name: 'Hebrew', color: '#f59e0b' },
          { label: 'А', name: 'Bulgarian', color: '#22d3ee' },
          { label: 'Я', name: 'Russian', color: '#f43f5e' },
          { label: 'Ω', name: 'Greek (M)', color: '#34d399' },
          { label: 'Ψ', name: 'Greek (A)', color: '#a78bfa' },
        ].map((s, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.1, y: -3 }}
            className="flex flex-col items-center gap-1 cursor-default"
          >
            <div className="w-12 h-12 rounded-xl glass flex items-center justify-center text-xl font-bold"
                 style={{ color: s.color, border: `1px solid ${s.color}30` }}>
              {s.label}
            </div>
            <span className="text-xs" style={{ color: 'var(--c-muted)' }}>{s.name}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
