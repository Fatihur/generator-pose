import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { GeneratedImage, AppSettings } from '../types';

const getAiClient = (apiKey?: string) => {
  const key = apiKey || process.env.API_KEY;
  if (!key) {
    throw new Error("Kunci API tidak diberikan atau diatur dalam variabel lingkungan.");
  }
  return new GoogleGenAI({ apiKey: key });
};

// Function to generate pose/expression suggestions
export const getSuggestions = async (keyword: string, type: 'pose' | 'ekspresi', apiKey: string): Promise<string[]> => {
  try {
    const ai = getAiClient(apiKey);
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
    ai: GoogleGenAI,
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
    
    throw new Error("Tidak ada data gambar yang ditemukan dalam respons API Gemini.");
};

// Function to generate four images in parallel
export const generateFourImages = async (
  base64ImageData: string,
  mimeType: string,
  basePrompt: string,
  settings: AppSettings
): Promise<GeneratedImage[]> => {
  
  const ai = getAiClient(settings.apiKey);

  let settingsPrompt = ' Fokus pada perubahan yang realistis.';
  if (settings.style !== 'Fotorrealistis') {
    settingsPrompt += ` Gaya gambar harus ${settings.style.toLowerCase()}.`;
  }
  if (settings.quality === 'Tinggi') {
    settingsPrompt += ` Hasilkan gambar dengan kualitas tinggi dan detail yang baik.`;
  }
  if (settings.quality === 'Sangat Tinggi') {
    settingsPrompt += ` Hasilkan gambar dengan kualitas sangat tinggi, detail tajam, dan pencahayaan profesional.`;
  }

  const finalPrompt = basePrompt + settingsPrompt;

  const promises = [
    generateImage(ai, base64ImageData, mimeType, finalPrompt),
    generateImage(ai, base64ImageData, mimeType, finalPrompt + " (variasi 1)"),
    generateImage(ai, base64ImageData, mimeType, finalPrompt + " (variasi 2)"),
    generateImage(ai, base64ImageData, mimeType, finalPrompt + " (variasi 3)"),
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
