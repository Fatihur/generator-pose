
export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
}

export interface AppSettings {
  apiKey: string;
  quality: 'Standar' | 'Tinggi' | 'Sangat Tinggi';
  style: 'Fotorrealistis' | 'Artistik' | 'Sinematik';
}