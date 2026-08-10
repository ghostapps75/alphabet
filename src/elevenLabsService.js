// ─────────────────────────────────────────────────────────────────────────────
// elevenLabsService.js — ElevenLabs TTS + native-accent browser voice fallback
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = 'https://api.elevenlabs.io/v1'

// ── Browser voice cache ───────────────────────────────────────────────────────
let _voiceCache = null

function getBrowserVoices() {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis?.getVoices() ?? []
    if (voices.length > 0) { resolve(voices); return }
    // Chrome loads voices asynchronously
    window.speechSynthesis.onvoiceschanged = () => resolve(window.speechSynthesis.getVoices())
    // Timeout fallback
    setTimeout(() => resolve(window.speechSynthesis?.getVoices() ?? []), 1000)
  })
}

/**
 * Pick the best available browser voice for a given BCP-47 language code.
 * Priority: exact locale match > language prefix match > any online voice > first voice
 */
async function pickBrowserVoice(langCode = 'en-US') {
  const voices = await getBrowserVoices()
  if (voices.length === 0) return null

  const lang = langCode.toLowerCase()
  const prefix = lang.split('-')[0]

  // 1. Exact locale, prefer "online" / "neural" / "natural" in name
  let match = voices.find(v =>
    v.lang.toLowerCase() === lang && isNaturalVoice(v)
  )
  // 2. Exact locale, any voice
  if (!match) match = voices.find(v => v.lang.toLowerCase() === lang)
  // 3. Language prefix, natural
  if (!match) match = voices.find(v =>
    v.lang.toLowerCase().startsWith(prefix) && isNaturalVoice(v)
  )
  // 4. Language prefix, any
  if (!match) match = voices.find(v => v.lang.toLowerCase().startsWith(prefix))
  // 5. Absolute fallback
  if (!match) match = voices[0]

  return match ?? null
}

function isNaturalVoice(v) {
  const n = v.name.toLowerCase()
  return (
    v.localService === false ||   // cloud/online voices tend to be better
    n.includes('neural') ||
    n.includes('online') ||
    n.includes('natural') ||
    n.includes('enhanced') ||
    n.includes('google') ||
    n.includes('microsoft')
  )
}

// ── ElevenLabs REST ───────────────────────────────────────────────────────────

/**
 * Synthesize text via ElevenLabs. Returns a blob URL or 'browser-tts' sentinel.
 * Falls back gracefully when no API key is set.
 */
export async function synthesizeSpeech({
  text,
  voiceId = 'Rachel',
  apiKey,
  stability = 0.55,
  similarityBoost = 0.75,
  speed = 0.9,
  langCode = 'en-US',  // passed through to fallback
}) {
  if (!apiKey) {
    return fallbackTTS(text, speed, langCode)
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
    return fallbackTTS(text, speed, langCode)
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
 * Browser SpeechSynthesis fallback with native-accent voice selection.
 * Returns 'browser-tts' sentinel — the caller handles the ended-promise.
 *
 * @param {string} text      - Text to speak
 * @param {number} rate      - Speech rate (0.5–1.5)
 * @param {string} langCode  - BCP-47 code e.g. 'ru-RU', 'he-IL', 'el-GR'
 * @returns {Promise<string>} - Resolves with 'browser-tts' when speech ends
 */
export function fallbackTTS(text, rate = 0.9, langCode = 'en-US') {
  return new Promise(async (resolve) => {
    if (!window.speechSynthesis) { resolve('browser-tts'); return }

    window.speechSynthesis.cancel()

    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = langCode
    utt.rate = rate

    // Pick the best available native voice for this language
    const voice = await pickBrowserVoice(langCode)
    if (voice) utt.voice = voice

    utt.onend   = () => resolve('browser-tts')
    utt.onerror = () => resolve('browser-tts')

    window.speechSynthesis.speak(utt)
  })
}

/**
 * Play audio from a blob URL, returning the Audio element.
 */
export function playAudioUrl(url, speed = 1) {
  if (!url || url === 'browser-tts') return null
  const audio = new Audio(url)
  audio.playbackRate = speed
  audio.play().catch(console.warn)
  return audio
}
