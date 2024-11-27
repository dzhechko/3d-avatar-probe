import ElevenLabs from "elevenlabs-node";
import dotenv from "dotenv";
dotenv.config();

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = process.env.ELEVEN_LABS_VOICE_ID;
const modelID = process.env.ELEVEN_LABS_MODEL_ID;

console.log('ElevenLabs Configuration:');
console.log('Voice ID:', voiceID || 'Not set');
console.log('API Key:', elevenLabsApiKey ? 'Set' : 'Not set');
console.log('Model ID:', modelID || 'Not set');

const voice = new ElevenLabs({
  apiKey: elevenLabsApiKey,
  voiceId: voiceID,
});

async function convertTextToSpeech({ text, fileName }) {
  console.log(`Converting text to speech using voice ID: ${voiceID}`);
  await voice.textToSpeech({
    fileName: fileName,
    textInput: text,
    voiceId: voiceID,
    stability: 0.5,
    similarityBoost: 0.5,
    modelId: modelID,
    style: 1,
    speakerBoost: true,
  });
}

export { convertTextToSpeech, voice };
