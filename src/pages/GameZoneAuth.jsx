import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import {
  Lock, Building, Phone, MapPin, User,
  ArrowRight, Loader2, Eye, EyeOff,
} from 'lucide-react';
import { useGameZoneAuth } from '../context/GameZoneAuthContext';
import { GAMEZONE_DASHBOARD_PATH } from '../config/routes';
import GameZoneAuthLayout from './GameZoneAuthParts';
import { registerSchema, signInSchema } from './gameZoneAuthSchemas';

export default function GameZoneAuth({ onNavigateBack, onAuthSuccess }) {
  const {
    zoneLogin,
    zoneRegister,
    isZoneLoading,
  } = useGameZoneAuth();
  
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState('signin'); 
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const activeSchema = authMode === 'signin' ? signInSchema : registerSchema;

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: zodResolver(activeSchema),
    mode: 'onChange'
  });

  const toggleMode = () => {
    setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
    setApiError('');
    setApiSuccess('');
    reset();
  };

  const handlePhoneChange = (e) => {
    const rawVal = e.target.value;
    let filteredValue = rawVal.replace(/(?!^\+)[^\d]/g, '');
    
    if (filteredValue.startsWith('+')) {
      filteredValue = '+' + filteredValue.slice(1).replace(/\+/g, '');
    } else {
      filteredValue = filteredValue.replace(/\+/g, '');
    }

    setValue('owner_phone', filteredValue, { shouldValidate: true });
  };

  const handlePhoneInputFilter = (e) => {
    const allowedKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 
      'Home', 'End', 'Enter', '+', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
    ];
    
    if (!allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError('');
    setApiSuccess('');

    const sanitizedPhone = data.owner_phone.trim().replace(/\s+/g, '');

    try {
      if (authMode === 'signin') {
        const result = await zoneLogin({
          owner_phone: sanitizedPhone,
          password: data.password
        });

        if (result.success) {
          setApiSuccess('Authentication successful! Redirecting to dashboard...');
          if (typeof onAuthSuccess === 'function') {
            onAuthSuccess();
          } else {
            navigate(GAMEZONE_DASHBOARD_PATH);
          }
        } else {
          setApiError(result.message || 'Authentication failed. Please check your credentials.');
        }
      } else {
        const result = await zoneRegister({
          zone_name: data.zone_name,
          address: data.address,
          owner_name: data.owner_name,
          owner_phone: sanitizedPhone,
          password: data.password
        });

        if (result.success) {
          if (result.autoLoginFailed) {
            // Registration succeeded but auto-login failed
            setApiSuccess('Registration successful! Please sign in manually.');
            setAuthMode('signin');
            reset();
          } else {
            setApiSuccess('Registration successful! Redirecting to dashboard...');
            if (typeof onAuthSuccess === 'function') {
              onAuthSuccess();
            } else {
              navigate(GAMEZONE_DASHBOARD_PATH);
            }
          }
        } else {
          setApiError(result.message || 'Registration failed. Please try again.');
        }
      }
    } catch (error) {
      setApiError(
        error.response?.data?.message || 
        error.message || 
        'An unexpected error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <GameZoneAuthLayout
      onNavigateBack={onNavigateBack}
      authMode={authMode}
      apiError={apiError}
      apiSuccess={apiSuccess}
      onToggleMode={toggleMode}
    >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Zone Name - Signup only */}
            {authMode === 'signup' && (
              <div className="space-y-1 animate-fadeIn">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block pl-0.5">
                  Venue Name (zone_name) *
                </label>
                <div className="relative">
                  <Building size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input 
                    {...register('zone_name')} 
                    placeholder="e.g. Nexus Gaming Hub" 
                    className="w-full bg-[#020208]/60 text-xs text-white placeholder-slate-700 pl-10 pr-4 py-3.5 rounded-xl border border-white/5 focus:border-[#00F0FF]/30 focus:outline-none transition-all duration-200" 
                  />
                </div>
                {errors.zone_name && (
                  <p className="text-[10px] text-red-400 font-semibold pl-0.5">{errors.zone_name.message}</p>
                )}
              </div>
            )}

            {/* Owner Name - Signup only */}
            {authMode === 'signup' && (
              <div className="space-y-1 animate-fadeIn">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block pl-0.5">
                  Owner Full Name (owner_name) *
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input 
                    {...register('owner_name')} 
                    placeholder="e.g. John Doe" 
                    className="w-full bg-[#020208]/60 text-xs text-white placeholder-slate-700 pl-10 pr-4 py-3.5 rounded-xl border border-white/5 focus:border-[#00F0FF]/30 focus:outline-none transition-all duration-200" 
                  />
                </div>
                {errors.owner_name && (
                  <p className="text-[10px] text-red-400 font-semibold pl-0.5">{errors.owner_name.message}</p>
                )}
              </div>
            )}

            {/* Phone Number - Always shown */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block pl-0.5">
                Owner Phone Number (owner_phone) *
              </label>
              <div className="relative">
                <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input 
                  {...register('owner_phone')} 
                  onKeyDown={handlePhoneInputFilter}
                  onChange={handlePhoneChange}
                  placeholder="e.g. +251911223344" 
                  type="text" 
                  className="w-full bg-[#020208]/60 text-xs text-white placeholder-slate-700 pl-10 pr-4 py-3.5 rounded-xl border border-white/5 focus:border-[#00F0FF]/30 focus:outline-none transition-all duration-200" 
                />
              </div>
              {errors.owner_phone && (
                <p className="text-[10px] text-red-400 font-semibold pl-0.5">{errors.owner_phone.message}</p>
              )}
            </div>

            {/* Address - Signup only */}
            {authMode === 'signup' && (
              <div className="space-y-1 animate-fadeIn">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block pl-0.5">
                  Physical Location Address (address) *
                </label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input 
                    {...register('address')} 
                    placeholder="City, Sub-city, Sector Coordinate" 
                    className="w-full bg-[#020208]/60 text-xs text-white placeholder-slate-700 pl-10 pr-4 py-3.5 rounded-xl border border-white/5 focus:border-[#00F0FF]/30 focus:outline-none transition-all duration-200" 
                  />
                </div>
                {errors.address && (
                  <p className="text-[10px] text-red-400 font-semibold pl-0.5">{errors.address.message}</p>
                )}
              </div>
            )}

            {/* Password - Always shown */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block pl-0.5">
                Terminal Access Password *
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input 
                  {...register('password')} 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  className="w-full bg-[#020208]/60 text-xs text-white placeholder-slate-700 pl-10 pr-12 py-3.5 rounded-xl border border-white/5 focus:border-[#00F0FF]/30 focus:outline-none transition-all duration-200" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors p-1 rounded-md"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[10px] text-red-400 font-semibold pl-0.5">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password - Signup only */}
            {authMode === 'signup' && (
              <div className="space-y-1 animate-fadeIn">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block pl-0.5">
                  Confirm Password Verification *
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input 
                    {...register('confirmPassword')} 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    placeholder="••••••••" 
                    className="w-full bg-[#020208]/60 text-xs text-white placeholder-slate-700 pl-10 pr-12 py-3.5 rounded-xl border border-white/5 focus:border-[#00F0FF]/30 focus:outline-none transition-all duration-200" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors p-1 rounded-md"
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-[10px] text-red-400 font-semibold pl-0.5">{errors.confirmPassword.message}</p>
                )}
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button 
              type="submit" 
              disabled={loading || isZoneLoading}
              className="w-full !mt-6 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#7B2CBF] text-white font-extrabold text-xs uppercase tracking-widest active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none shadow-[0_4px_20px_rgba(0,240,255,0.15)] cursor-pointer"
            >
              {loading || isZoneLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Processing Connection Array...
                </>
              ) : (
                <>
                  {authMode === 'signin' ? 'Link Terminal Node' : 'Transmit Node Allocation'}
                  <ArrowRight size={13} strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>
    </GameZoneAuthLayout>
  );
}
