import { useMemo, useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  User,
  Coins,
  Calendar,
  Award,
  ShieldCheck,
  RefreshCw,
  Edit3,
  X,
} from 'lucide-react';
import ProfileForm from './profile/ProfileForm';

const emptyForm = {
  zone_name: '',
  address: '',
  owner_name: '',
  owner_phone: '',
  current_password: '',
  new_password: '',
  confirm_password: '',
};

export default function Profile({
  zoneInfo,
  targetProfile,
  isVerified,
  creditBalance,
  onSaveProfile,
  onRefresh,
  isRefreshing,
}) {
  const profile = useMemo(() => {
    return zoneInfo?.data || zoneInfo || targetProfile || {};
  }, [zoneInfo, targetProfile]);

  const [draft, setDraft] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const form = draft ?? {
    ...emptyForm,
    zone_name: profile.zone_name || '',
    address: profile.address || '',
    owner_name: profile.owner_name || '',
    owner_phone: profile.owner_phone || '',
  };

  const handleChange = (field, value) => {
    setDraft((prev) => ({ ...(prev ?? form), [field]: value }));
  };

  const startEdit = () => {
    setSuccess('');
    setError('');
    setDraft({
      ...emptyForm,
      zone_name: profile.zone_name || '',
      address: profile.address || '',
      owner_name: profile.owner_name || '',
      owner_phone: profile.owner_phone || '',
    });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraft(null);
    setIsEditing(false);
    setError('');
    setSuccess('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (form.new_password || form.confirm_password || form.current_password) {
      if (!form.current_password) {
        setError('Current password is required to change your password.');
        return;
      }
      if (!form.new_password) {
        setError('Enter a new password.');
        return;
      }
      if (form.new_password !== form.confirm_password) {
        setError('New password and confirmation do not match.');
        return;
      }
    }

    const payload = {
      zone_name: form.zone_name.trim(),
      address: form.address.trim(),
      owner_name: form.owner_name.trim(),
      owner_phone: form.owner_phone.trim(),
    };

    if (form.current_password || form.new_password || form.confirm_password) {
      payload.current_password = form.current_password;
      payload.new_password = form.new_password;
      payload.confirm_password = form.confirm_password;
    }

    setIsSaving(true);
    try {
      await onSaveProfile?.(payload);
      setSuccess('Profile updated successfully.');
      setDraft(null);
      setIsEditing(false);
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (submitError) {
      setError(submitError?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#00F0FF]/10 via-white/5 to-[#7B2CBF]/10 p-5 shadow-lg shadow-black/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00F0FF] to-[#7B2CBF] shadow-lg">
              <User size={28} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-lg font-bold text-white">{profile.zone_name || 'Lounge Name'}</h2>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[9px] font-bold ${
                    isVerified
                      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                      : 'border-amber-500/20 bg-amber-500/10 text-amber-400'
                  }`}
                >
                  {isVerified ? 'Verified' : 'Pending'}
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-slate-400">{profile.owner_name || 'Owner'}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-xs font-bold text-white transition hover:border-[#00F0FF]/40 disabled:opacity-60"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            type="button"
            onClick={isEditing ? cancelEdit : startEdit}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#00F0FF]/20 bg-[#00F0FF]/10 px-4 py-2 text-xs font-bold text-[#00F0FF] transition hover:border-[#00F0FF]/40"
          >
            {isEditing ? <X size={14} /> : <Edit3 size={14} />}
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <div className="rounded-xl border border-white/5 bg-black/30 p-3.5">
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400">
            <Coins size={12} className="text-amber-400" /> Wallet
          </div>
          <p className="text-base font-bold text-amber-400">{creditBalance} Br</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-black/30 p-3.5">
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400">
            <Award size={12} className="text-[#00F0FF]" /> Status
          </div>
          <p className={`text-base font-bold ${isVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isVerified ? 'Active' : 'Pending'}
          </p>
        </div>
        <div className="rounded-xl border border-white/5 bg-black/30 p-3.5">
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400">
            <Calendar size={12} className="text-slate-400" /> Joined
          </div>
          <p className="mt-1 truncate text-xs font-bold text-white">
            {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
          </p>
        </div>
        <div className="rounded-xl border border-white/5 bg-black/30 p-3.5">
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400">
            <ShieldCheck size={12} className="text-slate-400" /> Role
          </div>
          <p className="mt-1 text-xs font-bold capitalize text-white">{profile.role || 'Owner'}</p>
        </div>
      </div>

      {!isEditing ? (
        <div className="rounded-2xl border border-white/5 bg-black/30 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Contact Details</h4>
            <p className="text-[10px] text-slate-500">Press Edit Profile to make changes</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-slate-300">
              <MapPin size={14} className="text-slate-500" />
              <span>{profile.address || 'No address set yet'}</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-slate-300">
              <Phone size={14} className="text-slate-500" />
              <span>{profile.owner_phone || 'No phone set yet'}</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-slate-300">
              <Mail size={14} className="text-slate-500" />
              <span>{profile.email || 'No email on file'}</span>
            </div>
          </div>
        </div>
      ) : (
        <ProfileForm
          form={form}
          error={error}
          success={success}
          isSaving={isSaving}
          showCurrentPassword={showCurrentPassword}
          showNewPassword={showNewPassword}
          showConfirmPassword={showConfirmPassword}
          setShowCurrentPassword={setShowCurrentPassword}
          setShowNewPassword={setShowNewPassword}
          setShowConfirmPassword={setShowConfirmPassword}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
