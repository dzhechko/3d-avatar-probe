import { exec } from "child_process";
import { promises as fs } from "fs";
import path from 'path';

const execCommand = ({ command }) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(error);
      resolve(stdout);
    });
  });
};

const readJsonTranscript = async ({ fileName }) => {
  try {
    // Ensure we're using absolute path
    const filePath = path.isAbsolute(fileName) ? fileName : path.join(process.cwd(), fileName);
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading transcript:', error);
    // Return empty transcript if file doesn't exist
    return { mouthCues: [] };
  }
};

const audioFileToBase64 = async ({ fileName }) => {
  try {
    // Ensure we're using absolute path
    const filePath = path.isAbsolute(fileName) ? fileName : path.join(process.cwd(), fileName);
    const data = await fs.readFile(filePath);
    return data.toString("base64");
  } catch (error) {
    console.error('Error reading audio file:', error);
    throw error;
  }
};

export { execCommand, readJsonTranscript, audioFileToBase64 };
