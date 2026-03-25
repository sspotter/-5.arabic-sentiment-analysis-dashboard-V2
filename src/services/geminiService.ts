import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeArabicSentimentBatch(comments: string[]): Promise<{ sentiment: 'positive' | 'negative' | 'neutral', score: number }[]> {
  const prompt = `Analyze the sentiment of the following Arabic comments. Return a JSON array of objects with 'sentiment' (positive, negative, or neutral) and 'score' (-1.0 to 1.0).
  
Comments:
${comments.map((c, i) => `${i}: ${c}`).join('\n')}
`;

  console.log("=== SENDING REQUEST TO GEMINI MODEL ===");
  console.log("Model: gemini-3-flash-preview");
  console.log("Prompt payload:", prompt);
  console.log("=======================================");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              sentiment: { type: Type.STRING, description: "positive, negative, or neutral" },
              score: { type: Type.NUMBER, description: "Sentiment score from -1.0 to 1.0" }
            }
          }
        }
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
    return comments.map(() => ({ sentiment: 'neutral', score: 0 }));
  } catch (error) {
    console.error("Error analyzing sentiment with Gemini:", error);
    // Fallback to neutral on error
    return comments.map(() => ({ sentiment: 'neutral', score: 0 }));
  }
}

export async function analyzeLocalSentimentBatch(comments: string[]): Promise<{ sentiment: 'positive' | 'negative' | 'neutral', score: number }[]> {
  const payload = { comments };

  console.log("=== SENDING REQUEST TO LOCAL MODEL ===");
  console.log("Endpoint: http://localhost:8555/analyze");
  
  console.log("Payload:", JSON.stringify(payload, null, 2));
  console.log("======================================");

  try {
    const response = await fetch('http://localhost:8555/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Local API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error analyzing sentiment with Local API:", error);
    // Fallback to neutral on error
    return comments.map(() => ({ sentiment: 'neutral', score: 0 }));
  }
}
