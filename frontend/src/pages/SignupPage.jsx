import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthHeroCarousel from '../components/AuthHeroCarousel';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function GoogleIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
    </svg>
  );
}

export default function SignupPage() {
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required.';
    if (!form.email || !form.email.trim()) {
      e.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      e.email = 'Please enter a valid email address.';
    }
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      return;
    }

    setLoading(true);
    const result = await signup(form.name, form.email, form.password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setServerError(result.error || 'Registration failed. Please try again.');
    }
  };

  const handleGoogleSignUp = async () => {
    setErrors({});
    setServerError('');
    setGoogleLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    await loginWithGoogle();
    setGoogleLoading(false);
    navigate('/dashboard');
  };

  return (
    <div className="relative flex w-full min-h-screen justify-between items-center overflow-x-hidden">
      {/* Full-Screen Background Carousel & Left Details */}
      <AuthHeroCarousel />

      {/* Right Column — Fixed Position Form Card */}
      <div className="w-full lg:w-5/12 flex flex-col justify-center items-center px-4 sm:px-10 xl:px-14 py-8 z-20 overflow-y-auto">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-[#EADBCE] shadow-2xl shadow-black/30">
          {/* Brand Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-2xl bg-[#0057d9] flex items-center justify-center text-white shadow-lg">
              <span className="material-symbols-outlined text-2xl">flight_takeoff</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#191c1e] tracking-tight">GlobeTrotter</h1>
              <p className="text-xs text-[#8A715F] font-semibold">Intelligent Travel Planner</p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-5">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#191c1e] mb-1 tracking-tight">Create your account</h2>
            <p className="text-sm text-[#6B5646]">
              Plan trips and explore global destinations.
            </p>
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <div className="mb-4 p-3.5 rounded-xl bg-[#FFF5F2] border border-[#F4C2B8] text-[#93000A] text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
              <span className="material-symbols-outlined text-red-500 text-lg">error</span>
              <span>{serverError}</span>
            </div>
          )}

          {/* Google Sign-up Button */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={googleLoading || loading}
            className="w-full py-3 px-4 bg-[#FDFBF7] hover:bg-[#F5EFE6] border border-[#D8C6B6] text-[#2A180C] rounded-xl text-sm font-semibold shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 mb-4"
          >
            {googleLoading ? (
              <span className="material-symbols-outlined animate-spin text-lg text-[#0057d9]">progress_activity</span>
            ) : (
              <>
                <GoogleIcon />
                <span>Sign up with Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="mb-4 flex items-center">
            <div className="flex-grow border-t border-[#E5D7CA]" />
            <span className="px-3 text-xs text-[#8A715F] font-semibold uppercase tracking-wider">or sign up with email</span>
            <div className="flex-grow border-t border-[#E5D7CA]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5A4536] mb-1">
                Full Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A715F] text-xl">
                  person
                </span>
                <input
                  type="text"
                  placeholder="Alex Johnson"
                  value={form.name}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, name: e.target.value }));
                    if (errors.name) setErrors(p => ({ ...p, name: null }));
                  }}
                  className={`w-full pl-11 pr-4 py-2 bg-[#FAF7F2] border rounded-xl text-sm text-[#2A180C] placeholder:text-[#9E8777] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0057d9]/20 transition-all shadow-sm ${
                    errors.name ? 'border-red-500 ring-1 ring-red-500 bg-red-50/30' : 'border-[#D8C6B6]'
                  }`}
                  required
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.name}</p>}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5A4536] mb-1">
                Email address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A715F] text-xl">
                  mail
                </span>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, email: e.target.value }));
                    if (errors.email) setErrors(p => ({ ...p, email: null }));
                  }}
                  className={`w-full pl-11 pr-4 py-2 bg-[#FAF7F2] border rounded-xl text-sm text-[#2A180C] placeholder:text-[#9E8777] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0057d9]/20 transition-all shadow-sm ${
                    errors.email ? 'border-red-500 ring-1 ring-red-500 bg-red-50/30' : 'border-[#D8C6B6]'
                  }`}
                  required
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5A4536] mb-1">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A715F] text-xl">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, password: e.target.value }));
                    if (errors.password) setErrors(p => ({ ...p, password: null }));
                  }}
                  className={`w-full pl-11 pr-10 py-2 bg-[#FAF7F2] border rounded-xl text-sm text-[#2A180C] placeholder:text-[#9E8777] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0057d9]/20 transition-all shadow-sm ${
                    errors.password ? 'border-red-500 ring-1 ring-red-500 bg-red-50/30' : 'border-[#D8C6B6]'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A715F] hover:text-[#191c1e] text-lg focus:outline-none cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5A4536] mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A715F] text-xl">
                  lock_reset
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  value={form.confirm}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, confirm: e.target.value }));
                    if (errors.confirm) setErrors(p => ({ ...p, confirm: null }));
                  }}
                  className={`w-full pl-11 pr-4 py-2 bg-[#FAF7F2] border rounded-xl text-sm text-[#2A180C] placeholder:text-[#9E8777] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0057d9]/20 transition-all shadow-sm ${
                    errors.confirm ? 'border-red-500 ring-1 ring-red-500 bg-red-50/30' : 'border-[#D8C6B6]'
                  }`}
                  required
                />
              </div>
              {errors.confirm && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.confirm}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-3 px-4 bg-[#0057d9] hover:bg-[#0041a7] text-white rounded-xl text-sm font-semibold shadow-md active:scale-[0.99] transition-all duration-200 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-60 mt-1"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-lg text-white">progress_activity</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <span className="material-symbols-outlined text-lg text-white">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Already have an account */}
          <p className="text-center text-sm text-[#6B5646] mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-[#0057d9] font-bold hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
