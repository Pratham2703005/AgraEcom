"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon, Loader2 } from "lucide-react";
import { useDebounce } from "@/lib/hooks";

type Suggestion = {
  type: 'product' | 'brand';
  text: string;
  id?: string;
  slug?: string;
};

interface SearchInputProps {
  initialValue?: string;
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  searchPath?: string; // Where to navigate on search, e.g., "/products"
}

export default function SearchInput({
  initialValue = "",
  onSearch,
  placeholder = "Search products...",
  className = "",
  autoFocus = false,
  searchPath = "/products",
}: SearchInputProps) {
  const [inputValue, setInputValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedSearchTerm = useDebounce(inputValue, 300);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Update input value when initialValue changes (e.g., from URL)
  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  // Focus input when autoFocus is true
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Fetch suggestions when search term changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/products/suggestions?q=${encodeURIComponent(debouncedSearchTerm)}`);
        if (!response.ok) throw new Error("Failed to fetch suggestions");
        
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearchTerm]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      if (onSearch) {
        onSearch(inputValue);
      } else {
        router.push(`${searchPath}?search=${encodeURIComponent(inputValue)}`);
      }
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (suggestion.type === 'product' && suggestion.id) {
      router.push(`/products/${suggestion.id}`);
    } else if (suggestion.type === 'brand' && suggestion.slug) {
      router.push(`${searchPath}?brand=${encodeURIComponent(suggestion.slug)}`);
    } else {
      setInputValue(suggestion.text);
      if (onSearch) {
        onSearch(suggestion.text);
      } else {
        router.push(`${searchPath}?search=${encodeURIComponent(suggestion.text)}`);
      }
    }
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <SearchIcon className="h-5 w-5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
        
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-3 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm shadow-sm transition-all duration-200 ${className}`}
          autoComplete="off"
        />
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
          </div>
        )}
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-50 mt-1 w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg max-h-60 overflow-auto animate-fadeIn"
        >
          <ul className="py-1">
            {suggestions.map((suggestion, index) => (
              <li 
                key={`${suggestion.type}-${index}`}
                className="px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer text-sm"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="flex items-center">
                  <SearchIcon className="h-4 w-4 text-neutral-400 mr-2" />
                  <span>
                    {suggestion.type === 'brand' ? (
                      <span>
                        <span className="text-neutral-500">Brand:</span> {suggestion.text}
                      </span>
                    ) : (
                      suggestion.text
                    )}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 