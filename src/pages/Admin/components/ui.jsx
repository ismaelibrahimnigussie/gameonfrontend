import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle, CheckCircle2, ChevronDown, Info, Loader2, X,
} from 'lucide-react';

export const Avatar = ({ name, size = 'md' }) => {
  const initials = name?.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || '?';
  const sizeMap = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base', xl: 'h-16 w-16 text-lg' };
  const colors = [
    'from-slate-600 to-slate-800',
    'from-blue-500 to-indigo-700',
    'from-emerald-500 to-teal-700',
    'from-amber-500 to-orange-700',
    'from-purple-500 to-pink-700',
    'from-rose-500 to-red-700',
  ];
  const colorIndex = (initials.charCodeAt(0) || 0) % colors.length;
  return (
    <div className={`${sizeMap[size]} rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-semibold ring-2 ring-white shadow-sm`}>
      {initials}
    </div>
  );
};

export const Button = ({ children, variant = 'primary', size = 'md', loading, disabled, icon: Icon, iconRight: IconRight, className = '', ...props }) => {
  const base = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 active:scale-[0.98] select-none touch-manipulation whitespace-nowrap';
  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm',
    ghost: 'text-slate-600 hover:bg-slate-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
    outline: 'border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50',
    soft: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
  };
  const sizes = { sm: 'h-9 px-3 text-sm gap-1.5', md: 'h-11 px-4 text-sm gap-2', lg: 'h-12 px-6 text-base gap-2.5', icon: 'h-10 w-10', 'icon-sm': 'h-8 w-8' };
  return (
    <button disabled={disabled || loading} className={`${base} ${variants[variant]} ${sizes[size]} disabled:opacity-50 disabled:pointer-events-none ${className}`} {...props}>
      {loading ? <Loader2 size={18} className="animate-spin" /> : Icon && <Icon size={size === 'sm' ? 16 : 18} />}
      {children}
      {IconRight && <IconRight size={18} />}
    </button>
  );
};

export const Input = ({ label, error, icon: Icon, className = '', ...props }) => (
  <div className={className}>
    {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
    <div className="relative">
      {Icon && <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />}
      <input
        className={`w-full h-12 rounded-xl border bg-white text-base outline-none transition-all ${Icon ? 'pl-11 pr-4' : 'px-4'} ${error ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-slate-200 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5'} placeholder:text-slate-400`}
        {...props}
      />
    </div>
    {error && <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1"><AlertCircle size={14} />{error}</p>}
  </div>
);

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

export const Textarea = ({ label, className = '', ...props }) => (
  <div className={className}>
    {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
    <textarea className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5 resize-none placeholder:text-slate-400" {...props} />
  </div>
);

export const Badge = ({ children, variant = 'default', size = 'md', icon: Icon }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
    warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
    danger: 'bg-red-50 text-red-700 ring-1 ring-red-600/20',
    info: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20',
    purple: 'bg-purple-50 text-purple-700 ring-1 ring-purple-600/20',
  };
  const sizes = { sm: 'px-2 py-0.5 text-[11px]', md: 'px-2.5 py-1 text-xs' };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${variants[variant]} ${sizes[size]}`}>
      {Icon && <Icon size={size === 'sm' ? 10 : 12} />}
      {children}
    </span>
  );
};

export const Card = ({ title, subtitle, action, children, className = '', noPadding = false }) => (
  <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}>
    {(title || action) && (
      <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100">
        <div className="min-w-0">
          {title && <h3 className="text-base font-semibold text-slate-900 truncate">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="flex-shrink-0 ml-3">{action}</div>}
      </div>
    )}
    <div className={noPadding ? '' : 'p-5'}>{children}</div>
  </div>
);

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
    <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
      {Icon && <Icon size={28} className="text-slate-400" />}
    </div>
    <h3 className="text-base font-semibold text-slate-900">{title}</h3>
    {description && <p className="text-sm text-slate-500 mt-1 max-w-xs">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const Skeleton = ({ className = '' }) => <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />;

export const Toast = ({ message, onDismiss }) => {
  useEffect(() => {
    const timeoutId = setTimeout(onDismiss, 3500);
    return () => clearTimeout(timeoutId);
  }, [onDismiss]);
  const config = {
    success: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    error: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  };
  const current = config[message.kind] || config.info;
  const Icon = current.icon;
  return (
    <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-[110] animate-in slide-in-from-top-2 fade-in duration-300">
      <div className={`flex items-start gap-3 p-4 rounded-2xl border ${current.bg} ${current.border} shadow-lg shadow-slate-900/5`}>
        <Icon size={20} className={`${current.color} flex-shrink-0 mt-0.5`} />
        <p className="text-sm font-medium text-slate-900 flex-1">{message.text}</p>
        <button onClick={onDismiss} className="p-1 -mr-1 rounded-lg hover:bg-black/5 text-slate-400"><X size={16} /></button>
      </div>
    </div>
  );
};

export const Modal = ({ isOpen, onClose, title, subtitle, children, size = 'md', footer, showClose = true }) => {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleEsc = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] sm:max-w-5xl',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      <div className={`relative bg-white w-full ${sizeClasses[size]} rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-2 duration-300`}>
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {showClose && (
            <button onClick={onClose} className="p-2 -mr-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors flex-shrink-0">
              <X size={20} />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">{footer}</div>}
      </div>
    </div>
  );
};

export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'danger', loading }) => {
  const iconMap = {
    danger: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    warning: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
    info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50' },
    success: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  };
  const current = iconMap[variant] || iconMap.info;
  const Icon = current.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showClose={false}>
      <div className="flex flex-col items-center text-center py-4">
        <div className={`h-14 w-14 rounded-2xl ${current.bg} flex items-center justify-center mb-4`}>
          <Icon size={28} className={current.color} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-500">{message}</p>
      </div>
      <div className="flex gap-2 pt-4">
        <Button variant="secondary" onClick={onClose} className="flex-1" disabled={loading}>{cancelLabel}</Button>
        <Button variant={variant === 'success' ? 'success' : variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading} className="flex-1">
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
};

export const StatCard = ({ label, value, icon: Icon, trend, subtitle, accent = 'slate', onClick }) => {
  const accentMap = {
    slate: 'from-slate-50 to-white',
    blue: 'from-blue-50 to-white',
    emerald: 'from-emerald-50 to-white',
    amber: 'from-amber-50 to-white',
    purple: 'from-purple-50 to-white',
    red: 'from-red-50 to-white',
  };
  const iconColors = {
    slate: 'bg-slate-100 text-slate-600',
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
  };
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl border border-slate-200 bg-gradient-to-br ${accentMap[accent]} p-5 transition-all duration-200 hover:shadow-md hover:border-slate-300 active:scale-[0.98] ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900 truncate">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {trend !== undefined && trend !== null && (
              <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {Math.abs(trend)}%
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${iconColors[accent]}`}>
          <Icon size={22} strokeWidth={1.8} />
        </div>
      </div>
    </button>
  );
};
