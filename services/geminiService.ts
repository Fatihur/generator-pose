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

const getPromptInstruction = (basePrompt: string, settings: AppSettings): string => {
  const styleInstructions = {
    'Fotorrealistis': `
      **Instruksi Gaya: Fotorrealistis**
      - Tujuan: Menghasilkan gambar yang sangat realistis, seolah-olah difoto dengan kamera kelas atas.
      - Detail Utama: Fokus pada detail halus seperti tekstur kulit, pori-pori, helai rambut individu, dan pantulan cahaya yang akurat di mata.
      - Pencahayaan: Gunakan pencahayaan alami atau seperti di studio yang menonjolkan bentuk dan volume. Hindari pencahayaan datar.
      - Penting: Hasilnya harus mempertahankan identitas orang tersebut tetapi dalam konteks yang diminta, dengan kualitas foto profesional. Hindari tampilan "airbrushed" atau buatan AI.`,
    'Artistik': `
      **Instruksi Gaya: Artistik**
      - Tujuan: Menginterpretasikan gambar asli dengan gaya artistik yang jelas.
      - Medium: Pikirkan gaya seperti lukisan cat minyak digital, ilustrasi cat air, atau sketsa arang yang detail.
      - Teknik: Sapuan kuas harus terlihat, tekstur kanvas atau kertas mungkin samar-samar terlihat.
      - Warna: Gunakan palet warna yang ekspresif dan harmonis yang meningkatkan mood.
      - Penting: Fokus pada esensi pose dan ekspresi, bukan replikasi fotorealistik.`,
    'Sinematik': `
      **Instruksi Gaya: Sinematik**
      - Tujuan: Menciptakan gambar yang terasa seperti adegan dari film.
      - Pencahayaan: Terapkan pencahayaan dramatis dengan kontras tinggi (chiaroscuro). Gunakan backlighting atau rim light untuk memisahkan subjek dari latar belakang.
      - Color Grading: Terapkan gradasi warna film yang khas, seperti palet warna teal-and-orange, atau tampilan film vintage yang hangat.
      - Komposisi: Pertimbangkan untuk sedikit mengubah framing untuk komposisi yang lebih dinamis. Bisa menambahkan sedikit grain film untuk tekstur.
      - Penting: Suasana dan mood adalah kunci. Ciptakan visual yang mendalam dan menggugah cerita.`
  };

  const qualityInstructions = {
    'Standar': `- Kualitas: Resolusi standar, detail yang baik.`,
    'Tinggi': `- Kualitas: Resolusi tinggi, detail tajam, dan tekstur yang jelas.`,
    'Sangat Tinggi': `- Kualitas: Kualitas master, detail sangat tajam (4K), tekstur yang sangat akurat, dan pencahayaan tingkat ahli.`
  };

  const instructions = `
${basePrompt}

**== PANDUAN GENERASI GAMBAR ==**
${styleInstructions[settings.style] || ''}
${qualityInstructions[settings.quality] || ''}
  `;
  
  return instructions.trim();
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Function to generate four images sequentially to avoid rate limiting
export const generateFourImages = async (
  base64ImageData: string,
  mimeType: string,
  basePrompt: string,
  settings: AppSettings,
  onProgress: (progress: { current: number; total: number }) => void
): Promise<GeneratedImage[]> => {
  
  const ai = getAiClient(settings.apiKey);

  const mainInstruction = getPromptInstruction(basePrompt, settings);
  
  const prompts = [
    `${mainInstruction}\n\n**Variasi 1:** Ikuti instruksi inti dengan cermat untuk hasil yang solid dan representatif.`,
    `${mainInstruction}\n\n**Variasi 2:** Perkenalkan sedikit perubahan pada sudut kamera. Coba sudut pandang yang sedikit lebih rendah atau lebih tinggi untuk menambahkan drama.`,
    `${mainInstruction}\n\n**Variasi 3:** Fokus pada interpretasi pencahayaan yang berbeda. Sambil tetap mempertahankan gaya utama, ubah sumber cahaya (misalnya, dari samping, bukan dari depan).`,
    `${mainInstruction}\n\n**Variasi 4:** Berikan sentuhan interpretasi yang lebih kreatif. Jika ada prompt kustom, kembangkan sedikit lebih jauh, atau perkenalkan elemen latar belakang halus yang melengkapi subjek.`,
  ];
  
  const successfulImages: GeneratedImage[] = [];
  const errors: any[] = [];
  const totalImages = prompts.length;

  for (let i = 0; i < totalImages; i++) {
    const p = prompts[i];
    onProgress({ current: i + 1, total: totalImages });
    try {
        const image = await generateImage(ai, base64ImageData, mimeType, p);
        successfulImages.push(image);
    } catch (error) {
        console.error(`Gagal membuat gambar untuk prompt:`, error);
        errors.push(error instanceof Error ? error.message : String(error));
    }

    // Add a 15-second delay between requests to avoid rate limiting, but not after the last one.
    if (i < totalImages - 1) {
        await delay(15000);
    }
  }

  if (successfulImages.length === 0) {
      throw new Error(`Semua pembuatan gambar gagal. Kesalahan pertama: ${errors[0] || 'Kesalahan tidak diketahui'}`);
  }

  return successfulImages;
};