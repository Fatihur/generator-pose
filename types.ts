
export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
}

export interface AppSettings {
  quality: 'Standar' | 'Tinggi' | 'Sangat Tinggi';
  style: 'Fotorrealistis' | 'Artistik' | 'Sinematik';
  apiKey: string;
}
