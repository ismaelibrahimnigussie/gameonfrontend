import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, ChevronDown, Search, X } from 'lucide-react';

export default function SearchableDropdown({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  searchPlaceholder = 'Search...',
  disabled = false,
  helperText = '',
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [highlightKey, setHighlightKey] = useState(`${open}:${query}`);
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const nextHighlightKey = `${open}:${query}`;
  if (highlightKey !== nextHighlightKey) {
    setHighlightKey(nextHighlightKey);
    setHighlightedIndex(0);
  }

  const selectedOption = options.find((option) => String(option.value) === String(value)) || null;
  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) => {
      const labelText = String(option.label || '').toLowerCase();
      const metaText = String(option.meta || '').toLowerCase();
      return labelText.includes(q) || metaText.includes(q);
    });
  }, [options, query]);

  useEffect(() => {
    if (!open || !searchInputRef.current) return;
    searchInputRef.current.focus();
  }, [open]);

  const closeDropdown = () => {
    setQuery('');
    setOpen(false);
  };

  const selectOption = (option) => {
    onChange?.(option.value);
    closeDropdown();
  };

  const handleKeyDown = (event) => {
    if (disabled) return;

    if (!open && ['Enter', ' ', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      setOpen(true);
      return;
    }

    if (!open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDropdown();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((index) => Math.min(index + 1, filteredOptions.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter' && filteredOptions[highlightedIndex]) {
      event.preventDefault();
      selectOption(filteredOptions[highlightedIndex]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target)) {
        setQuery('');
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`} onKeyDown={handleKeyDown}>
      {label && <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</label>}
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          if (disabled) return;
          setOpen((prev) => {
            const next = !prev;
            if (!next) setQuery('');
            return next;
          });
        }}
        className={`group flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border bg-black/35 px-3.5 py-3 text-left text-xs text-white transition-all hover:border-cyan-300/50 focus-visible:border-cyan-300/70 disabled:cursor-not-allowed disabled:opacity-60 ${open ? 'border-cyan-300/60 ring-2 ring-cyan-300/10' : 'border-white/10'}`}
      >
        <span className={`min-w-0 truncate ${selectedOption ? 'font-medium text-white' : 'text-slate-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {selectedOption && <span className="hidden text-[10px] text-slate-500 sm:inline">Selected</span>}
          <ChevronDown size={16} className={`text-slate-400 transition-transform group-hover:text-cyan-200 ${open ? 'rotate-180 text-cyan-200' : ''}`} />
        </span>
      </button>

      {open && !disabled && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-white/15 bg-[#0b0d17] shadow-2xl shadow-black/50 ring-1 ring-black/30" role="listbox" aria-label={label || placeholder}>
          <div className="border-b border-white/10 bg-white/2 p-2.5">
            <div className="flex items-center gap-2 rounded-xl border border-cyan-300/25 bg-black/40 px-3 py-2.5 transition focus-within:border-cyan-300/60 focus-within:ring-2 focus-within:ring-cyan-300/10">
              <Search size={14} className="text-slate-500" />
              <input
                ref={searchInputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
              />
              {query && (
                <button type="button" aria-label="Clear search" onClick={() => setQuery('')} className="rounded-md p-0.5 text-slate-500 transition hover:bg-white/10 hover:text-white">
                  <X size={13} />
                </button>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between px-1 text-[10px] text-slate-500">
              <span>{filteredOptions.length} {filteredOptions.length === 1 ? 'option' : 'options'}</span>
              <span className="hidden sm:inline">Use arrows and Enter</span>
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={String(option.value) === String(value)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => selectOption(option)}
                  className={`flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-xs transition ${
                    index === highlightedIndex ? 'bg-cyan-300/10' : 'hover:bg-white/5'
                  } ${
                    option.selected ? 'text-emerald-200' : String(option.value) === String(value) ? 'text-cyan-200' : 'text-white'
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2 truncate">
                    {option.selected && <CheckCircle2 size={14} className="shrink-0 text-emerald-300" />}
                    {!option.selected && String(option.value) === String(value) && <CheckCircle2 size={14} className="shrink-0 text-cyan-300" />}
                    <span className="truncate">{option.label}</span>
                  </span>
                  {option.meta ? <span className={`max-w-[42%] truncate text-right text-[10px] ${option.selected ? 'text-emerald-300' : 'text-slate-500'}`}>{option.meta}</span> : null}
                </button>
              ))
            ) : (
              <div className="px-3.5 py-5 text-center text-xs text-slate-500">
                <Search size={16} className="mx-auto mb-2 text-slate-600" />
                No matching options
              </div>
            )}
          </div>
        </div>
      )}

      {helperText ? <p className="mt-1 text-[11px] text-slate-400">{helperText}</p> : null}
    </div>
  );
}
