// ─────────────────────────────────────────────────────────────────────────────
// SettingsPanel.jsx — Voice settings, API keys, and display preferences
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  X, Volume2, Key, Eye, Sliders, Play, RefreshCw, Check,
} from 'lucide-react'
import useStore, { VOICE_PROFILES } from './store'
import { fetchVoices } from './elevenLabsService'
import useAudio from './useAudio'

function SliderRow({ label, value, min, max, step = 0.01, onChange, display }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs">
        <span style={{ color: 'var(--c-sub)' }}>{label}</span>
        <span style={{ color: 'var(--c-text)' }}>{display ?? value.toFixed(2)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-indigo-500 h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: 'var(--c-indigo)' }}
      />
    </div>
  )
}

function ToggleRow({ label, checked, onChange, description }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>{label}</p>
        {description && <p className="text-xs" style={{ color: 'var(--c-muted)' }}>{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="relative w-10 h-6 rounded-full transition-all"
        style={{ background: checked ? 'var(--c-indigo)' : 'var(--c-border)' }}
      >
        <motion.div
          animate={{ x: checked ? 18 : 2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="absolute top-1 w-4 h-4 rounded-full bg-white"
        />
      </button>
    </div>
  )
}

export default function SettingsPanel() {
  const {
    closeVoiceSettings,
    selectedVoiceId, setVoice,
    ttsSpeed, setTtsSpeed,
    ttsStability, setTtsStability,
    ttsSimilarityBoost, setTtsSimilarityBoost,
    elevenLabsKey, setElevenLabsKey,
    openAiKey, setOpenAiKey,
    geminiKey, setGeminiKey,
    aiProvider, setAiProvider,
    showIpa, toggleShowIpa,
    showExamples, toggleShowExamples,
    autoPlayAudio, toggleAutoPlay,
  } = useStore()

  const { speak } = useAudio()
  const [customVoices, setCustomVoices] = useState([])
  const [loadingVoices, setLoadingVoices] = useState(false)
  const [savedKeys, setSavedKeys] = useState(false)

  const [localElKey, setLocalElKey] = useState(elevenLabsKey)
  const [localOaKey, setLocalOaKey] = useState(openAiKey)
  const [localGemKey, setLocalGemKey] = useState(geminiKey)

  const allVoices = [...VOICE_PROFILES, ...customVoices]

  const loadVoices = async () => {
    if (!elevenLabsKey) return
    setLoadingVoices(true)
    const voices = await fetchVoices(elevenLabsKey)
    setCustomVoices(voices.filter(v => !VOICE_PROFILES.find(p => p.id === v.id)))
    setLoadingVoices(false)
  }

  useEffect(() => { loadVoices() }, [elevenLabsKey])

  const saveKeys = () => {
    setElevenLabsKey(localElKey)
    setOpenAiKey(localOaKey)
    setGeminiKey(localGemKey)
    setSavedKeys(true)
    setTimeout(() => setSavedKeys(false), 2000)
    if (localElKey) loadVoices()
  }

  return (
    <div className="glass-strong h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--c-border)' }}>
        <h2 className="text-base font-bold" style={{ color: 'var(--c-text)' }}>Settings</h2>
        <button onClick={closeVoiceSettings} className="p-1.5 rounded-lg btn-ghost" style={{ color: 'var(--c-sub)' }}>
          <X size={16} />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">

        {/* ── Voice Profile ────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Volume2 size={14} style={{ color: 'var(--c-indigo)' }} />
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--c-sub)' }}>
              Voice Profile
            </h3>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {allVoices.map((voice) => (
              <button
                key={voice.id}
                onClick={() => setVoice(voice.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                style={{
                  background: selectedVoiceId === voice.id ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${selectedVoiceId === voice.id ? 'rgba(99,102,241,0.4)' : 'transparent'}`,
                }}
              >
                <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                     style={{ background: 'rgba(99,102,241,0.2)', color: 'var(--c-indigo)' }}>
                  {voice.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--c-text)' }}>{voice.name}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--c-muted)' }}>{voice.description}</p>
                </div>
                {selectedVoiceId === voice.id && <Check size={14} style={{ color: 'var(--c-indigo)', shrink: 0 }} />}
              </button>
            ))}
            {loadingVoices && (
              <div className="flex items-center gap-2 py-2 px-3 text-xs" style={{ color: 'var(--c-muted)' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <RefreshCw size={11} />
                </motion.div>
                Loading your ElevenLabs voices…
              </div>
            )}
          </div>

          {/* Preview */}
          <button
            onClick={() => speak('Hello! This is a pronunciation preview.', null)}
            className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium btn-ghost"
            style={{ color: 'var(--c-sub)' }}
          >
            <Play size={11} />
            Preview Voice
          </button>
        </section>

        {/* ── TTS Sliders ──────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Sliders size={14} style={{ color: 'var(--c-indigo)' }} />
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--c-sub)' }}>
              Audio Quality
            </h3>
          </div>
          <div className="space-y-4">
            <SliderRow label="Speed" min={0.5} max={1.5} step={0.05} value={ttsSpeed} onChange={setTtsSpeed}
                       display={ttsSpeed === 1 ? '1× normal' : `${ttsSpeed.toFixed(2)}×`} />
            <SliderRow label="Stability" min={0} max={1} value={ttsStability} onChange={setTtsStability} />
            <SliderRow label="Similarity Boost" min={0} max={1} value={ttsSimilarityBoost} onChange={setTtsSimilarityBoost} />
          </div>
        </section>

        {/* ── Display Options ───────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Eye size={14} style={{ color: 'var(--c-indigo)' }} />
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--c-sub)' }}>
              Display
            </h3>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--c-border)' }}>
            <ToggleRow label="Show IPA" checked={showIpa} onChange={toggleShowIpa}
                       description="International Phonetic Alphabet notation" />
            <ToggleRow label="Show Examples" checked={showExamples} onChange={toggleShowExamples}
                       description="Word examples on letter cards" />
            <ToggleRow label="Auto-Play Audio" checked={autoPlayAudio} onChange={toggleAutoPlay}
                       description="Play audio when advancing letters" />
          </div>
        </section>

        {/* ── AI Provider ───────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs">🤖</span>
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--c-sub)' }}>
              AI Provider
            </h3>
          </div>
          <div className="flex gap-2">
            {['gemini', 'openai'].map((p) => (
              <button key={p} onClick={() => setAiProvider(p)}
                      className="flex-1 py-2 rounded-xl text-xs font-medium capitalize transition-all"
                      style={{
                        background: aiProvider === p ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${aiProvider === p ? 'rgba(99,102,241,0.5)' : 'var(--c-border)'}`,
                        color: aiProvider === p ? 'var(--c-indigo)' : 'var(--c-sub)',
                      }}>
                {p === 'gemini' ? '✦ Gemini' : '⬡ OpenAI'}
              </button>
            ))}
          </div>
        </section>

        {/* ── API Keys ──────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Key size={14} style={{ color: 'var(--c-indigo)' }} />
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--c-sub)' }}>
              API Keys
            </h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'ElevenLabs', value: localElKey, onChange: setLocalElKey, placeholder: 'el-...' },
              { label: 'OpenAI', value: localOaKey, onChange: setLocalOaKey, placeholder: 'sk-...' },
              { label: 'Gemini', value: localGemKey, onChange: setLocalGemKey, placeholder: 'AIza...' },
            ].map(({ label, value, onChange, placeholder }) => (
              <div key={label}>
                <label className="text-xs mb-1 block" style={{ color: 'var(--c-muted)' }}>{label}</label>
                <input
                  type="password"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--c-border)',
                    color: 'var(--c-text)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--c-indigo)'}
                  onBlur={e => e.target.style.borderColor = 'var(--c-border)'}
                />
              </div>
            ))}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={saveKeys}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold btn-primary text-white"
            >
              {savedKeys ? <><Check size={13} /> Saved!</> : 'Save API Keys'}
            </motion.button>
          </div>
          <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--c-muted)' }}>
            Keys are stored locally in your browser. Without keys the app uses browser speech synthesis and static quiz questions.
          </p>
        </section>
      </div>
    </div>
  )
}
