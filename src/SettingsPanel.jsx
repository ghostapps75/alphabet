// ─────────────────────────────────────────────────────────────────────────────
// SettingsPanel.jsx — Voice settings, audio quality, and display preferences
// ─────────────────────────────────────────────────────────────────────────────
import { motion } from 'framer-motion'
import {
  X, Volume2, Eye, Sliders, Play, Check,
} from 'lucide-react'
import useStore, { VOICE_PROFILES } from './store'
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
        style={{ accentColor: 'var(--c-terracotta)' }}
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
        style={{ background: checked ? 'var(--c-terracotta)' : 'var(--c-border)' }}
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
    showIpa, toggleShowIpa,
    showExamples, toggleShowExamples,
    autoPlayAudio, toggleAutoPlay,
  } = useStore()

  const { speak } = useAudio()

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
            <Volume2 size={14} style={{ color: 'var(--c-terracotta)' }} />
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--c-sub)' }}>
              Voice Profile
            </h3>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {VOICE_PROFILES.map((voice) => (
              <button
                key={voice.id}
                onClick={() => setVoice(voice.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                style={{
                  background: selectedVoiceId === voice.id ? 'rgba(200,91,42,0.12)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${selectedVoiceId === voice.id ? 'rgba(200,91,42,0.4)' : 'transparent'}`,
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

      </div>
    </div>
  )
}
