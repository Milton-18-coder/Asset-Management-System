import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess, DEMO_USERS } from '../store/authSlice';
import { Icon } from '../components/UIComponents';

export const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.auth);
  
  // React useRef hooks
  const usernameInputRef = useRef(null);
  const forgotInputRef = useRef(null);
  const googleButtonRef = useRef(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // Auto-focus username input on mount or when returning to login form
  useEffect(() => {
    if (!forgotMode && usernameInputRef.current) {
      usernameInputRef.current.focus();
    }
  }, [forgotMode]);

  // Auto-focus forgot password input when forgot mode is activated
  useEffect(() => {
    if (forgotMode && !forgotSent && forgotInputRef.current) {
      forgotInputRef.current.focus();
    }
  }, [forgotMode, forgotSent]);

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  const decodeJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Failed to decode JWT:", error);
      return null;
    }
  };

  const handleCredentialResponse = (response) => {
    if (!response || !response.credential) {
      setError('Google Sign-In failed or was cancelled.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const decoded = decodeJwt(response.credential);
      if (!decoded) {
        throw new Error('Invalid token payload');
      }

      const googleUserId = decoded.sub;
      const googleUserName = decoded.name;
      const googleUserEmail = decoded.email;
      const googleUserPicture = decoded.picture;

      // Find matching demo user by email to map role & department
      const matchedKey = Object.keys(DEMO_USERS).find(
        key => DEMO_USERS[key].email?.toLowerCase() === googleUserEmail.toLowerCase()
      );
      const matchedUser = matchedKey ? DEMO_USERS[matchedKey] : null;

      const userPayload = {
        id: googleUserId,
        name: googleUserName,
        email: googleUserEmail,
        photoURL: googleUserPicture,
        provider: 'google',
        role: matchedUser ? matchedUser.role : 'deptadmin',
        department: matchedUser ? matchedUser.department : 'General',
        avatar: googleUserName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      };

      dispatch(loginSuccess(userPayload));
    } catch (err) {
      setError('Google authentication failed. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID') {
      return;
    }

    const initGoogle = () => {
      if (window.google?.accounts?.id && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
        });

        const isDark = document.documentElement.classList.contains('dark');
        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            theme: isDark ? 'filled_black' : 'outline',
            size: 'large',
            width: '100%',
            shape: 'pill',
            text: 'signin_with',
          }
        );
      }
    };

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      script.onerror = () => {
        setError('Failed to load Google Sign-In SDK.');
      };
      document.body.appendChild(script);
      return () => {
        // Clean up script on unmount
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, []);

  const handleGoogleSignInFallback = () => {
    setError('Google Sign-In is not configured. Please set a valid VITE_GOOGLE_CLIENT_ID in your .env file.');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const u = DEMO_USERS[username.toLowerCase()];
      if (u && password === 'password123') {
        dispatch(loginSuccess(u));
      } else {
        setError('Invalid username or password. Try superadmin / password123.');
        setLoading(false);
        if (usernameInputRef.current) {
          usernameInputRef.current.focus();
        }
      }
    }, 800);
  };

  if (forgotMode) {
    return (
      <div className="min-h-screen bg-slate-900 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 border border-slate-100 dark:border-slate-800">
          {forgotSent ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400">
                <Icon.Check />
              </div>
              <h2 className="font-bold text-slate-800 dark:text-white text-lg mb-2 font-display">Check your email</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Password reset instructions sent to your registered email address.</p>
              <button 
                onClick={() => { setForgotMode(false); setForgotSent(false); }}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition cursor-pointer"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={() => setForgotMode(false)} 
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-5 transition cursor-pointer"
              >
                <Icon.ArrowLeft /> Back
              </button>
              <h2 className="font-bold text-slate-800 dark:text-white text-xl mb-1 font-display">Forgot Password</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Enter your username to receive reset instructions.</p>
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Username</label>
                  <input 
                    ref={forgotInputRef}
                    type="text" 
                    placeholder="Enter your username" 
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                  />
                </div>
                <button 
                  onClick={() => setForgotSent(true)}
                  className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition cursor-pointer"
                >
                  Send Reset Link
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex transition-colors duration-300 bg-slate-50 dark:bg-slate-950">
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <p className="font-bold text-white tracking-tight font-display text-base">AssetMS</p>
            <p className="text-xs text-indigo-300">National Engineering College</p>
          </div>
        </div>

        <div className="max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-800/60 border border-indigo-700 text-indigo-200 text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Institutional Asset Intelligence
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-4 font-display leading-tight">
            Seamless Asset Audits & Campus Tracking
          </h2>
          <p className="text-indigo-200 text-sm leading-relaxed mb-8">
            Centralized inventory lifecycle management, room allocations, real-time transfers, and physical condition inspections across all college departments.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-2xl font-bold text-white font-mono">1,240+</p>
              <p className="text-xs text-indigo-300 mt-0.5 font-medium">Assets Tracked</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-2xl font-bold text-white font-mono">8 Blocks</p>
              <p className="text-xs text-indigo-300 mt-0.5 font-medium">Campus Locations</p>
            </div>
          </div>
        </div>

        <p className="text-indigo-400 text-xs font-semibold">© 2026 National Engineering College. All rights reserved.</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm dark:shadow-none">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <p className="font-bold text-slate-800 dark:text-white font-display">AssetMS</p>
          </div>

          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1.5 font-display tracking-tight leading-none">Welcome back</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">Sign in to your administrator dashboard</p>

          {error && (
            <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs rounded-xl p-3.5 mb-5 font-semibold">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block uppercase">Username</label>
              <input
                ref={usernameInputRef}
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. superadmin, deptadmin"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25 transition placeholder:text-slate-400"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block uppercase">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25 transition placeholder:text-slate-400"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={remember} 
                  onChange={e => setRemember(e.target.checked)} 
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer" 
                />
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Remember me</span>
              </label>
              <button 
                type="button" 
                onClick={() => setForgotMode(true)} 
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold transition cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-sm font-bold shadow-md shadow-indigo-600/10 active:scale-97 cursor-pointer transition disabled:opacity-75 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in…
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 dark:text-slate-500 font-bold">Or continue with</span>
            </div>
          </div>

          {import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID' ? (
            <div ref={googleButtonRef} className="w-full flex justify-center"></div>
          ) : (
            <button
              type="button"
              onClick={handleGoogleSignInFallback}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 py-3 rounded-xl text-sm font-bold shadow-sm transition active:scale-97 cursor-pointer"
            >
              <svg className="w-5 h-5 animate-pulse" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>
          )}

          <div className="mt-8 p-4 bg-indigo-50/60 dark:bg-slate-800/40 border border-indigo-100 dark:border-slate-850 rounded-2xl">
            <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300 mb-2">Demo Credentials</p>
            <div className="space-y-1 text-xs text-indigo-700 dark:text-indigo-400 font-medium">
              <p><span className="font-bold">Super Admin:</span> superadmin / password123</p>
              <p><span className="font-bold">Dept Admin:</span> deptadmin / password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
