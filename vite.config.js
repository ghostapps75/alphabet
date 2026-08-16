import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const VOICE_MAP = {
  rachel: '21m00Tcm4TlvDq8ikWAM',
  adam: 'pNInz6obpgDQGcFmaJgB',
  bella: 'EXAVITQu4vr4xnSDxMaL',
  antoni: 'ErXwobaYiN019PkySvjV',
  josh: 'TxGEqnHWrfWFTfGW9XjX',
  arnold: 'VR6AewLTigWG4xSOukaG',
  domi: 'AZnzlk1XvdvUeBnXmlld',
  elli: 'MF3mGyEYCl7XYWbV9V6O',
}

function resolveVoiceId(id) {
  if (!id) return '21m00Tcm4TlvDq8ikWAM'
  const lower = String(id).toLowerCase()
  return VOICE_MAP[lower] || id
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = env.ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY

  const handleTTS = async (req, res, next) => {
    if (req.url === '/.netlify/functions/tts' && req.method === 'POST') {
      let bodyStr = ''
      req.on('data', (chunk) => { bodyStr += chunk })
      req.on('end', async () => {
        if (!apiKey) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          return res.end(JSON.stringify({ error: 'ELEVENLABS_API_KEY is not set in .env' }))
        }
        try {
          const body = JSON.parse(bodyStr || '{}')
          const { text, voiceId: rawVoiceId, stability = 0.55, similarityBoost = 0.75, speed = 0.9 } = body
          const voiceId = resolveVoiceId(rawVoiceId)

          const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
              'xi-api-key': apiKey,
              'Content-Type': 'application/json',
              Accept: 'audio/mpeg',
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
            const errText = await response.text()
            res.statusCode = response.status
            res.setHeader('Content-Type', 'application/json')
            return res.end(JSON.stringify({ error: `ElevenLabs error: ${response.status}`, details: errText }))
          }

          const arrayBuffer = await response.arrayBuffer()
          const base64Audio = Buffer.from(arrayBuffer).toString('base64')
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ audio: base64Audio }))
        } catch (err) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err.message }))
        }
      })
      return
    }
    next()
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'netlify-functions-dev-server',
        configureServer(server) {
          server.middlewares.use(handleTTS)
        },
        configurePreviewServer(server) {
          server.middlewares.use(handleTTS)
        },
      },
    ],
  }
})
