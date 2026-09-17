import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Building2, CheckCircle2, Clock3, Layers, Loader2, LogOut, RefreshCw, Save, Search,
  Trash2, Wallet, X, ChevronRight, Users, TrendingUp, Calendar, Home, Zap,
  UserPlus, Gift, Coins, Bell, Menu, TrendingDown, Phone, MapPin, CreditCard,
  DollarSign, Timer, CircleCheck, Filter, AlertCircle, Info, Package,
  ChevronDown, ArrowLeft, MoreHorizontal, Plus, Edit3, BadgeCheck, Sparkles,
  Download, ExternalLink, Copy, Eye, ArrowUpRight, Settings, Shield,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import GameZoneAPI from '../../api/modules/gamezones.api';
import CreditAPI from '../../api/modules/credits.api';
import PlayersAPI from '../../api/modules/players.api';
import UsersAPI from '../../api/modules/users.api';
import StationsAPI from '../../api/modules/stations.api';
import AdminsAPI from '../../api/modules/admins.api';
import { ADMIN_PORTAL_PATH } from '../../config/routes';
import SystemCosts from './dashboard/SystemCosts';

// ===================== CONSTANTS =====================
const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: Home, mobileLabel: 'Home' },
  { id: 'zones', label: 'Game Zones', icon: Building2, mobileLabel: 'Zones' },
  { id: 'players', label: 'Players', icon: Users, mobileLabel: 'Players' },
  { id: 'admins', label: 'Administrators', icon: Shield, mobileLabel: 'Admins', superAdminOnly: true },
  { id: 'credits', label: 'Credits', icon: Coins, mobileLabel: 'Credits' },
  { id: 'packages', label: 'Packages', icon: Package, mobileLabel: 'Packages' },
  { id: 'costs', label: 'System Costs', icon: Settings, mobileLabel: 'Costs', superAdminOnly: true },
];

const initialZoneForm = { zone_name: '', address: '', owner_name: '', owner_phone: '' };
const initialGrantForm = { zoneId: '', creditId: '', amount: '', transaction_type: 'Bonus' };
const initialPackageForm = { credit_name: '', credit_amount: '', duration_days: '30', price: '0', offered_by: 'Registration' };
const initialPlayerForm = { player_type: 'random', user_id: '', station_id: '', nickname: '' };
const initialAdminForm = { admin_name: '', phone: '', password: '', role: 'Admin', status: 'Active' };

