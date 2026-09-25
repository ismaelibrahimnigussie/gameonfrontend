import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { Button } from './ui';

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
