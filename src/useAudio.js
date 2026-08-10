// ─────────────────────────────────────────────────────────────────────────────
// useAudio.js — Custom hook for ElevenLabs + browser TTS audio playback
// ─────────────────────────────────────────────────────────────────────────────
import { useRef, useCallback } from 'react'
import { synthesizeSpeech, playAudioUrl } from './elevenLabsService'
import useStore from './store'

export default function useAudio() {
  const audioRef = useRef(null)
  const { elevenLabsKey, selectedVoiceId, ttsSpeed, ttsStability, ttsSimilarityBoost, setPlaying, stopPlaying } = useStore()

  const speak = useCallback((text, letterId = null) => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    window.speechSynthesis?.cancel()

    if (letterId) setPlaying(letterId)

    // Return a Promise that resolves when playback ends
    return new Promise(async (resolve) => {
      try {
        const url = await synthesizeSpeech({
          text,
          voiceId: selectedVoiceId,
          apiKey: elevenLabsKey,
          stability: ttsStability,
          similarityBoost: ttsSimilarityBoost,
          speed: ttsSpeed,
        })

        if (url && url !== 'browser-tts') {
          const audio = playAudioUrl(url, 1)
          audioRef.current = audio
          if (audio) {
            audio.onended = () => { stopPlaying(); resolve() }
            audio.onerror = () => { stopPlaying(); resolve() }
          } else {
            stopPlaying(); resolve()
          }
        } else {
          // Browser TTS — estimate duration then resolve
          const ms = text.length * 80 + 500
          setTimeout(() => { stopPlaying(); resolve() }, ms)
        }
      } catch (err) {
        console.warn('[useAudio] speak error:', err)
        stopPlaying()
        resolve()
      }
    })
  }, [elevenLabsKey, selectedVoiceId, ttsSpeed, ttsStability, ttsSimilarityBoost, setPlaying, stopPlaying])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    window.speechSynthesis?.cancel()
    stopPlaying()
  }, [stopPlaying])

  return { speak, stop }
}
