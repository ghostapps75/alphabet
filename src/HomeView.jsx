// ─────────────────────────────────────────────────────────────────────────────
// HomeView.jsx — Animated hero landing screen
// ─────────────────────────────────────────────────────────────────────────────
import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, Zap, Star } from 'lucide-react'
import useStore, { VIEWS } from './store'

// Warm vintage palette for floating letters — matches reference image
const FLOATING_CHARS = [
  { char: 'Α', color: '#c85b2a' },  // terracotta
  { char: 'ב', color: '#3a7a7a' },  // teal
  { char: 'А', color: '#d4912a' },  // amber
  { char: 'Б', color: '#6b7c3f' },  // olive
  { char: 'Ε', color: '#c9941a' },  // gold
  { char: 'Ω', color: '#8b5a2b' },  // brown
  { char: 'Λ', color: '#3a7a7a' },  // teal
  { char: 'Σ', color: '#c85b2a' },  // terracotta
  { char: 'И', color: '#d4912a' },  // amber
  { char: 'ג', color: '#6b7c3f' },  // olive
  { char: 'Γ', color: '#7d9467' },  // sage
  { char: 'Ψ', color: '#c9941a' },  // gold
]

const featureCards = [
  {
    icon: <Zap size={20} />,
    title: 'Crash Course',
    desc: 'Rapid flashcard-style learning for fast familiarity with any script',
    color: '#c85b2a',
  },
  {
    icon: <BookOpen size={20} />,
    title: 'Deep Study',
    desc: 'Structured, progressive lessons with IPA phonetics and cultural context',
    color: '#3a7a7a',
  },
  {
    icon: <Star size={20} />,
    title: 'Dynamic Quizzes',
    desc: 'AI-generated assessments adapting to your learning mode and progress',
    color: '#c9941a',
  },
]

export default function HomeView() {
  const { setView } = useStore()

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-5 py-12 overflow-hidden">
      {/* Floating background letters — warm multicolor like reference image */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {FLOATING_CHARS.map(({ char, color }, i) => (
          <motion.div
            key={i}
            className="absolute text-6xl font-bold select-none"
            style={{
              color: color,
              opacity: 0.18 + (i % 4) * 0.06,
              left: `${(i * 8.5) % 95}%`,
              top: `${(i * 13 + 5) % 90}%`,
              fontFamily: 'var(--font-display)',
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.18 + (i % 4) * 0.06, 0.32 + (i % 4) * 0.06, 0.18 + (i % 4) * 0.06],
              rotate: [-4, 4, -4],
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
        {/* Badge — warm parchment pill */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{
            background: 'rgba(200,91,42,0.1)',
            border: '1px solid rgba(200,91,42,0.28)',
            color: 'var(--c-terracotta)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse-ring" style={{ background: 'var(--c-terracotta)' }} />
          6 World Scripts · AI-Powered · Premium TTS
        </motion.div>

        {/* Main headline — Playfair Display serif, matching reference image */}
        <h1
          className="text-5xl sm:text-7xl font-black tracking-tight mb-4 leading-[1.05]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <span className="gradient-text italic">Master</span>
          <br />
          <span style={{ color: 'var(--c-text)' }}>World Alphabets</span>
        </h1>

        <p className="text-lg sm:text-xl mb-10 leading-relaxed max-w-lg mx-auto" style={{ color: 'var(--c-sub)' }}>
          Learn to read, pronounce, and use{' '}
          <span style={{ color: 'var(--c-text2)', fontWeight: 600 }}>Hebrew, Bulgarian, Russian,</span>{' '}
          <span style={{ color: 'var(--c-text2)', fontWeight: 600 }}>Ancient &amp; Modern Greek</span>, and more —
          with AI-driven examples and studio-quality audio.
        </p>

        {/* CTA button — rounded terracotta pill */}
        <motion.button
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setView(VIEWS.ALPHABET_SELECT)}
          className="inline-flex items-center gap-3 px-8 py-4 text-base font-bold text-white btn-primary"
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
            style={{ border: `1px solid ${card.color}30` }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ background: `${card.color}18`, color: card.color }}>
              {card.icon}
            </div>
            <h3 className="font-bold text-sm" style={{ color: 'var(--c-text)', fontFamily: 'var(--font-display)' }}>{card.title}</h3>
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
          { label: 'A', name: 'English',    color: '#6b7c3f' },
          { label: 'א', name: 'Hebrew',     color: '#c9941a' },
          { label: 'А', name: 'Bulgarian',  color: '#3a7a7a' },
          { label: 'Я', name: 'Russian',    color: '#c85b2a' },
          { label: 'Ω', name: 'Greek (M)',  color: '#7d9467' },
          { label: 'Ψ', name: 'Greek (A)',  color: '#8b5a2b' },
        ].map((s, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.1, y: -3 }}
            className="flex flex-col items-center gap-1 cursor-default"
          >
            <div className="w-12 h-12 rounded-xl glass flex items-center justify-center text-xl font-bold"
                 style={{ color: s.color, border: `1px solid ${s.color}35`, fontFamily: 'var(--font-display)' }}>
              {s.label}
            </div>
            <span className="text-xs" style={{ color: 'var(--c-muted)' }}>{s.name}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
