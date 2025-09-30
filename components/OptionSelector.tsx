import React, { useState, useEffect, useCallback } from 'react';
import { SearchIcon } from './icons/SearchIcon';
import { useDebounce } from '../hooks/useDebounce';
import { Spinner } from './Spinner';

interface OptionSelectorProps {
  label: string;
  initialOptions: string[];
  onSelect: (option: string) => void;
  onSearch: (keyword: string) => Promise<string[]>;
}

export const OptionSelector: React.FC<OptionSelectorProps> = ({ label, initialOptions, onSelect, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState(initialOptions);
  const [selected, setSelected] = useState(initialOptions[0]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    onSelect(selected);
  }, [selected, onSelect]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearchTerm) {
        setIsSearching(true);
        try {
          const results = await onSearch(debouncedSearchTerm);
          setSuggestions(results.length > 0 ? results : [`Tidak ada hasil untuk "${debouncedSearchTerm}"`]);
        } catch (error) {
          console.error(`Failed to fetch suggestions for ${label}:`, error);
          setSuggestions(['Gagal mengambil saran']);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions(initialOptions);
      }
    };
    fetchSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, onSearch]);

  const handleSelect = (option: string) => {
    setSelected(option);
    onSelect(option);
  };
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isSearching ? <Spinner size="sm" /> : <SearchIcon />}
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Cari ${label.toLowerCase()}...`}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
        {suggestions.map((option) => (
          <button
            key={option}
            onClick={() => handleSelect(option)}
            className={`px-3 py-1 text-sm rounded-full transition-all duration-200 ${
              selected === option
                ? 'bg-indigo-600 text-white font-semibold shadow-md'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};