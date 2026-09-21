// pages/UserAuth.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import AuthAPI from '../api/modules/auth';

const UserAuth = ({ onAuthSuccess, onNavigateBack }) => {
  const navigate = useNavigate();
  const { 
    userLogin, 
    isUserLoading, 
    isUserAuthenticated,
    userProfile 
  } = useUserAuth();
  
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    username: '',
    email: ''
  });
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isUserAuthenticated && userProfile) {
      navigate('/user/dashboard', { replace: true });
    }
  }, [isUserAuthenticated, userProfile, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    setError('');
    
    if (!formData.phone || formData.phone.length < 10) {
      setError('Please enter a valid phone number (minimum 10 digits)');
      return false;
    }
    
    if (!/^\d+$/.test(formData.phone)) {
      setError('Phone number should contain only digits');
      return false;
    }
    
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    if (isSignUp) {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (!formData.username || formData.username.length < 3) {
        setError('Username must be at least 3 characters');
        return false;
      }
      if (formData.username.length > 100) {
        setError('Username must be less than 100 characters');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Handle Registration
        const registerData = {
          username: formData.username.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
          email: formData.email?.trim() || undefined
        };

        const response = await AuthAPI.user.register(registerData);
        

        if (response?.success) {
          setSuccess('Account created successfully! Logging in...');
          
          // Auto-login after registration
          const loginResult = await userLogin({
            phone: formData.phone.trim(),
            password: formData.password
          });
          
          if (loginResult.success) {
            onAuthSuccess?.();
          } else {
            setError('Account created but auto-login failed. Please login manually.');
          }
        } else {
          // Handle specific error messages
          const errorMsg = response?.message || 'Registration failed. Please try again.';
          setError(errorMsg);
        }
      } else {
        // Handle Login
        const loginData = {
          phone: formData.phone.trim(),
          password: formData.password
        };

        const result = await userLogin(loginData);
        
        if (result.success) {
          setSuccess('Login successful! Redirecting...');
          onAuthSuccess?.();
        } else {
          setError(result.message || 'Login failed. Please check your credentials.');
        }
      }
    } catch (err) {
      
      let errorMessage = 'An unexpected error occurred';
      
      if (err.response) {
        errorMessage = err.response.data?.message || 
                      err.response.data?.error ||
                      `Server error: ${err.response.status}`;
        
        if (err.response.status === 400) {
          errorMessage = err.response.data?.message || 'Invalid request. Please check your input.';
        } else if (err.response.status === 409) {
          errorMessage = err.response.data?.message || 'User already exists. Please login instead.';
        } else if (err.response.status === 422) {
          errorMessage = err.response.data?.message || 'Validation failed. Please check your input.';
        }
      } else if (err.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        errorMessage = err.message || 'An unexpected error occurred';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setSuccess('');
    setFormData({
      phone: '',
      password: '',
      confirmPassword: '',
      username: '',
      email: ''
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020208] p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        {onNavigateBack && (
          <button
            onClick={onNavigateBack}
            className="mb-6 text-slate-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        )}

        <div className="bg-[#0a0a1a] border border-slate-800 rounded-xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-slate-400 mt-2">
              {isSignUp 
                ? 'Sign up to start your gaming journey' 
                : 'Login to access your dashboard'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Username <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#111125] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Choose a username (3-100 characters)"
                    required
                    minLength={3}
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#111125] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Enter your email (optional)"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Phone Number <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#111125] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Enter your phone number (digits only)"
                required
                pattern="[0-9]+"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Password <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#111125] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder={isSignUp ? 'Create a password (min 6 chars)' : 'Enter your password'}
                required
                minLength={6}
              />
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Confirm Password <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#111125] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || isUserLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading || isUserLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isSignUp ? 'Creating Account...' : 'Logging in...'}
                </span>
              ) : (
                isSignUp ? 'Create Account' : 'Login'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={toggleMode}
                className="ml-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
                disabled={loading}
              >
                {isSignUp ? 'Login' : 'Sign Up'}
              </button>
            </p>
          </div>

          {!isSignUp && (
            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-sm text-slate-500 hover:text-slate-400 transition-colors"
                onClick={() => {
                  setError('');
                  setSuccess('Password reset link will be sent to your phone.');
                }}
              >
                Forgot Password?
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAuth;