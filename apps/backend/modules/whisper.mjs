import { OpenAIWhisperAudio } from "langchain/document_loaders/fs/openai_whisper_audio";
import { convertAudioToMp3 } from "../utils/audios.mjs";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const openAIApiKey = process.env.OPENAI_API_KEY;

async function convertAudioToText({ audioData }) {
  try {
    // Create temp directory in the project
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const mp3AudioData = await convertAudioToMp3({ audioData });
    const outputPath = path.join(tempDir, 'output.mp3');
    
    fs.writeFileSync(outputPath, mp3AudioData);
    const loader = new OpenAIWhisperAudio(outputPath, { clientOptions: { apiKey: openAIApiKey } });
    const doc = (await loader.load()).shift();
    const transcribedText = doc.pageContent;
    
    // Clean up
    try {
      fs.unlinkSync(outputPath);
    } catch (error) {
      console.warn('Failed to delete temp file:', error);
    }
    
    return transcribedText;
  } catch (error) {
    console.error('Error in convertAudioToText:', error);
    throw error;
  }
}

export { convertAudioToText };
