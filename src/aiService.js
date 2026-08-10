// ─────────────────────────────────────────────────────────────────────────────
// aiService.js — OpenAI & Gemini connector for dynamic content generation
// ─────────────────────────────────────────────────────────────────────────────
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

// ── Helpers ──────────────────────────────────────────────────────────────────

function getOpenAIClient(apiKey) {
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true })
}

function getGeminiClient(apiKey) {
  return new GoogleGenerativeAI(apiKey)
}

// ── Core call: dispatch to provider ──────────────────────────────────────────

async function callAI({ provider, openAiKey, geminiKey, systemPrompt, userPrompt, maxTokens = 500 }) {
  if (provider === 'gemini' && geminiKey) {
    const genAI = getGeminiClient(geminiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`)
    return result.response.text().trim()
  }

  if (provider === 'openai' && openAiKey) {
    const client = getOpenAIClient(openAiKey)
    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    })
    return resp.choices[0].message.content.trim()
  }

  throw new Error('No AI provider configured. Please add an API key in Settings.')
}

// ── Feature: Dynamic word examples ───────────────────────────────────────────

/**
 * Generate 3 contextual word examples for a given letter in a script.
 * Returns an array of { word, transliteration, meaning, sentence } objects.
 */
export async function generateWordExamples({ letter, alphabetName, provider, openAiKey, geminiKey }) {
  const systemPrompt = `You are a linguistics expert and language teacher. Provide accurate, educational word examples for alphabet learning. Always respond with valid JSON only — no markdown, no explanations.`

  const userPrompt = `Give 3 example words that start with or prominently feature the ${alphabetName} letter "${letter.char}" (${letter.name}, sound: ${letter.sound}).

Return ONLY a JSON array like:
[
  {
    "word": "the word in its native script",
    "transliteration": "romanized pronunciation guide",
    "meaning": "English translation",
    "sentence": "A short example sentence using the word (native script)",
    "sentenceTranslation": "English translation of the sentence"
  }
]`

  try {
    const raw = await callAI({ provider, openAiKey, geminiKey, systemPrompt, userPrompt })
    // Strip any accidental markdown code fences
    const cleaned = raw.replace(/```json?|```/g, '').trim()
    return JSON.parse(cleaned)
  } catch (err) {
    console.warn('[aiService] generateWordExamples failed:', err.message)
    return []
  }
}

// ── Feature: Historical / cultural notes ─────────────────────────────────────

/**
 * Generate an engaging cultural/historical note about a specific letter.
 */
export async function generateLetterNote({ letter, alphabetName, provider, openAiKey, geminiKey }) {
  const systemPrompt = `You are a historian and linguist specializing in world writing systems. Write concise, fascinating, engaging facts. Max 3 sentences.`

  const userPrompt = `Write an interesting historical or cultural note about the ${alphabetName} letter "${letter.char}" (${letter.name}). Focus on etymology, evolution, or cultural significance. Be vivid and educational.`

  try {
    return await callAI({ provider, openAiKey, geminiKey, systemPrompt, userPrompt, maxTokens: 200 })
  } catch (err) {
    console.warn('[aiService] generateLetterNote failed:', err.message)
    return null
  }
}

// ── Feature: Quiz question generation ────────────────────────────────────────

/**
 * Generate a set of quiz questions for a given alphabet.
 * @param {object} opts
 * @param {object[]} opts.letters - Array of letter objects from alphabetData
 * @param {string} opts.alphabetName
 * @param {string} opts.mode - 'crash_course' | 'deep_study'
 * @param {number} opts.count - Number of questions
 */
export async function generateQuizQuestions({ letters, alphabetName, mode, count = 10, provider, openAiKey, geminiKey }) {
  const letterSummary = letters.slice(0, 20).map(l => `${l.char} = ${l.name} (${l.sound})`).join(', ')

  const systemPrompt = `You are a language quiz master. Create engaging, educationally sound multiple-choice quiz questions. Respond ONLY with valid JSON.`

  const userPrompt = `Create ${count} multiple-choice quiz questions for the ${alphabetName} alphabet.
Mode: ${mode === 'crash_course' ? 'Quick identification — letter to sound or sound to letter' : 'Deep comprehension — meaning, usage, etymology, and phonetics'}.

Letters available: ${letterSummary}

Return ONLY a JSON array:
[
  {
    "id": "q1",
    "type": "letter_to_sound" | "sound_to_letter" | "word_example" | "cultural",
    "question": "Question text",
    "options": ["option A", "option B", "option C", "option D"],
    "correctIndex": 0,
    "explanation": "Brief explanation of the correct answer"
  }
]`

  try {
    const raw = await callAI({ provider, openAiKey, geminiKey, systemPrompt, userPrompt, maxTokens: 2000 })
    const cleaned = raw.replace(/```json?|```/g, '').trim()
    return JSON.parse(cleaned)
  } catch (err) {
    console.warn('[aiService] generateQuizQuestions failed:', err.message)
    return []
  }
}

// ── Feature: Ancient vs Modern Greek bridge note ──────────────────────────────

/**
 * Generate a comparative note bridging a letter's ancient and modern pronunciation.
 */
export async function generateGreekBridgeNote({ letter, provider, openAiKey, geminiKey }) {
  const systemPrompt = `You are a Classical Greek scholar. Explain pronunciation differences between Ancient Attic Greek and Modern Greek concisely and accurately.`

  const userPrompt = `For the Greek letter ${letter.char} (${letter.name}):
- Ancient Attic pronunciation: ${letter.ipa}
- Modern pronunciation: (typically shifted)
Write 2 sentences explaining how the pronunciation changed from Classical to Modern Greek, and give one famous ancient word that uses this letter.`

  try {
    return await callAI({ provider, openAiKey, geminiKey, systemPrompt, userPrompt, maxTokens: 150 })
  } catch (err) {
    console.warn('[aiService] generateGreekBridgeNote failed:', err.message)
    return null
  }
}
