"use client";

import { Search } from "lucide-react";

const CommonSearch = ({
  heading,
  placeholder,
  buttonText,
  onChange,
  value,
  onSubmit,
  suggestions,
  onSuggestion,
}: {
  heading?: string;
  placeholder?: string;
  buttonText?: string;
  onChange?: (value: string) => void;
  value?: string;
  onSubmit?: () => void;
  suggestions?: { label: string; value: string }[];
  onSuggestion?: (value: string) => void;
}) => {
  return (
    <div className="px-4">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        {heading}
      </h1>
      <form
        className="mx-auto mt-8 flex max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit?.();
        }}
      >
        <input
          type="text"
          placeholder={placeholder}
          className="flex-1 px-6 py-6 text-lg outline-none"
          onChange={(e) => onChange?.(e.target.value)}
          value={value}
        />
        <button
          type="submit"
          className="flex items-center justify-center gap-2 bg-brand-gradient px-8 py-4 text-lg font-medium text-white transition hover:brightness-110"
        >
          <Search size={18} /> {buttonText}
        </button>
      </form>

      {suggestions && suggestions.length > 0 && (
        <div className="mx-auto mt-4 flex max-w-4xl flex-wrap justify-center gap-2 text-sm">
          <span className="text-gray-500">Try:</span>
          {suggestions.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => onSuggestion?.(s.value)}
              className="rounded-full border border-brand-200 bg-white px-3 py-1 text-brand-700 hover:bg-brand-50"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommonSearch;
