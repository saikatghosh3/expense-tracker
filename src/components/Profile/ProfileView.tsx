import React, { useEffect, useState } from 'react';
import {
  User,
  Mail,
  Lock,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  KeyRound,
  Receipt,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useExpenses } from '../../hooks/useExpenses';
import { useSettings } from '../../contexts/SettingsContext';
import { Button } from '../ui/Primitives';
import { Field, Input } from '../ui/Field';
import { SectionCard } from '../ui/Card';
import PageHeader from '../ui/PageHeader';
import Alert from '../ui/Alert';
import MetricCard from '../ui/MetricCard';
import PasswordField from '../ui/PasswordField';
import Badge from '../ui/Badge';
import { useToast } from '../ui/Toast';

const MIN_PASSWORD_LENGTH = 6;

const ProfileView: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { expenses, budget } = useExpenses();
  const { formatMoneyWhole } = useSettings();
  const toast = useToast();

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName);
    setEmail(user.email);
  }, [user]);

  if (!user) return null;

  const mismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword && newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(
        `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      );
      return;
    }

    if (newPassword && !currentPassword) {
      setError('Enter your current password to set a new one.');
      return;
    }

    setSaving(true);

    try {
      await updateProfile({
        fullName: fullName.trim(),
        email: email.trim(),
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      toast.success(
        'Profile updated',
        'Your details have been saved.',
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to update profile';

      setError(message);
      toast.error('Could not update profile', message);
    } finally {
      setSaving(false);
    }
  };

  const memberSince = new Date(user.createdAt).toLocaleDateString(
    undefined,
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
  );

  const lifetimeTotal = expenses.reduce(
    (total, expense) => total + expense.amount,
    0,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        subtitle="Manage your account details and password."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 items-start">
        {/* Main profile form */}
        <div className="lg:col-span-2 min-w-0">
          <SectionCard
            as="form"
            onSubmit={handleSubmit}
            noValidate
            icon={User}
            gradient="from-indigo-600 to-violet-600"
            title="Personal Information"
            subtitle="Update the details stored for your account"
          >
            {error && (
              <Alert tone="danger" iconSize="lg" role="alert">
                {error}
              </Alert>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field
                label="Full name"
                htmlFor="profile-name"
                icon={User}
              >
                <Input
                  id="profile-name"
                  type="text"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(event.target.value)
                  }
                  required
                  minLength={2}
                  maxLength={60}
                  autoComplete="name"
                />
              </Field>

              <Field
                label="Email address"
                htmlFor="profile-email"
                icon={Mail}
              >
                <Input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                  autoComplete="email"
                />
              </Field>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="mb-5">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-slate-400" />

                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Change password
                  </h3>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Leave these blank to keep your current password.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <PasswordField
                  label="Current password"
                  id="current-password"
                  icon={Lock}
                  revealWord="current password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  shown={showCurrent}
                  onToggleShown={() => setShowCurrent((current) => !current)}
                  autoComplete="current-password"
                />

                <PasswordField
                  label="New password"
                  id="new-password"
                  icon={Lock}
                  revealWord="new password"
                  value={newPassword}
                  onChange={setNewPassword}
                  shown={showNew}
                  onToggleShown={() => setShowNew((current) => !current)}
                  autoComplete="new-password"
                  minLength={MIN_PASSWORD_LENGTH}
                />

                <PasswordField
                  label="Confirm new password"
                  id="confirm-password"
                  icon={Lock}
                  className="sm:max-w-[calc(50%-0.625rem)]"
                  revealWord="confirmation"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  shown={showConfirm}
                  onToggleShown={() => setShowConfirm((current) => !current)}
                  error={mismatch ? 'Passwords do not match' : undefined}
                  trailing={
                    confirmPassword.length > 0 && !mismatch ? (
                      <CheckCircle2
                        className="w-4 h-4 text-emerald-500"
                        aria-hidden="true"
                      />
                    ) : undefined
                  }
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="pt-1 flex justify-end">
              <Button
                type="submit"
                loading={saving}
                className="w-full sm:w-auto"
              >
                Save Changes
              </Button>
            </div>
          </SectionCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-5 lg:space-y-6 min-w-0">
          <SectionCard
            as="div"
            size="sidebar"
            titleAs="h3"
            icon={ShieldCheck}
            gradient="from-emerald-600 to-teal-600"
            title="Your Account"
            subtitle="Stored in this browser"
            spacing="space-y-0"
          >
            <dl className="space-y-4 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-shrink-0">
                  <User className="w-4 h-4 text-slate-400" />
                  Name
                </dt>

                <dd className="font-semibold text-slate-900 dark:text-slate-100 text-right break-words min-w-0">
                  {user.fullName}
                </dd>
              </div>

              <div className="flex items-start justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-shrink-0">
                  <Mail className="w-4 h-4 text-slate-400" />
                  Email
                </dt>

                <dd className="font-semibold text-slate-900 dark:text-slate-100 text-right break-all min-w-0">
                  {user.email}
                </dd>
              </div>

              <div className="flex items-start justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-shrink-0">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Member since
                </dt>

                <dd className="font-semibold text-slate-900 dark:text-slate-100 text-right break-words min-w-0">
                  {memberSince}
                </dd>
              </div>

              {user.isAdmin && (
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    Role
                  </dt>

                  <dd>
                    <Badge>ADMIN</Badge>
                  </dd>
                </div>
              )}
            </dl>
          </SectionCard>

          <SectionCard as="div" spacing="space-y-4">
            <MetricCard
              variant="row"
              label="Expenses tracked"
              value={expenses.length}
              icon={Receipt}
              gradient="from-indigo-500 to-violet-600"
            />

            <MetricCard
              variant="row"
              label="Total spent all time"
              value={formatMoneyWhole(lifetimeTotal)}
              icon={Wallet}
              gradient="from-emerald-500 to-teal-600"
            />

            <MetricCard
              variant="row"
              label="Budget this month"
              value={budget > 0 ? formatMoneyWhole(budget) : 'Not set'}
              icon={Wallet}
              gradient="from-amber-500 to-orange-600"
            />
          </SectionCard>

          <p className="px-1 text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
            Your password is hashed before it is stored, but this app
            has no server. Anyone with access to this browser profile
            could read the underlying data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;