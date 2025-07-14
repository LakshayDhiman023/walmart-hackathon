import React, { useState } from 'react';
import { useSignIn } from '@clerk/clerk-react';

const ManagerLogin = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!isLoaded) return;
      const result = await signIn.create({ identifier: email, password });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        // Redirect to dashboard or home
        window.location.href = '/';
      } else {
        setError('Sign in not complete.');
      }
    } catch (err) {
      setError(err.errors ? err.errors[0].message : 'Sign in failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md border border-[#E5E7EB]">
        <div className="flex flex-col items-center mb-6">
          {/* Walmart logo placeholder */}
          <span className="text-4xl font-bold text-[#0071CE]">Walmart</span>
          <span className="ml-2 text-4xl text-[#FFC220]">*</span>
        </div>
        <form className="bg-white rounded-xl border border-[#E5E7EB] p-6" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold text-center mb-4 text-[#1F2937]">Manager Login</h2>
          <div className="mb-4">
            <label className="block text-[#4B5563] mb-1" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded focus:outline-none focus:ring-2 focus:ring-[#0071CE] bg-white text-[#1F2937]"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <label className="block text-[#4B5563] mb-1" htmlFor="password">Password</label>
              <a href="#" className="text-[#0071CE] text-sm hover:underline">Forgot password?</a>
            </div>
            <input
              id="password"
              type="password"
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded focus:outline-none focus:ring-2 focus:ring-[#0071CE] bg-white text-[#1F2937]"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-4 flex items-center">
            <input
              id="rememberMe"
              type="checkbox"
              className="mr-2"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe" className="text-[#4B5563]">Remember me</label>
          </div>
          {error && <div className="mb-2 text-[#DC3545] text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="w-full bg-[#0071CE] text-white py-2 rounded font-bold text-lg hover:bg-[#FFC220] hover:text-[#1F2937] transition"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManagerLogin; 