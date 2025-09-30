import React, { useState, useCallback, DragEvent } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
  onImageUpload: (image: { file: File; base64: string } | null) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFileChange = useCallback((files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          setPreview(reader.result as string);
          onImageUpload({ file, base64: base64String });
        };
        reader.readAsDataURL(file);
      } else {
        alert('Silakan pilih file gambar.');
      }
    }
  }, [onImageUpload]);

  const onDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">Unggah Foto Anda</label>
      <div
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-300 ${isDragging ? 'border-indigo-500 bg-gray-700' : 'border-gray-600 hover:border-indigo-400'}`}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files)} />
        {preview ? (
          <img src={preview} alt="Pratinjau" className="mx-auto max-h-48 rounded-md object-contain" />
        ) : (
          <div className="flex flex-col items-center text-gray-400">
            <UploadIcon />
            <p className="mt-2">Seret & letakkan atau klik untuk mengunggah</p>
            <p className="text-xs">PNG, JPG, WEBP</p>
          </div>
        )}
      </div>
      {preview && (
        <button
          onClick={() => {
            setPreview(null);
            onImageUpload(null);
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if(fileInput) fileInput.value = '';
          }}
          className="w-full mt-2 text-sm text-red-400 hover:text-red-300 transition-colors"
        >
          Hapus Gambar
        </button>
      )}
    </div>
  );
};