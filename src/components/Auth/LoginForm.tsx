import React, { useState } from 'react';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Primitives';
import { Field, Input } from '../ui/Field';
import AuthCard from '../ui/AuthCard';
import PasswordField from '../ui/PasswordField';

interface LoginFormProps {
  onToggleForm: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onToggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      icon={LogIn}
      gradient="from-indigo-600 to-violet-600"
      shadowClass="shadow-lg shadow-indigo-600/20"
      title="Welcome Back"
      subtitle="Sign in to your account"
      error={error}
      footerPrompt={<>Don&apos;t have an account?</>}
      footerActionLabel="Sign up"
      onFooterAction={onToggleForm}
      footerActionClassName="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Email address" htmlFor="login-email" icon={Mail}>
          <Input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </Field>

        <PasswordField
          label="Password"
          id="login-password"
          icon={Lock}
          value={password}
          onChange={setPassword}
          shown={showPassword}
          onToggleShown={() => setShowPassword((current) => !current)}
          placeholder="Enter your password"
          autoComplete="current-password"
          required
        />

        <Button type="submit" loading={loading} className="w-full">
          {!loading && <LogIn className="w-4 h-4" />}
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </AuthCard>
  );
};

export default LoginForm;