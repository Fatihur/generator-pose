import React from 'react';
import { SettingsIcon } from './icons/SettingsIcon';

interface HeaderProps {
  onSettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
  return (
    <header className="bg-gray-800/80 backdrop-blur-sm shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
          Generator Pose & Ekspresi AI
        </h1>
        <button
          onClick={onSettingsClick}
          className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors duration-200"
          aria-label="Pengaturan"
        >
          <SettingsIcon />
        </button>
      </div>
    </header>
  );
};