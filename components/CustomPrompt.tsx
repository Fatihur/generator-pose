import React from 'react';

interface CustomPromptProps {
  value: string;
  onChange: (value: string) => void;
}

export const CustomPrompt: React.FC<CustomPromptProps> = ({ value, onChange }) => {
  return (
    <div>
      <label htmlFor="custom-prompt" className="block text-sm font-medium text-gray-300 mb-2">
        Prompt Kustom (Opsional)
      </label>
      <textarea
        id="custom-prompt"
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="contoh: 'memakai topi merah', 'di hutan fantasi'"
        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
      />
    </div>
  );
};