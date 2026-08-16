// ─────────────────────────────────────────────────────────────────────────────
// QuizView.jsx — Multiple-choice quiz experience
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, RefreshCw, Trophy, CheckCircle2, XCircle, Brain } from 'lucide-react'
import useStore, { VIEWS } from './store'
import { ALPHABETS } from './alphabetData'

function buildQuizQuestions(letters, alphabetName, count = 10) {
  const shuffled = [...letters].sort(() => Math.random() - 0.5).slice(0, count)
  return shuffled.map((l, i) => {
    // Alternate question types: letter_to_sound vs sound_to_letter vs letter_to_name
    const qType = i % 3 === 0 ? 'letter_to_sound' : i % 3 === 1 ? 'sound_to_letter' : 'letter_to_name'
    
    if (qType === 'sound_to_letter') {
      const distractors = letters
        .filter(x => x.id !== l.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(x => x.char)
      const options = [l.char, ...distractors].sort(() => Math.random() - 0.5)
      return {
        id: `q${i}`,
        type: 'sound_to_letter',
        question: `Which ${alphabetName} letter makes the sound "${l.sound}"?`,
        options,
        correctIndex: options.indexOf(l.char),
        explanation: `The letter "${l.char}" (${l.name}) corresponds to the sound: ${l.sound} (IPA: ${l.ipa || l.sound}).`,
      }
    }

    if (qType === 'letter_to_name') {
      const distractors = letters
        .filter(x => x.id !== l.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(x => x.name)
      const options = [l.name, ...distractors].sort(() => Math.random() - 0.5)
      return {
        id: `q${i}`,
        type: 'letter_to_name',
        question: `What is the name of the letter "${l.char}"?`,
        options,
        correctIndex: options.indexOf(l.name),
        explanation: `"${l.char}" is called "${l.name}" (makes the sound: ${l.sound}).`,
      }
    }

    // Default: letter_to_sound
    const distractors = letters
      .filter(x => x.id !== l.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(x => x.sound)
    const options = [l.sound, ...distractors].sort(() => Math.random() - 0.5)
    return {
      id: `q${i}`,
      type: 'letter_to_sound',
      question: `What sound does the letter "${l.char}" (${l.name}) make?`,
      options,
      correctIndex: options.indexOf(l.sound),
      explanation: `The letter "${l.char}" (${l.name}) makes the sound: ${l.sound} (IPA: ${l.ipa || l.sound}).`,
    }
  })
}

export default function QuizView() {
  const {
    selectedAlphabetId, setView,
    quizQuestions, quizAnswers, quizScore,
    setQuizQuestions, answerQuiz, setQuizScore,
  } = useStore()

  const alphabet = selectedAlphabetId ? ALPHABETS[selectedAlphabetId] : null
  const [loading, setLoading] = useState(false)
  const [currentQ, setCurrentQ] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [done, setDone] = useState(false)

  const loadQuestions = useCallback(() => {
    if (!alphabet) return
    setLoading(true)
    setCurrentQ(0)
    setSelectedOption(null)
    setShowFeedback(false)
    setDone(false)
    setQuizScore(null)

    const qs = buildQuizQuestions(alphabet.letters, alphabet.name, 10)
    setQuizQuestions(qs)
    setLoading(false)
  }, [alphabet, setQuizQuestions, setQuizScore])

  // Load questions on mount / alphabet change
  useEffect(() => {
    if (!alphabet) {
      setView(VIEWS.ALPHABET_SELECT)
      return
    }
    loadQuestions()
  }, [alphabet, setView, loadQuestions])

  if (!alphabet) return null

  const questions = quizQuestions
  const question = questions[currentQ]

  const handleAnswer = (optionIndex) => {
    if (showFeedback) return
    setSelectedOption(optionIndex)
    answerQuiz(question.id, optionIndex)
    setShowFeedback(true)
  }

  const handleNext = () => {
    setShowFeedback(false)
    setSelectedOption(null)
    if (currentQ + 1 < questions.length) {
      setCurrentQ(q => q + 1)
    } else {
      finishQuiz()
    }
  }

  const finishQuiz = () => {
    const correct = questions.reduce((acc, q) => {
      return acc + (quizAnswers[q.id] === q.correctIndex ? 1 : 0)
    }, 0)
    setQuizScore(correct)
    setDone(true)
  }

  const scorePercent = done ? Math.round(((quizScore ?? 0) / questions.length) * 100) : 0
  const scoreColor = scorePercent >= 80 ? '#34d399' : scorePercent >= 50 ? '#fbbf24' : '#f43f5e'

  // ── Results screen ───────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-5 py-12">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 250, damping: 20 }}
          className="text-center max-w-sm"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-7xl mb-6"
          >
            <Trophy size={72} style={{ color: scoreColor, margin: '0 auto' }} />
          </motion.div>
          <h2 className="text-3xl font-black mb-2" style={{ color: 'var(--c-text)' }}>
            {scorePercent >= 80 ? 'Excellent!' : scorePercent >= 50 ? 'Good job!' : 'Keep practicing!'}
          </h2>
          <div className="text-6xl font-black mb-2" style={{ color: scoreColor }}>
            {scorePercent}%
          </div>
          <p className="text-sm mb-8" style={{ color: 'var(--c-sub)' }}>
            {quizScore} / {questions.length} correct · {alphabet.name} Quiz
          </p>

          {/* Score bar */}
          <div className="h-3 rounded-full overflow-hidden mb-8" style={{ background: 'var(--c-border)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${scorePercent}%` }}
              transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: scoreColor }}
            />
          </div>

          <div className="flex gap-3 justify-center">
            <button onClick={loadQuestions}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium btn-primary text-white">
              <RefreshCw size={14} />
              Try Again
            </button>
            <button onClick={() => setView(VIEWS.MODE_SELECT)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium btn-ghost"
                    style={{ color: 'var(--c-text)' }}>
              Back to Menu
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Loading screen ───────────────────────────────────────────────────────
  if (loading || !question) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Brain size={32} style={{ color: alphabet.color }} />
        </motion.div>
        <p className="text-sm" style={{ color: 'var(--c-sub)' }}>
          Preparing your quiz…
        </p>
      </div>
    )
  }

  const isCorrect = selectedOption === question.correctIndex
  const progress = ((currentQ + 1) / questions.length) * 100

  // ── Active quiz ──────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center px-5 py-8 max-w-xl mx-auto w-full">
      {/* Header */}
      <div className="w-full mb-6">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setView(VIEWS.MODE_SELECT)}
                  className="flex items-center gap-1.5 text-sm btn-ghost rounded-lg px-3 py-1.5"
                  style={{ color: 'var(--c-sub)' }}>
            <ArrowLeft size={14} />
            Exit
          </button>
          <span className="text-xs" style={{ color: 'var(--c-sub)' }}>
            {currentQ + 1} / {questions.length}
          </span>
          <button onClick={loadQuestions}
                  className="flex items-center gap-1.5 text-xs btn-ghost rounded-lg px-3 py-1.5"
                  style={{ color: 'var(--c-sub)' }}>
            <RefreshCw size={12} />
            New Quiz
          </button>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--c-border)' }}>
          <motion.div
            className="progress-bar h-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="w-full"
        >
          {/* Question card */}
          <div className="glass rounded-2xl p-6 mb-5 text-center">
            <span className="text-xs uppercase tracking-widest font-medium mb-3 block"
                  style={{ color: 'var(--c-muted)' }}>
              {question.type?.replace(/_/g, ' ')} · {alphabet.name}
            </span>
            <p className="text-lg font-bold leading-relaxed" style={{ color: 'var(--c-text)' }}>
              {question.question}
            </p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.options?.map((opt, i) => {
              let optColor = 'var(--c-border)'
              let optBg = 'transparent'
              let optText = 'var(--c-text)'

              if (showFeedback) {
                if (i === question.correctIndex) {
                  optColor = '#34d399'; optBg = 'rgba(52,211,153,0.1)'; optText = '#34d399'
                } else if (i === selectedOption && !isCorrect) {
                  optColor = '#f43f5e'; optBg = 'rgba(244,63,94,0.1)'; optText = '#f43f5e'
                }
              } else if (i === selectedOption) {
                optColor = alphabet.color; optBg = `${alphabet.color}18`
              }

              return (
                <motion.button
                  key={i}
                  whileHover={!showFeedback ? { scale: 1.02 } : {}}
                  whileTap={!showFeedback ? { scale: 0.98 } : {}}
                  onClick={() => handleAnswer(i)}
                  className="flex items-center gap-3 p-4 rounded-xl text-sm text-left transition-all"
                  style={{ border: `2px solid ${optColor}`, background: optBg, color: optText }}
                >
                  <span className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{ background: `${optColor}20` }}>
                    {['A', 'B', 'C', 'D'][i]}
                  </span>
                  {showFeedback && i === question.correctIndex && <CheckCircle2 size={15} className="shrink-0" />}
                  {showFeedback && i === selectedOption && !isCorrect && <XCircle size={15} className="shrink-0" />}
                  <span>{opt}</span>
                </motion.button>
              )
            })}
          </div>

          {/* Feedback explanation */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 glass rounded-xl p-4"
                style={{ border: `1px solid ${isCorrect ? '#34d399' : '#f43f5e'}30` }}
              >
                <div className="flex items-center gap-2 mb-1">
                  {isCorrect
                    ? <CheckCircle2 size={15} style={{ color: '#34d399' }} />
                    : <XCircle size={15} style={{ color: '#f43f5e' }} />
                  }
                  <span className="text-sm font-bold" style={{ color: isCorrect ? '#34d399' : '#f43f5e' }}>
                    {isCorrect ? 'Correct!' : 'Not quite.'}
                  </span>
                </div>
                {question.explanation && (
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--c-sub)' }}>
                    {question.explanation}
                  </p>
                )}
                <button
                  onClick={handleNext}
                  className="mt-3 w-full py-2.5 rounded-xl text-sm font-medium btn-primary text-white"
                >
                  {currentQ + 1 < questions.length ? 'Next Question →' : 'See Results →'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
