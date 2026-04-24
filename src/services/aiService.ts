import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const SYSTEM_INSTRUCTION = `You are Bloom, the friendly plant expert and assistant for GreenBloom, an online nursery.
Your goal is to help users with:
1. Plant care advice (watering, light, soil, pests).
2. Choosing the right plants for their space (indoor vs outdoor, low maintenance).
3. Questions about GreenBloom's services and products.

Tone: Helpful, warm, and expert but accessible.
Response style: Concise, formatting with markdown where helpful (bullet points, bold text).
If you don't know something about a specific order, suggest the user check their profile or contact our expert support team directly on WhatsApp (a button will appear below our chat if you need further assistance).`;

export const chatWithBloom = async (message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) => {
  try {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    // Send the full history and the new message
    // Note: The SDK's chat object keeps its own state if used sequentially, 
    // but for stateless API calls we can pass history.
    // However, the simplest way for a persistent chat session in a single turn is:
    const response = await chat.sendMessage({
        message: message,
    });

    return response.text;
  } catch (error) {
    console.error("Bloom Error:", error);
    return "I'm sorry, I'm having a little trouble connecting right now. Please try again in a moment! 🌱";
  }
};
