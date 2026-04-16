import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, CircleDollarSign, Building2, LogIn, AlertCircle, KeyRound, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('entrepreneur');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [otp, setOtp] = useState(['', '', '', '']);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      // Simulate validating credentials first
      await new Promise(resolve => setTimeout(resolve, 800));
      // Just step to OTP
      setStep(2);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // limit to 1 char
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length < 4) {
      setError('Please enter a valid 4-digit code');
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await login(email, password, role);
      // Redirect based on user role
      navigate(role === 'entrepreneur' ? '/dashboard/entrepreneur' : '/dashboard/investor');
    } catch (err) {
      setError((err as Error).message);
      setStep(1); // revert on failure
    } finally {
      setIsLoading(false);
    }
  };
  
  // For demo purposes, pre-filled credentials
  const fillDemoCredentials = (userRole: UserRole) => {
    if (userRole === 'entrepreneur') {
      setEmail('sarah@techwave.io');
      setPassword('password123');
    } else {
      setEmail('michael@vcinnovate.com');
      setPassword('password123');
    }
    setRole(userRole);
  };
  
  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* Left side: Branding/Hero (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img 
          src="/login-bg.png" 
          alt="Business Nexus background" 
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-primary-900/40 backdrop-blur-[2px]"></div>
        
        <div className="relative z-10 w-full flex flex-col justify-center px-12 text-white">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-2xl">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary-600">
                <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 21V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-3xl font-bold tracking-tight">Business Nexus</span>
          </div>
          
          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            Empowering the next generation of <span className="text-primary-300">innovators</span> and <span className="text-primary-300">investors</span>.
          </h1>
          
          <div className="grid grid-cols-2 gap-8 mt-12">
            <div>
              <p className="text-4xl font-bold">5,000+</p>
              <p className="text-primary-100 mt-1 opacity-80">Entrepreneurs</p>
            </div>
            <div>
              <p className="text-4xl font-bold">1,200+</p>
              <p className="text-primary-100 mt-1 opacity-80">Active Investors</p>
            </div>
          </div>
          
          <div className="mt-16 flex items-center space-x-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`w-10 h-10 rounded-full border-2 border-primary-800 bg-gray-${i*100 + 200}`} />
              ))}
            </div>
            <p className="text-sm text-primary-50">Join high-performing startups finding success today.</p>
          </div>
        </div>
        
        {/* Subtle decorative element */}
        <div className="absolute bottom-8 left-12 right-12 flex justify-between text-primary-200/60 text-xs">
          <span>&copy; 2026 Business Nexus Platform</span>
          <span className="flex space-x-4">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </span>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-gray-50 lg:bg-white overflow-y-auto">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="lg:hidden flex justify-center mb-8">
             <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                  <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 21V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
          </div>
          
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Account Login
          </h2>
          <p className="mt-3 text-sm text-gray-600 mb-8">
            Please enter your credentials to access your dashboard.
          </p>

          <div className="mt-8 transition-all duration-300">
            {error && (
              <div className="mb-6 bg-error-50 border-l-4 border-error-500 text-error-700 px-4 py-3 rounded-r-md flex items-start animate-shake">
                <AlertCircle size={18} className="mr-2 mt-0.1" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {step === 1 ? (
              <>
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                       I am a
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        className={`py-3 px-4 border-2 rounded-xl flex flex-col items-center justify-center transition-all duration-200 ${
                          role === 'entrepreneur'
                            ? 'border-primary-500 bg-primary-50 text-primary-700 ring-4 ring-primary-50'
                            : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => setRole('entrepreneur')}
                      >
                        <Building2 size={24} className="mb-1" />
                        <span className="text-xs font-bold uppercase tracking-tight">Entrepreneur</span>
                      </button>
                      
                      <button
                        type="button"
                        className={`py-3 px-4 border-2 rounded-xl flex flex-col items-center justify-center transition-all duration-200 ${
                          role === 'investor'
                            ? 'border-primary-500 bg-primary-50 text-primary-700 ring-4 ring-primary-50'
                            : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => setRole('investor')}
                      >
                        <CircleDollarSign size={24} className="mb-1" />
                        <span className="text-xs font-bold uppercase tracking-tight">Investor</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Input
                      label="EMAIL ADDRESS"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      fullWidth
                      startAdornment={<User size={18} className="text-gray-400" />}
                      className="rounded-xl border-gray-200 focus:border-primary-500 focus:ring-primary-500"
                    />
                    
                    <div className="relative">
                      <Input
                        label="PASSWORD"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        fullWidth
                        startAdornment={<LogIn size={18} className="text-gray-400" />}
                        className="rounded-xl border-gray-200 focus:border-primary-500 focus:ring-primary-500"
                      />
                      <div className="flex justify-end mt-1">
                         <a href="#" className="text-xs font-semibold text-primary-600 hover:text-primary-500">
                          Forgot password?
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded-md"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                      Keep me signed in
                    </label>
                  </div>
                  
                  <Button
                    type="submit"
                    fullWidth
                    isLoading={isLoading}
                    className="py-4 text-sm font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-primary-600/20 active:scale-[0.98] transition-transform"
                  >
                    Continue to Dashboard
                  </Button>
                </form>
                
                <div className="mt-10">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-100"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-3 bg-white text-gray-400 font-semibold uppercase tracking-widest">Demo Accounts</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <button
                      onClick={() => fillDemoCredentials('entrepreneur')}
                      className="flex items-center justify-center px-4 py-2 text-xs font-bold text-gray-600 bg-gray-50 border border-transparent rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Entrepreneur
                    </button>
                    
                    <button
                      onClick={() => fillDemoCredentials('investor')}
                      className="flex items-center justify-center px-4 py-2 text-xs font-bold text-gray-600 bg-gray-50 border border-transparent rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Investor
                    </button>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-50 text-center">
                  <p className="text-sm text-gray-600">
                    New to the platform?{' '}
                    <Link to="/register" className="font-bold text-primary-600 hover:text-primary-500 decoration-2 underline-offset-4 hover:underline">
                      Create an account
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              <div className="space-y-8 py-4 animate-fade-in-up">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-primary-100 text-primary-600 shadow-inner mb-6">
                    <KeyRound size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Security Verification</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    A unique 4-digit code was sent to <br />
                    <span className="font-bold text-gray-900">{email}</span>
                  </p>
                </div>

                <form onSubmit={handleOtpSubmit} className="space-y-8">
                  <div className="flex justify-center gap-4">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-16 h-18 text-center text-3xl font-bold bg-white border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                        required
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>

                  <div className="space-y-4">
                    <Button
                      type="submit"
                      fullWidth
                      isLoading={isLoading}
                      className="py-4 text-sm font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-primary-600/20 active:scale-[0.98] transition-transform"
                    >
                      Verify and Login
                    </Button>
                    
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full text-center text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest"
                    >
                      Back to sign in
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};