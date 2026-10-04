import React, { useState } from 'react';
import { UserPlus, User, Mail, Lock, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Primitives';
import { Field, Input } from '../ui/Field';
import AuthCard from '../ui/AuthCard';
import PasswordField, { MatchIndicator } from '../ui/PasswordField';

interface SignUpFormProps {
  onToggleForm: () => void;
}

const MIN_PASSWORD_LENGTH = 6;

const SignUpForm: React.FC<SignUpFormProps> = ({ onToggleForm }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signUp } = useAuth();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
      return;
    }

    setLoading(true);
    try {
      await signUp(formData.email.trim(), formData.password, formData.fullName.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the account.');
    } finally {
      setLoading(false);
    }
  };

  const mismatch = formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword;

  return (
    <AuthCard
      icon={UserPlus}
      gradient="from-emerald-600 to-green-600"
      shadowClass="shadow-lg shadow-emerald-600/20"
      title="Create Account"
      subtitle="Start tracking your expenses"
      error={error}
      footerPrompt={<>Already have an account?</>}
      footerActionLabel="Sign in"
      onFooterAction={onToggleForm}
      footerActionClassName="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Full name" htmlFor="signup-name" icon={User}>
          <Input
            id="signup-name"
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            autoComplete="name"
            minLength={2}
            maxLength={60}
            required
          />
        </Field>

        <Field label="Email address" htmlFor="signup-email" icon={Mail}>
          <Input
            id="signup-email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </Field>

        <PasswordField
          label="Password"
          id="signup-password"
          name="password"
          icon={Lock}
          value={formData.password}
          onChange={(value) => setFormData((current) => ({ ...current, password: value }))}
          shown={showPassword}
          onToggleShown={() => setShowPassword((current) => !current)}
          placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          required
        />

        <PasswordField
          label="Confirm password"
          id="signup-confirm"
          name="confirmPassword"
          icon={Lock}
          value={formData.confirmPassword}
          onChange={(value) => setFormData((current) => ({ ...current, confirmPassword: value }))}
          shown={showConfirmPassword}
          onToggleShown={() => setShowConfirmPassword((current) => !current)}
          revealWord="confirmation"
          placeholder="Repeat your password"
          autoComplete="new-password"
          error={mismatch ? 'Passwords do not match' : undefined}
          trailing={
            mismatch ? (
              <MatchIndicator />
            ) : formData.confirmPassword ? (
              <Check className="w-4 h-4 text-emerald-500" aria-hidden="true" />
            ) : undefined
          }
          required
        />

        <Button
          type="submit"
          loading={loading}
          variant="success"
          className="w-full"
        >
          {!loading && <UserPlus className="w-4 h-4" />}
          {loading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>
    </AuthCard>
  );
};

export default SignUpForm;