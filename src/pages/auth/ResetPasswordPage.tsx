import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Sprout, Lock, CheckCircle2 } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      await authApi.resetPassword(password, 'mock-token');
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-soft-lg">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white mx-auto shadow-md shadow-emerald-600/20">
            <Sprout className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            Set New Password
          </h2>
          <p className="text-xs text-slate-500">
            Enter your new secure password below to regain account access.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
            {error}
          </div>
        )}

        {isSuccess ? (
          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-slate-900 text-sm">Password Updated</h4>
            <p className="text-xs text-slate-600">
              Your password has been successfully reset. You may now sign in.
            </p>
            <Link to="/login" className="inline-block pt-2">
              <Button variant="primary" size="md">
                Sign In Now
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              className="font-bold shadow-md"
            >
              Update Password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
