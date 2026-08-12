// ─────────────────────────────────────────────────────────────────────────────
// AlphabetSelectView.jsx — Script selection grid with animated accent cards
// ─────────────────────────────────────────────────────────────────────────────
import { motion } from 'framer-motion'
import { ArrowLeft, Globe, Clock } from 'lucide-react'
import useStore, { VIEWS } from './store'
import { ALPHABET_LIST } from './alphabetData'

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 22 } },
}

export default function AlphabetSelectView() {
  const { setView, setSelectedAlphabet, masteredLetters } = useStore()

  const handleSelect = (alphabetId) => {
    setSelectedAlphabet(alphabetId)
    setView(VIEWS.MODE_SELECT)
  }

  return (
    <div className="flex flex-col items-center px-5 py-10 max-w-4xl mx-auto w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full mb-8"
      >
        <button onClick={() => setView(VIEWS.HOME)}
                className="flex items-center gap-2 text-sm mb-6 transition-colors hover:text-white btn-ghost rounded-lg px-3 py-2"
                style={{ color: 'var(--c-sub)' }}>
          <ArrowLeft size={15} />
          Back to Home
        </button>
        <h2 className="text-3xl font-black tracking-tight" style={{ color: 'var(--c-text)', fontFamily: 'var(--font-display)' }}>
          Choose a Script
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--c-sub)' }}>
          Select the alphabet you want to study. Each script includes full phonetics, audio, and AI-generated examples.
        </p>
      </motion.div>

      {/* Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full"
      >
        {ALPHABET_LIST.map((alphabet) => {
          const mastered = masteredLetters[alphabet.id]?.length ?? 0
          const total = alphabet.letters.length
          const pct = total > 0 ? Math.round((mastered / total) * 100) : 0

          return (
            <motion.button
              key={alphabet.id}
              variants={cardVariants}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(alphabet.id)}
              className="glass rounded-2xl p-6 text-left flex flex-col gap-4 group relative overflow-hidden"
              style={{ border: `1px solid ${alphabet.color}20` }}
            >
              {/* Glow accent on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
                   style={{ background: `radial-gradient(ellipse at top left, ${alphabet.color}12, transparent 60%)` }} />

              {/* Ancient badge */}
              {alphabet.badge && (
                <div className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-medium"
                     style={{ background: `${alphabet.color}25`, color: alphabet.color }}>
                  {alphabet.badge}
                </div>
              )}

              {/* Letter preview + direction tag */}
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl font-bold"
                     style={{ background: `${alphabet.color}18`, color: alphabet.color,
                              boxShadow: `0 0 20px ${alphabet.color}30` }}>
                  {alphabet.letters[0]?.char}
                </div>
                <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                     style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--c-sub)' }}>
                  <Globe size={11} />
                  {alphabet.direction === 'rtl' ? 'Right-to-Left' : 'Left-to-Right'}
                </div>
              </div>

              {/* Name */}
              <div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--c-text)' }}>
                  {alphabet.name}
                </h3>
                <p className="text-base font-medium mt-0.5" style={{ color: alphabet.color }}>
                  {alphabet.nativeName}
                </p>
              </div>

              {/* Description */}
              <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--c-sub)' }}>
                {alphabet.description}
              </p>

              {/* Stats + Progress */}
              <div className="mt-auto flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--c-sub)' }}>
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {total} letters
                  </span>
                  <span style={{ color: pct > 0 ? alphabet.color : 'var(--c-muted)' }}>
                    {pct}% mastered
                  </span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--c-border)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: alphabet.color }}
                  />
                </div>
              </div>
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}
