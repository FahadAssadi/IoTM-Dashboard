import { GoogleGenAI } from "@google/genai";

export async function GET(request: Request) {
  // Extract the `prompt` query param
  const { searchParams } = new URL(request.url);
  const prompt = searchParams.get("prompt") || "Explain how AI works in a few words";

  // Initialize Gemini client
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // Generate response
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  console.log("GEMINI INVOKED with prompt:", prompt);

  // Send text response back
  return new Response(response.text, {
    headers: { "Content-Type": "text/plain" },
  });
}