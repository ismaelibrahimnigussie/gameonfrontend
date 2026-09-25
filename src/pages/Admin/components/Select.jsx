import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = ({ label, options = [], className = '', value = '', onChange, disabled = false, name, id }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const selectedOption = options.find((option) => String(option.value) === String(value));
  const filteredOptions = options.filter((option) => {
    const search = query.trim().toLowerCase();
    if (!search) return true;
    return `${option.label} ${option.meta || ''}`.toLowerCase().includes(search);
  });

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectOption = (option) => {
    onChange?.({ target: { name, id, value: option.value } });
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && <label htmlFor={id || name} className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>}
      <div className="relative">
        <input
          ref={inputRef}
          id={id || name}
          name={name}
          disabled={disabled}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          autoComplete="off"
          value={open ? query : selectedOption?.label || ''}
          placeholder={selectedOption?.label || 'Choose an option...'}
          onFocus={() => {
            if (!disabled) setOpen(true);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setOpen(false);
              setQuery('');
            }
            if (event.key === 'Enter' && filteredOptions[0]) {
              event.preventDefault();
              selectOption(filteredOptions[0]);
            }
          }}
          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-10 text-base outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          aria-label={`${open ? 'Close' : 'Open'} ${label || 'options'}`}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            setOpen((current) => !current);
            if (!open) inputRef.current?.focus();
          }}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 transition hover:text-slate-700 disabled:pointer-events-none"
        >
          <ChevronDown size={18} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {open && !disabled && (
        <div className="absolute z-40 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10" role="listbox">
          {filteredOptions.length > 0 ? filteredOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={String(option.value) === String(value)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectOption(option)}
              className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${String(option.value) === String(value) ? 'bg-slate-100 font-semibold text-slate-900' : 'text-slate-700 hover:bg-slate-50'}`}
            >
              <span className="min-w-0 truncate">{option.label}</span>
              {option.meta && <span className="max-w-[40%] shrink-0 truncate text-xs text-slate-400">{option.meta}</span>}
            </button>
          )) : <div className="px-3 py-5 text-center text-sm text-slate-400">No matching options</div>}
        </div>
      )}
    </div>
  );
};
