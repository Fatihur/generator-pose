import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { OptionSelector } from './components/OptionSelector';
import { CustomPrompt } from './components/CustomPrompt';
import { ImageGallery } from './components/ImageGallery';
import { GalleryModal } from './components/GalleryModal';
import { SettingsModal } from './components/SettingsModal';
import { Spinner } from './components/Spinner';
import { getSuggestions, generateFourImages } from './services/geminiService';
import { INITIAL_POSES, INITIAL_EXPRESSIONS } from './constants';
import type { GeneratedImage } from './types';

export default function App() {
  const [uploadedImage, setUploadedImage] = useState<{ file: File; base64: string } | null>(null);
  const [selectedPose, setSelectedPose] = useState<string>(INITIAL_POSES[0]);
  const [selectedExpression, setSelectedExpression] = useState<string>(INITIAL_EXPRESSIONS[0]);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  const handleGenerate = async () => {
    if (!uploadedImage) {
      setError('Silakan unggah gambar terlebih dahulu.');
      return;
    }
    setError('');
    setIsLoading(true);
    setGeneratedImages([]);

    try {
      const fullPrompt = `Ubah orang di gambar ini. Terapkan pose berikut: "${selectedPose}". Terapkan ekspresi wajah berikut: "${selectedExpression}". Instruksi tambahan: "${customPrompt}". Fokus pada perubahan yang realistis dan berkualitas tinggi.`;
      
      const results = await generateFourImages(uploadedImage.base64, uploadedImage.file.type, fullPrompt);
      setGeneratedImages(results);

    } catch (err) {
      console.error(err);
      setError('Gagal menghasilkan gambar. Silakan periksa kunci API Anda dan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setIsGalleryModalOpen(true);
  };

  const handlePoseSearch = useCallback(async (keyword: string) => {
    if (!keyword) return INITIAL_POSES;
    return await getSuggestions(keyword, 'pose');
  }, []);

  const handleExpressionSearch = useCallback(async (keyword: string) => {
    if (!keyword) return INITIAL_EXPRESSIONS;
    return await getSuggestions(keyword, 'ekspresi');
  }, []);

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <Header onSettingsClick={() => setIsSettingsModalOpen(true)} />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column */}
          <div className="lg:col-span-4 space-y-6 bg-gray-800 p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-100 border-b border-gray-700 pb-3">Kustomisasi Gambar Anda</h2>
            <ImageUploader onImageUpload={setUploadedImage} />
            <OptionSelector
              label="Pose Tubuh"
              initialOptions={INITIAL_POSES}
              onSelect={setSelectedPose}
              onSearch={handlePoseSearch}
            />
            <OptionSelector
              label="Ekspresi Wajah"
              initialOptions={INITIAL_EXPRESSIONS}
              onSelect={setSelectedExpression}
              onSearch={handleExpressionSearch}
            />
            <CustomPrompt value={customPrompt} onChange={setCustomPrompt} />
            <button
              onClick={handleGenerate}
              disabled={isLoading || !uploadedImage}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            >
              {isLoading ? <Spinner /> : 'Hasilkan Gambar'}
            </button>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-8 bg-gray-800 p-6 rounded-2xl shadow-lg">
             <h2 className="text-2xl font-bold text-gray-100 border-b border-gray-700 pb-3 mb-6">Hasil Generasi</h2>
            {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg text-center">{error}</p>}
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-96">
                <Spinner size="lg" />
                <p className="mt-4 text-gray-400">AI sedang bekerja... Ini mungkin butuh beberapa saat.</p>
              </div>
            )}
            {!isLoading && generatedImages.length === 0 && (
                 <div className="flex flex-col items-center justify-center h-96 text-gray-500 text-center">
                    <p className="text-lg">Gambar yang Anda hasilkan akan muncul di sini.</p>
                    <p className="text-sm">Unggah foto dan atur preferensi Anda untuk memulai.</p>
                </div>
            )}
            {generatedImages.length > 0 && <ImageGallery images={generatedImages} onImageClick={handleImageClick} />}
          </div>
        </div>
      </main>

      {isGalleryModalOpen && (
        <GalleryModal
          images={generatedImages.map(img => img.url)}
          startIndex={currentImageIndex}
          onClose={() => setIsGalleryModalOpen(false)}
        />
      )}
      {isSettingsModalOpen && <SettingsModal onClose={() => setIsSettingsModalOpen(false)} />}
    </div>
  );
}