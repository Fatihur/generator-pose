import React from 'react';
import type { GeneratedImage } from '../types';

interface ImageGalleryProps {
  images: GeneratedImage[];
  onImageClick: (index: number) => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, onImageClick }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {images.map((image, index) => (
        <div
          key={image.id}
          className="relative group aspect-square rounded-lg overflow-hidden cursor-pointer"
          onClick={() => onImageClick(index)}
        >
          <img
            src={image.url}
            alt={`Hasil generasi ${index + 1}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
             <p className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-semibold text-lg">Lihat</p>
          </div>
        </div>
      ))}
    </div>
  );
};