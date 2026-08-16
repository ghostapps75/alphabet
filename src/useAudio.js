// ─────────────────────────────────────────────────────────────────────────────
// useAudio.js — Custom hook for ElevenLabs + native-accent browser TTS
// ─────────────────────────────────────────────────────────────────────────────
import { useRef, useCallback } from 'react'
import { synthesizeSpeech, playAudioUrl } from './elevenLabsService'
import useStore from './store'

export default function useAudio() {
  const audioRef = useRef(null)
  const {
    selectedVoiceId,
    ttsSpeed,
    ttsStability,
    ttsSimilarityBoost,
    setPlaying,
    stopPlaying,
  } = useStore()

  /**
   * Speak text with the configured voice.
   * @param {string} text       - Text to speak
   * @param {string} letterId   - Unique key used to track which slot is active
   * @param {string} langCode   - BCP-47 language code for native voice selection (e.g. 'ru-RU')
   * @returns {Promise<void>}   - Resolves when audio finishes
   */
  const speak = useCallback((text, letterId = null, langCode = 'en-US') => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    window.speechSynthesis?.cancel()

    if (letterId) setPlaying(letterId)

    return synthesizeSpeech({
      text,
      voiceId: selectedVoiceId,
      stability: ttsStability,
      similarityBoost: ttsSimilarityBoost,
      speed: ttsSpeed,
      langCode,
    }).then((url) => {
      if (url && url !== 'browser-tts') {
        const audio = playAudioUrl(url, 1)
        audioRef.current = audio
        if (audio) {
          return new Promise((resolve) => {
            audio.onended = () => { stopPlaying(); resolve() }
            audio.onerror = () => { stopPlaying(); resolve() }
          })
        } else {
          stopPlaying()
        }
      } else {
        stopPlaying()
      }
    }).catch((err) => {
      console.warn('[useAudio] speak error:', err)
      stopPlaying()
    })
  }, [selectedVoiceId, ttsSpeed, ttsStability, ttsSimilarityBoost, setPlaying, stopPlaying])

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
