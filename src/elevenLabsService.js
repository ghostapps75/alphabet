// ─────────────────────────────────────────────────────────────────────────────
// elevenLabsService.js — ElevenLabs TTS via Netlify Proxy + Native Browser Fallback
//
// The browser NEVER touches the ElevenLabs API key. Requests are routed through
// the /.netlify/functions/tts serverless proxy.
// ─────────────────────────────────────────────────────────────────────────────

// ── Browser voice cache ───────────────────────────────────────────────────────
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

/**
 * Browser SpeechSynthesis fallback with native-accent voice selection.
 * If the browser doesn't have a voice for the target script, uses fallbackText (transliteration).
 *
 * @param {string} text          - Text to speak
 * @param {number} rate          - Speech rate (0.5–1.5)
 * @param {string} langCode      - BCP-47 code e.g. 'ru-RU', 'he-IL', 'el-GR'
 * @param {string} fallbackText  - Romanized fallback for English-only browser TTS engines
 * @returns {Promise<string>}   - Resolves with 'browser-tts' when speech ends
 */
export function fallbackTTS(text, rate = 0.9, langCode = 'en-US', fallbackText = text) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) { resolve('browser-tts'); return }

    window.speechSynthesis.cancel()

    const prefix = langCode.toLowerCase().split('-')[0]

    pickBrowserVoice(langCode).then((voice) => {
      const hasMatchingVoice = voice && voice.lang.toLowerCase().startsWith(prefix)
      const spokenText = hasMatchingVoice ? text : (fallbackText || text)

      const utt = new SpeechSynthesisUtterance(spokenText)
      utt.lang = hasMatchingVoice ? langCode : 'en-US'
      utt.rate = rate
      if (voice) utt.voice = voice

      utt.onend   = () => resolve('browser-tts')
      utt.onerror = () => resolve('browser-tts')

      window.speechSynthesis.speak(utt)
    }).catch(() => {
      const utt = new SpeechSynthesisUtterance(fallbackText || text)
      utt.rate = rate
      utt.onend   = () => resolve('browser-tts')
      utt.onerror = () => resolve('browser-tts')
      window.speechSynthesis.speak(utt)
    })
  })
}

/**
 * Synthesize speech via the Netlify TTS proxy with seamless fallback to browser TTS.
 */
export async function synthesizeSpeech({
  text,
  voiceId = '21m00Tcm4TlvDq8ikWAM',
  stability = 0.55,
  similarityBoost = 0.75,
  speed = 0.9,
  langCode = 'en-US',
  fallbackText = text,
}) {
  try {
    const response = await fetch('/.netlify/functions/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voiceId,
        stability,
        similarityBoost,
        speed,
      }),
    })

    if (!response.ok) {
      throw new Error(`Proxy error ${response.status}`)
    }

    const data = await response.json()
    if (!data.audio) {
      throw new Error('No audio data in response')
    }

    // Decode base64 audio into blob URL
    const byteCharacters = atob(data.audio)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'audio/mpeg' })
    return URL.createObjectURL(blob)
  } catch (error) {
    console.warn('[ElevenLabs proxy] Falling back to browser TTS:', error.message)
    return fallbackTTS(text, speed, langCode, fallbackText)
  }
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
