import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Lock, UserPlus, Mail, User, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';

export const LoginPage = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [signupRole, setSignupRole] = useState<'member' | 'admin'>('member');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(identifier, password);
    setLoading(false);

    if (!result.success) {
      toast.error(result.error || 'Login failed');
    } else {
      toast.success('Welcome back!');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signup(username, email, password, partnerName, signupRole, adminPasscode);
    setLoading(false);

    if (!result.success) {
      toast.error(result.error || 'Signup failed');
    } else {
      toast.success('Account created. Login now.');
      setIsSignup(false);
      setIdentifier(username);
      setPassword('');
      setEmail('');
      setAdminPasscode('');
      setSignupRole('member');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[radial-gradient(circle_at_top,_#ffe4ef_0%,_#fff3ec_40%,_#fff_100%)]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(18)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-rose-300"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: (typeof window !== 'undefined' ? window.innerHeight : 1000) + 50,
              scale: Math.random() * 0.5 + 0.5,
              opacity: 0.35,
            }}
            animate={{
              y: -100,
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            }}
            transition={{
              duration: Math.random() * 10 + 14,
              repeat: Infinity,
              ease: 'linear',
              delay: Math.random() * 4,
            }}
          >
            <Heart fill="currentColor" size={Math.random() * 18 + 12} />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-white/85 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-rose-100">
          <div className="text-center mb-7">
            <div className="inline-block mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                <Heart className="text-white" size={40} fill="white" />
              </div>
            </div>
            <h1 className="text-4xl mb-2 bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent font-bold">
              HappyValentine.in
            </h1>
            <p className="text-gray-600 text-sm">
              {isSignup ? 'Create member/admin account' : 'Login as admin or member'}
            </p>
          </div>

          <div className="flex gap-2 mb-6 bg-rose-50 p-1 rounded-lg">
            <button
              onClick={() => setIsSignup(false)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                !isSignup ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-600 hover:text-rose-600'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsSignup(true)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                isSignup ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-600 hover:text-rose-600'
              }`}
            >
              Sign Up
            </button>
          </div>

          {isSignup ? (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-gray-700 flex items-center gap-2">
                  <User size={16} /> Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                  placeholder="unique username"
                  className="mt-1 border-rose-200 focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <Label htmlFor="signup-email" className="text-gray-700 flex items-center gap-2">
                  <Mail size={16} /> Email
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="mt-1 border-rose-200 focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <Label htmlFor="signup-password" className="text-gray-700 flex items-center gap-2">
                  <Lock size={16} /> Password
                </Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="min 6 chars"
                  className="mt-1 border-rose-200 focus:border-rose-500"
                  minLength={6}
                  required
                />
              </div>

              <div>
                <Label htmlFor="partner-name" className="text-gray-700 flex items-center gap-2">
                  <Heart size={16} /> Partner Name
                </Label>
                <Input
                  id="partner-name"
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="special person name"
                  className="mt-1 border-rose-200 focus:border-rose-500"
                />
              </div>

              <div>
                <Label className="text-gray-700 flex items-center gap-2">
                  <Shield size={16} /> Account Type
                </Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSignupRole('member')}
                    className={`rounded-lg border px-3 py-2 text-sm transition ${
                      signupRole === 'member' ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-gray-200'
                    }`}
                  >
                    Member
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignupRole('admin')}
                    className={`rounded-lg border px-3 py-2 text-sm transition ${
                      signupRole === 'admin' ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-gray-200'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="admin-pass" className="text-gray-700 flex items-center gap-2">
                  <Shield size={16} /> Paid passcode key required to signup (contact admin @techtalksbynavneet for more)
                </Label>
                <Input
                  id="admin-pass"
                  type="password"
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  placeholder="Enter paid passcode key"
                  className="mt-1 border-rose-200 focus:border-rose-500"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white py-6"
              >
                <UserPlus size={18} className="mr-2" />
                {loading ? 'Creating...' : 'Create Account'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <Label htmlFor="login-id" className="text-gray-700 flex items-center gap-2">
                  <Mail size={16} /> Username or Email
                </Label>
                <Input
                  id="login-id"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="username or email"
                  className="mt-1 border-rose-200 focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <Label htmlFor="login-password" className="text-gray-700 flex items-center gap-2">
                  <Lock size={16} /> Password
                </Label>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="mt-1 border-rose-200 focus:border-rose-500"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white py-6"
              >
                <Lock size={18} className="mr-2" />
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-gray-500 leading-relaxed space-y-2">
            <p>Create public pages for each Valentine day and share with direct links.</p>
            <p className="text-sm font-medium text-gray-700">Website designed by Navneet Khandelwal</p>
            <a
              href="https://instagram.com/techtalksbynavneet"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-rose-600 hover:text-rose-700 font-semibold"
            >
              @techtalksbynavneet
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
