import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { openAIChain, parser } from "./modules/openAI.mjs";
import { lipSync } from "./modules/lip-sync.mjs";
import { sendDefaultMessages, defaultResponse } from "./modules/defaultMessages.mjs";
import { convertAudioToText } from "./modules/whisper.mjs";

dotenv.config();

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;

const app = express();

// Устанавливаем лимиты до использования middleware
app.use(express.json({limit: '100mb'}));
app.use(express.urlencoded({limit: '100mb', extended: true}));
app.use(cors());

const port = 3000;

// Track if greeting was sent
let greetingSent = false;
console.log('Server started, greetingSent initialized to:', greetingSent);

app.post("/tts", async (req, res) => {
  const requestId = Math.random().toString(36).substring(7); // уникальный ID запроса
  console.log(`[${requestId}] New TTS request received`);
  
  const userMessage = await req.body.message;
  console.log(`[${requestId}] Received user message:`, userMessage);
  console.log(`[${requestId}] Current greetingSent state:`, greetingSent);
  
  // Handle greeting
  if (!userMessage && !greetingSent) {
    console.log(`[${requestId}] Conditions met for initial greeting`);
    console.log(`[${requestId}] Setting greetingSent to true`);
    greetingSent = true;
    const defaultMessages = await sendDefaultMessages({ userMessage });
    if (defaultMessages) {
      console.log(`[${requestId}] Sending default greeting messages`);
      res.send({ messages: defaultMessages });
      return;
    }
  } else {
    console.log(`[${requestId}] Skipping greeting because:`, {
      hasUserMessage: !!userMessage,
      greetingAlreadySent: greetingSent
    });
  }
  
  // Skip OpenAI call for empty messages
  if (!userMessage) {
    console.log(`[${requestId}] Skipping OpenAI call for empty message`);
    return res.send({ messages: [] });
  }
  
  // Handle normal messages
  let openAImessages;
  try {
    console.log('Calling OpenAI...');
    openAImessages = await openAIChain.invoke({
      question: userMessage,
      format_instructions: parser.getFormatInstructions(),
    });
    console.log('OpenAI response:', openAImessages);
  } catch (error) {
    console.error('Error from OpenAI:', error);
    openAImessages = defaultResponse;
  }

  if (!openAImessages || !openAImessages.messages || !Array.isArray(openAImessages.messages)) {
    console.error('Invalid message structure:', openAImessages);
    return res.status(500).json({ error: 'Invalid message structure from AI response' });
  }

  try {
    console.log('Starting lip sync process...');
    openAImessages = await lipSync({ messages: openAImessages.messages });
    console.log('Lip sync complete, sending response');
    res.send({ messages: openAImessages });
  } catch (error) {
    console.error('Error in lip sync:', error);
    res.status(500).json({ error: 'Error processing lip sync' });
  }
});

// Reset greeting flag when server starts
app.get("/reset", (req, res) => {
  greetingSent = false;
  res.send({ message: "Greeting reset" });
});

app.post("/sts", async (req, res) => {
  try {
    console.log('Received speech-to-text request');
    const base64Audio = req.body.audio;
    const audioData = Buffer.from(base64Audio, "base64");
    
    console.log('Converting audio to text...');
    const userMessage = await convertAudioToText({ audioData });
    console.log('Transcribed text:', userMessage);
    
    let openAImessages;
    try {
      console.log('Calling OpenAI...');
      openAImessages = await openAIChain.invoke({
        question: userMessage,
        format_instructions: parser.getFormatInstructions(),
      });
      console.log('OpenAI response:', openAImessages);
    } catch (error) {
      console.error('Error from OpenAI:', error);
      openAImessages = defaultResponse;
    }

    if (!openAImessages || !openAImessages.messages || !Array.isArray(openAImessages.messages)) {
      console.error('Invalid message structure:', openAImessages);
      return res.status(500).json({ error: 'Invalid message structure from AI response' });
    }

    console.log('Starting lip sync process...');
    openAImessages = await lipSync({ messages: openAImessages.messages });
    console.log('Lip sync complete, sending response');
    res.send({ messages: openAImessages });
  } catch (error) {
    console.error('Error processing speech-to-text request:', error);
    res.status(500).json({ error: 'Error processing speech input' });
  }
});

app.listen(port, () => {
  console.log(`Alex is listening on port ${port}`);
});
