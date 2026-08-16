import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const apiKeyMatch = envFile.match(/ELEVENLABS_API_KEY=(.+)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : null;

console.log('Key:', apiKey ? apiKey.substring(0, 10) + '...' : 'Missing');

async function testElevenLabs() {
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: "Test",
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          speed: 1.0,
        },
      }),
    });

    console.log('Status:', response.status);
    if (!response.ok) {
      const text = await response.text();
      console.log('Error text:', text);
    } else {
      console.log('Success!');
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testElevenLabs();
