export default function UserAuthForm({
  isSignUp,
  formData,
  handleChange,
  handleSubmit,
  error,
  success,
  loading,
  isUserLoading,
}) {
  return (
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
  );
}
