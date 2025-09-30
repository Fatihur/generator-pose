import React, { useState, useEffect, useCallback } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { ZoomInIcon } from './icons/ZoomInIcon';
import { ZoomOutIcon } from './icons/ZoomOutIcon';

interface GalleryModalProps {
  images: string[];
  startIndex: number;
  onClose: () => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({ images, startIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [zoomLevel, setZoomLevel] = useState(1);

  const nextImage = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    setZoomLevel(1);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    setZoomLevel(1);
  }, [images.length]);
  
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.5));

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = images[currentIndex];
    link.download = `gambar-hasil-${currentIndex + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextImage, prevImage, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full h-full max-w-4xl max-h-[90vh] flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
        
        {/* Image Display */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <img 
                src={images[currentIndex]} 
                alt={`Tampilan hasil ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain transition-transform duration-300"
                style={{ transform: `scale(${zoomLevel})`}}
            />
        </div>

        {/* Top Controls */}
        <div className="absolute top-2 right-2 md:top-4 md:right-4 flex items-center gap-2">
            <button onClick={downloadImage} className="p-2 bg-gray-800/70 rounded-full text-white hover:bg-gray-700 transition">
                <DownloadIcon />
            </button>
            <button onClick={onClose} className="p-2 bg-gray-800/70 rounded-full text-white hover:bg-gray-700 transition">
                <CloseIcon />
            </button>
        </div>

        {/* Navigation Controls */}
        <button onClick={prevImage} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 bg-gray-800/70 rounded-full text-white hover:bg-gray-700 transition">
          <ChevronLeftIcon />
        </button>
        <button onClick={nextImage} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 bg-gray-800/70 rounded-full text-white hover:bg-gray-700 transition">
          <ChevronRightIcon />
        </button>
        
        {/* Bottom Controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-800/70 rounded-full p-2">
            <button onClick={handleZoomOut} disabled={zoomLevel <= 0.5} className="p-2 text-white hover:bg-gray-700 rounded-full transition disabled:opacity-50">
                <ZoomOutIcon />
            </button>
            <span className="text-white w-12 text-center text-sm">{Math.round(zoomLevel * 100)}%</span>
             <button onClick={handleZoomIn} disabled={zoomLevel >= 3} className="p-2 text-white hover:bg-gray-700 rounded-full transition disabled:opacity-50">
                <ZoomInIcon />
            </button>
        </div>
      </div>
    </div>
  );
};