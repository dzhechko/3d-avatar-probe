import { execCommand } from "../utils/files.mjs";
import fs from 'fs';
import path from 'path';

const getPhonemes = async ({ message }) => {
  try {
    const time = new Date().getTime();
    console.log(`Starting conversion for message ${message}`);
    
    // Get absolute paths
    const projectRoot = path.resolve(process.cwd(), '../../');
    const audiosDir = path.join(process.cwd(), 'audios');
    const inputPath = path.join(audiosDir, `message_${message}.mp3`);
    const outputWav = path.join(audiosDir, `message_${message}.wav`);
    const outputJson = path.join(audiosDir, `message_${message}.json`);
    
    // Определяем путь к rhubarb в зависимости от окружения
    let rhubarbPath;
    if (process.env.NODE_ENV === 'production' || process.env.DOCKER_ENV === 'true') {
      // В контейнере предполагаем, что rhubarb доступен в PATH
      rhubarbPath = 'rhubarb';
    } else {
      // Для локальной разработки используем путь из bin
      rhubarbPath = path.join(projectRoot, 'bin', 'rhubarb.exe');
      // Verify rhubarb exists
      if (!fs.existsSync(rhubarbPath)) {
        throw new Error(`Rhubarb not found at ${rhubarbPath}`);
      }
    }
    
    console.log(`Using rhubarb at: ${rhubarbPath}`);
    
    // Convert MP3 to WAV
    await execCommand({
      command: `ffmpeg -y -i "${inputPath}" "${outputWav}"`
    });
    console.log(`Conversion done in ${new Date().getTime() - time}ms`);
    
    // Generate lip sync data
    console.log('Running rhubarb from:', rhubarbPath);
    
    // Формируем команду с учетом типа ОС
    const isWindows = process.platform === 'win32' || rhubarbPath.endsWith('.exe');
    const rhubarbCmd = isWindows 
      ? `"${rhubarbPath}" -f json -o "${outputJson}" "${outputWav}" -r phonetic`
      : `${rhubarbPath} -f json -o "${outputJson}" "${outputWav}" -r phonetic`;
      
    await execCommand({
      command: rhubarbCmd
    });
    
    // Clean up WAV file
    try {
      fs.unlinkSync(outputWav);
    } catch (error) {
      console.warn('Failed to delete WAV file:', error);
    }
    
    console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
  } catch (error) {
    console.error(`Error while getting phonemes for message ${message}:`, error);
    // Create a minimal JSON file for lip sync
    const defaultJson = {
      "mouthCues": [
        {"start": 0, "end": 0.5, "value": "X"},
        {"start": 0.5, "end": 1, "value": "B"},
        {"start": 1, "end": 1.5, "value": "X"}
      ]
    };
    
    const outputJson = path.join(process.cwd(), 'audios', `message_${message}.json`);
    fs.writeFileSync(outputJson, JSON.stringify(defaultJson, null, 2));
  }
};

export { getPhonemes };