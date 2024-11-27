import { audioFileToBase64, readJsonTranscript } from "../utils/files.mjs";
import { convertTextToSpeech } from "./elevenLabs.mjs";
import { getPhonemes } from "./rhubarbLipSync.mjs";
import fs from 'fs';
import path from 'path';
import dotenv from "dotenv";
dotenv.config();

const openAIApiKey = process.env.OPENAI_API_KEY;
const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;

async function sendDefaultMessages({ userMessage }) {
  const messageId = Math.random().toString(36).substring(7);
  console.log(`[${messageId}] sendDefaultMessages called with userMessage:`, userMessage);

  // Check API keys first
  if (!elevenLabsApiKey || !openAIApiKey) {
    console.log(`[${messageId}] Missing API keys:`, { 
      hasElevenLabs: !!elevenLabsApiKey, 
      hasOpenAI: !!openAIApiKey 
    });
    return [{
      text: "Мне нужно настроить API ключи, прежде чем мы сможем продолжить разговор.",
      facialExpression: "default",
      animation: "TalkingOne",
    }];
  }

  // Handle initial greeting
  if (!userMessage) {
    console.log(`[${messageId}] Generating initial greeting...`);
    const greetingText = "Привет, меня зовут Алекс! Я бы хотел пообщаться по поводу курсов Product University";
    console.log(`[${messageId}] Greeting text:`, greetingText);
    
    // Ensure audios directory exists
    const audiosDir = path.join(process.cwd(), 'audios');
    console.log(`[${messageId}] Checking audios directory:`, audiosDir);
    if (!fs.existsSync(audiosDir)) {
      console.log(`[${messageId}] Creating audios directory...`);
      fs.mkdirSync(audiosDir, { recursive: true });
    }
    
    // Generate speech for greeting
    const fileName = "greeting";
    const audioPath = path.join('audios', `${fileName}.mp3`);
    
    try {
      console.log(`[${messageId}] Converting text to speech...`);
      await convertTextToSpeech({
        text: greetingText,
        fileName: audioPath
      });
      console.log(`[${messageId}] Speech generated successfully`);
      
      // Generate lip sync data
      console.log(`[${messageId}] Generating lip sync data...`);
      await getPhonemes({ message: fileName });
      console.log(`[${messageId}] Lip sync data generated`);
      
      // Read the generated files
      console.log(`[${messageId}] Reading generated files...`);
      const audio = await audioFileToBase64({ fileName: audioPath });
      const lipsync = await readJsonTranscript({ 
        fileName: path.join('audios', `${fileName}.json`)
      });
      console.log(`[${messageId}] Files read successfully`);
      
      return [{
        text: greetingText,
        audio: audio,
        lipsync: lipsync,
        facialExpression: "smile",
        animation: "TalkingOne",
      }];
    } catch (error) {
      console.error(`[${messageId}] Error in greeting generation:`, error);
      return [{
        text: greetingText,
        facialExpression: "smile",
        animation: "TalkingOne",
      }];
    }
  }
  
  return null;
}

const defaultResponse = {
  messages: [
    {
      text: "Извините, давайте вернемся к обсуждению курсов. Как владелец бизнеса, я особенно заинтересован в том, как эти курсы могут помочь моему стартапу расти. Не могли бы вы рассказать подробнее об этом?",
      facialExpression: "thoughtful",
      animation: "ThoughtfulHeadShake",
    },
  ]
};

export { sendDefaultMessages, defaultResponse };
