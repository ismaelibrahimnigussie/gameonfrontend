import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, Building, Phone, MapPin, User,
  ArrowRight, Loader2, Sparkles, AlertCircle, ArrowLeft,
  Eye, EyeOff, CheckCircle
} from 'lucide-react';
import { useGameZoneAuth } from '../context/GameZoneAuthContext';
import { GAMEZONE_DASHBOARD_PATH } from '../config/routes';

// ==========================================
// FORM VALIDATION CONFIGURATIONS
// ==========================================
const signInSchema = z.object({
  owner_phone: z
    .string()
    .trim()
    .min(9, 'Authorized owner phone number is required')
    .regex(/^\+?[0-9]{9,15}$/, 'Invalid phone number format. Use numeric digits only (e.g., +251911223344)'),
  password: z.string().min(1, 'Access key credential signature required'),
});

const registerSchema = z.object({
  zone_name: z.string().min(3, 'Venue name identity must be at least 3 characters'),
  address: z.string().min(4, 'Physical allocation address profile parameters required'),
  owner_name: z.string().min(3, 'Administrator signature name must be at least 3 characters'),
  owner_phone: z
    .string()
    .trim()
    .min(9, 'Please map a valid physical terminal phone line')
    .regex(/^\+?[0-9]{9,15}$/, 'Invalid phone number format. Use numeric digits only (e.g., +251911223344)'),
  password: z.string().min(6, 'Access token password must exceed 5 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your validation password signature'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Security key specifications parameters mismatch",
  path: ["confirmPassword"],
});

function BrandLogoIcon() {
  return (
    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gLogoGradAuth" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00F0FF" />
          <stop offset="100%" stopColor="#7B2CBF" />
        </linearGradient>
      </defs>
      <path d="M80 32H45C32 32 22 42 22 55C22 68 32 78 45 78H75C80 78 82 74 82 68V54H58" stroke="url(#gLogoGradAuth)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
      <polygon points="54,48 54,60 64,54" fill="#00F0FF" />
    </svg>
  );
}

// ==========================================
// COMPONENT CORE LAYER
// ==========================================
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
    <div className="min-h-screen bg-[#020208] text-[#f1f5f9] font-sans antialiased flex flex-col justify-start items-center p-4 sm:p-6 md:p-12 relative overflow-x-hidden selection:bg-[#00F0FF]/20 selection:text-white">
      
      {/* BACKGROUND EFFECTS */}
      <div className="absolute top-[-5%] left-[-10%] w-[320px] h-[320px] sm:w-[500px] sm:h-[500px] bg-[#00F0FF]/5 rounded-full blur-[80px] sm:blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[5%] right-[-10%] w-[350px] h-[350px] sm:w-[600px] sm:h-[600px] bg-[#7B2CBF]/5 rounded-full blur-[90px] sm:blur-[150px] pointer-events-none z-0" />

      {/* HEADER */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-6 sm:mb-8 z-10">
        <button 
          type="button"
          onClick={onNavigateBack}
          className="text-[11px] font-extrabold text-slate-400 hover:text-white transition-all cursor-pointer flex items-center gap-2 bg-white/[0.02] border border-white/10 px-3.5 py-2 rounded-xl backdrop-blur-md active:scale-[0.97]"
        >
          <ArrowLeft size={12} strokeWidth={2.5} /> RETURN
        </button>
        
        <div className="flex lg:hidden items-center gap-2">
          <BrandLogoIcon />
          <span className="font-black tracking-widest text-xs uppercase text-white font-mono">
            GAME<span className="text-[#00F0FF]">ON</span>
          </span>
        </div>
      </div>

      {/* MAIN AUTH CARD */}
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-[#090914]/60 border border-white/5 rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_24px_70px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl relative z-10 m-auto">
        
        {/* DESKTOP BRAND COLUMN */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-b from-black/20 via-transparent to-black/30 p-10 flex-col justify-between relative border-r border-white/[0.03]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,240,255,0.02),_transparent_60%)] pointer-events-none" />
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={onNavigateBack}>
            <BrandLogoIcon />
            <span className="font-extrabold tracking-widest text-base text-white font-mono uppercase">
              GAME<span className="text-[#00F0FF]">ON</span>
            </span>
          </div>

          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.02] border border-white/10 text-[10px] font-bold tracking-widest text-[#00F0FF] uppercase w-fit">
              <Sparkles size={11} className="animate-pulse" /> SYSTEM ACCESS MODULE
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight uppercase font-mono leading-snug">
              Power Up Your <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#7B2CBF]">Lounge Matrix.</span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Automate local arcade token emissions, handle consolidated user transactions, 
              track terminal response logs, and monitor gaming metrics in real-time.
            </p>
          </div>

          <footer className="text-[9px] text-slate-600 font-mono tracking-widest uppercase">
            Core Secure Interface v4.0.0
          </footer>
        </div>

        {/* FORM PANEL */}
        <div className="lg:col-span-7 p-5 sm:p-8 md:p-12 flex flex-col justify-center bg-transparent">
          
          <div className="mb-6 sm:mb-8 text-center lg:text-left">
            <h1 className="text-lg sm:text-2xl font-black text-white uppercase font-mono tracking-wide">
              {authMode === 'signin' ? 'Connect Arena Node' : 'Register Arena Node'}
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-sm mx-auto lg:mx-0">
              {authMode === 'signin' 
                ? 'Connect using your terminal owner phone string profile.' 
                : 'Transmit your layout parameters directly into our global physical directory cluster.'}
            </p>
          </div>

          {/* MESSAGES */}
          {apiError && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-red-500/5 border border-red-500/10 text-red-400 rounded-xl text-xs font-semibold animate-fadeIn">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" /> 
              <span className="leading-tight">{apiError}</span>
            </div>
          )}
          {apiSuccess && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 rounded-xl text-xs font-semibold animate-fadeIn">
              <CheckCircle size={15} className="flex-shrink-0 mt-0.5" /> 
              <span className="leading-tight">{apiSuccess}</span>
            </div>
          )}

          {/* FORM */}
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

          {/* TOGGLE MODE */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500 leading-normal">
              {authMode === 'signin' ? "Don't have a configured hub terminal?" : "Already registered your venue node?"}{' '}
              <button 
                type="button" 
                onClick={toggleMode}
                className="text-[#00F0FF] font-extrabold hover:underline bg-transparent border-none cursor-pointer p-0 ml-1.5 focus:outline-none inline-block"
              >
                {authMode === 'signin' ? 'Register Hub Arena' : 'Sign In'}
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}