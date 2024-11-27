import { convertTextToSpeech } from "./elevenLabs.mjs";
import { getPhonemes } from "./rhubarbLipSync.mjs";
import { readJsonTranscript, audioFileToBase64 } from "../utils/files.mjs";
import fs from 'fs';
import path from 'path';

const lipSync = async ({ messages }) => {
  try {
    // Ensure audios directory exists
    const audiosDir = path.join(process.cwd(), 'audios');
    if (!fs.existsSync(audiosDir)) {
      fs.mkdirSync(audiosDir, { recursive: true });
    }

    await Promise.all(
      messages.map(async (message, index) => {
        try {
          const fileName = path.join('audios', `message_${index}.mp3`);
          console.log(`Processing message ${index}:`, message.text);

          // Generate speech
          await convertTextToSpeech({ text: message.text, fileName });
          console.log(`Speech generated for message ${index}`);

          // Generate lip sync
          await getPhonemes({ message: index });
          console.log(`Lip sync generated for message ${index}`);

          // Read generated files
          message.audio = await audioFileToBase64({ fileName });
          message.lipsync = await readJsonTranscript({ 
            fileName: fileName.replace('.mp3', '.json')
          });

          console.log(`Message ${index} processing complete`);
        } catch (error) {
          console.error(`Error processing message ${index}:`, error);
          // Don't throw here, continue with other messages
        }
      })
    );

    return messages;
  } catch (error) {
    console.error('Error in lipSync:', error);
    throw error;
  }
};

export { lipSync };
