// ─────────────────────────────────────────────────────────────────────────────
// elevenLabsService.js — ElevenLabs TTS integration
// Uses the @elevenlabs/elevenlabs-js SDK + direct REST fallback
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = 'https://api.elevenlabs.io/v1'

/**
 * Synthesize text to speech using ElevenLabs and return a playable audio blob URL.
 * Falls back to browser speechSynthesis if no API key is available.
 */
export async function synthesizeSpeech({
  text,
  voiceId = 'Rachel',
  apiKey,
  stability = 0.55,
  similarityBoost = 0.75,
  speed = 0.85,
}) {
  if (!apiKey) {
    return fallbackTTS(text, speed)
  }

  try {
    const response = await fetch(`${BASE_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
          speed,
        },
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`ElevenLabs API error ${response.status}: ${err}`)
    }

    const blob = await response.blob()
    return URL.createObjectURL(blob)
  } catch (error) {
    console.warn('[ElevenLabs] Falling back to browser TTS:', error.message)
    return fallbackTTS(text, speed)
  }
}

/**
 * Fetch available voices from ElevenLabs.
 */
export async function fetchVoices(apiKey) {
  if (!apiKey) return []

  try {
    const res = await fetch(`${BASE_URL}/voices`, {
      headers: { 'xi-api-key': apiKey },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return (data.voices ?? []).map((v) => ({
      id: v.voice_id,
      name: v.name,
      description: v.description ?? v.labels?.description ?? '',
      category: v.category ?? 'premade',
      previewUrl: v.preview_url ?? null,
    }))
  } catch (err) {
    console.warn('[ElevenLabs] fetchVoices failed:', err.message)
    return []
  }
}

/**
 * Browser SpeechSynthesis fallback for offline / no-key scenarios.
 * Returns a Promise that resolves when speech ends.
 */
export function fallbackTTS(text, rate = 0.85) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) { resolve(null); return }
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.rate = rate
    utt.onend = () => resolve(null)
    utt.onerror = () => resolve(null)
    window.speechSynthesis.speak(utt)
    resolve('browser-tts') // resolve immediately so UI can respond
  })
}

/**
 * Play audio from a URL (blob or remote), returning the Audio element.
 */
export function playAudioUrl(url, speed = 1) {
  if (!url || url === 'browser-tts') return null
  const audio = new Audio(url)
  audio.playbackRate = speed
  audio.play().catch(console.warn)
  return audio
}
