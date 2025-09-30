import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { GeneratedImage } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Function to generate pose/expression suggestions
export const getSuggestions = async (keyword: string, type: 'pose' | 'ekspresi'): Promise<string[]> => {
  try {
    const prompt = type === 'pose'
      ? `Berikan 5 variasi atau deskripsi yang lebih spesifik untuk pose tubuh berdasarkan kata kunci: "${keyword}". Contohnya, jika kata kuncinya 'duduk', variasinya bisa 'duduk bersila' atau 'duduk santai'. Fokus hanya pada deskripsi pose tubuh.`
      : `Berikan 5 variasi atau deskripsi yang lebih spesifik untuk ekspresi wajah berdasarkan kata kunci: "${keyword}". Contohnya, jika kata kuncinya 'senyum', variasinya bisa 'senyum tipis' atau 'senyum lebar'. Fokus hanya pada deskripsi ekspresi wajah.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        },
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    return result.suggestions || [];
  } catch (error) {
    console.error(`Error fetching ${type} suggestions:`, error);
    return [`Gagal mendapatkan saran ${type} untuk "${keyword}"`];
  }
};

// Function to generate a single image
const generateImage = async (
    base64ImageData: string,
    mimeType: string,
    prompt: string
  ): Promise<GeneratedImage> => {
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          { inlineData: { data: base64ImageData, mimeType: mimeType } },
          { text: prompt },
        ],
      },
      config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });
    
    // Find the image part in the response
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return {
                id: crypto.randomUUID(),
                url: `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`,
                prompt: prompt,
            };
        }
    }
    
    throw new Error("No image data found in the Gemini API response.");
};

// Function to generate four images in parallel
export const generateFourImages = async (
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<GeneratedImage[]> => {
  const promises = [
    generateImage(base64ImageData, mimeType, prompt),
    generateImage(base64ImageData, mimeType, prompt + " (variasi 1)"),
    generateImage(base64ImageData, mimeType, prompt + " (variasi 2)"),
    generateImage(base64ImageData, mimeType, prompt + " (variasi 3)"),
  ];

  const results = await Promise.allSettled(promises);
  
  const successfulImages = results
    .filter((result): result is PromiseFulfilledResult<GeneratedImage> => result.status === 'fulfilled')
    .map(result => result.value);

  if (successfulImages.length === 0) {
      const firstError = results.find(r => r.status === 'rejected') as PromiseRejectedResult | undefined;
      throw new Error(`Semua pembuatan gambar gagal. Kesalahan pertama: ${firstError?.reason}`);
  }

  return successfulImages;
};