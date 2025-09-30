import React from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md text-white border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Pengaturan</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700">
            <CloseIcon />
          </button>
        </div>
        <div className="p-6 space-y-4">
            <div>
              <label htmlFor="output-quality" className="block text-sm font-medium text-gray-300">Kualitas Output</label>
              <select id="output-quality" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <option>Standar</option>
                <option>Tinggi</option>
                <option>Sangat Tinggi</option>
              </select>
            </div>
             <div>
              <label htmlFor="style-preference" className="block text-sm font-medium text-gray-300">Preferensi Gaya</label>
              <select id="style-preference" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <option>Fotorrealistis</option>
                <option>Artistik</option>
                <option>Sinematik</option>
              </select>
            </div>
             <div className="text-sm text-gray-500 pt-2">
                Catatan: Kunci API dikonfigurasi melalui variabel lingkungan `process.env.API_KEY` dan tidak dapat diubah di sini.
             </div>
        </div>
        <div className="px-6 py-3 bg-gray-700/50 text-right rounded-b-lg">
             <button
              onClick={onClose}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors duration-300"
            >
              Tutup
            </button>
        </div>
      </div>
    </div>
  );
};