// ===================== UTILITIES =====================
function normalizeList(payload) {
  const data = payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function pickZoneId(zone) { return zone?.zone_id ?? zone?.id ?? zone?.zoneId ?? null; }
function pickPackageId(pkg) { return pkg?.credit_id ?? pkg?.id ?? pkg?.package_id ?? null; }

// ===================== UI PRIMITIVES =====================

// Avatar
const Avatar = ({ name, size = 'md' }) => {
  const initials = name?.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join('') || '?';
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

// Button
const Button = ({ children, variant = 'primary', size = 'md', loading, disabled, icon: Icon, iconRight: IconRight, className = '', ...props }) => {
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

// Input
const Input = ({ label, error, icon: Icon, className = '', ...props }) => (
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

// Searchable select
const Select = ({ label, options = [], className = '', value = '', onChange, disabled = false, name, id }) => {
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

// Textarea
const Textarea = ({ label, className = '', ...props }) => (
  <div className={className}>
    {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
    <textarea className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5 resize-none placeholder:text-slate-400" {...props} />
  </div>
);

// Badge
const Badge = ({ children, variant = 'default', size = 'md', icon: Icon }) => {
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

// Card
const Card = ({ title, subtitle, action, children, className = '', noPadding = false }) => (
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

// Empty State
const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
    <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
      {Icon && <Icon size={28} className="text-slate-400" />}
    </div>
    <h3 className="text-base font-semibold text-slate-900">{title}</h3>
    {description && <p className="text-sm text-slate-500 mt-1 max-w-xs">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

// Skeleton
const Skeleton = ({ className = '' }) => <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />;

// Toast
const Toast = ({ message, onDismiss }) => {
  useEffect(() => { const t = setTimeout(onDismiss, 3500); return () => clearTimeout(t); }, [onDismiss]);
  const config = {
    success: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    error: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  };
  const c = config[message.kind] || config.info;
  const Icon = c.icon;
  return (
    <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-[110] animate-in slide-in-from-top-2 fade-in duration-300">
      <div className={`flex items-start gap-3 p-4 rounded-2xl border ${c.bg} ${c.border} shadow-lg shadow-slate-900/5`}>
        <Icon size={20} className={`${c.color} flex-shrink-0 mt-0.5`} />
        <p className="text-sm font-medium text-slate-900 flex-1">{message.text}</p>
        <button onClick={onDismiss} className="p-1 -mr-1 rounded-lg hover:bg-black/5 text-slate-400"><X size={16} /></button>
      </div>
    </div>
  );
};

// Modal System
const Modal = ({ isOpen, onClose, title, subtitle, children, size = 'md', footer, showClose = true }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
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
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />

      {/* Modal Content */}
      <div className={`relative bg-white w-full ${sizeClasses[size]} rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-2 duration-300`}>
        {/* Drag Handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">{footer}</div>}
      </div>
    </div>
  );
};

// Confirmation Dialog
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'danger', loading }) => {
  const iconMap = {
    danger: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    warning: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
    info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50' },
    success: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  };
  const c = iconMap[variant] || iconMap.info;
  const Icon = c.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showClose={false}>
      <div className="flex flex-col items-center text-center py-4">
        <div className={`h-14 w-14 rounded-2xl ${c.bg} flex items-center justify-center mb-4`}>
          <Icon size={28} className={c.color} />
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

// Stat Card
const StatCard = ({ label, value, icon: Icon, trend, subtitle, accent = 'slate', onClick }) => {
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
                {trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
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

// Mobile Bottom Nav
const MobileBottomNav = ({ activePage, onNavigate, adminRole }) => (
  <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 pb-[env(safe-area-inset-bottom)] sm:hidden">
    <div className="flex items-center justify-around px-2 py-2">
      {NAV_ITEMS.filter(item => !item.superAdminOnly || adminRole === 'Super Admin').map(item => {
        const Icon = item.icon;
        const isActive = activePage === item.id;
        return (
          <button key={item.id} onClick={() => onNavigate(item.id)} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-150 min-w-[64px] ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
            <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-slate-100' : ''}`}>
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
            </div>
            <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>{item.mobileLabel}</span>
          </button>
        );
      })}
    </div>
  </nav>
);

// Desktop Sidebar
const DesktopSidebar = ({ activePage, onNavigate, adminName, adminRole, onLogout }) => (
  <aside className="hidden sm:flex flex-col w-64 fixed left-0 top-0 bottom-0 bg-white border-r border-slate-200 z-40">
    <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-100">
      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center shadow-sm">
        <Zap size={18} className="text-white" />
      </div>
      <div>
        <span className="font-bold text-slate-900 text-base">GameZone</span>
        <span className="block text-[10px] text-slate-500 font-medium">Admin Portal</span>
      </div>
    </div>

    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
      <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Menu</p>
      {NAV_ITEMS.filter(item => !item.superAdminOnly || adminRole === 'Super Admin').map(item => {
        const Icon = item.icon;
        const isActive = activePage === item.id;
        return (
          <button key={item.id} onClick={() => onNavigate(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${isActive ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
            <Icon size={20} strokeWidth={isActive ? 2 : 1.8} />
            {item.label}
            {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />}
          </button>
        );
      })}
    </nav>

    <div className="p-3 border-t border-slate-100">
      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
        <Avatar name={adminName} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">{adminName}</p>
          <p className="text-xs text-slate-500 truncate">{adminRole}</p>
        </div>
        <button onClick={onLogout} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Sign out">
          <LogOut size={18} />
        </button>
      </div>
    </div>
  </aside>
);

// Mobile Header
const MobileHeader = ({ title, onMenuClick, onRefresh, refreshing }) => (
  <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 sm:hidden">
    <div className="flex items-center justify-between px-4 h-14">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100"><Menu size={22} /></button>
        <h1 className="font-semibold text-slate-900 truncate">{title}</h1>
      </div>
      <button onClick={onRefresh} disabled={refreshing} className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50">
        <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
      </button>
    </div>
  </header>
);

// Desktop Header
const DesktopHeader = ({ title, subtitle, onRefresh, refreshing }) => (
  <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 hidden sm:block">
    <div className="flex items-center justify-between px-6 h-16">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" icon={RefreshCw} loading={refreshing} onClick={onRefresh}>Refresh</Button>
        <button className="relative p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>
      </div>
    </div>
  </header>
);

// Mobile Drawer
const MobileDrawer = ({ isOpen, onClose, activePage, onNavigate, adminName, adminRole, onLogout }) => (
  <>
    <div className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 sm:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
    <div className={`fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 transition-transform duration-300 sm:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center"><Zap size={18} className="text-white" /></div>
            <span className="font-bold text-slate-900">GameZone</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100"><X size={20} /></button>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.filter(item => !item.superAdminOnly || adminRole === 'Super Admin').map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button key={item.id} onClick={() => { onNavigate(item.id); onClose(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                <Icon size={22} strokeWidth={isActive ? 2 : 1.8} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-3 p-2">
            <Avatar name={adminName} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{adminName}</p>
              <p className="text-xs text-slate-500">{adminRole}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-colors">
            <LogOut size={20} />Sign Out
          </button>
        </div>
      </div>
    </div>
  </>
);

// Zone Row (for table view on desktop)
const ZoneRow = ({ zone, onClick }) => {
  const zoneId = pickZoneId(zone);
  const isVerified = Boolean(zone.is_verified === 1 || zone.is_verified === true);
  return (
    <tr onClick={onClick} className="hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100 last:border-0">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {zone.zone_name?.[0]?.toUpperCase() || 'Z'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{zone.zone_name || 'Unnamed'}</p>
            <p className="text-xs text-slate-500 font-mono">#{zoneId}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4 text-sm text-slate-600 hidden md:table-cell">{zone.owner_name || '—'}</td>
      <td className="px-5 py-4 text-sm text-slate-600 hidden lg:table-cell">{zone.owner_phone || '—'}</td>
      <td className="px-5 py-4">
        <Badge variant={isVerified ? 'success' : 'warning'} icon={isVerified ? CheckCircle2 : Clock3}>
          {isVerified ? 'Verified' : 'Pending'}
        </Badge>
      </td>
      <td className="px-5 py-4 text-right">
        <span className="text-sm font-bold text-slate-900">{Number(zone.balance || 0).toLocaleString()}</span>
        <span className="text-xs text-slate-500 ml-1">Br</span>
      </td>
      <td className="px-5 py-4 text-right">
        <ChevronRight size={18} className="text-slate-400" />
      </td>
    </tr>
  );
};

// Zone Card (for mobile view)
const ZoneCard = ({ zone, onClick }) => {
  const zoneId = pickZoneId(zone);
  const isVerified = Boolean(zone.is_verified === 1 || zone.is_verified === true);
  return (
    <button onClick={onClick} className="w-full text-left rounded-2xl border border-slate-200 bg-white p-4 transition-all active:scale-[0.98] hover:border-slate-300 hover:shadow-sm">
      <div className="flex items-start gap-3">
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-base font-bold flex-shrink-0 ${isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
          {zone.zone_name?.[0]?.toUpperCase() || 'Z'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900 truncate">{zone.zone_name || 'Unnamed'}</h3>
            <Badge variant={isVerified ? 'success' : 'warning'} size="sm" icon={isVerified ? CheckCircle2 : Clock3}>
              {isVerified ? 'Verified' : 'Pending'}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 truncate mt-0.5">{zone.owner_name || 'Unknown'}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-slate-400 font-mono">#{zoneId}</span>
            <span className="text-sm font-bold text-slate-900">{Number(zone.balance || 0).toLocaleString()} Br</span>
          </div>
        </div>
      </div>
    </button>
  );
};

// Package Card
const PackageCard = ({ pkg, onEdit, onDelete, deleting }) => {
  const pkgId = pickPackageId(pkg);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md hover:border-slate-300 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
          <Package size={22} className="text-purple-600" />
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onEdit} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors" title="Edit">
            <Edit3 size={16} />
          </button>
          <button onClick={onDelete} disabled={deleting} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50" title="Delete">
            {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          </button>
        </div>
      </div>
      <h3 className="text-base font-semibold text-slate-900 truncate">{pkg.credit_name}</h3>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-2xl font-bold text-slate-900">{pkg.credit_amount}</span>
        <span className="text-sm text-slate-500">credits</span>
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        <Badge variant="info" icon={Timer}>{pkg.duration_days} days</Badge>
        <Badge variant="default">{pkg.offered_by || 'Manual'}</Badge>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500">Price</span>
        <span className="text-lg font-bold text-slate-900">{pkg.price ?? 0} <span className="text-xs text-slate-500">Br</span></span>
      </div>
    </div>
  );
};

// Credit Row
const CreditRow = ({ credit, onClick }) => {
  const type = credit.offered_by || 'Manual';
  const typeColors = {
    Bonus: 'bg-emerald-100 text-emerald-700',
    Manual: 'bg-blue-100 text-blue-700',
    Registration: 'bg-purple-100 text-purple-700',
    Purchase: 'bg-amber-100 text-amber-700',
    Deduction: 'bg-red-100 text-red-700',
  };
  return (
    <div onClick={onClick} className="flex items-center gap-4 p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors">
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColors[type] || 'bg-slate-100 text-slate-600'}`}>
        <CreditCard size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-slate-900 truncate">{credit.credit_name || 'Manual Credit'}</p>
          <Badge variant="default" size="sm">{type}</Badge>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          {credit.purchased_at ? new Date(credit.purchased_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-slate-900">{credit.total_credit || credit.credit_amount || 0}</p>
        <p className="text-xs text-slate-500">{credit.remaining_credit || 0} left</p>
      </div>
    </div>
  );
};

// ===================== MAIN COMPONENT =====================
export default function AdminPortal() {
  const navigate = useNavigate();
  const { adminUser, isAdminAuthenticated, isAdminLoading, adminLogout } = useAdminAuth();

  // State
  const [activePage, setActivePage] = useState('overview');
  const [zones, setZones] = useState([]);
  const [packages, setPackages] = useState([]);
  const [systemCosts, setSystemCosts] = useState([]);
  const [players, setPlayers] = useState([]);
  const [users, setUsers] = useState([]);
  const [stations, setStations] = useState([]);
  const [playerSearch, setPlayerSearch] = useState('');
  const [playerTypeFilter, setPlayerTypeFilter] = useState('all');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [adminSearch, setAdminSearch] = useState('');
  const [selectedAdminIds, setSelectedAdminIds] = useState([]);
  const [zoneCredits, setZoneCredits] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modal states
  const [showZoneDetails, setShowZoneDetails] = useState(false);
  const [showZoneEdit, setShowZoneEdit] = useState(false);
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(null);
  const [selectedZoneForDetails, setSelectedZoneForDetails] = useState(null);
  const [selectedPackageForEdit, setSelectedPackageForEdit] = useState(null);

  // Form states
  const [zoneForm, setZoneForm] = useState(initialZoneForm);
  const [grantForm, setGrantForm] = useState(initialGrantForm);
  const [packageForm, setPackageForm] = useState(initialPackageForm);
  const [playerForm, setPlayerForm] = useState(initialPlayerForm);
  const [selectedPlayerForEdit, setSelectedPlayerForEdit] = useState(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminForm, setAdminForm] = useState(initialAdminForm);
  const [selectedAdminForEdit, setSelectedAdminForEdit] = useState(null);

  const isAuthenticated = Boolean(isAdminAuthenticated);
  const adminName = adminUser?.admin_name || adminUser?.name || 'Admin';
  const adminRole = adminUser?.role || 'Administrator';

  const showMessage = useCallback((text, kind = 'success') => setMessage({ text, kind }), []);
  const dismissToast = useCallback(() => setMessage(null), []);

  // Data Loading
  const loadDashboard = useCallback(async (silent = false) => {
    if (!isAuthenticated) { setLoading(false); return; }
    if (silent) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const [zonesRes, packagesRes, playersRes, usersRes, stationsRes, costsRes] = await Promise.all([
        GameZoneAPI.getAllZones(),
        CreditAPI.getCreditPackages().catch(() => ({ data: [] })),
        PlayersAPI.getAll().catch(() => ({ data: [] })),
        UsersAPI.getAll().catch(() => ({ data: [] })),
        StationsAPI.getAllStations().catch(() => ({ data: [] })),
        adminUser?.role === 'Super Admin' ? CreditAPI.getSystemCosts().catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
      ]);
      const rawZones = normalizeList(zonesRes);
      const rawPackages = normalizeList(packagesRes);
      const zonesWithBalance = await Promise.all(
        rawZones.map(async (zone) => {
          const zoneId = pickZoneId(zone);
          try {
            const balanceRes = await CreditAPI.getZoneBalanceAdmin(zoneId);
            const balance = balanceRes?.data?.balance ?? balanceRes?.balance ?? balanceRes?.data?.data?.balance ?? 0;
            return { ...zone, balance };
          } catch { return { ...zone, balance: 0 }; }
        })
      );
      setZones(zonesWithBalance);
      setPackages(rawPackages);
      setPlayers(normalizeList(playersRes));
      setUsers(normalizeList(usersRes));
      setStations(normalizeList(stationsRes));
      setSystemCosts(normalizeList(costsRes));
      if (adminUser?.role === 'Super Admin') {
        const adminsRes = await AdminsAPI.getAll();
        setAdmins(normalizeList(adminsRes));
      }
      if (!selectedZoneId && zonesWithBalance.length > 0) setSelectedZoneId(String(pickZoneId(zonesWithBalance[0])));
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load data');
      showMessage('Failed to load data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, selectedZoneId, showMessage]);

  const handleSystemCostSave = async (payload, id) => {
    setActionLoading('cost-save');
    try {
      if (id) await CreditAPI.updateSystemCost(id, payload);
      else await CreditAPI.createSystemCost(payload);
      showMessage(id ? 'System cost updated' : 'System cost created', 'success');
      const response = await CreditAPI.getSystemCosts();
      setSystemCosts(normalizeList(response));
    } catch (err) { showMessage(err?.response?.data?.message || 'Failed to save system cost', 'error'); }
    finally { setActionLoading(''); }
  };

  const handleSystemCostDelete = (cost) => requestConfirm({
    title: 'Delete system cost?', message: `Delete "${cost.cost_reason}"?`, variant: 'danger', confirmLabel: 'Delete',
    onConfirm: async () => {
      try { await CreditAPI.deleteSystemCost(cost.cost_id); setSystemCosts((items) => items.filter((item) => item.cost_id !== cost.cost_id)); showMessage('System cost deleted', 'success'); }
      catch (err) { showMessage(err?.response?.data?.message || 'Cannot delete this system cost', 'error'); }
      finally { setShowConfirm(null); }
    }
  });

  const loadSelectedZoneCredits = useCallback(async (zoneId) => {
    if (!zoneId) { setZoneCredits([]); return; }
    try {
      const res = await CreditAPI.getZoneCreditsAdmin(zoneId);
      setZoneCredits(normalizeList(res));
    } catch { setZoneCredits([]); }
  }, []);

  useEffect(() => { if (isAuthenticated) loadDashboard(); else if (!isAdminLoading) setLoading(false); }, [isAuthenticated, isAdminLoading, loadDashboard]);
  useEffect(() => { if (selectedZoneId) loadSelectedZoneCredits(selectedZoneId); }, [selectedZoneId, loadSelectedZoneCredits]);

  // Computed
  const filteredZones = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return zones;
    return zones.filter(z => {
      const name = String(z.zone_name || '').toLowerCase();
      const owner = String(z.owner_name || '').toLowerCase();
      const phone = String(z.owner_phone || '').toLowerCase();
      return name.includes(q) || owner.includes(q) || phone.includes(q);
    });
  }, [zones, searchQuery]);

  const selectedZone = useMemo(() => zones.find(z => String(pickZoneId(z)) === String(selectedZoneId)) || null, [zones, selectedZoneId]);

  const filteredPlayers = useMemo(() => {
    const q = playerSearch.trim().toLowerCase();
    return players.filter((player) => {
      const isRandom = player.user_id == null;
      const matchesType = playerTypeFilter === 'all' || (playerTypeFilter === 'random' ? isRandom : !isRandom);
      const text = `${player.random_nickname || player.nickname || ''} ${player.username || ''} ${player.phone || ''} ${player.station_name || ''}`.toLowerCase();
      return matchesType && (!q || text.includes(q));
    });
  }, [players, playerSearch, playerTypeFilter]);

  const filteredAdmins = useMemo(() => {
    const q = adminSearch.trim().toLowerCase();
    return admins.filter((admin) => !q || `${admin.admin_name || ''} ${admin.phone || ''} ${admin.role || ''} ${admin.status || ''}`.toLowerCase().includes(q));
  }, [admins, adminSearch]);

  const stats = useMemo(() => {
    const totalBalance = zones.reduce((s, z) => s + Number(z.balance || 0), 0);
    const verified = zones.filter(z => Boolean(z.is_verified === 1 || z.is_verified === true)).length;
    return { total: zones.length, verified, pending: zones.length - verified, totalBalance, packageCount: packages.length, rate: zones.length ? (verified / zones.length) * 100 : 0 };
  }, [zones, packages]);

  // Modal handlers
  const openZoneDetails = async (zone) => {
    setSelectedZoneForDetails(zone);
    setShowZoneDetails(true);
    const zoneId = pickZoneId(zone);
    if (zoneId) {
      try {
        const res = await CreditAPI.getZoneCreditsAdmin(zoneId);
        setSelectedZoneForDetails(prev => ({ ...prev, credits: normalizeList(res) }));
      } catch { /* ignore */ }
    }
  };

  const openZoneEdit = (zone) => {
    setSelectedZoneForDetails(zone);
    setZoneForm({
      zone_name: zone.zone_name || '',
      address: zone.address || '',
      owner_name: zone.owner_name || '',
      owner_phone: zone.owner_phone || '',
    });
    setShowZoneEdit(true);
    setShowZoneDetails(false);
  };

  const openGrantModal = (zone = null) => {
    setGrantForm({ ...initialGrantForm, zoneId: zone ? String(pickZoneId(zone)) : selectedZoneId || '' });
    setShowGrantModal(true);
  };

  const openPackageModal = (pkg = null) => {
    if (pkg) {
      setSelectedPackageForEdit(pkg);
      setPackageForm({
        credit_name: pkg.credit_name || '',
        credit_amount: String(pkg.credit_amount ?? ''),
        duration_days: String(pkg.duration_days ?? '30'),
        price: String(pkg.price ?? '0'),
        offered_by: pkg.offered_by || 'Registration',
      });
    } else {
      setSelectedPackageForEdit(null);
      setPackageForm(initialPackageForm);
    }
    setShowPackageModal(true);
  };

  const requestConfirm = (config) => setShowConfirm(config);

  // Action handlers
  const handleZoneSave = async (e) => {
    e.preventDefault();
    const zone = selectedZoneForDetails;
    if (!zone) return;
    const zoneId = pickZoneId(zone);
    setActionLoading('zone-save');
    try {
      await GameZoneAPI.updateZone(zoneId, {
        zone_name: zoneForm.zone_name.trim(),
        address: zoneForm.address.trim(),
        owner_name: zoneForm.owner_name.trim(),
        owner_phone: zoneForm.owner_phone.trim(),
      });
      showMessage('Zone updated successfully', 'success');
      setShowZoneEdit(false);
      await loadDashboard(true);
    } catch (err) {
      showMessage(err?.response?.data?.message || 'Failed to update', 'error');
    } finally { setActionLoading(''); }
  };

  const handleZoneVerify = (zone, verified) => {
    requestConfirm({
      title: verified ? 'Verify Zone' : 'Unverify Zone',
      message: verified ? `Mark "${zone.zone_name}" as verified? This will enable full features.` : `Remove verification from "${zone.zone_name}"?`,
      variant: verified ? 'success' : 'warning',
      confirmLabel: verified ? 'Verify' : 'Unverify',
      onConfirm: async () => {
        const zoneId = pickZoneId(zone);
        setActionLoading('verify');
        try {
          if (verified) await GameZoneAPI.verifyZone(zoneId);
          else await GameZoneAPI.unverifyZone(zoneId);
          showMessage(verified ? 'Zone verified' : 'Zone unverified', 'success');
          setShowConfirm(null);
          await loadDashboard(true);
        } catch { showMessage('Failed to update', 'error'); setShowConfirm(null); }
        finally { setActionLoading(''); }
      },
    });
  };

  const handleGrantCredits = async (e) => {
    e.preventDefault();
    if (!grantForm.zoneId) { showMessage('Select a zone', 'error'); return; }
    const amount = Number(grantForm.amount);
    if (!amount || amount <= 0) { showMessage('Enter a valid amount', 'error'); return; }
    setActionLoading('grant');
    try {
      await CreditAPI.grantCredits({
        zoneId: Number(grantForm.zoneId),
        creditId: grantForm.creditId ? Number(grantForm.creditId) : null,
        amount,
        transaction_type: grantForm.transaction_type,
        cost_id: grantForm.costId ? Number(grantForm.costId) : null,
      });
      showMessage('Credits granted successfully', 'success');
      setGrantForm(initialGrantForm);
      setShowGrantModal(false);
      await loadDashboard(true);
      if (grantForm.zoneId) await loadSelectedZoneCredits(grantForm.zoneId);
    } catch (err) { showMessage(err?.response?.data?.message || 'Failed to grant', 'error'); }
    finally { setActionLoading(''); }
  };

  const handleDeductCredits = (zone) => {
    const zoneId = pickZoneId(zone) || selectedZoneId;
    if (!zoneId) return showMessage('Select a zone', 'error');
    const rawAmount = window.prompt('Credits to revoke from this zone:', '1');
    if (rawAmount === null) return;
    const amount = Number(rawAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      showMessage('Enter a valid positive amount', 'error');
      return;
    }
    requestConfirm({
      title: 'Deduct Credits',
      message: `Remove ${amount} credits from this zone? This action cannot be undone.`,
      variant: 'danger',
      confirmLabel: 'Proceed',
      onConfirm: async () => {
        setActionLoading('deduct');
        try {
          await CreditAPI.deductCredits(zoneId, amount);
          showMessage('Credits deducted successfully', 'success');
          setShowConfirm(null);
          await loadDashboard(true);
          await loadSelectedZoneCredits(zoneId);
        } catch (err) {
          showMessage(err?.response?.data?.message || 'Failed to deduct credits', 'error');
          setShowConfirm(null);
        } finally {
          setActionLoading('');
        }
      },
    });
  };

  const handlePackageSave = async (e) => {
    e.preventDefault();
    setActionLoading('package-save');
    try {
      const payload = {
        credit_name: packageForm.credit_name.trim(),
        credit_amount: Number(packageForm.credit_amount),
        duration_days: Number(packageForm.duration_days),
        price: Number(packageForm.price),
        offered_by: packageForm.offered_by || 'Registration',
      };
      if (!payload.credit_name) throw new Error('Name required');
      if (!payload.credit_amount) throw new Error('Invalid amount');
      if (selectedPackageForEdit) {
        await CreditAPI.updatePackage(pickPackageId(selectedPackageForEdit), payload);
        showMessage('Package updated', 'success');
      } else {
        await CreditAPI.createPackage(payload);
        showMessage('Package created', 'success');
      }
      setPackageForm(initialPackageForm);
      setSelectedPackageForEdit(null);
      setShowPackageModal(false);
      await loadDashboard(true);
    } catch (err) { showMessage(err.message || 'Failed to save', 'error'); }
    finally { setActionLoading(''); }
  };

  const handlePackageDelete = (pkg) => {
    requestConfirm({
      title: 'Delete Package',
      message: `Are you sure you want to delete "${pkg.credit_name}"? This action cannot be undone.`,
      variant: 'danger',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        const pkgId = pickPackageId(pkg);
        setActionLoading(`del-${pkgId}`);
        try {
          await CreditAPI.deletePackage(pkgId);
          showMessage('Package deleted', 'success');
          setShowConfirm(null);
          await loadDashboard(true);
        } catch { showMessage('Failed to delete', 'error'); setShowConfirm(null); }
        finally { setActionLoading(''); }
      },
    });
  };

  const openPlayerModal = (player = null) => {
    setSelectedPlayerForEdit(player);
    setPlayerForm(player
      ? { player_type: player.user_id == null ? 'random' : 'registered', user_id: player.user_id || '', station_id: player.station_id || '', nickname: player.random_nickname || player.nickname || '' }
      : initialPlayerForm);
    setShowPlayerModal(true);
  };

  const handlePlayerSave = async (event) => {
    event.preventDefault();
    if (!playerForm.station_id) return showMessage('Select a station', 'error');
    setActionLoading('player-save');
    try {
      if (selectedPlayerForEdit) {
        await PlayersAPI.update(selectedPlayerForEdit.player_id, { station_id: Number(playerForm.station_id), nickname: playerForm.nickname.trim() });
      } else if (playerForm.player_type === 'registered') {
        if (!playerForm.user_id) throw new Error('Select a registered user');
        await PlayersAPI.create({ user_id: Number(playerForm.user_id), station_id: Number(playerForm.station_id) });
      } else {
        await PlayersAPI.createRandom({ station_id: Number(playerForm.station_id), nickname: playerForm.nickname.trim() });
      }
      showMessage(selectedPlayerForEdit ? 'Player updated' : 'Player created', 'success');
      setShowPlayerModal(false);
      setSelectedPlayerForEdit(null);
      await loadDashboard(true);
    } catch (err) {
      showMessage(err?.response?.data?.message || err.message || 'Failed to save player', 'error');
    } finally { setActionLoading(''); }
  };

  const handlePlayersDelete = (ids) => {
    const normalizedIds = ids.map(Number).filter(Boolean);
    if (!normalizedIds.length) return;
    requestConfirm({
      title: `Delete ${normalizedIds.length} player${normalizedIds.length === 1 ? '' : 's'}?`,
      message: 'This removes the selected player records. Existing session history is retained when the database allows it.',
      variant: 'danger',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        setActionLoading('players-delete');
        try {
          if (normalizedIds.length === 1) await PlayersAPI.delete(normalizedIds[0]);
          else await PlayersAPI.bulkDelete(normalizedIds);
          setSelectedPlayerIds([]);
          setShowConfirm(null);
          showMessage('Players deleted', 'success');
          await loadDashboard(true);
        } catch (err) {
          showMessage(err?.response?.data?.message || 'Failed to delete players', 'error');
          setShowConfirm(null);
        } finally { setActionLoading(''); }
      },
    });
  };

  const openAdminModal = (admin = null) => {
    setSelectedAdminForEdit(admin);
    setAdminForm(admin
      ? { admin_name: admin.admin_name || '', phone: admin.phone || '', password: '', role: admin.role || 'Admin', status: admin.status || 'Active' }
      : initialAdminForm);
    setShowAdminModal(true);
  };

  const handleAdminSave = async (event) => {
    event.preventDefault();
    setActionLoading('admin-save');
    try {
      const payload = { admin_name: adminForm.admin_name.trim(), phone: adminForm.phone.trim(), role: adminForm.role, status: adminForm.status };
      if (!payload.admin_name || !payload.phone) throw new Error('Name and phone are required');
      if (!selectedAdminForEdit && !adminForm.password) throw new Error('Password is required');
      if (adminForm.password) payload.password = adminForm.password;
      if (selectedAdminForEdit) await AdminsAPI.update(selectedAdminForEdit.admin_id, payload);
      else await AdminsAPI.create(payload);
      showMessage(selectedAdminForEdit ? 'Administrator updated' : 'Administrator created', 'success');
      setShowAdminModal(false);
      await loadDashboard(true);
    } catch (err) { showMessage(err?.response?.data?.message || err.message || 'Failed to save administrator', 'error'); }
    finally { setActionLoading(''); }
  };

  const handleAdminsDelete = (ids) => {
    if (!ids.length) return;
    requestConfirm({
      title: `Delete ${ids.length} administrator${ids.length === 1 ? '' : 's'}?`,
      message: 'Deleted administrators will no longer be able to sign in.',
      variant: 'danger',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        setActionLoading('admins-delete');
        try {
          if (ids.length === 1) await AdminsAPI.delete(ids[0]); else await AdminsAPI.bulkDelete(ids);
          setSelectedAdminIds([]); setShowConfirm(null); showMessage('Administrators deleted', 'success'); await loadDashboard(true);
        } catch (err) { showMessage(err?.response?.data?.message || 'Failed to delete administrators', 'error'); setShowConfirm(null); }
        finally { setActionLoading(''); }
      },
    });
  };

  const handleLogout = () => {
    requestConfirm({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out?',
      variant: 'warning',
      confirmLabel: 'Sign Out',
      onConfirm: () => { adminLogout(); navigate(ADMIN_PORTAL_PATH, { replace: true }); },
    });
  };

  if (!isAuthenticated && !isAdminLoading) return <Navigate to={ADMIN_PORTAL_PATH} replace />;

  const currentPage = NAV_ITEMS.find(n => n.id === activePage);
  const subtitles = {
    overview: 'Platform overview and quick actions',
    zones: 'Manage game zones and verification',
    credits: 'Track and manage credit transactions',
    packages: 'Configure credit packages',
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      {message && <Toast message={message} onDismiss={dismissToast} />}

      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        activePage={activePage}
        onNavigate={setActivePage}
        adminName={adminName}
        adminRole={adminRole}
        onLogout={handleLogout}
      />

      <DesktopSidebar
        activePage={activePage}
        onNavigate={setActivePage}
        adminName={adminName}
        adminRole={adminRole}
        onLogout={handleLogout}
      />

      <div className="sm:ml-64 min-h-screen pb-20 sm:pb-0">
        <MobileHeader title={currentPage?.label} onMenuClick={() => setMobileMenuOpen(true)} onRefresh={() => loadDashboard(true)} refreshing={refreshing} />
        <DesktopHeader title={currentPage?.label} subtitle={subtitles[activePage]} onRefresh={() => loadDashboard(true)} refreshing={refreshing} />

        {error && (
          <div className="mx-4 mt-4 sm:mx-6 flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800 flex-1">{error}</p>
            <button onClick={() => setError('')} className="p-1 rounded-lg hover:bg-red-100 text-red-600"><X size={16} /></button>
          </div>
        )}

        <div className="p-4 sm:p-6 space-y-6">
          {/* ==================== OVERVIEW ==================== */}
          {activePage === 'overview' && (
            <>
              {/* Welcome Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-3xl rounded-full" />
                <div className="relative">
                  <Badge variant="info" size="md" icon={Sparkles}>Live Dashboard</Badge>
                  <h2 className="text-2xl sm:text-3xl font-bold mt-3">Welcome back, {adminName.split(' ')[0]} 👋</h2>
                  <p className="text-slate-300 mt-2 text-sm sm:text-base">Here's what's happening with your platform today.</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard label="Total Zones" value={stats.total} icon={Building2} accent="blue" subtitle={`${stats.verified} verified`} />
                <StatCard label="Pending" value={stats.pending} icon={Clock3} accent="amber" subtitle={`${stats.rate.toFixed(0)}% rate`} />
                <StatCard label="Packages" value={stats.packageCount} icon={Layers} accent="purple" />
                <StatCard label="Total Balance" value={stats.totalBalance.toLocaleString()} icon={Wallet} accent="emerald" trend={12.5} subtitle="Br" />
              </div>

              {/* Quick Actions */}
              <Card title="Quick Actions" subtitle="Common tasks at your fingertips">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <button onClick={() => openGrantModal()} className="flex flex-col items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all active:scale-[0.98] text-left">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                      <Gift size={22} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Grant Credits</p>
                      <p className="text-xs text-slate-500 mt-0.5">Add credits to zones</p>
                    </div>
                  </button>
                  <button onClick={() => openPackageModal()} className="flex flex-col items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all active:scale-[0.98] text-left">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                      <Plus size={22} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">New Package</p>
                      <p className="text-xs text-slate-500 mt-0.5">Create credit package</p>
                    </div>
                  </button>
                  <button onClick={() => setActivePage('zones')} className="flex flex-col items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all active:scale-[0.98] text-left">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
                      <Building2 size={22} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">View Zones</p>
                      <p className="text-xs text-slate-500 mt-0.5">Manage all zones</p>
                    </div>
                  </button>
                  <button onClick={() => setActivePage('credits')} className="flex flex-col items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all active:scale-[0.98] text-left">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
                      <Coins size={22} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Transactions</p>
                      <p className="text-xs text-slate-500 mt-0.5">View history</p>
                    </div>
                  </button>
                </div>
              </Card>

              {/* Recent Zones */}
              <Card
                title="Recent Zones"
                subtitle={`${stats.total} total zones`}
                action={<Button variant="ghost" size="sm" onClick={() => setActivePage('zones')} iconRight={ChevronRight}>View all</Button>}
              >
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
                  </div>
                ) : zones.length === 0 ? (
                  <EmptyState icon={Building2} title="No zones yet" description="Create a game zone to get started" />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {zones.slice(0, 4).map(zone => (
                      <ZoneCard key={pickZoneId(zone)} zone={zone} onClick={() => openZoneDetails(zone)} />
                    ))}
                  </div>
                )}
              </Card>
            </>
          )}

          {/* ==================== ZONES ==================== */}
          {activePage === 'zones' && (
            <>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search zones by name, owner, or phone..."
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-base outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="md" icon={Filter}><span className="hidden sm:inline">Filter</span></Button>
                  <Button variant="primary" size="md" icon={Plus} onClick={() => openGrantModal()}>Grant</Button>
                </div>
              </div>

              <Card title={`Game Zones`} subtitle={`${filteredZones.length} of ${zones.length} zones`} noPadding>
                {loading ? (
                  <div className="p-5 space-y-3">
                    {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 w-full" />)}
                  </div>
                ) : filteredZones.length === 0 ? (
                  <EmptyState icon={Building2} title="No zones found" description={searchQuery ? 'Try a different search term' : 'No game zones configured yet'} />
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/50">
                            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Zone</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Owner</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Phone</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Balance</th>
                            <th className="px-5 py-3 w-10"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredZones.map(zone => (
                            <ZoneRow key={pickZoneId(zone)} zone={zone} onClick={() => openZoneDetails(zone)} />
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Mobile Cards */}
                    <div className="md:hidden p-4 grid gap-3">
                      {filteredZones.map(zone => (
                        <ZoneCard key={pickZoneId(zone)} zone={zone} onClick={() => openZoneDetails(zone)} />
                      ))}
                    </div>
                  </>
                )}
              </Card>
            </>
          )}

          {/* ==================== PLAYERS ==================== */}
          {activePage === 'players' && (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Player Management</h2>
                  <p className="text-sm text-slate-500">Manage registered users and random players</p>
                </div>
                <Button icon={UserPlus} onClick={() => openPlayerModal()}>Add Player</Button>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input value={playerSearch} onChange={(event) => setPlayerSearch(event.target.value)} placeholder="Search name, phone, or station..." icon={Search} className="flex-1" />
                <Select value={playerTypeFilter} onChange={(event) => setPlayerTypeFilter(event.target.value)} options={[{ value: 'all', label: 'All players' }, { value: 'registered', label: 'Registered users' }, { value: 'random', label: 'Random players' }]} className="sm:w-52" />
                <Button variant="secondary" disabled={!selectedPlayerIds.length} icon={Trash2} onClick={() => handlePlayersDelete(selectedPlayerIds)}>Delete selected ({selectedPlayerIds.length})</Button>
              </div>
              <Card title="Players" subtitle={`${filteredPlayers.length} shown of ${players.length}`} noPadding>
                {loading ? <div className="p-5 space-y-3">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-16 w-full" />)}</div> : filteredPlayers.length === 0 ? <EmptyState icon={Users} title="No players found" description="Try another search or create a player" action={<Button icon={UserPlus} onClick={() => openPlayerModal()}>Add Player</Button>} /> : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px]">
                      <thead><tr className="border-b border-slate-100 bg-slate-50/60">
                        <th className="w-12 px-5 py-3"><input type="checkbox" checked={filteredPlayers.length > 0 && filteredPlayers.every((player) => selectedPlayerIds.includes(player.player_id))} onChange={(event) => setSelectedPlayerIds(event.target.checked ? filteredPlayers.map((player) => player.player_id) : [])} aria-label="Select all visible players" /></th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Player</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Type</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Station</th>
                        <th className="w-24 px-5 py-3"></th>
                      </tr></thead>
                      <tbody>{filteredPlayers.map((player) => {
                        const isRandom = player.user_id == null;
                        const name = player.random_nickname || player.nickname || player.username || `Player #${player.player_id}`;
                        const checked = selectedPlayerIds.includes(player.player_id);
                        return <tr key={player.player_id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                          <td className="px-5 py-4"><input type="checkbox" checked={checked} onChange={() => setSelectedPlayerIds((current) => checked ? current.filter((id) => id !== player.player_id) : [...current, player.player_id])} aria-label={`Select ${name}`} /></td>
                          <td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar name={name} size="sm" /><div><p className="text-sm font-semibold text-slate-900">{name}</p><p className="text-xs text-slate-500">{player.phone || player.username || 'No contact'}</p></div></div></td>
                          <td className="px-5 py-4"><Badge variant={isRandom ? 'warning' : 'info'}>{isRandom ? 'Random' : 'Registered'}</Badge></td>
                          <td className="px-5 py-4 text-sm text-slate-600">{player.station_name || (player.station_id ? `Station #${player.station_id}` : 'Unassigned')}</td>
                          <td className="px-5 py-4"><div className="flex justify-end gap-1"><button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900" title="Edit player" onClick={() => openPlayerModal(player)}><Edit3 size={16} /></button><button className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Delete player" onClick={() => handlePlayersDelete([player.player_id])}><Trash2 size={16} /></button></div></td>
                        </tr>;
                      })}</tbody>
                    </table>
                  </div>
                )}
              </Card>
            </>
          )}

          {activePage === 'admins' && adminUser?.role === 'Super Admin' && (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><h2 className="text-lg font-semibold text-slate-900">Administrator Management</h2><p className="text-sm text-slate-500">Create, update, deactivate, or remove administrator accounts</p></div>
                <Button icon={UserPlus} onClick={() => openAdminModal()}>Add Administrator</Button>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input value={adminSearch} onChange={(event) => setAdminSearch(event.target.value)} placeholder="Search administrators..." icon={Search} className="flex-1" />
                <Button variant="secondary" disabled={!selectedAdminIds.length} icon={Trash2} onClick={() => handleAdminsDelete(selectedAdminIds)}>Delete selected ({selectedAdminIds.length})</Button>
              </div>
              <Card title="Administrators" subtitle={`${filteredAdmins.length} shown of ${admins.length}`} noPadding>
                {filteredAdmins.length === 0 ? <EmptyState icon={Shield} title="No administrators found" description="Create an administrator account to get started" action={<Button icon={UserPlus} onClick={() => openAdminModal()}>Add Administrator</Button>} /> : <div className="overflow-x-auto"><table className="w-full min-w-[700px]"><thead><tr className="border-b border-slate-100 bg-slate-50/60"><th className="w-12 px-5 py-3"><input type="checkbox" checked={filteredAdmins.every((admin) => selectedAdminIds.includes(admin.admin_id))} onChange={(event) => setSelectedAdminIds(event.target.checked ? filteredAdmins.map((admin) => admin.admin_id) : [])} aria-label="Select all administrators" /></th><th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Administrator</th><th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Role</th><th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th><th className="w-24 px-5 py-3"></th></tr></thead><tbody>{filteredAdmins.map((admin) => { const name = admin.admin_name || `Admin #${admin.admin_id}`; const checked = selectedAdminIds.includes(admin.admin_id); return <tr key={admin.admin_id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50"><td className="px-5 py-4"><input type="checkbox" checked={checked} onChange={() => setSelectedAdminIds((current) => checked ? current.filter((id) => id !== admin.admin_id) : [...current, admin.admin_id])} aria-label={`Select ${name}`} /></td><td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar name={name} size="sm" /><div><p className="text-sm font-semibold text-slate-900">{name}</p><p className="text-xs text-slate-500">{admin.phone || 'No phone'}</p></div></div></td><td className="px-5 py-4"><Badge variant={admin.role === 'Super Admin' ? 'purple' : 'info'}>{admin.role || 'Admin'}</Badge></td><td className="px-5 py-4"><Badge variant={admin.status === 'Inactive' ? 'danger' : 'success'}>{admin.status || 'Active'}</Badge></td><td className="px-5 py-4"><div className="flex justify-end gap-1"><button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900" title="Edit administrator" onClick={() => openAdminModal(admin)}><Edit3 size={16} /></button><button className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Delete administrator" onClick={() => handleAdminsDelete([admin.admin_id])}><Trash2 size={16} /></button></div></td></tr>; })}</tbody></table></div>}
              </Card>
            </>
          )}

          {/* ==================== CREDITS ==================== */}
          {activePage === 'credits' && (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Credit Management</h2>
                  <p className="text-sm text-slate-500">View and manage zone credit transactions</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" icon={TrendingDown} onClick={() => handleDeductCredits(selectedZone)}>Revoke Credits</Button>
                  <Button variant="primary" icon={Plus} onClick={() => openGrantModal()}>Grant Credits</Button>
                </div>
              </div>

              <Select
                label="Select Zone"
                value={selectedZoneId}
                onChange={e => setSelectedZoneId(e.target.value)}
                options={[{ value: '', label: 'Choose a zone...' }, ...zones.map(z => ({ value: pickZoneId(z), label: z.zone_name || `Zone #${pickZoneId(z)}` }))]}
              />

              {selectedZone ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${selectedZone.is_verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {selectedZone.is_verified ? <BadgeCheck size={24} /> : <Clock3 size={24} />}
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Status</p>
                        <p className="text-sm font-semibold text-slate-900">{selectedZone.is_verified ? 'Verified' : 'Pending'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                      <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                        <Wallet size={24} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Balance</p>
                        <p className="text-lg font-bold text-slate-900">{Number(selectedZone.balance || 0).toLocaleString()} <span className="text-sm text-slate-500">Br</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                      <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                        <Coins size={24} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Transactions</p>
                        <p className="text-lg font-bold text-slate-900">{zoneCredits.length}</p>
                      </div>
                    </div>
                  </div>

                  <Card title="Transaction History" noPadding>
                    {zoneCredits.length === 0 ? (
                      <EmptyState icon={Coins} title="No transactions yet" description="Credit activity will appear here once you grant credits" action={<Button icon={Plus} onClick={() => openGrantModal(selectedZone)}>Grant Credits</Button>} />
                    ) : (
                      zoneCredits.map((credit, i) => <CreditRow key={credit.zone_credit_id || credit.id || i} credit={credit} onClick={() => {}} />)
                    )}
                  </Card>
                </>
              ) : (
                <Card>
                  <EmptyState icon={Coins} title="Select a zone" description="Choose a zone above to view credit history and manage transactions" />
                </Card>
              )}
            </>
          )}

          {/* ==================== PACKAGES ==================== */}
          {activePage === 'packages' && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Credit Packages</h2>
                  <p className="text-sm text-slate-500">{packages.length} packages configured</p>
                </div>
                <Button icon={Plus} onClick={() => openPackageModal()}>New Package</Button>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-64 w-full" />)}
                </div>
              ) : packages.length === 0 ? (
                <Card>
                  <EmptyState
                    icon={Package}
                    title="No packages yet"
                    description="Create your first credit package to offer to game zones"
                    action={<Button icon={Plus} onClick={() => openPackageModal()}>Create Package</Button>}
                  />
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {packages.map(pkg => (
                    <PackageCard
                      key={pickPackageId(pkg)}
                      pkg={pkg}
                      onEdit={() => openPackageModal(pkg)}
                      onDelete={() => handlePackageDelete(pkg)}
                      deleting={actionLoading === `del-${pickPackageId(pkg)}`}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activePage === 'costs' && adminUser?.role === 'Super Admin' && (
            <>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">System Costs</h2>
                <p className="text-sm text-slate-500">Configure automatic cost rules used for zone credit grants.</p>
              </div>
              <SystemCosts costs={systemCosts} zones={zones} loading={actionLoading} onSave={handleSystemCostSave} onDelete={handleSystemCostDelete} />
            </>
          )}
        </div>
      </div>

      {/* ==================== MODALS ==================== */}

      {/* Zone Details Modal */}
      <Modal
        isOpen={showZoneDetails}
        onClose={() => setShowZoneDetails(false)}
        title={selectedZoneForDetails?.zone_name || 'Zone Details'}
        subtitle={`Zone #${pickZoneId(selectedZoneForDetails)}`}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowZoneDetails(false)}>Close</Button>
            <Button variant="soft" icon={Edit3} onClick={() => openZoneEdit(selectedZoneForDetails)}>Edit Zone</Button>
            <Button variant="primary" icon={Gift} onClick={() => { setShowZoneDetails(false); openGrantModal(selectedZoneForDetails); }}>Grant Credits</Button>
          </>
        }
      >
        {selectedZoneForDetails && (
          <div className="space-y-6">
            {/* Zone Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={16} className="text-slate-500" />
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Owner</span>
                </div>
                <p className="text-sm font-semibold text-slate-900">{selectedZoneForDetails.owner_name || '—'}</p>
                <p className="text-xs text-slate-500 mt-0.5">{selectedZoneForDetails.owner_phone || 'No phone'}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet size={16} className="text-slate-500" />
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Balance</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{Number(selectedZoneForDetails.balance || 0).toLocaleString()}</p>
                <p className="text-xs text-slate-500">Br</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={16} className="text-slate-500" />
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Address</span>
                </div>
                <p className="text-sm text-slate-700">{selectedZoneForDetails.address || 'No address provided'}</p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <Badge variant={selectedZoneForDetails.is_verified ? 'success' : 'warning'} icon={selectedZoneForDetails.is_verified ? BadgeCheck : Clock3}>
                  {selectedZoneForDetails.is_verified ? 'Verified' : 'Pending Verification'}
                </Badge>
              </div>
              <div className="flex gap-2">
                {!selectedZoneForDetails.is_verified ? (
                  <Button variant="success" size="sm" icon={BadgeCheck} onClick={() => handleZoneVerify(selectedZoneForDetails, true)}>Verify</Button>
                ) : (
                  <Button variant="secondary" size="sm" icon={Clock3} onClick={() => handleZoneVerify(selectedZoneForDetails, false)}>Unverify</Button>
                )}
              </div>
            </div>

            {/* Recent Transactions */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Recent Transactions</h4>
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                {selectedZoneForDetails.credits && selectedZoneForDetails.credits.length > 0 ? (
                  selectedZoneForDetails.credits.slice(0, 5).map((credit, i) => <CreditRow key={i} credit={credit} />)
                ) : (
                  <div className="p-6 text-center text-sm text-slate-500">No transactions yet</div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Zone Edit Modal */}
      <Modal
        isOpen={showZoneEdit}
        onClose={() => setShowZoneEdit(false)}
        title="Edit Zone"
        subtitle="Update zone information"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowZoneEdit(false)}>Cancel</Button>
            <Button variant="primary" icon={Save} loading={actionLoading === 'zone-save'} onClick={handleZoneSave}>Save Changes</Button>
          </>
        }
      >
        <form onSubmit={handleZoneSave} className="space-y-4">
          <Input label="Zone Name" value={zoneForm.zone_name} onChange={e => setZoneForm(p => ({ ...p, zone_name: e.target.value }))} icon={Building2} />
          <Input label="Owner Name" value={zoneForm.owner_name} onChange={e => setZoneForm(p => ({ ...p, owner_name: e.target.value }))} icon={Users} />
          <Input label="Phone" type="tel" value={zoneForm.owner_phone} onChange={e => setZoneForm(p => ({ ...p, owner_phone: e.target.value }))} icon={Phone} />
          <Textarea label="Address" rows={3} value={zoneForm.address} onChange={e => setZoneForm(p => ({ ...p, address: e.target.value }))} />
        </form>
      </Modal>

      {/* Grant Credits Modal */}
      <Modal
        isOpen={showGrantModal}
        onClose={() => setShowGrantModal(false)}
        title="Grant Credits"
        subtitle="Add credits to a game zone"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowGrantModal(false)}>Cancel</Button>
            <Button variant="primary" icon={Gift} loading={actionLoading === 'grant'} onClick={handleGrantCredits}>Grant Credits</Button>
          </>
        }
      >
        <form onSubmit={handleGrantCredits} className="space-y-4">
          <Select
            label="Zone"
            value={grantForm.zoneId}
            onChange={e => setGrantForm(p => ({ ...p, zoneId: e.target.value }))}
            options={[{ value: '', label: 'Choose a zone...' }, ...zones.map(z => ({ value: pickZoneId(z), label: z.zone_name || `Zone #${pickZoneId(z)}` }))]}
          />
          <Select
            label="Package (optional)"
            value={grantForm.creditId}
            onChange={e => setGrantForm(p => ({ ...p, creditId: e.target.value }))}
            options={[{ value: '', label: 'Use manual amount' }, ...packages.map(p => ({ value: pickPackageId(p), label: `${p.credit_name} — ${p.credit_amount} Br` }))]}
          />
          <Select
            label="System cost (optional)"
            value={grantForm.costId || ''}
            onChange={e => setGrantForm(p => ({ ...p, costId: e.target.value }))}
            options={[{ value: '', label: 'Automatically use matching rule' }, ...systemCosts.map(cost => ({ value: cost.cost_id, label: `${cost.cost_reason} — ${Number(cost.amount || 0).toFixed(2)}` }))]}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Amount" type="number" value={grantForm.amount} onChange={e => setGrantForm(p => ({ ...p, amount: e.target.value }))} placeholder="0" icon={Coins} />
            <Select
              label="Type"
              value={grantForm.transaction_type}
              onChange={e => setGrantForm(p => ({ ...p, transaction_type: e.target.value }))}
              options={[
                { value: 'Bonus', label: '🎁 Bonus' },
                { value: 'Manual', label: '✋ Manual' },
                { value: 'Registration', label: '📝 Registration' },
                { value: 'Purchase', label: '💳 Purchase' },
              ]}
            />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        title={selectedAdminForEdit ? 'Edit Administrator' : 'Add Administrator'}
        subtitle="Manage account access and permissions"
        footer={<><Button variant="secondary" onClick={() => setShowAdminModal(false)}>Cancel</Button><Button icon={Save} loading={actionLoading === 'admin-save'} onClick={handleAdminSave}>{selectedAdminForEdit ? 'Save Changes' : 'Create Administrator'}</Button></>}
      >
        <form onSubmit={handleAdminSave} className="space-y-4">
          <Input label="Name" value={adminForm.admin_name} onChange={(event) => setAdminForm((current) => ({ ...current, admin_name: event.target.value }))} icon={UserPlus} placeholder="Full name" />
          <Input label="Phone" type="tel" value={adminForm.phone} onChange={(event) => setAdminForm((current) => ({ ...current, phone: event.target.value }))} icon={Phone} placeholder="Phone number" />
          <Select label="Role" value={adminForm.role} onChange={(event) => setAdminForm((current) => ({ ...current, role: event.target.value }))} options={['Admin', 'System Admin', 'Support', 'Manager', 'Super Admin'].map((role) => ({ value: role, label: role }))} />
          <Select label="Status" value={adminForm.status} onChange={(event) => setAdminForm((current) => ({ ...current, status: event.target.value }))} options={[{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }]} />
          <Input label={selectedAdminForEdit ? 'New password (optional)' : 'Password'} type="password" value={adminForm.password} onChange={(event) => setAdminForm((current) => ({ ...current, password: event.target.value }))} placeholder="At least 6 characters" />
        </form>
      </Modal>

      {/* Player Create/Edit Modal */}
      <Modal
        isOpen={showPlayerModal}
        onClose={() => setShowPlayerModal(false)}
        title={selectedPlayerForEdit ? 'Edit Player' : 'Add Player'}
        subtitle={selectedPlayerForEdit ? 'Update player assignment' : 'Create a registered or random player'}
        footer={<><Button variant="secondary" onClick={() => setShowPlayerModal(false)}>Cancel</Button><Button icon={Save} loading={actionLoading === 'player-save'} onClick={handlePlayerSave}>{selectedPlayerForEdit ? 'Save Changes' : 'Create Player'}</Button></>}
      >
        <form onSubmit={handlePlayerSave} className="space-y-4">
          {!selectedPlayerForEdit && <Select label="Player type" value={playerForm.player_type} onChange={(event) => setPlayerForm((current) => ({ ...current, player_type: event.target.value }))} options={[{ value: 'random', label: 'Random player' }, { value: 'registered', label: 'Registered user' }]} />}
          {!selectedPlayerForEdit && playerForm.player_type === 'registered' && <Select label="Registered user" value={playerForm.user_id} onChange={(event) => setPlayerForm((current) => ({ ...current, user_id: event.target.value }))} options={[{ value: '', label: 'Choose a user...' }, ...users.map((user) => ({ value: user.user_id, label: `${user.username} (${user.phone || 'no phone'})` }))]} />}
          {(!selectedPlayerForEdit && playerForm.player_type === 'random' || selectedPlayerForEdit && selectedPlayerForEdit.user_id == null) && <Input label="Nickname" value={playerForm.nickname} onChange={(event) => setPlayerForm((current) => ({ ...current, nickname: event.target.value }))} placeholder="Guest name" icon={UserPlus} />}
          <Select label="Station" value={playerForm.station_id} onChange={(event) => setPlayerForm((current) => ({ ...current, station_id: event.target.value }))} options={[{ value: '', label: 'Choose a station...' }, ...stations.map((station) => ({ value: station.id ?? station.station_id, label: station.station_name || `Station #${station.id ?? station.station_id}` }))]} />
        </form>
      </Modal>

      {/* Package Edit/Create Modal */}
      <Modal
        isOpen={showPackageModal}
        onClose={() => setShowPackageModal(false)}
        title={selectedPackageForEdit ? 'Edit Package' : 'Create Package'}
        subtitle={selectedPackageForEdit ? 'Update package details' : 'Configure a new credit package'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowPackageModal(false)}>Cancel</Button>
            <Button variant="primary" icon={Save} loading={actionLoading === 'package-save'} onClick={handlePackageSave}>
              {selectedPackageForEdit ? 'Save Changes' : 'Create Package'}
            </Button>
          </>
        }
      >
        <form onSubmit={handlePackageSave} className="space-y-4">
          <Input label="Package Name" value={packageForm.credit_name} onChange={e => setPackageForm(p => ({ ...p, credit_name: e.target.value }))} placeholder="e.g., Starter Pack" icon={Package} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Credits" type="number" value={packageForm.credit_amount} onChange={e => setPackageForm(p => ({ ...p, credit_amount: e.target.value }))} placeholder="100" icon={Coins} />
            <Input label="Duration (days)" type="number" value={packageForm.duration_days} onChange={e => setPackageForm(p => ({ ...p, duration_days: e.target.value }))} placeholder="30" icon={Timer} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Price (Br)" type="number" value={packageForm.price} onChange={e => setPackageForm(p => ({ ...p, price: e.target.value }))} placeholder="0" icon={DollarSign} />
            <Select
              label="Distribution"
              value={packageForm.offered_by}
              onChange={e => setPackageForm(p => ({ ...p, offered_by: e.target.value }))}
              options={[
                { value: 'Registration', label: '📝 Registration' },
                { value: 'Payment', label: '💳 Payment' },
              ]}
            />
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!showConfirm}
        onClose={() => setShowConfirm(null)}
        title={showConfirm?.title}
        message={showConfirm?.message}
        confirmLabel={showConfirm?.confirmLabel}
        variant={showConfirm?.variant}
        loading={!!actionLoading}
        onConfirm={showConfirm?.onConfirm}
      />

      <MobileBottomNav activePage={activePage} onNavigate={setActivePage} adminRole={adminRole} />
    </div>
  );
}