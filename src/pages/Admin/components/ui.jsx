import { useEffect } from 'react';
import {
  AlertCircle, CheckCircle2, Info, Loader2, X,
} from 'lucide-react';

export { Select } from './Select';
export { Modal, ConfirmDialog } from './dialogs';

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
