import React, { useState } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import type { AppSettings } from '../types';

interface SettingsModalProps {
  onClose: () => void;
  currentSettings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, currentSettings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(currentSettings);

  const handleSave = () => {
    onSave(localSettings);
  };

  const handleSettingChange = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

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
        <div className="p-6 space-y-6">
            <div>
              <label htmlFor="api-key" className="block text-sm font-medium text-gray-300">Kunci API Gemini</label>
              <input 
                type="password"
                id="api-key" 
                className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Masukkan kunci API Anda"
                value={localSettings.apiKey}
                onChange={(e) => handleSettingChange('apiKey', e.target.value)}
              />
              <p className="mt-2 text-xs text-gray-400">
                Kunci API Anda disimpan dengan aman di browser Anda.
              </p>
            </div>
            <div>
              <label htmlFor="output-quality" className="block text-sm font-medium text-gray-300">Kualitas Output</label>
              <select 
                id="output-quality" 
                className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={localSettings.quality}
                onChange={(e) => handleSettingChange('quality', e.target.value as AppSettings['quality'])}
              >
                <option>Standar</option>
                <option>Tinggi</option>
                <option>Sangat Tinggi</option>
              </select>
            </div>
             <div>
              <label htmlFor="style-preference" className="block text-sm font-medium text-gray-300">Preferensi Gaya</label>
              <select 
                id="style-preference" 
                className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={localSettings.style}
                onChange={(e) => handleSettingChange('style', e.target.value as AppSettings['style'])}
              >
                <option>Fotorrealistis</option>
                <option>Artistik</option>
                <option>Sinematik</option>
              </select>
            </div>
        </div>
        <div className="px-6 py-3 bg-gray-700/50 text-right rounded-b-lg">
             <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors duration-300"
            >
              Simpan Perubahan
            </button>
        </div>
      </div>
    </div>
  );
};